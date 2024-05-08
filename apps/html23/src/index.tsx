import { createRoot } from 'react-dom/client'
import './global.css'
import { Suspense, lazy } from 'react'
import { Onboarding } from './components/onboarding.js'

const LazyApp = lazy(() => import('./App.js'))

createRoot(document.getElementById('root')!).render(
  <Onboarding>
    <Suspense>
      <LazyApp />
    </Suspense>
  </Onboarding>,
)
