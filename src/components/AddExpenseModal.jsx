import React, { useState, useEffect } from 'react';
import { X, Plus, AlertTriangle, AlertCircle, RefreshCw, Check } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { formatDateIso, formatCurrency } from '../utils/dateUtils';

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
  settings,
  currentExpenses = [],
  editingExpense = null,
}) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(settings?.baseCurrency || 'SAR');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'food');
  const [date, setDate] = useState(formatDateIso(new Date()));
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount);
      setCurrency(editingExpense.currency || settings?.baseCurrency || 'SAR');
      setCategoryId(editingExpense.categoryId);
      setDate(editingExpense.date);
      setNote(editingExpense.note || '');
      setIsRecurring(!!editingExpense.isRecurring);
    } else {
      setAmount('');
      setCurrency(settings?.baseCurrency || 'SAR');
      setCategoryId(categories[0]?.id || 'food');
      setDate(formatDateIso(new Date()));
      setNote('');
      setIsRecurring(false);
    }
  }, [editingExpense, isOpen, categories, settings]);

  if (!isOpen) return null;

  // حساب سعر التحويل للعملة الأساسية
  const baseCurrency = settings?.baseCurrency || 'SAR';
  const selectedCurrencyObj = settings?.currencies?.find(c => c.code === currency);
  const baseCurrencyObj = settings?.currencies?.find(c => c.code === baseCurrency);
  const rate = selectedCurrencyObj ? (selectedCurrencyObj.rateToBase || 1) : 1;
  const convertedAmount = (Number(amount) || 0) * rate;

  // حساب ميزانية الفئة المحددة والمصروف الفعلي حتى الآن
  const category = categories.find(c => c.id === categoryId);
  const salary = Number(settings?.salary || 0);
  
  let plannedLimit = 0;
  if (category) {
    if (category.limitType === 'percentage') {
      plannedLimit = (salary * (category.limitValue || 0)) / 100;
    } else {
      plannedLimit = Number(category.limitValue || 0);
    }
  }

  // المصروف الفعلي الحالي لهذه الفئة (باستثناء المصروف قيد التعديل إن وجد)
  const currentCategorySpent = currentExpenses
    .filter(e => e.categoryId === categoryId && (!editingExpense || e.id !== editingExpense.id))
    .reduce((sum, e) => sum + Number(e.convertedAmount || e.amount || 0), 0);

  const projectedSpent = currentCategorySpent + convertedAmount;
  const projectedPercent = plannedLimit > 0 ? (projectedSpent / plannedLimit) * 100 : 0;
  const isOverLimit = plannedLimit > 0 && projectedSpent > plannedLimit;
  const isNearLimit = plannedLimit > 0 && projectedPercent >= 90 && !isOverLimit;

  // إجمالي مصاريف الشهر مع المصروف الجديد
  const totalSpentAll = currentExpenses
    .filter(e => !editingExpense || e.id !== editingExpense.id)
    .reduce((sum, e) => sum + Number(e.convertedAmount || e.amount || 0), 0) + convertedAmount;
  const isBudgetDeficit = salary > 0 && totalSpentAll > salary;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    onSave({
      id: editingExpense ? editingExpense.id : undefined,
      amount: Number(amount),
      currency,
      convertedAmount,
      categoryId,
      date,
      note,
      isRecurring,
    });
    onClose();
  };

  const quickNotes = ['تموينات غذائية', 'مطعم وكافيه', 'بنزين', 'صيدلية', 'تسوق متجر', 'فاتورة إنترنت'];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        {/* رأس النافذة */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gradient)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Plus size={22} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {editingExpense ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* المبلغ والعملة في صف واحد */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">المبلغ *</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                required
                style={{ fontSize: '1.25rem', fontWeight: 700 }}
              />
            </div>
            <div>
              <label className="form-label">العملة</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ fontSize: '0.92rem' }}
              >
                {settings?.currencies?.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* معاينة التحويل إن كانت عملة مختلفة */}
          {currency !== baseCurrency && Number(amount) > 0 && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
            }}>
              يساوي تقريباً: <strong style={{ color: 'var(--color-info)' }}>{formatCurrency(convertedAmount, baseCurrencyObj?.symbol)}</strong> (سعر الصرف: 1 {currency} = {rate} {baseCurrency})
            </div>
          )}

          {/* اختيار الفئة */}
          <div className="form-group">
            <label className="form-label">الفئة *</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '8px',
              maxHeight: '160px',
              overflowY: 'auto',
              padding: '4px',
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              {categories.map((cat) => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--bg-surface)' : 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'right',
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: `${cat.color}20`,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CategoryIcon name={cat.icon} size={16} color={cat.color} />
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* مؤشر ميزانية الفئة الفوري والتنبيهات المباشرة */}
          {category && plannedLimit > 0 && (
            <div style={{
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  ميزانية <strong>{category.name}</strong>: {formatCurrency(plannedLimit, baseCurrencyObj?.symbol)}
                </span>
                <span style={{ fontWeight: 700, color: isOverLimit ? 'var(--color-danger)' : isNearLimit ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  {Math.round(projectedPercent)}%
                </span>
              </div>

              <div className="progress-bar-container" style={{ height: '8px', marginBottom: '8px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, projectedPercent)}%`,
                    background: isOverLimit ? 'var(--color-danger)' : isNearLimit ? 'var(--color-warning)' : category.color,
                  }}
                />
              </div>

              {/* تنبيه لطيف عند الوصول إلى 90% */}
              {isNearLimit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-warning)' }}>
                  <AlertTriangle size={14} />
                  <span>تنبيه لطيف: بهذا المصروف ستصل إلى 90% من سقف ميزانية هذه الفئة.</span>
                </div>
              )}

              {/* تنبيه بارز عند تجاوز الفئة 100% */}
              {isOverLimit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-danger)' }}>
                  <AlertCircle size={14} />
                  <span>تحذير: ستتجاوز الميزانية المحددة لهذه الفئة بمقدار {formatCurrency(projectedSpent - plannedLimit, baseCurrencyObj?.symbol)}!</span>
                </div>
              )}
            </div>
          )}

          {/* تنبيه بارز لعجز الميزانية الكلية إذا تجاوز إجمالي المصروف الراتب */}
          {isBudgetDeficit && (
            <div className="alert-banner danger" style={{ padding: '10px 14px', fontSize: '0.82rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <strong>عجز في الميزانية!</strong>
                <span>إجمالي المصاريف سيتجاوز الراتب الشهري بمقدار {formatCurrency(totalSpentAll - salary, baseCurrencyObj?.symbol)}.</span>
              </div>
            </div>
          )}

          {/* التاريخ والملاحظة */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label className="form-label">التاريخ</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">ملاحظة / المحل (اختياري)</label>
              <input
                type="text"
                className="form-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثال: كارفور، مطعم الرومانسية..."
              />
            </div>
          </div>

          {/* وسوم سريعة للملاحظات */}
          {!editingExpense && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {quickNotes.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setNote(q)}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* خيار مصروف متكرر شهرياً */}
          <div style={{
            background: 'var(--bg-app)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '22px',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-500)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600 }}>
                  <RefreshCw size={15} color="var(--brand-500)" />
                  <span>مصروف متكرر شهرياً (إيجار، اشتراكات، أقساط)</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  سيتم تكراره وإضافته تلقائياً عند بداية كل شهر مالي جديد.
                </div>
              </div>
            </label>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!amount || Number(amount) <= 0}
            >
              <Check size={18} />
              <span>{editingExpense ? 'حفظ التعديلات' : 'تسجيل المصروف'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
