import React from 'react';
import { Sun, Moon, PlusCircle, Lock, Calendar, DollarSign, Wallet } from 'lucide-react';
import { formatArabicMonth } from '../utils/dateUtils';

export default function Header({
  settings,
  activeMonth,
  setActiveMonth,
  availableMonths = [],
  onOpenAddExpense,
  onOpenAddIncome,
  onToggleTheme,
  onLockApp,
  isPinEnabled,
}) {
  return (
    <header className="glass-card" style={{
      borderRadius: '0 0 24px 24px',
      margin: '0 0 24px 0',
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* الهوية البصرية والشعار */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src="/logo.png"
              alt="شعار مصروفي"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                مصروفي
              </h1>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                الميزانية الذكية
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              إدارة المصاريف وتنمية المدخرات الشخصية
            </p>
          </div>
        </div>

        {/* محدد الشهر المالي والإجراءات */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* محدد الشهر المالي النشط */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-app)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <Calendar size={18} color="var(--brand-500)" />
            <select
              value={activeMonth}
              onChange={(e) => setActiveMonth(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-main)',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {availableMonths.map((mKey) => (
                <option key={mKey} value={mKey} style={{ background: 'var(--bg-surface)' }}>
                  {formatArabicMonth(mKey)}
                </option>
              ))}
            </select>
          </div>

          {/* زر إضافة دخل إضافي */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenAddIncome}
            title="تسجيل دخل إضافي (فريلانس / مكافأة)"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Wallet size={16} color="var(--brand-500)" />
            <span>+ دخل إضافي</span>
          </button>

          {/* زر إضافة مصروف فوري */}
          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenAddExpense}
            title="تسجيل مصروف جديد سريع"
          >
            <PlusCircle size={16} />
            <span>+ مصروف جديد</span>
          </button>

          {/* قفل التطبيق إذا كان مفعلاً */}
          {isPinEnabled && (
            <button
              className="btn btn-secondary btn-icon"
              onClick={onLockApp}
              title="قفل التطبيق برقم سري"
            >
              <Lock size={18} />
            </button>
          )}

          {/* تبديل الوضع الليلي والنهاري */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={onToggleTheme}
            title={settings.theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
          >
            {settings.theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>
        </div>
      </div>
    </header>
  );
}
