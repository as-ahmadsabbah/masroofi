import React, { useState } from 'react';
import { Target, X, Check, PiggyBank, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

export default function SetGoalModal({
  isOpen,
  onClose,
  onSave,
  settings,
}) {
  const [goalType, setGoalType] = useState(settings?.goalType || 'savings');
  const [targetAmount, setTargetAmount] = useState(settings?.goalTargetAmount || 1000);

  if (!isOpen) return null;

  const currencySymbol = settings?.baseCurrency === 'USD' ? '$' : '₪';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      goalType,
      goalTargetAmount: Number(targetAmount) || 1000,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={22} color="var(--brand-500)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>تحديد الهدف المالي للشهر</h3>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
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
                ? `المبلغ المراد ادخاره (${currencySymbol}) *`
                : `الحد الأقصى للمصاريف (${currencySymbol}) *`}
            </label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="مثال: 1000"
              required
              style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}
            />
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              {goalType === 'savings'
                ? 'سيتابع التطبيق وتيرة صرفك ويخبرك إذا كنت ستصل لمبلغ الادخار هذا بنهاية الشهر.'
                : 'سيحذرك التطبيق إذا كانت وتيرة صرفك ستتجاوز هذا السقف.'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>تأكيد الهدف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
