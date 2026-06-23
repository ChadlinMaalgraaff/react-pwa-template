/**
 * Creative Commons attribution helpers.
 *
 * Many seeded recipes come from free sources that are only free if we credit
 * them (a licence condition, not a nicety). These helpers resolve licence
 * names to their official deed URLs and classify licences so the Recipe Detail
 * screen can render correct, data-driven credits.
 *
 * See recipe-attribution-prd.md for the full spec.
 */

import { RecipeAttribution } from '@/types/recipes.types'

const PUBLIC_DOMAIN_VALUES = ['CC0', 'PUBLIC DOMAIN', 'PD', 'PDM']

const normalise = (license: string | null | undefined): string =>
  (license ?? '').trim().toUpperCase()

/**
 * Public-domain values (CC0, Public domain, PD, PDM) do not legally require
 * attribution. A courtesy credit is allowed, but the licence link is optional.
 */
export const isPublicDomainLicense = (license: string | null | undefined): boolean =>
  PUBLIC_DOMAIN_VALUES.includes(normalise(license))

/**
 * CC BY-SA carries the extra "ShareAlike" obligation (recipe text only): we
 * must indicate that changes were made. Only CC BY-SA* triggers this.
 */
export const isShareAlikeLicense = (license: string | null | undefined): boolean =>
  normalise(license).startsWith('CC BY-SA')

/**
 * Resolve a licence short-name to its official deed URL.
 * Matches by prefix (CC BY-SA, CC BY, CC0) + version so new minor variants
 * still resolve. Returns null when unknown or when no link is required
 * (Public domain / PD / PDM).
 */
export const getLicenseDeedUrl = (license: string | null | undefined): string | null => {
  const value = normalise(license)
  if (!value) return null
  if (value === 'CC0') return 'https://creativecommons.org/publicdomain/zero/1.0/'

  const version = value.match(/(\d+\.\d+)/)?.[1]
  if (!version) return null

  if (value.startsWith('CC BY-SA')) return `https://creativecommons.org/licenses/by-sa/${version}/`
  if (value.startsWith('CC BY')) return `https://creativecommons.org/licenses/by/${version}/`
  return null
}

/**
 * Rule A — render the photo credit only when both the licence and a link-back
 * source URL are present.
 */
export const hasPhotoCredit = (recipe: Pick<RecipeAttribution, 'imageLicense' | 'imageSourceUrl'>): boolean =>
  Boolean(recipe.imageLicense && recipe.imageSourceUrl)

/**
 * Rule B — render the recipe credit only when both the licence and a link-back
 * source URL are present.
 */
export const hasSourceCredit = (recipe: Pick<RecipeAttribution, 'sourceLicense' | 'sourceUrl'>): boolean =>
  Boolean(recipe.sourceLicense && recipe.sourceUrl)
