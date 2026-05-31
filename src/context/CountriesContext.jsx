/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CountriesContext = createContext(null)

const ALL_COUNTRIES_ENDPOINT =
  'https://restcountries.com/v3.1/all?fields=cca3,name,flags,region,subregion,population,capital,area,languages,currencies'

export function CountriesProvider({ children }) {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCountries = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(ALL_COUNTRIES_ENDPOINT)
        if (!response.ok) {
          throw new Error(`Failed to fetch countries (${response.status})`)
        }

        const payload = await response.json()
        const sorted = payload.sort((a, b) =>
          a.name.common.localeCompare(b.name.common),
        )
        setCountries(sorted)
      } catch (fetchError) {
        setError(fetchError.message || 'Could not load countries.')
      } finally {
        setLoading(false)
      }
    }

    loadCountries()
  }, [])

  const byCode = useMemo(() => {
    return countries.reduce((acc, country) => {
      acc[country.cca3] = country
      return acc
    }, {})
  }, [countries])

  const value = useMemo(
    () => ({ countries, loading, error, byCode }),
    [countries, loading, error, byCode],
  )

  return (
    <CountriesContext.Provider value={value}>{children}</CountriesContext.Provider>
  )
}

export function useCountries() {
  const context = useContext(CountriesContext)
  if (!context) {
    throw new Error('useCountries must be used within CountriesProvider')
  }
  return context
}
