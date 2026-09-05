import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Masroofi Error caught:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#090d16',
          color: '#f8fafc',
          textAlign: 'center',
          fontFamily: "'Alexandria', sans-serif",
          direction: 'rtl',
        }}>
          <div style={{
            maxWidth: '420px',
            width: '100%',
            background: '#0f172a',
            padding: '32px 24px',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src="/logo.png" alt="مصروفي" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
              مرحباً بك في تطبيق مصروفي
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.6 }}>
              يبدو أن هناك بيانات مخزنة قديمة في متصفحك تحتاج لتحديث. اضغط الزر أدناه لبدء التطبيق مباشرة:
            </p>

            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.35)',
              }}
            >
              تحديث وفتح التطبيق الآن
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
