import React from 'react';
import { AlertCircle, AlertTriangle, ChevronLeft } from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

export default function QuickAlertsBanner({
  categories = [],
  expenses = [],
  totalBudget = 0,
  currencySymbol = 'ر.س',
  salary = 10000,
  onViewExpenses,
}) {
  const totalSpent = expenses.reduce((s, e) => s + Number(e.convertedAmount || e.amount || 0), 0);
  const isDeficit = totalBudget > 0 && totalSpent > totalBudget;

  const catSpentMap = {};
  expenses.forEach((e) => {
    catSpentMap[e.categoryId] = (catSpentMap[e.categoryId] || 0) + Number(e.convertedAmount || e.amount || 0);
  });

  const exceededCategories = [];
  const nearingCategories = [];

  categories.forEach((cat) => {
    let limit = 0;
    if (cat.limitType === 'percentage') {
      limit = (salary * (cat.limitValue || 0)) / 100;
    } else {
      limit = Number(cat.limitValue || 0);
    }

    if (limit > 0) {
      const spent = catSpentMap[cat.id] || 0;
      if (spent > limit) {
        exceededCategories.push({
          ...cat,
          spent,
          limit,
          diff: spent - limit,
          pct: Math.round((spent / limit) * 100),
        });
      } else if (spent >= limit * 0.9) {
        nearingCategories.push({
          ...cat,
          spent,
          limit,
          remaining: limit - spent,
          pct: Math.round((spent / limit) * 100),
        });
      }
    }
  });

  if (!isDeficit && exceededCategories.length === 0 && nearingCategories.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
      {/* تنبيه عجز الميزانية العام */}
      {isDeficit && (
        <div className="alert-banner danger">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>تنبيه حرج: عجز في ميزانية هذا الشهر!</strong>
              <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                تجاوزت المصاريف الفعلية إجمالي الراتب والميزانية المتاحة بمقدار{' '}
                <strong>{formatCurrency(totalSpent - totalBudget, currencySymbol)}</strong>.
              </div>
            </div>
          </div>
          {onViewExpenses && (
            <button className="btn btn-sm btn-danger" onClick={onViewExpenses}>
              <span>مراجعة المصاريف</span>
              <ChevronLeft size={14} />
            </button>
          )}
        </div>
      )}

      {/* فئات تجاوزت الحد */}
      {exceededCategories.map((c) => (
        <div key={c.id} className="alert-banner danger">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.84rem' }}>
              تجاوزت ميزانية <strong>{c.name}</strong> بنسبة <strong>{c.pct}%</strong> (الزيادة: {formatCurrency(c.diff, currencySymbol)}).
            </div>
          </div>
          {onViewExpenses && (
            <button className="btn btn-sm btn-danger" onClick={onViewExpenses}>
              <span>عرض</span>
              <ChevronLeft size={14} />
            </button>
          )}
        </div>
      ))}

      {/* فئات اقتربت من الحد (90%) */}
      {nearingCategories.map((c) => (
        <div key={c.id} className="alert-banner warning">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.84rem' }}>
              تنبيه لطيف: فئة <strong>{c.name}</strong> وصلت إلى <strong>{c.pct}%</strong> من سقفها. متبقٍ لك فيها فقط {formatCurrency(c.remaining, currencySymbol)}.
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
