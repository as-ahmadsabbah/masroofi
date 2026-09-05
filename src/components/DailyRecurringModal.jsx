import React, { useState, useEffect } from 'react';
import { Repeat, X, Check, Flame, Calendar, Sparkles, HelpCircle } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatCurrency, getTodayIso, getCurrentMonthKey } from '../utils/dateUtils';

export default function DailyRecurringModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
  editingItem = null,
  currencySymbol = '₪',
}) {
  const [name, setName] = useState('');
  const [amountPerDay, setAmountPerDay] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [repeatMode, setRepeatMode] = useState('end_of_month'); // 'end_of_month' | 'continuous'

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setAmountPerDay(editingItem.amountPerDay || '');
      setCategoryId(editingItem.categoryId || (categories[0]?.id || ''));
      setRepeatMode(editingItem.repeatTillEndOfMonth ? 'end_of_month' : 'continuous');
    } else {
      setName('');
      setAmountPerDay('5');
      setCategoryId(categories.find(c => c.name === 'دخان' || c.id === 'smoke')?.id || categories[0]?.id || '');
      setRepeatMode('end_of_month');
    }
  }, [editingItem, isOpen, categories]);

  if (!isOpen) return null;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = today.getDate();
  const remainingDays = Math.max(1, totalDaysInMonth - currentDay + 1);

  const numAmount = Number(amountPerDay) || 0;
  const totalForRemainingMonth = Math.round(numAmount * remainingDays);
  const totalForFullMonth = Math.round(numAmount * totalDaysInMonth);

  const selectedCat = categories.find(c => c.id === categoryId) || categories[0] || {
    name: 'مصروف',
    color: '#ef4444',
    icon: 'Flame',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || numAmount <= 0) return;

    onSave({
      id: editingItem?.id,
      name: name.trim(),
      amountPerDay: numAmount,
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      icon: selectedCat.icon || 'Flame',
      color: selectedCat.color || '#ef4444',
      repeatTillEndOfMonth: repeatMode === 'end_of_month',
      startDate: editingItem?.startDate || getTodayIso(),
      endDate: repeatMode === 'end_of_month'
        ? `${year}-${String(month + 1).padStart(2, '0')}-${String(totalDaysInMonth).padStart(2, '0')}`
        : null,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '440px', padding: '24px 20px' }}>
        {/* رأس النافذة */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Repeat size={22} color="var(--brand-500)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              {editingItem ? 'تعديل المصروف المتكرر' : 'إضافة مصروف يومي متكرر تلقائياً'}
            </h3>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose} style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* تنبيه وشرح ذكي */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
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
          <Sparkles size={18} color="var(--brand-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            لا داعي لتسجيل المصروف كل يوم يدوياً! بمجرد إضافته، سيقوم التطبيق بإدراجه في مصاريف اليوم ومجموع الشهر تلقائياً كل يوم.
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* اسم المصروف */}
          <div className="form-group">
            <label className="form-label">اسم المصروف المتكرر *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: دخان، قهوة، إفطار، مواصلات..."
              required
              autoFocus
              style={{ fontSize: '1rem', fontWeight: 700 }}
            />
          </div>

          {/* التكلفة باليوم */}
          <div className="form-group">
            <label className="form-label">التكلفة باليوم الواحد ({currencySymbol}) *</label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={amountPerDay}
              onChange={(e) => setAmountPerDay(e.target.value)}
              placeholder="5"
              required
              style={{ fontSize: '1.4rem', fontWeight: 900, textAlign: 'center' }}
            />
          </div>

          {/* خيار مدة التكرار */}
          <div className="form-group">
            <label className="form-label">فترة التكرار التلقائي:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRepeatMode('end_of_month')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: repeatMode === 'end_of_month' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                  background: repeatMode === 'end_of_month' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-app)',
                  color: repeatMode === 'end_of_month' ? 'var(--brand-500)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Calendar size={18} />
                <span>حتى نهاية هذا الشهر</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({remainingDays} يوم متبقي)</span>
              </button>

              <button
                type="button"
                onClick={() => setRepeatMode('continuous')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: repeatMode === 'continuous' ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                  background: repeatMode === 'continuous' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-app)',
                  color: repeatMode === 'continuous' ? '#3b82f6' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Repeat size={18} />
                <span>مستمر كل يوم</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>يتجدد تلقائياً</span>
              </button>
            </div>
          </div>

          {/* فئة المصروف */}
          <div className="form-group">
            <label className="form-label">الفئة التابع لها:</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '6px',
              maxHeight: '130px',
              overflowY: 'auto',
              padding: '4px',
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
            }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    if (!name.trim()) setName(cat.name);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: categoryId === cat.id ? `2px solid ${cat.color}` : '1px solid var(--border-subtle)',
                    background: categoryId === cat.id ? `${cat.color}20` : 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <CategoryIcon name={cat.icon} size={14} color={cat.color} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ملخص الحساب التلقائي الذكي */}
          {numAmount > 0 && (
            <div style={{
              background: 'var(--bg-app)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
              fontSize: '0.82rem',
              lineHeight: 1.6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: 'var(--text-muted)' }}>المحسوب شهرياً بالكامل:</span>
                <strong>{formatCurrency(totalForFullMonth, currencySymbol)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>المتبقي حتى نهاية الشهر:</span>
                <strong style={{ color: 'var(--brand-500)' }}>
                  {formatCurrency(totalForRemainingMonth, currencySymbol)} ({remainingDays} يوم × {numAmount} {currencySymbol})
                </strong>
              </div>
            </div>
          )}

          {/* أزرار الحفظ والإلغاء */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{editingItem ? 'حفظ التعديلات' : 'تفعيل التكرار اليومي'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
