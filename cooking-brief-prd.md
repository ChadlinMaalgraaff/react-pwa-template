# PRD: AI Cooking Brief — "Tell me about this dish"

**Owner:** Product  
**Status:** Ready for implementation  
**Applies to:** Recipe Detail screen  
**Depends on:** Backend provides two new endpoints (§6)

---

## 1. Summary

A "Tell me about this dish" button on the Recipe Detail screen triggers an AI-generated audio walkthrough of the recipe. The AI — acting as a warm sous chef — delivers a natural-language intro to the dish followed by a spoken summary of each cooking step. As each step is narrated, the app scrolls to it and highlights it, so the user is always looking at the right place. The whole thing is user-initiated and can be paused or stopped at any time.

---

## 2. User flow

```
User taps "Tell me about this dish"
  → Loading state (spinner on button, ~3–5 seconds)
  → App fetches text segments from backend (AI-generated)
  → App immediately fetches audio for the intro segment
  → Intro audio ready → playback starts → playback bar appears
  → Intro plays (no step highlighted; scroll to top of Method section)
  → Intro ends → Step 1 audio plays → Step 1 highlighted + scrolled into view
  → Step 2 audio plays → Step 2 highlighted + scrolled into view
  → ... continues until final step
  → Playback ends → bar disappears → highlights clear → idle state
  
  At any point:
    Pause button → audio pauses, highlight stays
    Resume button → audio resumes from where it paused
    Stop (✕) button → audio stops, highlight clears, bar disappears, idle state
```

---

## 3. Content model — what the AI generates

The backend returns **one segment per section**:

| Segment | Type | Content |
|---|---|---|
| 0 | `intro` | 2–3 sentences: what the dish is, where it's from, what makes it special, and a brief heads-up on what's coming |
| 1 | `step` (stepIndex 0) | 1–2 sentences: what the cook does in step 1, *why*, and what to look for |
| 2 | `step` (stepIndex 1) | Same for step 2 |
| … | … | … |
| N | `step` (stepIndex N−1) | Same for final step |

Each segment should be **60–90 words maximum** — roughly 30–45 seconds of audio at a natural speaking pace. This keeps the walkthrough moving and prevents the user from zoning out.

**Tone:** Warm, direct, encouraging. Like a knowledgeable friend in the kitchen with you, not a recipe-book narrator. First person plural ("we're going to", "you want to see"), practical tips, and real cues ("you'll know the onions are ready when they turn golden and smell sweet").

---

## 4. Frontend specification

### 4.1 New files

| File | Purpose |
|---|---|
| `src/hooks/useCookingBrief.ts` | All state, fetching, audio management, and playback logic |
| `src/components/pages/RecipeDetail/CookingBriefBar.tsx` | Persistent playback bar shown during playback |
| `src/components/pages/RecipeDetail/CookingBriefBar.css` | Styles for the bar |

### 4.2 Modified files

| File | Change |
|---|---|
| `src/services/recipes.service.ts` | Add `getCookingBrief(recipeId)` |
| `src/services/tts.service.ts` | New service — `fetchSegmentAudio(text)` → audio Blob URL |
| `src/types/recipes.types.ts` | Add `CookingBriefSegment`, `CookingBriefResponse` types |
| `src/components/pages/RecipeDetail/RecipeDetail.tsx` | Button, step refs, active segment wiring, `CookingBriefBar` mount |
| `src/components/pages/RecipeDetail/RecipeDetail.css` | Active step highlight style |

### 4.3 Types

```typescript
// src/types/recipes.types.ts

export interface CookingBriefSegment {
  type: 'intro' | 'step'
  index: number        // 0 = intro; 1..N = step segments
  stepIndex?: number   // 0-based step number; only present when type === 'step'
  text: string
}

export interface CookingBriefResponse {
  segments: CookingBriefSegment[]
}
```

### 4.4 Services

**`recipes.service.ts` — add:**
```
getCookingBrief(recipeId: string): Promise<CookingBriefResponse>
  → GET /recipes/:id/cooking-brief
```

**`tts.service.ts` — new:**
```
fetchAudio(text: string): Promise<string>
  → POST /tts
  → Request body: { text }
  → Response: audio/mpeg binary
  → Returns a blob URL (URL.createObjectURL) ready to pass to an Audio element
  → Caller is responsible for calling URL.revokeObjectURL when done
```

### 4.5 `useCookingBrief` hook

**State machine:**

```
idle  →  loading  →  playing  ↔  paused
 ↑                      ↓
 └──────────── stopped / ended
```

**State shape:**
```typescript
type BriefStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface CookingBriefState {
  status: BriefStatus
  segments: CookingBriefSegment[]
  audioCache: Map<number, string>   // segmentIndex → blob URL
  activeIndex: number               // which segment is currently playing
}
```

**Behaviour:**

- `start(recipeId)`: sets status `loading`, calls `getCookingBrief`, then immediately begins fetching audio for `segment[0]`. Once `segment[0]` audio is ready, sets status `playing` and starts playback.
- **Prefetch**: while segment N is playing, fetch segment N+1's audio in the background so there's no gap between segments.
- **Auto-advance**: `audio.onended` → increment `activeIndex`, play next segment's audio (already prefetched). If no next segment, return to `idle` and revoke all blob URLs.
- `pause()`: `audio.pause()`, status → `paused`.
- `resume()`: `audio.play()`, status → `playing`.
- `stop()`: stop audio, clear all state, revoke all blob URLs, status → `idle`.
- **Cleanup**: on unmount, stop audio and revoke all cached blob URLs.
- **Error**: if text fetch fails → dispatch error notification, return to `idle`. If a single TTS fetch fails → skip that segment, continue with next (don't halt the whole walkthrough).

**Returned values (hook interface):**
```typescript
{
  status: BriefStatus
  activeSegment: CookingBriefSegment | null
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
}
```

### 4.6 RecipeDetail changes

**Button placement:** Below the recipe title/meta block, above the Ingredients section — prominent but not intrusive.

```tsx
<button className="cooking-brief-trigger" onClick={brief.start} disabled={brief.status === 'loading'}>
  {brief.status === 'loading' ? <Spinner size="sm" /> : <HeadphonesIcon />}
  Tell me about this dish
</button>
```

- Disabled and shows a spinner while `status === 'loading'`.
- Hidden while `status === 'playing' | 'paused'` (replaced by the playback bar).

**Step refs:** Attach a `ref` to each `.recipe-detail-step` div:
```tsx
const stepRefs = useRef<(HTMLDivElement | null)[]>([])

// In JSX:
<div
  key={index}
  ref={(el) => { stepRefs.current[index] = el }}
  className={`recipe-detail-step${activeStepIndex === index ? ' recipe-detail-step--active' : ''}`}
>
```

Where `activeStepIndex` is derived from `brief.activeSegment`:
```typescript
const activeStepIndex =
  brief.activeSegment?.type === 'step' ? (brief.activeSegment.stepIndex ?? null) : null
```

**Scroll behaviour:** In a `useEffect` watching `activeStepIndex`:
```typescript
useEffect(() => {
  if (activeStepIndex !== null) {
    stepRefs.current[activeStepIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}, [activeStepIndex])
```

**`CookingBriefBar` mount:** Render at the bottom of the page (outside `.recipe-detail-body`, inside `.recipe-detail-page`) when `status !== 'idle' && status !== 'loading'`:
```tsx
{(brief.status === 'playing' || brief.status === 'paused') && (
  <CookingBriefBar
    activeSegment={brief.activeSegment}
    totalSteps={recipe.instructions.length}
    status={brief.status}
    onPause={brief.pause}
    onResume={brief.resume}
    onStop={brief.stop}
  />
)}
```

### 4.7 `CookingBriefBar` component

```
┌──────────────────────────────────────────────────┐
│  🎧  Step 2 of 6          [  ⏸  ]    [  ✕  ]    │
└──────────────────────────────────────────────────┘
```

- Fixed to the bottom of the screen, sits above the page scroll area.
- Left: speaker/headphones icon + label ("Intro" or "Step N of M").
- Right: pause/resume icon button + stop icon button.
- Background: `bg-canvas` with a top border, slight shadow — same pattern as the existing `.recipe-detail-sticky-bar`.
- When paused: label reads "Paused · Step N of M", pause icon toggles to play icon.

### 4.8 CSS additions

**`RecipeDetail.css` — add:**
```css
/* Active step highlight (cooking brief) */
.recipe-detail-step--active {
  @apply rounded-xl bg-primary-light px-3 -mx-3 transition-colors duration-300;
}

/* Tell me about this dish trigger */
.cooking-brief-trigger {
  @apply mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 
         bg-primary-light px-4 py-3 text-[14px] font-medium text-primary;
}
```

**`CookingBriefBar.css`** — new file, styles the fixed bottom bar.

---

## 5. Acceptance criteria

- [ ] "Tell me about this dish" button is visible on Recipe Detail and disabled during loading.
- [ ] Button shows a spinner while the cooking brief is being fetched.
- [ ] Playback starts with the intro segment; no step is highlighted during the intro.
- [ ] When a step segment plays, the corresponding step scrolls into view and is visually highlighted.
- [ ] Highlight and scroll advance in sync with audio — one step at a time.
- [ ] Playback bar shows the correct segment label throughout playback.
- [ ] Pause button pauses audio and label updates to reflect paused state.
- [ ] Resume continues from where it paused.
- [ ] Stop button clears all state, removes highlight, hides the bar.
- [ ] After the final step plays, the bar disappears and highlights clear automatically.
- [ ] If the cooking brief fetch fails, an error notification is shown and the UI returns to idle.
- [ ] If a single TTS segment fails, the walkthrough skips it and continues.
- [ ] All blob URLs are revoked on stop, completion, or component unmount (no memory leaks).
- [ ] Tests cover: `useCookingBrief` state transitions; `CookingBriefBar` render states; RecipeDetail integration (button visibility, active step class, scroll trigger).
- [ ] Lint passes at zero warnings.

---

## 6. Backend specification

### 6.1 Endpoint 1 — Generate cooking brief text

**`POST /recipes/:id/cooking-brief`**

- Auth: Required (same as `GET /recipes/:id`).
- Purpose: Use an LLM to generate a warm, chef-style spoken summary of the recipe — one intro segment and one segment per instruction step.
- **AI Model: `claude-sonnet-4-6`** (Anthropic). Sonnet is preferred over Haiku here because the quality of the narration directly affects UX; this is a user-facing voice experience, not a background task.
- The call to Claude should be a **non-streaming, single request** — the frontend doesn't need streaming here, it needs the full segment list before it can sequence TTS calls.

**Input to Claude (system + user prompt):**

System prompt direction:
> You are a warm, encouraging sous chef helping a home cook prepare a meal. Your job is to narrate the recipe — first give a short intro to the dish, then summarise each cooking step in natural, friendly language. Speak directly to the cook ("you'll want to", "this is where"). Be practical: mention what to look for, how to know when something's ready, any quick tip that makes the step easier. Keep each segment under 90 words. Never just repeat the instruction verbatim — add context and warmth. Return your response as a JSON object.

User message: include the recipe's `title`, `cuisine`, `servings`, `prepTimeMinutes`, `cookTimeMinutes`, complete `ingredients` array (name, quantity, unit), and the full `instructions` array verbatim.

**Expected response format from Claude:**
```json
{
  "segments": [
    {
      "type": "intro",
      "index": 0,
      "text": "Tonight you're making Bobotie — a beautiful Cape Malay classic that's been on South African tables for centuries. It's a spiced mince bake topped with a golden egg custard, and it smells incredible. You've got about 65 minutes ahead of you, with most of that hands-off baking time, so let's get started."
    },
    {
      "type": "step",
      "index": 1,
      "stepIndex": 0,
      "text": "First, you'll soften the onion in a little oil over medium heat. Take your time here — about 5 minutes. You want the onion translucent and sweet, not brown. This flavour base is what everything else builds on."
    }
  ]
}
```

- The backend should validate the response shape before returning it to the client. If Claude returns malformed JSON, return a 502 with a meaningful error.
- `index` values must be sequential starting at 0. `stepIndex` must align with the 0-based position in the `instructions` array.
- Response: `200 OK`, `Content-Type: application/json`, body matching `CookingBriefResponse`.

---

### 6.2 Endpoint 2 — Text-to-speech

**`POST /tts`**

- Auth: Required.
- Purpose: Accept a text string and return audio synthesised by OpenAI TTS. The API key must never leave the server.
- **AI Model: OpenAI TTS, model `tts-1`** — chosen for low latency (~500ms–1.5s) at the cost of marginal quality difference vs `tts-1-hd`. Given segments are 30–45 seconds of casual speech, `tts-1` quality is entirely appropriate. Upgrade to `tts-1-hd` only if explicit quality complaints arise.
- **Voice: `nova`** — warm, clear, conversational. This voice is fixed server-side and not configurable by the client. Do not expose voice as a request parameter; changing it later is a server-side decision.
- **Audio format: MP3** (`response_format: 'mp3'`) — good browser compatibility, reasonable file size (~40–80 KB per segment).

**Request body:**
```json
{ "text": "..." }
```

**Validation:**
- `text` must be a non-empty string.
- `text` must be ≤ 4096 characters (OpenAI TTS hard limit — segments will typically be ~400 chars, so this is not a practical concern but should be validated and return a `400` if exceeded).

**Response:**
- `200 OK`, `Content-Type: audio/mpeg`, body is the raw MP3 binary.
- The client will `URL.createObjectURL` the blob to create a playable audio source.

**Error handling:**
- OpenAI API error → `502 Bad Gateway`, JSON body `{ "error": "TTS unavailable" }`.
- Validation failure → `400 Bad Request`.

---

## 7. Sequencing and latency notes

The two-endpoint design is intentional. A single combined endpoint (Claude + all TTS in one call) would block for 10–20+ seconds before the client hears anything. The split approach gives:

| Event | Approx. time from button tap |
|---|---|
| Cooking brief text received | ~3–5 s (Claude call) |
| Intro audio ready, playback starts | ~4–7 s (+ TTS for intro) |
| Step 1 audio ready (prefetched during intro) | ~5–8 s (plays immediately after intro) |
| Subsequent steps | No gap (prefetch while playing) |

The user waits once — for the intro — and the rest plays seamlessly.

---

## 8. Out of scope for this iteration

- Voice input / microphone ("ask the chef a question").
- Serving-size-aware narration (e.g. adjusting quantities in the spoken text).
- Caching TTS audio server-side (worth adding later for popular recipes).
- Background audio (continues if the screen locks) — PWA audio lock-screen controls are complex, defer.
- Selecting a different voice.
- "Read this step again" button.
