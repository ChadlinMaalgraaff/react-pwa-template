import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PhotoCredit from '@components/recipes/RecipeAttribution/PhotoCredit'
import SourceCredit from '@components/recipes/RecipeAttribution/SourceCredit'

describe('PhotoCredit', () => {
  it('renders nothing when licence or source link is missing', () => {
    const { container } = render(
      <PhotoCredit imageAuthor="cherrylet" imageLicense="CC BY 2.0" imageSourceUrl={null} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders author, licence-deed link and source link (Rule A)', () => {
    render(
      <PhotoCredit
        imageAuthor="cherrylet"
        imageLicense="CC BY 2.0"
        imageSourceUrl="https://commons.wikimedia.org/wiki/File:Bobotie-01.jpg"
      />
    )
    expect(screen.getByText(/Photo: cherrylet/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'CC BY 2.0' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/2.0/'
    )
    expect(screen.getByRole('link', { name: 'Wikimedia Commons' })).toHaveAttribute(
      'href',
      'https://commons.wikimedia.org/wiki/File:Bobotie-01.jpg'
    )
  })

  it('shows Unknown when the author is missing', () => {
    render(
      <PhotoCredit imageAuthor={null} imageLicense="CC BY 2.0" imageSourceUrl="https://x" />
    )
    expect(screen.getByText(/Photo: Unknown/)).toBeInTheDocument()
  })

  it('renders a courtesy credit with no licence link for CC0 (Rule D)', () => {
    render(
      <PhotoCredit
        imageAuthor="Andy Li"
        imageLicense="CC0"
        imageSourceUrl="https://commons.wikimedia.org/wiki/File:Bunny_Chow.jpg"
      />
    )
    expect(screen.getByText(/\(CC0, public domain\)/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'CC0' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Wikimedia Commons' })).toBeInTheDocument()
  })

  it('opens links safely in a new tab', () => {
    render(
      <PhotoCredit imageAuthor="cherrylet" imageLicense="CC BY 2.0" imageSourceUrl="https://x" />
    )
    const link = screen.getByRole('link', { name: 'Wikimedia Commons' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('SourceCredit', () => {
  it('renders nothing when licence or source link is missing', () => {
    const { container } = render(
      <SourceCredit sourceName="Wikibooks Cookbook" sourceLicense="CC BY-SA 4.0" sourceUrl={null} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders source link, licence-deed link and the mandatory Modified note (Rule B / §6)', () => {
    render(
      <SourceCredit
        sourceName="Wikibooks Cookbook"
        sourceUrl="https://en.wikibooks.org/wiki/Cookbook:Tomato_Bredie"
        sourceLicense="CC BY-SA 4.0"
      />
    )
    expect(screen.getByRole('link', { name: 'Wikibooks Cookbook' })).toHaveAttribute(
      'href',
      'https://en.wikibooks.org/wiki/Cookbook:Tomato_Bredie'
    )
    expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by-sa/4.0/'
    )
    expect(screen.getByText(/Modified \(units converted to metric; formatting edited\)/)).toBeInTheDocument()
  })
})
