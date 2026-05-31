import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CountriesProvider } from './context/CountriesContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CountriesProvider>
          <App />
        </CountriesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
