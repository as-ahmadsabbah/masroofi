import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  PiggyBank,
  PlusCircle,
  HelpCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatArabicDate } from '../../utils/dateUtils';

export default function IncomeView({
  incomes = [],
  settings,
  onOpenAddIncome,
  onDeleteIncome,
}) {
  const [filterDest, setFilterDest] = useState('all'); // all | savings | budget | free

  const currencyObj = settings?.currencies?.find(c => c.code === settings?.baseCurrency);
  const currencySymbol = currencyObj?.symbol || 'ر.س';

  const totalExtraIncome = incomes.reduce(
    (s, i) => s + Number(i.convertedAmount || i.amount || 0),
    0
  );

  const savingsTotal = incomes
    .filter(i => i.destination === 'savings')
    .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);

  const budgetTotal = incomes
    .filter(i => i.destination === 'budget')
    .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);

  const freeTotal = incomes
    .filter(i => i.destination === 'free')
    .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);

  const filteredIncomes = incomes.filter(i => {
    if (filterDest === 'all') return true;
    return i.destination === filterDest;
  });

  const getDestBadge = (destination) => {
    switch (destination) {
      case 'savings':
        return (
          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
            <PiggyBank size={12} />
            <span>موجّه للمدخرات التراكمية</span>
          </span>
        );
      case 'budget':
        return (
          <span className="badge badge-fixed" style={{ fontSize: '0.72rem' }}>
            <PlusCircle size={12} />
            <span>مضاف لميزانية الصرف</span>
          </span>
        );
      case 'free':
        return (
          <span className="badge badge-variable" style={{ fontSize: '0.72rem' }}>
            <HelpCircle size={12} />
            <span>دخل حر غير مخصص</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* بطاقة الترويسة والإحصائيات */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>سجل الدخل الإضافي غير الثابت</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              إيرادات الفريلانس، المكافآت، المبيعات، ومصير كل مبلغ
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onOpenAddIncome}>
            <Plus size={16} />
            <span>تسجيل دخل إضافي</span>
          </button>
        </div>

        {/* كروت توزيع الدخل الإضافي */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>إجمالي الدخل الإضافي</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-500)', marginTop: '2px' }}>
              +{formatCurrency(totalExtraIncome, currencySymbol)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: '#10b981' }}>وُجّه للمدخرات التراكمية</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>
              +{formatCurrency(savingsTotal, currencySymbol)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>أضيف لميزانية الصرف</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>
              +{formatCurrency(budgetTotal, currencySymbol)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>دخل حر معلق</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>
              +{formatCurrency(freeTotal, currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      {/* فلترة القائمة */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`btn btn-sm ${filterDest === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterDest('all')}
        >
          الكل ({incomes.length})
        </button>
        <button
          className={`btn btn-sm ${filterDest === 'savings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterDest('savings')}
        >
          المدخرات
        </button>
        <button
          className={`btn btn-sm ${filterDest === 'budget' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterDest('budget')}
        >
          الميزانية
        </button>
        <button
          className={`btn btn-sm ${filterDest === 'free' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterDest('free')}
        >
          الدخل الحر
        </button>
      </div>

      {/* قائمة عمليات الدخل */}
      <div className="glass-card">
        {filteredIncomes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>لا يوجد دخل إضافي مسجل في هذا التصنيف لهذا الشهر.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredIncomes.map((inc) => (
              <div
                key={inc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--brand-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Wallet size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.96rem' }}>{inc.source}</span>
                      {getDestBadge(inc.destination)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {inc.note && <span>{inc.note} • </span>}
                      <span>{formatArabicDate(inc.date)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-500)' }}>
                      +{formatCurrency(inc.convertedAmount || inc.amount, currencySymbol)}
                    </div>
                    {inc.currency !== settings.baseCurrency && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ({inc.amount} {inc.currency})
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-danger btn-icon btn-sm"
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف هذا الدخل؟')) {
                        onDeleteIncome(inc.id);
                      }
                    }}
                    title="حذف الدخل"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
