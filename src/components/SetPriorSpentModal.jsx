import React, { useState, useEffect } from 'react';
import { Wallet, History, X, Check, ArrowLeftRight, HelpCircle } from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

export default function SetPriorSpentModal({
  isOpen,
  onClose,
  onSave,
  salary = 4000,
  currentPriorSpent = 0,
  currencySymbol = '₪',
}) {
  const [mode, setMode] = useState('spent'); // 'spent' | 'remaining'
  const [priorSpent, setPriorSpent] = useState(currentPriorSpent || 0);
  const [remainingBalance, setRemainingBalance] = useState(
    Math.max(0, salary - (currentPriorSpent || 0))
  );

  useEffect(() => {
    setPriorSpent(currentPriorSpent || 0);
    setRemainingBalance(Math.max(0, salary - (currentPriorSpent || 0)));
  }, [currentPriorSpent, salary, isOpen]);

  if (!isOpen) return null;

  const handleSpentChange = (val) => {
    const num = Number(val) || 0;
    setPriorSpent(val);
    setRemainingBalance(Math.max(0, salary - num));
  };

  const handleRemainingChange = (val) => {
    const num = Number(val) || 0;
    setRemainingBalance(val);
    setPriorSpent(Math.max(0, salary - num));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPrior = Number(priorSpent) || 0;
    onSave(finalPrior);
    onClose();
  };

  const handleResetToZero = () => {
    setPriorSpent(0);
    setRemainingBalance(salary);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '440px', padding: '24px 20px' }}>
        {/* رأس النافذة */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={22} color="var(--brand-500)" />
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0 }}>
              تسجيل الراتب بعد الصرف السابق
            </h3>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose} style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* شرح مبسط للمستخدم */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '16px',
          fontSize: '0.82rem',
          lineHeight: 1.5,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
        }}>
          <HelpCircle size={17} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            استلمت راتبك قبل أيام وصرفت منه جزءاً؟ لا داعي لتذكر الفواتير القديمة. حدد إما <strong>كم صرفت سابقاً</strong> أو <strong>كم متبقي في جيبك الآن</strong>، وسيحسب التطبيق الباقي تلقائياً!
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* خانة الراتب المرجعي */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-app)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '14px',
            fontSize: '0.84rem',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>راتبك الشهري المسجل:</span>
            <strong>{formatCurrency(salary, currencySymbol)}</strong>
          </div>

          {/* تبديل طريقة الإدخال */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={() => setMode('spent')}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: mode === 'spent' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                background: mode === 'spent' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-app)',
                color: mode === 'spent' ? 'var(--brand-500)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              أعرف كم صرفت سابقاً
            </button>
            <button
              type="button"
              onClick={() => setMode('remaining')}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: mode === 'remaining' ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                background: mode === 'remaining' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-app)',
                color: mode === 'remaining' ? '#3b82f6' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              أعرف كم باقي معي الآن
            </button>
          </div>

          {mode === 'spent' ? (
            <div className="form-group">
              <label className="form-label">
                كم صرفت في الأيام السابقة لهذا الشهر؟ ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={priorSpent}
                onChange={(e) => handleSpentChange(e.target.value)}
                placeholder="0"
                required
                style={{ fontSize: '1.4rem', fontWeight: 900, textAlign: 'center' }}
                autoFocus
              />
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                المتبقي التلقائي في جيبك سيكون: <strong style={{ color: 'var(--color-success)' }}>{formatCurrency(remainingBalance, currencySymbol)}</strong>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">
                كم متبقي في جيبك / حسابك الآن بعد الصرف؟ ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={remainingBalance}
                onChange={(e) => handleRemainingChange(e.target.value)}
                placeholder="مثال: 3200"
                required
                style={{ fontSize: '1.4rem', fontWeight: 900, textAlign: 'center' }}
                autoFocus
              />
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                المصروف المحسوب للأيام السابقة: <strong style={{ color: 'var(--brand-500)' }}>{formatCurrency(priorSpent, currencySymbol)}</strong>
              </div>
            </div>
          )}

          {/* أزرار سريعة */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '18px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetToZero}
              style={{ fontSize: '0.76rem' }}
            >
              تصفير (لم أصرف شيئاً سابقاً)
            </button>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>حفظ وتحديث الرصيد</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
