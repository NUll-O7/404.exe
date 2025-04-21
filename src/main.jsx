import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StoryProvider } from './context/StoryContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoryProvider>
      <App />
    </StoryProvider>
  </StrictMode>,
)
