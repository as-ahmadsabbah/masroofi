import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown, ChevronUp, Calendar, FileText } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { getTodayIso } from '../utils/dateUtils';

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
  settings,
  editingExpense = null,
  initialCategory = null,
  onAddNewCategory,
}) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(settings?.baseCurrency || 'ILS');
  const [showMore, setShowMore] = useState(false);
  const [date, setDate] = useState(getTodayIso());
  const [note, setNote] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setCategoryId(editingExpense.categoryId);
      setAmount(editingExpense.amount);
      setCurrency(editingExpense.currency || 'ILS');
      setDate(editingExpense.date);
      setNote(editingExpense.note || '');
      setShowMore(!!editingExpense.note || editingExpense.date !== getTodayIso());
    } else {
      const defaultCat = initialCategory || categories[0];
      if (defaultCat) {
        setCategoryId(defaultCat.id);
        setAmount(defaultCat.defaultAmount ? String(defaultCat.defaultAmount) : '');
      }
      setCurrency(settings?.baseCurrency || 'ILS');
      setDate(getTodayIso());
      setNote('');
      setShowMore(false);
    }
  }, [editingExpense, initialCategory, isOpen, categories, settings]);

  if (!isOpen) return null;

  const handleSelectCategory = (cat) => {
    setCategoryId(cat.id);
    if (cat.defaultAmount) {
      setAmount(String(cat.defaultAmount));
    }
  };

  const handleQuickCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (onAddNewCategory) {
      const created = onAddNewCategory({
        name: newCatName.trim(),
        type: 'daily',
        icon: 'Tag',
        color: '#10b981',
      });
      if (created) {
        setCategoryId(created.id);
      }
    }
    setNewCatName('');
    setIsCreatingCat(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) return;

    const selectedCat = categories.find(c => c.id === categoryId);

    // تحويل المبلغ إذا كان بالدولار
    const rate = currency === 'USD' ? (settings?.currencies?.find(c => c.code === 'USD')?.rateToBase || 3.65) : 1;
    const convertedAmount = currency === 'USD' ? num * rate : num;

    onSave({
      id: editingExpense?.id,
      amount: num,
      currency,
      convertedAmount,
      categoryId,
      categoryName: selectedCat?.name || 'مصروف',
      date: date || getTodayIso(),
      note: note.trim(),
    });

    onClose();
  };

  const currentCat = categories.find(c => c.id === categoryId) || categories[0];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '440px', padding: '24px 20px' }}>
        {/* رأس النافذة */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            {editingExpense ? 'تعديل المصروف' : 'إضافة مصروف اليوم'}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon btn-sm"
            style={{ borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* اختيار الفئة أولاً بنقرة واحدة */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                اختر الفئة:
              </label>
              {!isCreatingCat && (
                <button
                  type="button"
                  onClick={() => setIsCreatingCat(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-500)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  + فئة مخصصة جديدة
                </button>
              )}
            </div>

            {/* إنشاء فئة مخصصة على الفور */}
            {isCreatingCat && (
              <div style={{
                background: 'var(--bg-app)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="اسم الفئة الجديدة (مثال: بنزين، هدايا...)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                  style={{ fontSize: '0.86rem', padding: '6px 10px' }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleQuickCreateCategory}
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  إضافة
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setIsCreatingCat(false); setNewCatName(''); }}
                  style={{ padding: '6px 10px' }}
                >
                  إلغاء
                </button>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
            }}>
              {categories.map((cat) => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '12px 6px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-subtle)',
                      background: isSelected ? `${cat.color}15` : 'var(--bg-app)',
                      color: isSelected ? cat.color : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `${cat.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CategoryIcon name={cat.icon} size={20} color={cat.color} />
                    </div>
                    <span style={{ fontSize: '0.84rem', fontWeight: isSelected ? 800 : 600 }}>
                      {cat.name}
                    </span>
                    {cat.defaultAmount && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ({cat.defaultAmount} ₪)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* خانة إدخال المبلغ بخط كبير واضح */}
          <div style={{
            background: 'var(--bg-app)',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-subtle)',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              المبلغ لـ {currentCat?.name || 'المصروف'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <input
                type="number"
                step="any"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                required
                style={{
                  textAlign: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  height: '60px',
                  maxWidth: '180px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-focus)',
                }}
              />
              {/* اختيار العملة: شيكل ₪ أو دولار $ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setCurrency('ILS')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: currency === 'ILS' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                    background: currency === 'ILS' ? 'var(--brand-500)' : 'var(--bg-surface)',
                    color: currency === 'ILS' ? '#fff' : 'var(--text-primary)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  ₪
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: currency === 'USD' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                    background: currency === 'USD' ? 'var(--brand-500)' : 'var(--bg-surface)',
                    color: currency === 'USD' ? '#fff' : 'var(--text-primary)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  $
                </button>
              </div>
            </div>

            {/* أزرار مبالغ سريعة */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
              {[5, 10, 20, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +{val} {currency === 'USD' ? '$' : '₪'}
                </button>
              ))}
            </div>
          </div>

          {/* خيارات إضافية (مخفية اختيارية خلف "المزيد") */}
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                margin: '0 auto',
              }}
            >
              <span>{showMore ? 'إخفاء الخيارات الإضافية' : 'خيارات إضافية (تاريخ / ملاحظة)'}</span>
              {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showMore && (
              <div style={{
                background: 'var(--bg-app)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                marginTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>التاريخ:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>ملاحظة اختيارية:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="مثال: بقالة أبو أحمد..."
                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* زر التأكيد الكبير */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!amount || Number(amount) <= 0}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1.1rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Check size={20} />
            <span>تأكيد المصروف ({amount ? `${amount} ${currency === 'USD' ? '$' : '₪'}` : 'أدخل المبلغ'})</span>
          </button>
        </form>
      </div>
    </div>
  );
}
