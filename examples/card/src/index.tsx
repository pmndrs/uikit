import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.js'

createRoot(document.getElementById('root') as HTMLCanvasElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
