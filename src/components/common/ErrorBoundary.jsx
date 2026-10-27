import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MovieVerse ErrorBoundary caught error]:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#050507',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Outfit', -apple-system, sans-serif",
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '500px',
            background: 'rgba(18, 18, 24, 0.95)',
            border: '1px solid rgba(212, 160, 23, 0.35)',
            borderRadius: '18px',
            padding: '36px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 160, 23, 0.1)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#f5c842' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '24px' }}>
              MovieVerse encountered an unexpected rendering hiccup.
            </p>
            {this.state.error?.message && (
              <pre style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '12px',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '24px',
                fontFamily: 'monospace',
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              style={{
                background: 'linear-gradient(135deg, #d4a017, #f5c842)',
                color: '#050507',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(212, 160, 23, 0.4)',
              }}
            >
              Reload MovieVerse
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
