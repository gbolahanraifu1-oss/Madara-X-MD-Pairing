import { createRoot } from 'react-dom/client';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import App from './App';
import { getAuthToken } from './lib/auth-token';

import './index.css';

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { error: Error | null };

class AppErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[App] Unhandled render error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '24px',
            background: '#0a0a0a',
            color: '#f5f5f5',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <section style={{ maxWidth: '520px' }}>
            <h1 style={{ color: '#ff2b2b', marginBottom: '12px' }}>
              ᴍᴀᴅᴀʀᴀ x-ᴍᴅ could not finish loading
            </h1>
            <p style={{ color: '#c7c7c7', lineHeight: 1.6 }}>
              An unexpected browser error stopped the page. Refresh to try
              again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '11px 18px',
                border: 0,
                borderRadius: '8px',
                background: '#ff2b2b',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Refresh page
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}
setAuthTokenGetter(getAuthToken);

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
