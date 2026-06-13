import { useEffect, useState } from 'react'
import { Button, SearchBar, EmptyState, Spinner } from '@components/shared'
import { SpecialCard, RetailerFilterBar } from '@components/specials'
import { useSpecials } from '@hooks/useSpecials'
import { useRetailers } from '@hooks/useRetailers'
import './Specials.css'

const PAGE_SIZE = 10

const Specials = () => {
  const { retailers } = useRetailers()
  const [search, setSearch] = useState('')
  const [retailerId, setRetailerId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const { specials, total, isLoading, setParams } = useSpecials({ active: true, page: 1, pageSize: PAGE_SIZE })

  useEffect(() => {
    setParams({
      active: true,
      page: 1,
      pageSize,
      search: search || undefined,
      retailerId: retailerId || undefined,
    })
  }, [search, retailerId, pageSize, setParams])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPageSize(PAGE_SIZE)
  }

  const handleSelectRetailer = (id: string | null) => {
    setRetailerId(id)
    setPageSize(PAGE_SIZE)
  }

  const sortedSpecials = [...specials].sort(
    (a, b) => new Date(a.validTo).getTime() - new Date(b.validTo).getTime()
  )

  return (
    <div className="specials-page">
      <RetailerFilterBar retailers={retailers} selectedRetailerId={retailerId} onSelect={handleSelectRetailer} />
      <SearchBar placeholder="Search specials..." onSearch={handleSearch} />

      {isLoading && sortedSpecials.length === 0 ? (
        <Spinner fullScreen />
      ) : sortedSpecials.length === 0 ? (
        <EmptyState title="No specials match your search" />
      ) : (
        <>
          <div className="specials-list">
            {sortedSpecials.map((special) => (
              <SpecialCard key={special.id} special={special} />
            ))}
          </div>
          {sortedSpecials.length < total && (
            <Button variant="secondary" onClick={() => setPageSize((prev) => prev + PAGE_SIZE)} isLoading={isLoading}>
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export default Specials
