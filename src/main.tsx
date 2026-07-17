import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import FaceLoop from './FaceLoop'
import './styles.css'

const display = window.location.pathname === '/face' ? <FaceLoop /> : <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {display}
  </StrictMode>,
)
