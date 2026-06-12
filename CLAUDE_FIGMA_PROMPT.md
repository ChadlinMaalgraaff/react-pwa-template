Here's a prompt you can paste into a Claude conversation that has the Figma MCP connected (e.g. Claude Desktop/Code with the Figma plugin, in the pwa project directory so the PRD is readable):

----------------------------------------------------------------------------------------------

I want you to generate a Figma design for PantryPal, my PWA app. Read PANTRYPAL_FRONTEND_PRD.md in this project first — it's the full spec.

Follow Section 14 (Figma Design Brief) as your build plan, in this order:

Design tokens (Section 5) — create Figma variables/styles for the color palette, typography scale, spacing/radius/elevation values, and set up the Lucide icon set.
Component library (Section 7) — build each shared component as a Figma component with the variants noted (e.g. Button primary/secondary/danger × default/loading/disabled, Badge variants, RecipeCard/SpecialCard default/pressed). Organize into pages: Layout & Navigation, Core Primitives, Pantry, Recipes, Specials, Shopping Lists, Admin.
Customer screens (Section 8) — one frame per screen at 375×812 (mobile), built from the components above. Include the loading/empty/error states listed for each screen as separate frames, using the naming convention from 14.2 (Customer / <Screen Name> / <State>).
Admin screens (Section 9) — one frame per screen at 1280×800 (desktop), reusing the existing Layout/Sidebar/Header components.
Prototype links — connect the frames following the user journeys in Section 12 (12.1–12.6) so the file is click-through-able end to end.
Skip the items listed in 14.3 (no separate frame for GET /specials/ingredient/{ingredientId} or per-store drill-down).

Given the size (22 screens + a full component library), let's work through this in stages — start with step 1 (tokens) and step 2 (component library), and pause for my review before moving on to the screens.

----------------------------------------------------------------------------------------------

A couple of notes:

I split it into stages because 22 screens + a component library is a lot for one Figma generation pass — better to validate the tokens/components first since every screen depends on them.
Section 5.1's color hex values are currently blank in the table — if that was intentional (letting Figma pick the palette), fine; otherwise you may want to fill those back in before running this, since the component library generation will need concrete colors to work from.