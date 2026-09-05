import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Percent,
  Sliders,
  X,
  Check,
} from 'lucide-react';
import CategoryIcon from '../CategoryIcon';
import { formatCurrency } from '../../utils/dateUtils';
import { SMART_50_30_20_PRESET } from '../../constants/categories';

export default function BudgetSetupView({
  categories = [],
  onSaveCategories,
  settings,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // حالة نموذج الفئة
  const [name, setName] = useState('');
  const [type, setType] = useState('variable'); // fixed | variable
  const [limitType, setLimitType] = useState('percentage'); // percentage | fixed
  const [limitValue, setLimitValue] = useState(10);
  const [color, setColor] = useState('#10b981');
  const [icon, setIcon] = useState('Utensils');

  const salary = Number(settings?.salary || 10000);
  const currencyObj = settings?.currencies?.find(c => c.code === settings?.baseCurrency);
  const currencySymbol = currencyObj?.symbol || 'ر.س';

  // حساب المجموع الكلي للنسب المخصصة
  const totalAllocatedPercentage = categories.reduce((sum, cat) => {
    if (cat.limitType === 'percentage') {
      return sum + Number(cat.limitValue || 0);
    } else {
      // تحويل المبلغ الثابت إلى نسبة مئوية من الراتب
      return sum + (salary > 0 ? (Number(cat.limitValue || 0) / salary) * 100 : 0);
    }
  }, 0);

  const isOverAllocated = Math.round(totalAllocatedPercentage) > 100;
  const isPerfectAllocated = Math.round(totalAllocatedPercentage) === 100;

  // تطبيق قاعدة 50/30/20 الذكية
  const handleApplySmartBudget = () => {
    const updated = categories.map((cat) => {
      const preset = SMART_50_30_20_PRESET[cat.id];
      if (preset) {
        return {
          ...cat,
          limitType: preset.limitType,
          limitValue: preset.limitValue,
        };
      }
      return cat;
    });

    onSaveCategories(updated);
    confetti({ particleCount: 60, spread: 60 });
    alert('تم تطبيق الميزانية الذكية (50% احتياجات / 30% رغبات / 20% ادخار) بنجاح!');
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setType('variable');
    setLimitType('percentage');
    setLimitValue(10);
    setColor('#10b981');
    setIcon('ShoppingBag');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setLimitType(cat.limitType || 'percentage');
    setLimitValue(cat.limitValue || 10);
    setColor(cat.color || '#10b981');
    setIcon(cat.icon || 'HelpCircle');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      // تعديل فئة موجودة
      const updated = categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, name, type, limitType, limitValue: Number(limitValue), color, icon }
          : c
      );
      onSaveCategories(updated);
    } else {
      // إضافة فئة جديدة
      const newCat = {
        id: 'cat_' + Date.now(),
        name,
        type,
        limitType,
        limitValue: Number(limitValue),
        color,
        icon,
      };
      onSaveCategories([...categories, newCat]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteCategory = (catId) => {
    if (categories.length <= 1) {
      alert('يجب أن تبقى فئة واحدة على الأقل في الميزانية!');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      const filtered = categories.filter((c) => c.id !== catId);
      onSaveCategories(filtered);
    }
  };

  const availableIcons = [
    'Home', 'Utensils', 'Car', 'HeartPulse', 'Film', 'ShoppingBag',
    'PiggyBank', 'HelpCircle', 'Smartphone', 'GraduationCap', 'Plane',
    'Coffee', 'Tv', 'Briefcase', 'CreditCard', 'Gift'
  ];

  const availableColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6',
    '#06B6D4', '#64748B', '#059669', '#EF4444', '#14B8A6'
  ];

  return (
    <div>
      {/* بطاقة التوزيع العام ومؤشر الـ 100% */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>تخطيط فئات الميزانية</h2>
              {isPerfectAllocated && (
                <span className="badge badge-success">
                  <CheckCircle2 size={13} />
                  <span>توزيع مثالي 100%</span>
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              خصص سقف الإنفاق لكل فئة كنسبة من الراتب أو كمبلغ ثابت
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleApplySmartBudget}
              title="توزيع الراتب مبدئياً وفق قاعدة 50/30/20"
              style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
            >
              <Sparkles size={16} color="#f59e0b" />
              <span>اقتراح ميزانية ذكية 50/30/20</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
              <Plus size={16} />
              <span>إضافة فئة جديدة</span>
            </button>
          </div>
        </div>

        {/* مؤشر إجمالي التوزيع والنسبة المئوية */}
        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>إجمالي المخصص من الراتب:</span>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: isOverAllocated ? 'var(--color-danger)' : isPerfectAllocated ? 'var(--color-success)' : 'var(--text-primary)',
            }}>
              {Math.round(totalAllocatedPercentage)}%
            </span>
          </div>

          <div className="progress-bar-container" style={{ height: '10px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, totalAllocatedPercentage)}%`,
                background: isOverAllocated ? 'var(--color-danger)' : isPerfectAllocated ? 'var(--color-success)' : 'var(--brand-500)',
              }}
            />
          </div>

          {/* تنبيه إذا تجاوز المجموع 100% */}
          {isOverAllocated && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '10px',
              color: 'var(--color-danger)',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}>
              <AlertCircle size={16} />
              <span>تنبيه: مجموع الميزانيات يتجاوز الراتب بنسبة {Math.round(totalAllocatedPercentage - 100)}%! يرجى تعديل النسب حتى لا يحدث عجز.</span>
            </div>
          )}

          {!isOverAllocated && !isPerfectAllocated && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              متبقٍ {Math.round(100 - totalAllocatedPercentage)}% غير مخصصة في الميزانية (تُترك كفائض حر أو ادخار تلقائي).
            </div>
          )}
        </div>
      </div>

      {/* قائمة الفئات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {categories.map((cat) => {
          let calculatedAmount = 0;
          let calculatedPercent = 0;

          if (cat.limitType === 'percentage') {
            calculatedPercent = cat.limitValue || 0;
            calculatedAmount = (salary * calculatedPercent) / 100;
          } else {
            calculatedAmount = Number(cat.limitValue || 0);
            calculatedPercent = salary > 0 ? (calculatedAmount / salary) * 100 : 0;
          }

          return (
            <div
              key={cat.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: `${cat.color}20`,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CategoryIcon name={cat.icon} size={20} color={cat.color} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{cat.name}</h4>
                      <span className={`badge ${cat.type === 'fixed' ? 'badge-fixed' : 'badge-variable'}`} style={{ fontSize: '0.7rem', padding: '1px 8px', marginTop: '4px' }}>
                        {cat.type === 'fixed' ? 'فئة ثابتة (إيجار/فواتير)' : 'فئة متغيرة (يومية)'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => handleOpenEditModal(cat)}
                      title="تعديل الفئة"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      onClick={() => handleDeleteCategory(cat.id)}
                      title="حذف الفئة"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-app)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginTop: '12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>حد الميزانية:</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {formatCurrency(calculatedAmount, currencySymbol)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>النسبة من الراتب:</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-500)' }}>
                      {Math.round(calculatedPercent)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* نافذة إضافة / تعديل الفئة */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingCategory ? 'تعديل فئة الميزانية' : 'إضافة فئة جديدة'}
              </h3>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label className="form-label">اسم الفئة *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: تعليم ودورات، بنزين..."
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">نوع الفئة *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setType('fixed')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: type === 'fixed' ? '2px solid #3b82f6' : '1px solid var(--border-subtle)',
                      background: type === 'fixed' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-app)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    ثابتة (إيجار، فواتير، اشتراك)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('variable')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: type === 'variable' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
                      background: type === 'variable' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-app)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    متغيرة (طعام، تسوق، ترفيه)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">طريقة تحديد الميزانية</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setLimitType('percentage')}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      border: limitType === 'percentage' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                      background: limitType === 'percentage' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-app)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                    }}
                  >
                    نسبة مئوية (%) من الراتب
                  </button>
                  <button
                    type="button"
                    onClick={() => setLimitType('fixed')}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      border: limitType === 'fixed' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                      background: limitType === 'fixed' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-app)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                    }}
                  >
                    مبلغ ثابت ({currencySymbol})
                  </button>
                </div>

                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={limitValue}
                  onChange={(e) => setLimitValue(e.target.value)}
                  placeholder={limitType === 'percentage' ? 'مثال: 15' : 'مثال: 1500'}
                  required
                />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {limitType === 'percentage'
                    ? `تساوي تقريباً: ${formatCurrency((salary * (Number(limitValue) || 0)) / 100, currencySymbol)} شهرياً`
                    : `تساوي تقريباً: ${salary > 0 ? Math.round(((Number(limitValue) || 0) / salary) * 100) : 0}% من راتبك`}
                </div>
              </div>

              {/* اختيار اللون والأيقونة */}
              <div className="form-group">
                <label className="form-label">اللون المميّز</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableColors.map((c) => (
                    <div
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        border: color === c ? '3px solid #ffffff' : 'none',
                        boxShadow: color === c ? '0 0 8px rgba(0,0,0,0.5)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">الأيقونة</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '90px', overflowY: 'auto' }}>
                  {availableIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: icon === ic ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                        background: icon === ic ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-app)',
                        color: icon === ic ? 'var(--brand-500)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <CategoryIcon name={ic} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>حفظ الفئة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
