import { BookOpen } from 'lucide-react'
import { RecipeAttribution } from '@/types/recipes.types'
import { getLicenseDeedUrl, hasSourceCredit } from '@utils/attribution'
import './RecipeAttribution.css'

type SourceCreditProps = Pick<
  RecipeAttribution,
  'sourceName' | 'sourceUrl' | 'sourceLicense'
>

const EXTERNAL_LINK_PROPS = {
  target: '_blank' as const,
  rel: 'noopener noreferrer',
  className: 'recipe-credit-link',
}

/**
 * Recipe-text credit (PRD Rule B / §5.2) — a credits line at the foot of the
 * recipe. Source name (linked), licence (linked to deed), and a mandatory note
 * that the recipe was modified (we convert units to metric and reformat — the
 * CC BY-SA ShareAlike obligation, §6). Renders nothing unless both the licence
 * and a source link-back are present.
 */
const SourceCredit = ({ sourceName, sourceUrl, sourceLicense }: SourceCreditProps) => {
  if (!hasSourceCredit({ sourceLicense, sourceUrl })) return null

  const name = sourceName || 'original source'
  const license = sourceLicense as string
  const url = sourceUrl as string
  const deedUrl = getLicenseDeedUrl(license)

  return (
    <section className="recipe-source-credit" aria-label="Recipe source and licence">
      <BookOpen className="recipe-source-credit-ico" aria-hidden="true" />
      <p className="recipe-source-credit-text">
        Recipe adapted from <a href={url} {...EXTERNAL_LINK_PROPS}>{name}</a>, licensed under{' '}
        {deedUrl ? (
          <a href={deedUrl} {...EXTERNAL_LINK_PROPS}>{license}</a>
        ) : (
          <span className="recipe-credit-muted">{license}</span>
        )}
        . <span className="recipe-credit-muted">Modified (units converted to metric; formatting edited).</span>
      </p>
    </section>
  )
}

export default SourceCredit
