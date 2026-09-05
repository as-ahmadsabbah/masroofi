import React from 'react';
import { Sun, Moon, Lock } from 'lucide-react';

export default function Header({
  settings,
  onToggleTheme,
  onLockApp,
  isPinEnabled,
}) {
  return (
    <header className="glass-card" style={{
      borderRadius: '0 0 20px 20px',
      margin: '0 0 20px 0',
      padding: '14px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        {/* الشعار واسم التطبيق */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src="/logo.png"
              alt="مصروفي"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                مصروفي
              </h1>
              <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                يومي
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              دفتر مصاريفك اليومي السريع
            </p>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isPinEnabled && (
            <button
              className="btn btn-secondary btn-icon btn-sm"
              onClick={onLockApp}
              title="قفل التطبيق برمز الأمان"
            >
              <Lock size={16} />
            </button>
          )}

          <button
            className="btn btn-secondary btn-icon btn-sm"
            onClick={onToggleTheme}
            title={settings.theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
          >
            {settings.theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
          </button>
        </div>
      </div>
    </header>
  );
}
