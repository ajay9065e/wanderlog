import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCountries } from '../context/CountriesContext'
import { useAuth } from '../context/AuthContext'

const numberFormatter = new Intl.NumberFormat('en-US')

function CountryDetailPage() {
  const { code } = useParams()
  const normalizedCode = code?.toUpperCase() || ''
  const { byCode } = useCountries()
  const { bucket, visited, toggleBucket, toggleVisited } = useAuth()

  const [fallbackCountry, setFallbackCountry] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const localCountry = byCode[normalizedCode]

  useEffect(() => {
    const fetchByAlpha = async () => {
      if (!normalizedCode) return
      if (localCountry && localCountry.timezones) return

      setLoading(true)
      setError('')
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha/${normalizedCode}?fields=cca3,name,flags,region,subregion,population,capital,area,languages,currencies,timezones`,
        )
        if (!response.ok) {
          throw new Error('Country not found.')
        }
        const payload = await response.json()
        const parsedCountry = Array.isArray(payload) ? payload[0] : payload
        setFallbackCountry({ code: normalizedCode, data: parsedCountry })
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load country details.')
      } finally {
        setLoading(false)
      }
    }

    fetchByAlpha()
  }, [localCountry, normalizedCode])

  const fallbackForCurrentCode =
    fallbackCountry?.code === normalizedCode ? fallbackCountry.data : null
  const country = fallbackForCurrentCode || localCountry

  const currencyList = useMemo(() => {
    if (!country?.currencies) return 'N/A'
    return Object.values(country.currencies)
      .map((currency) => `${currency.name} (${currency.symbol || 'n/a'})`)
      .join(', ')
  }, [country])

  const languageList = useMemo(() => {
    if (!country?.languages) return 'N/A'
    return Object.values(country.languages).join(', ')
  }, [country])

  const inBucket = bucket.includes(normalizedCode)
  const inVisited = visited.includes(normalizedCode)

  if (loading) {
    return <p className="status-box">Loading country details...</p>
  }

  if (error) {
    return (
      <section>
        <p className="status-box error-box">{error}</p>
        <Link className="btn btn-outline" to="/explore">
          Back to Explore
        </Link>
      </section>
    )
  }

  if (!country) {
    return (
      <section>
        <p className="status-box error-box">Country unavailable.</p>
        <Link className="btn btn-outline" to="/explore">
          Back to Explore
        </Link>
      </section>
    )
  }

  return (
    <section className="detail-page">
      <Link className="btn btn-outline" to="/explore">
        ← Back
      </Link>

      <article className="detail-card">
        <img
          src={country.flags?.svg || country.flags?.png}
          alt={`Flag of ${country.name.common}`}
          className="detail-flag"
        />

        <div className="detail-content">
          <h1>{country.name.common}</h1>
          <p className="detail-subtitle">{country.subregion || country.region || 'Unknown region'}</p>

          <div className="detail-grid">
            <p>
              <strong>Code:</strong> {country.cca3}
            </p>
            <p>
              <strong>Region:</strong> {country.region || 'N/A'}
            </p>
            <p>
              <strong>📍 Capital:</strong> {country.capital?.[0] || 'N/A'}
            </p>
            <p>
              <strong>👥 Population:</strong> {numberFormatter.format(country.population || 0)}
            </p>
            <p>
              <strong>Area:</strong>{' '}
              {country.area ? `${numberFormatter.format(country.area)} km²` : 'N/A'}
            </p>
            <p>
              <strong>🕒 Timezones:</strong> {country.timezones?.join(', ') || 'N/A'}
            </p>
            <p>
              <strong>💬 Languages:</strong> {languageList}
            </p>
            <p>
              <strong>💴 Currencies:</strong> {currencyList}
            </p>
          </div>

          <div className="detail-actions">
            <button
              className={`btn btn-primary ${inBucket ? 'active' : ''}`}
              type="button"
              onClick={() => toggleBucket(country.cca3)}
            >
              {inBucket ? '🩷 In Bucket List' : '🤍 Add to Bucket List'}
            </button>
            <button
              className={`btn btn-soft ${inVisited ? 'active' : ''}`}
              type="button"
              onClick={() => toggleVisited(country.cca3)}
            >
              {inVisited ? '✅ Marked Visited' : '✔️ Mark as Visited'}
            </button>
          </div>
        </div>
      </article>
    </section>
  )
}

export default CountryDetailPage
