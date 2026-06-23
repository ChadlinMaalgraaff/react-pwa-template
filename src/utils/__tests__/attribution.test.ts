import { describe, it, expect } from 'vitest'
import {
  getLicenseDeedUrl,
  hasPhotoCredit,
  hasSourceCredit,
  isPublicDomainLicense,
  isShareAlikeLicense,
} from '@utils/attribution'

describe('getLicenseDeedUrl', () => {
  it('resolves CC BY variants to the by deed', () => {
    expect(getLicenseDeedUrl('CC BY 2.0')).toBe('https://creativecommons.org/licenses/by/2.0/')
    expect(getLicenseDeedUrl('CC BY 4.0')).toBe('https://creativecommons.org/licenses/by/4.0/')
  })

  it('resolves CC BY-SA variants to the by-sa deed', () => {
    expect(getLicenseDeedUrl('CC BY-SA 3.0')).toBe('https://creativecommons.org/licenses/by-sa/3.0/')
    expect(getLicenseDeedUrl('CC BY-SA 4.0')).toBe('https://creativecommons.org/licenses/by-sa/4.0/')
  })

  it('resolves CC0 to the public-domain dedication', () => {
    expect(getLicenseDeedUrl('CC0')).toBe('https://creativecommons.org/publicdomain/zero/1.0/')
  })

  it('matches by prefix + version for unseen minor variants', () => {
    expect(getLicenseDeedUrl('CC BY-SA 2.5')).toBe('https://creativecommons.org/licenses/by-sa/2.5/')
  })

  it('returns null for Public domain / PD / PDM and unknown values', () => {
    expect(getLicenseDeedUrl('Public domain')).toBeNull()
    expect(getLicenseDeedUrl('PD')).toBeNull()
    expect(getLicenseDeedUrl('PDM')).toBeNull()
    expect(getLicenseDeedUrl('All rights reserved')).toBeNull()
    expect(getLicenseDeedUrl(null)).toBeNull()
  })
})

describe('isPublicDomainLicense', () => {
  it('is true for public-domain values, case-insensitively', () => {
    expect(isPublicDomainLicense('CC0')).toBe(true)
    expect(isPublicDomainLicense('public domain')).toBe(true)
    expect(isPublicDomainLicense('PDM')).toBe(true)
  })

  it('is false for attribution licences and null', () => {
    expect(isPublicDomainLicense('CC BY 2.0')).toBe(false)
    expect(isPublicDomainLicense(null)).toBe(false)
  })
})

describe('isShareAlikeLicense', () => {
  it('is true only for CC BY-SA', () => {
    expect(isShareAlikeLicense('CC BY-SA 4.0')).toBe(true)
    expect(isShareAlikeLicense('CC BY 4.0')).toBe(false)
    expect(isShareAlikeLicense('CC0')).toBe(false)
    expect(isShareAlikeLicense(null)).toBe(false)
  })
})

describe('hasPhotoCredit / hasSourceCredit', () => {
  it('requires both a licence and a source link-back', () => {
    expect(hasPhotoCredit({ imageLicense: 'CC BY 2.0', imageSourceUrl: 'https://x' })).toBe(true)
    expect(hasPhotoCredit({ imageLicense: 'CC BY 2.0', imageSourceUrl: null })).toBe(false)
    expect(hasPhotoCredit({ imageLicense: null, imageSourceUrl: 'https://x' })).toBe(false)

    expect(hasSourceCredit({ sourceLicense: 'CC BY-SA 4.0', sourceUrl: 'https://x' })).toBe(true)
    expect(hasSourceCredit({ sourceLicense: null, sourceUrl: 'https://x' })).toBe(false)
  })
})
