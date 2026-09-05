import React, { useState, useEffect } from 'react';
import { Lock, Delete, AlertCircle, RefreshCw } from 'lucide-react';

export default function PinLockScreen({ correctPin, onUnlock, onResetPin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setAttempts(prev => prev + 1);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  // دعم لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, correctPin]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #090d16 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div className="glass-card" style={{
        maxWidth: '380px',
        width: '100%',
        textAlign: 'center',
        padding: '36px 24px',
        borderRadius: '28px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
      }}>
        {/* الشعار والقفل */}
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '22px',
          margin: '0 auto 16px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <img src="/logo.png" alt="مصروفي" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
          مصروفي مقفل برمز الأمان
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          أدخل الرمز السري المكوّن من 4 أرقام للمتابعة
        </p>

        {/* نقاط الـ PIN */}
        <div className="pin-dots" style={{
          transform: error ? 'translateX(6px)' : 'none',
          transition: 'transform 0.1s ease',
        }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`pin-dot ${pin.length > i ? 'filled' : ''}`}
              style={{
                borderColor: error ? '#ef4444' : undefined,
                background: error ? '#ef4444' : undefined,
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{
            color: '#ef4444',
            fontSize: '0.85rem',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={16} />
            <span>الرمز غير صحيح، حاول ثانية</span>
          </div>
        )}

        {/* لوحة الأرقام */}
        <div className="pin-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className="pin-key"
              onClick={() => handleDigit(String(num))}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className="pin-key"
            onClick={() => setPin('')}
            style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}
          >
            مسح
          </button>
          <button
            type="button"
            className="pin-key"
            onClick={() => handleDigit('0')}
          >
            0
          </button>
          <button
            type="button"
            className="pin-key"
            onClick={handleDelete}
          >
            <Delete size={22} />
          </button>
        </div>

        {attempts >= 3 && onResetPin && (
          <button
            onClick={onResetPin}
            style={{
              marginTop: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'underline',
            }}
          >
            <RefreshCw size={14} />
            <span>نسيت الرمز؟ إعادة تعيين القفل</span>
          </button>
        )}
      </div>
    </div>
  );
}
