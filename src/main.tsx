import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PerceptronHypergraphDemo from './Demo.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PerceptronHypergraphDemo />
  </StrictMode>,
)
