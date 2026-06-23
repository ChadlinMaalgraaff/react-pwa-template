import { Camera } from 'lucide-react'
import { RecipeAttribution } from '@/types/recipes.types'
import { getLicenseDeedUrl, hasPhotoCredit, isPublicDomainLicense } from '@utils/attribution'
import './RecipeAttribution.css'

type PhotoCreditProps = Pick<
  RecipeAttribution,
  'imageAuthor' | 'imageLicense' | 'imageSourceUrl'
>

const EXTERNAL_LINK_PROPS = {
  target: '_blank' as const,
  rel: 'noopener noreferrer',
  className: 'recipe-credit-link',
}

/**
 * Photo credit (PRD Rule A / §5.1) — a small caption clearly associated with
 * the hero image. Renders TASL: author, source link, licence (linked to deed).
 * Renders nothing unless both the licence and a source link-back are present.
 */
const PhotoCredit = ({ imageAuthor, imageLicense, imageSourceUrl }: PhotoCreditProps) => {
  if (!hasPhotoCredit({ imageLicense, imageSourceUrl })) return null

  const author = imageAuthor || 'Unknown'
  const license = imageLicense as string
  const sourceUrl = imageSourceUrl as string
  const deedUrl = getLicenseDeedUrl(license)
  const publicDomain = isPublicDomainLicense(license)

  return (
    <p className="recipe-photo-credit">
      <Camera className="recipe-photo-credit-ico" aria-hidden="true" />
      <span>
        Photo: {author}
        {' '}
        {publicDomain ? (
          <span className="recipe-credit-muted">({license}, public domain)</span>
        ) : deedUrl ? (
          <>
            / <a href={deedUrl} {...EXTERNAL_LINK_PROPS}>{license}</a>
          </>
        ) : (
          <span className="recipe-credit-muted">/ {license}</span>
        )}
        {' '}via{' '}
        <a href={sourceUrl} {...EXTERNAL_LINK_PROPS}>Wikimedia Commons</a>
      </span>
    </p>
  )
}

export default PhotoCredit
