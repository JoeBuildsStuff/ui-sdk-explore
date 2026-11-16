import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Preferences } from '@ui-sdk/react/preferences'
import './index.css'
import App from './App.tsx'
import { colorScheme } from './lib/color-scheme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preferences preferences={[colorScheme]}>
      <App />
    </Preferences>
  </StrictMode>,
)
