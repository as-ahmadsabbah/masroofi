import React, { useState, useEffect } from 'react';
import { Target, X, Check, PiggyBank, ShieldCheck, Calendar } from 'lucide-react';
import { formatCurrency, formatArabicMonth, getCurrentMonthKey } from '../utils/dateUtils';

export default function SetGoalModal({
  isOpen,
  onClose,
  onSave,
  settings,
  targetMonthKey = getCurrentMonthKey(),
  currentGoal = null,
}) {
  const [goalType, setGoalType] = useState('savings');
  const [targetAmount, setTargetAmount] = useState(1000);

  useEffect(() => {
    if (currentGoal) {
      setGoalType(currentGoal.goalType || 'savings');
      setTargetAmount(currentGoal.goalTargetAmount || 1000);
    } else if (settings) {
      setGoalType(settings.goalType || 'savings');
      setTargetAmount(settings.goalTargetAmount || 1000);
    }
  }, [currentGoal, settings, isOpen]);

  if (!isOpen) return null;

  const currencySymbol = settings?.baseCurrency === 'USD' ? '$' : '₪';
  const monthTitle = formatArabicMonth(targetMonthKey);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      goalType,
      goalTargetAmount: Number(targetAmount) || 1000,
      monthKey: targetMonthKey,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={22} color="var(--brand-500)" />
            <div>
              <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0 }}>تحديد الهدف المالي</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--brand-500)', fontWeight: 700 }}>
                {monthTitle ? `لشهر ${monthTitle}` : 'لهذا الشهر'}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose} style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">نوع الهدف المالي:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setGoalType('savings')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: goalType === 'savings' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                  background: goalType === 'savings' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-app)',
                  color: goalType === 'savings' ? 'var(--brand-500)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <PiggyBank size={20} />
                <span>هدف ادخار شهري</span>
              </button>

              <button
                type="button"
                onClick={() => setGoalType('spend_limit')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: goalType === 'spend_limit' ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                  background: goalType === 'spend_limit' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-app)',
                  color: goalType === 'spend_limit' ? '#3b82f6' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <ShieldCheck size={20} />
                <span>سقف أقصى للمصاريف</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {goalType === 'savings'
                ? `المبلغ المراد ادخاره في ${monthTitle} (${currencySymbol}) *`
                : `الحد الأقصى لمصاريف ${monthTitle} (${currencySymbol}) *`}
            </label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="مثال: 1000"
              required
              style={{ fontSize: '1.3rem', fontWeight: 800, textAlign: 'center' }}
            />
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              {goalType === 'savings'
                ? 'سيتابع التطبيق وتيرة صرفك ويخبرك إذا كنت ستحقق هذا الادخار بنهاية هذا الشهر.'
                : 'سيحذرك التطبيق إذا كانت وتيرة صرفك ستتجاوز هذا السقف.'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>حفظ هدف الشهر</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
