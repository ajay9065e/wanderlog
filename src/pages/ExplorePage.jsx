import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCountries } from '../context/CountriesContext'
import { useAuth } from '../context/AuthContext'

const numberFormatter = new Intl.NumberFormat('en-US')

function ExplorePage() {
  const { countries, loading, error, byCode } = useCountries()
  const { bucket, visited, toggleBucket, toggleVisited } = useAuth()
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('All')

  const regions = useMemo(() => {
    const allRegions = countries.map((country) => country.region).filter(Boolean)
    return ['All', ...new Set(allRegions)]
  }, [countries])

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase()
    return countries.filter((country) => {
      const matchesRegion = region === 'All' || country.region === region
      const matchesSearch =
        !query ||
        country.name.common.toLowerCase().includes(query) ||
        country.cca3.toLowerCase().includes(query)

      return matchesRegion && matchesSearch
    })
  }, [countries, search, region])

  if (loading) {
    return <p className="status-box">Loading countries...</p>
  }

  if (error) {
    return <p className="status-box error-box">{error}</p>
  }

  return (
    <section className="explore-layout">
      <aside className="list-panel">
        <h2>My Lists</h2>

        <div className="list-block">
          <h3>🤍 Want To Visit ({bucket.length})</h3>
          {bucket.length === 0 ? (
            <p className="muted">No countries added yet.</p>
          ) : (
            <ul>
              {bucket.map((code) => (
                <li key={`bucket-${code}`}>
                  <Link to={`/country/${code}`}>{byCode[code]?.name?.common || code}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="list-block">
          <h3>✅ Visited ({visited.length})</h3>
          {visited.length === 0 ? (
            <p className="muted">No visited countries yet.</p>
          ) : (
            <ul>
              {visited.map((code) => (
                <li key={`visited-${code}`}>
                  <Link to={`/country/${code}`}>{byCode[code]?.name?.common || code}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div className="explore-main">
        <div className="filters">
          <label>
            Search
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Country name or code"
            />
          </label>

          <label>
            Region
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              {regions.map((regionName) => (
                <option key={regionName} value={regionName}>
                  {regionName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="results-meta">Showing {filteredCountries.length} countries</p>

        <div className="country-grid">
          {filteredCountries.map((country) => {
            const inBucket = bucket.includes(country.cca3)
            const inVisited = visited.includes(country.cca3)

            return (
              <article className="country-card" key={country.cca3}>
                <img
                  src={country.flags?.svg || country.flags?.png}
                  alt={`Flag of ${country.name.common}`}
                  className="flag"
                />

                <div className="card-body">
                  <h3>{country.name.common}</h3>
                  <p>📍 {country.capital?.[0] || 'N/A'}</p>
                  <p>👥 {numberFormatter.format(country.population || 0)}</p>
                  <p>🌐 {country.region || 'Unknown region'}</p>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className={`btn btn-soft ${inBucket ? 'active' : ''}`}
                    onClick={() => toggleBucket(country.cca3)}
                  >
                    {inBucket ? '🩷 In Bucket' : '🤍 Add To Bucket'}
                  </button>
                  <button
                    type="button"
                    className={`btn btn-soft ${inVisited ? 'active' : ''}`}
                    onClick={() => toggleVisited(country.cca3)}
                  >
                    {inVisited ? '✅ Visited' : '✔️ Mark Visited'}
                  </button>
                  <Link className="btn btn-outline" to={`/country/${country.cca3}`}>
                    View Details
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ExplorePage
