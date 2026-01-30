import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Note: StrictMode is intentionally disabled for this WebGL application.
// StrictMode causes double-mounting of components in development, which
// rapidly creates/destroys GPU resources and leads to WebGL context loss.
// This is a common pattern for Three.js/React Three Fiber applications.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
