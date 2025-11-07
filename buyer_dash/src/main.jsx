import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// DEV-only: sanitize React DevTools renderer versions to avoid "Invalid argument not valid semver ('')" errors
// Some renderer implementations can register with an empty version string which breaks the DevTools
if (import.meta.env.DEV) {
  try {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook) {
      // Wrap register to fix future registrations
      const originalRegister = hook.register;
      hook.register = function (renderer) {
        try {
          if (renderer && typeof renderer.version === 'string' && renderer.version === '') {
            renderer.version = '0.0.0';
          }
        } catch (e) {
          // ignore
        }
        return originalRegister.apply(this, arguments);
      };

      // Sanitize any already-registered renderers (Map in newer DevTools)
      try {
        const renderers = hook.renderers;
        if (renderers && typeof renderers.forEach === 'function') {
          renderers.forEach((renderer) => {
            try {
              if (renderer && typeof renderer.version === 'string' && renderer.version === '') {
                renderer.version = '0.0.0';
              }
            } catch (e) {}
          });
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // swallow any errors in this defensive patch to avoid breaking the app
    // console.warn('DevTools sanitization failed', e);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
