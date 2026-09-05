import React, { useState } from 'react';
import {
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
} from 'lucide-react';
import CategoryIcon from '../CategoryIcon';
import { formatCurrency } from '../../utils/dateUtils';

export default function SubscriptionsView({
  subscriptions = [],
  onAddSubscription,
  onDeleteSubscription,
  currencySymbol = '₪',
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDay, setBillingDay] = useState(1);
  const [icon, setIcon] = useState('Tv');
  const [color, setColor] = useState('#3b82f6');

  const today = new Date();
  const currentDay = today.getDate();

  // إجمالي الالتزامات الشهرية الثابتة
  const totalMonthlySubs = subscriptions.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  const handleSubmit = (e) => {
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
    setIsModalOpen(false);
  };

  const availableIcons = ['Tv', 'Smartphone', 'Wifi', 'CreditCard', 'Film', 'Music', 'Home', 'Shield'];
  const availableColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* الترويسة وبطاقة المجموع */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              الاشتراكات الشهرية الثابتة
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              تُضاف تلقائياً في يوم استحقاقها ضمن مصروف اليوم بدون تدخل منك
            </p>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>إضافة اشتراك جديد</span>
          </button>
        </div>

        {/* بطاقة إجمالي الاشتراكات */}
        <div style={{
          background: 'var(--bg-app)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              إجمالي الالتزامات الشهرية الثابتة ({subscriptions.length} اشتراكات):
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-500)', marginTop: '2px' }}>
              {formatCurrency(totalMonthlySubs, currencySymbol)} شهرياً
            </div>
          </div>

          <span className="badge badge-fixed" style={{ fontSize: '0.74rem' }}>
            تخصم تلقائياً
          </span>
        </div>
      </div>

      {/* قائمة الاشتراكات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {subscriptions.map((sub) => {
          const isProcessedThisMonth = currentDay >= sub.billingDay;

          return (
            <div
              key={sub.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${sub.color || '#3b82f6'}20`,
                      color: sub.color || '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CategoryIcon name={sub.icon || 'Tv'} size={20} color={sub.color || '#3b82f6'} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.98rem' }}>{sub.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        يوم {sub.billingDay} من كل شهر
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-danger btn-icon btn-sm"
                    onClick={() => {
                      if (window.confirm('هل تريد حذف هذا الاشتراك؟')) {
                        onDeleteSubscription(sub.id);
                      }
                    }}
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{
                  background: 'var(--bg-app)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginTop: '10px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>مبلغ الاشتراك:</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {formatCurrency(sub.amount, currencySymbol)}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', marginTop: '6px' }}>
                    {isProcessedThisMonth ? (
                      <>
                        <CheckCircle2 size={13} color="var(--color-success)" />
                        <span style={{ color: 'var(--color-success)' }}>
                          تمت إضافته لمصروف هذا الشهر في يوم {sub.billingDay}
                        </span>
                      </>
                    ) : (
                      <>
                        <Calendar size={13} color="var(--color-warning)" />
                        <span style={{ color: 'var(--color-warning)' }}>
                          سيُضاف تلقائياً بعد {sub.billingDay - currentDay} أيام (يوم {sub.billingDay})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* نافذة إضافة اشتراك جديد */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>إضافة اشتراك شهري ثابت</h3>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">اسم الاشتراك *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: نتفليكس، اشتراك نت منزلي، جيم..."
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">المبلغ الشهري ({currencySymbol}) *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="مثال: 35"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">يوم الخصم بالشهر *</label>
                  <select
                    className="form-select"
                    value={billingDay}
                    onChange={(e) => setBillingDay(Number(e.target.value))}
                  >
                    {[...Array(28)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        يوم {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* اختيار الأيقونة واللون */}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>حفظ الاشتراك</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
