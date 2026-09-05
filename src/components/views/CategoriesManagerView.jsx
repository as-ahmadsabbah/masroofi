import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Tag,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import CategoryIcon from '../CategoryIcon';
import { formatCurrency } from '../../utils/dateUtils';

export default function CategoriesManagerView({
  categories = [],
  onAddCategory,
  onDeleteCategory,
  onSaveCategories,
  currencySymbol = '₪',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('daily'); // daily | monthly
  const [defaultAmount, setDefaultAmount] = useState('');
  const [icon, setIcon] = useState('Coffee');
  const [color, setColor] = useState('#10b981');

  const handleOpenAdd = () => {
    setName('');
    setType('daily');
    setDefaultAmount('');
    setIcon('Coffee');
    setColor('#10b981');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      name: name.trim(),
      type,
      defaultAmount: defaultAmount ? Number(defaultAmount) : '',
      icon,
      color,
    });

    setIsModalOpen(false);
  };

  const availableIcons = [
    'Flame', 'Coffee', 'Utensils', 'Car', 'ShoppingBag', 'HeartPulse',
    'Smartphone', 'Tv', 'Gamepad', 'Gift', 'BookOpen', 'HelpCircle'
  ];

  const availableColors = [
    '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6', '#06b6d4',
    '#ec4899', '#ef4444', '#64748b'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* الترويسة */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              فئات المصاريف
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              حدد فئاتك اليومية (دخان، قهوة، أكل...) ومبالغها الافتراضية للإضافة السريعة بنقرة واحدة
            </p>
          </div>

          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>إضافة فئة جديدة</span>
          </button>
        </div>
      </div>

      {/* بطاقات الفئات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: `${cat.color}20`,
                color: cat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CategoryIcon name={cat.icon} size={22} color={cat.color} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>{cat.name}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span className="badge badge-variable" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                    {cat.type === 'monthly' ? 'شهري' : 'يومي'}
                  </span>
                  {cat.defaultAmount ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--brand-500)', fontWeight: 700 }}>
                      افتراضي: {formatCurrency(cat.defaultAmount, currencySymbol)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      مبلغ متغير
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              className="btn btn-danger btn-icon btn-sm"
              onClick={() => {
                if (categories.length <= 1) {
                  alert('يجب أن تتبقى فئة واحدة على الأقل!');
                  return;
                }
                if (window.confirm(`هل تريد حذف فئة "${cat.name}"؟`)) {
                  onDeleteCategory(cat.id);
                }
              }}
              title="حذف الفئة"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* نافذة إضافة فئة جديدة */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>إضافة فئة جديدة</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">اسم الفئة *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: جيم، حلويات، مواصلات..."
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">نوع المصروف *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setType('daily')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: type === 'daily' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                      background: type === 'daily' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-app)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    يومي (كل يوم)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('monthly')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: type === 'monthly' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                      background: type === 'monthly' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-app)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    شهري (مرة بالشهر)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">مبلغ افتراضي متوقع (اختياري)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={defaultAmount}
                  onChange={(e) => setDefaultAmount(e.target.value)}
                  placeholder="مثال: 5 (يُملأ تلقائياً لتسجيله بنقرة واحدة)"
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  إذا حددت مبلغاً، سيظهر لك خيار إضافته فوراً بدون كتابة الرقم كل مرة.
                </span>
              </div>

              {/* أيقونة ولون */}
              <div className="form-group">
                <label className="form-label">الأيقونة</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

              <div className="form-group">
                <label className="form-label">اللون</label>
                <div style={{ display: 'flex', gap: '8px' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
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
