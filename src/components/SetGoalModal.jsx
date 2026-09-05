import React, { useState, useEffect } from 'react';
import { Target, X, Check, PiggyBank, ShieldCheck, Ban, Trash2 } from 'lucide-react';
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
  const [targetAmount, setTargetAmount] = useState('1000');

  useEffect(() => {
    if (currentGoal && currentGoal.goalType) {
      setGoalType(currentGoal.goalType);
      setTargetAmount(currentGoal.goalTargetAmount ? String(currentGoal.goalTargetAmount) : '');
    } else if (settings && settings.goalType && settings.goalType !== 'none') {
      setGoalType(settings.goalType);
      setTargetAmount(settings.goalTargetAmount ? String(settings.goalTargetAmount) : '');
    } else {
      setGoalType('none');
      setTargetAmount('');
    }
  }, [currentGoal, settings, isOpen]);

  if (!isOpen) return null;

  const safeMonthKey = (typeof targetMonthKey === 'string' && targetMonthKey.includes('-'))
    ? targetMonthKey
    : getCurrentMonthKey();

  const currencySymbol = settings?.baseCurrency === 'USD' ? '$' : '₪';
  const monthTitle = formatArabicMonth(safeMonthKey);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goalType === 'none') {
      onSave({
        goalType: 'none',
        goalTargetAmount: 0,
        monthKey: safeMonthKey,
      });
    } else {
      const num = Number(targetAmount);
      if (!num || num <= 0) {
        alert('يرجى إدخال مبلغ صحيح أكبر من 0، أو اختيار "فش هدف لهذا الشهر"');
        return;
      }
      onSave({
        goalType,
        goalTargetAmount: num,
        monthKey: safeMonthKey,
      });
    }
    onClose();
  };

  const handleClearGoalImmediately = () => {
    onSave({
      goalType: 'none',
      goalTargetAmount: 0,
      monthKey: safeMonthKey,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '440px', padding: '24px 20px' }}>
        {/* رأس النافذة */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={22} color="var(--brand-500)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>تحديد الهدف المالي</h3>
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
          {/* اختيار نوع الهدف مع خيار "فش هدف لهذا الشهر" البارز */}
          <div className="form-group">
            <label className="form-label">اختر نوع الهدف:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {/* خيار 1: هدف ادخار */}
              <button
                type="button"
                onClick={() => {
                  setGoalType('savings');
                  if (!targetAmount || Number(targetAmount) <= 0) setTargetAmount('1000');
                }}
                style={{
                  padding: '12px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: goalType === 'savings' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                  background: goalType === 'savings' ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-app)',
                  color: goalType === 'savings' ? 'var(--brand-500)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <PiggyBank size={18} />
                <span>هدف ادخار</span>
              </button>

              {/* خيار 2: سقف مصاريف */}
              <button
                type="button"
                onClick={() => {
                  setGoalType('spend_limit');
                  if (!targetAmount || Number(targetAmount) <= 0) setTargetAmount('2500');
                }}
                style={{
                  padding: '12px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: goalType === 'spend_limit' ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                  background: goalType === 'spend_limit' ? 'rgba(59, 130, 246, 0.14)' : 'var(--bg-app)',
                  color: goalType === 'spend_limit' ? '#3b82f6' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <ShieldCheck size={18} />
                <span>سقف مصاريف</span>
              </button>

              {/* خيار 3: فش هدف لهذا الشهر */}
              <button
                type="button"
                onClick={() => setGoalType('none')}
                style={{
                  padding: '12px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: goalType === 'none' ? '2px solid #ef4444' : '1px solid var(--border-subtle)',
                  background: goalType === 'none' ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-app)',
                  color: goalType === 'none' ? '#ef4444' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Ban size={18} />
                <span>فش هدف هالشهر</span>
              </button>
            </div>
          </div>

          {/* خانة إدخال المبلغ إذا كان هناك هدف */}
          {goalType !== 'none' ? (
            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">
                {goalType === 'savings'
                  ? `المبلغ المطلوب ادخاره في ${monthTitle} (${currencySymbol}) *`
                  : `الحد الأقصى لمصاريف ${monthTitle} (${currencySymbol}) *`}
              </label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder={goalType === 'savings' ? 'مثال: 1000' : 'مثال: 2500'}
                required={goalType !== 'none'}
                autoFocus
                style={{ fontSize: '1.4rem', fontWeight: 900, textAlign: 'center' }}
              />
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                {goalType === 'savings'
                  ? 'سيتابع التطبيق وتيرة صرفك لمعرفة هل ستحقق هذا المبلغ بنهاية الشهر.'
                  : 'سيحذرك التطبيق إذا كانت وتيرة صرفك ستتجاوز هذا الحد.'}
              </span>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-app)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              marginTop: '14px',
              textAlign: 'center',
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}>
              <Check size={18} color="var(--color-success)" style={{ margin: '0 auto 4px' }} />
              <div>
                <strong>تم اختيار: بدون هدف مالي لشهر {monthTitle}</strong>
              </div>
              <span style={{ fontSize: '0.78rem' }}>
                لن يظهر أي شريط أحمر أو تنبيهات "خارج المسار" لهذا الشهر، وستتمكن من تتبع مصاريفك بكل حرية.
              </span>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '22px',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            {/* زر سريع لإلغاء وتصفير الهدف فوراً */}
            {goalType !== 'none' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClearGoalImmediately}
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: '0.78rem' }}
              >
                <Trash2 size={13} />
                <span>إلغاء الهدف (فش هدف)</span>
              </button>
            )}

            <div style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                إلغاء
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} />
                <span>{goalType === 'none' ? 'تأكيد (بدون هدف)' : 'حفظ الهدف'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
