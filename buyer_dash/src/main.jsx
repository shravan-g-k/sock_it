import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// DEV-only: sanitize React DevTools renderer versions to avoid "Invalid argument not valid semver ('')" errors
// Some renderer implementations can register with an empty version string which breaks the DevTools
if (import.meta.env.DEV) {
  // Patch must run before React is imported to catch all registrations
  (function patchReactDevTools() {
    try {
      // Wait for hook to be available (might not exist immediately)
      const checkHook = () => {
        const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!hook) {
          // Retry after a short delay if hook doesn't exist yet
          setTimeout(checkHook, 10);
          return;
        }

        // Fix the registerRendererInterface method which is causing the error
        if (hook.registerRendererInterface) {
          const originalRegister = hook.registerRendererInterface;
          hook.registerRendererInterface = function(...args) {
            try {
              // Ensure version is valid before registration
              if (args[0] && typeof args[0].version === 'string') {
                if (args[0].version === '' || !args[0].version) {
                  args[0].version = '0.0.0';
                }
              }
              return originalRegister.apply(this, args);
            } catch (e) {
              // Silently fail if registration fails to prevent app crash
              console.warn('DevTools registration intercepted error:', e);
              return null;
            }
          };
        }

        // Wrap register to fix future registrations
        if (hook.register) {
          const originalRegister = hook.register;
          hook.register = function (renderer) {
            try {
              if (renderer) {
                // Fix empty or invalid version strings
                if (typeof renderer.version === 'string') {
                  if (renderer.version === '' || !renderer.version.trim()) {
                    renderer.version = '0.0.0';
                  }
                } else if (renderer.version === null || renderer.version === undefined) {
                  renderer.version = '0.0.0';
                }
              }
              return originalRegister.apply(this, arguments);
            } catch (e) {
              // If registration fails, just continue without DevTools
              console.warn('DevTools registration failed:', e);
              return null;
            }
          };
        }

        // Sanitize any already-registered renderers
        try {
          if (hook.renderers) {
            if (typeof hook.renderers.forEach === 'function') {
              hook.renderers.forEach((renderer, key) => {
                try {
                  if (renderer && typeof renderer.version === 'string') {
                    if (renderer.version === '' || !renderer.version.trim()) {
                      renderer.version = '0.0.0';
                    }
                  }
                } catch (e) {
                  // ignore individual renderer errors
                }
              });
            } else if (hook.renderers instanceof Map) {
              hook.renderers.forEach((renderer) => {
                try {
                  if (renderer && typeof renderer.version === 'string') {
                    if (renderer.version === '' || !renderer.version.trim()) {
                      renderer.version = '0.0.0';
                    }
                  }
                } catch (e) {
                  // ignore
                }
              });
            }
          }
        } catch (e) {
          // ignore renderer sanitization errors
        }
      };

      // Start checking for the hook
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkHook);
      } else {
        checkHook();
      }
    } catch (e) {
      // Silently fail - don't break the app if DevTools patching fails
      console.warn('React DevTools patch failed (non-critical):', e);
    }
  })();

  // Also add a global error handler to catch any remaining DevTools errors
  const originalError = console.error;
  console.error = function(...args) {
    // Filter out DevTools semver errors to prevent noise
    const errorString = args.join(' ');
    if (errorString.includes('not valid semver') || 
        errorString.includes('react_devtools_backend') ||
        errorString.includes('Invalid argument not valid semver')) {
      // Suppress these specific errors
      return;
    }
    originalError.apply(console, args);
  };

  // Catch unhandled errors and promise rejections
  window.addEventListener('error', function(event) {
    const errorMsg = event.message || event.error?.toString() || '';
    if (errorMsg.includes('not valid semver') || 
        errorMsg.includes('react_devtools_backend') ||
        errorMsg.includes('Invalid argument not valid semver')) {
      // Prevent DevTools errors from crashing the app
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  window.addEventListener('unhandledrejection', function(event) {
    const errorMsg = event.reason?.toString() || '';
    if (errorMsg.includes('not valid semver') || 
        errorMsg.includes('react_devtools_backend') ||
        errorMsg.includes('Invalid argument not valid semver')) {
      // Prevent DevTools promise rejections from crashing the app
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
