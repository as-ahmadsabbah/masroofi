import React, { useState } from 'react';
import {
  Repeat,
  Tv,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Smartphone,
  Wifi,
  CreditCard,
  Edit2,
  Power,
  Sparkles,
} from 'lucide-react';
import CategoryIcon from '../CategoryIcon';
import { formatCurrency } from '../../utils/dateUtils';

export default function SubscriptionsView({
  subscriptions = [],
  dailyRecurring = [],
  onAddSubscription,
  onDeleteSubscription,
  onOpenAddDailyRecurring,
  onEditDailyRecurring,
  onDeleteDailyRecurring,
  onToggleDailyRecurring,
  currencySymbol = '₪',
}) {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'monthly'
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDay, setBillingDay] = useState(1);
  const [icon, setIcon] = useState('Tv');
  const [color, setColor] = useState('#3b82f6');

  // حساب إجمالي اليومي والشهري
  const totalDailyCost = dailyRecurring
    .filter(r => r.active)
    .reduce((sum, r) => sum + Number(r.amountPerDay || 0), 0);
  const estimatedMonthlyDailyCost = Math.round(totalDailyCost * 30);

  const totalMonthlySubs = subscriptions.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  const handleSubSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || Number(amount) <= 0) return;

    onAddSubscription({
      name: name.trim(),
      amount: Number(amount),
      billingDay: Number(billingDay),
      icon,
      color,
    });

    setName('');
    setAmount('');
    setBillingDay(1);
    setIsSubModalOpen(false);
  };

  const availableIcons = ['Tv', 'Smartphone', 'Wifi', 'CreditCard', 'Film', 'Music', 'Home', 'Shield'];
  const availableColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* الترويسة الرئيسية وتبديل الأقسام */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              المصاريف المتكررة والاشتراكات التلقائية
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              مصاريف تحسب وتضاف تلقائياً دون الحاجة لتسجيلها يدوياً كل يوم
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {activeTab === 'daily' ? (
              <button className="btn btn-primary btn-sm" onClick={onOpenAddDailyRecurring}>
                <Plus size={16} />
                <span>إضافة مصروف متكرر (دخان، قهوة...)</span>
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setIsSubModalOpen(true)}>
                <Plus size={16} />
                <span>إضافة اشتراك شهري جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* أزرار التبديل بين المصاريف اليومية والاشتراكات الشهرية */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-app)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginTop: '16px',
          gap: '4px',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'daily' ? 'var(--brand-500)' : 'transparent',
              color: activeTab === 'daily' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Repeat size={16} />
            <span>المصاريف اليومية المتكررة ({dailyRecurring.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'monthly' ? 'var(--brand-500)' : 'transparent',
              color: activeTab === 'monthly' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Tv size={16} />
            <span>الاشتراكات الشهرية الثابتة ({subscriptions.length})</span>
          </button>
        </div>
      </div>

      {/* قسم 1: المصاريف اليومية المتكررة (دخان، قهوة، أكل...) */}
      {activeTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* بطاقة ملخص المصاريف اليومية */}
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--brand-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Repeat size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>المجموع اليومي المحسوب تلقائياً:</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {formatCurrency(totalDailyCost, currencySymbol)} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>/ يوم</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>المتوقع هالشهر:</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--brand-500)' }}>
                ~ {formatCurrency(estimatedMonthlyDailyCost, currencySymbol)} / شهر
              </strong>
            </div>
          </div>

          {dailyRecurring.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <Sparkles size={32} color="var(--brand-500)" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                لم تضف أي مصروف متكرر بعد
              </h3>
              <p style={{ fontSize: '0.84rem', maxWidth: '380px', margin: '6px auto 16px' }}>
                مثل الدخان (5 ₪/يوم) أو القهوة اليومية. أضفها مرة واحدة وسيقوم التطبيق بحسابها وتنزيلها تلقائياً كل يوم حتى نهاية الشهر!
              </p>
              <button className="btn btn-primary" onClick={onOpenAddDailyRecurring}>
                <Plus size={18} />
                <span>+ إضافة مصروف يومي متكرر الآن</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '12px' }}>
              {dailyRecurring.map((item) => (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: item.active ? 1 : 0.6,
                    border: item.active ? '1px solid var(--border-subtle)' : '1px dashed var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: `${item.color}20`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CategoryIcon name={item.icon} size={22} color={item.color} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '1rem' }}>{item.name}</strong>
                        {item.active ? (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                            نشط تلقائياً
                          </span>
                        ) : (
                          <span className="badge" style={{ fontSize: '0.65rem', padding: '1px 5px', background: 'var(--bg-app)', color: 'var(--text-muted)' }}>
                            متوقف مؤقتاً
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--brand-500)', fontWeight: 800 }}>
                        {formatCurrency(item.amountPerDay, currencySymbol)} / يومياً
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        {item.repeatTillEndOfMonth ? 'حتى نهاية الشهر' : 'تكرار مستمر'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => onToggleDailyRecurring(item.id)}
                      title={item.active ? 'إيقاف مؤقت' : 'تفعيل'}
                      style={{ color: item.active ? '#10b981' : 'var(--text-muted)' }}
                    >
                      <Power size={14} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => onEditDailyRecurring(item)}
                      title="تعديل"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      onClick={() => {
                        if (window.confirm(`هل تريد حذف المصروف المتكرر "${item.name}"؟`)) {
                          onDeleteDailyRecurring(item.id);
                        }
                      }}
                      title="حذف"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* قسم 2: الاشتراكات الشهرية الثابتة (نتفليكس، إنترنت...) */}
      {activeTab === 'monthly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* بطاقة ملخص الاشتراكات */}
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                إجمالي الاشتراكات الشهرية الثابتة ({subscriptions.length}):
              </span>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-500)', marginTop: '2px' }}>
                {formatCurrency(totalMonthlySubs, currencySymbol)} شهرياً
              </div>
            </div>
            <span className="badge badge-fixed" style={{ fontSize: '0.74rem' }}>
              تخصم في يوم الاستحقاق
            </span>
          </div>

          {subscriptions.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <Tv size={32} color="#3b82f6" style={{ margin: '0 auto 10px' }} />
              <p>لا توجد اشتراكات شهرية مضافة.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setIsSubModalOpen(true)} style={{ marginTop: '8px' }}>
                <Plus size={16} />
                <span>إضافة اشتراك (نتفليكس، فاتورة، إنترنت)</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '12px' }}>
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="glass-card"
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: `${sub.color}20`,
                      color: sub.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CategoryIcon name={sub.icon} size={22} color={sub.color} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem', display: 'block' }}>{sub.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--brand-500)', fontWeight: 800 }}>
                        {formatCurrency(sub.amount, currencySymbol)} / شهرياً
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        يوم {sub.billingDay} من كل شهر
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-danger btn-icon btn-sm"
                    onClick={() => {
                      if (window.confirm(`هل تريد حذف اشتراك "${sub.name}"؟`)) {
                        onDeleteSubscription(sub.id);
                      }
                    }}
                    title="حذف"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* نافذة إضافة اشتراك شهري */}
      {isSubModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsSubModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tv size={20} color="var(--brand-500)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>إضافة اشتراك شهري جديد</h3>
              </div>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setIsSubModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubSubmit}>
              <div className="form-group">
                <label className="form-label">اسم الخدمة أو الاشتراك *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: نتفليكس، إنترنت منزلي، فاتورة جوال"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">المبلغ الشهري ({currencySymbol}) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  required
                  style={{ fontSize: '1.2rem', fontWeight: 800 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">يوم الاستحقاق من كل شهر (1 إلى 31) *</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="form-input"
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsSubModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>إضافة الاشتراك</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
