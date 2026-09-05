import React, { useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/dateUtils';
import CategoryIcon from '../CategoryIcon';

try {
  ChartJS.register(...registerables);
} catch (e) {
  console.warn(e);
}

export default function CategoryPieChart({
  monthExpenses = [],
  categories = [],
  priorSpentAmount = 0,
  currencySymbol = '₪',
  isDark = true,
}) {
  const [hasError, setHasError] = useState(false);

  // تجميع المصاريف حسب الفئات
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const catSpent = {};

  monthExpenses.forEach((e) => {
    const id = e.categoryId || 'other';
    catSpent[id] = (catSpent[id] || 0) + Number(e.convertedAmount || e.amount || 0);
  });

  if (priorSpentAmount > 0) {
    catSpent['prior_spent'] = (catSpent['prior_spent'] || 0) + Number(priorSpentAmount);
  }

  const items = Object.entries(catSpent)
    .map(([id, spent]) => {
      if (id === 'prior_spent') {
        return {
          id,
          name: 'مصروفات سابقة قبل التطبيق',
          color: '#64748b',
          icon: 'Clock',
          spent,
        };
      }
      const cat = catMap[id];
      return {
        id,
        name: cat?.name || 'أخرى',
        color: cat?.color || '#10b981',
        icon: cat?.icon || 'ShoppingBag',
        spent,
      };
    })
    .filter(i => i.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const totalSpent = items.reduce((s, i) => s + i.spent, 0);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.88rem' }}>لا توجد مصاريف مسجلة لهذا الشهر حتى الآن.</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
        {items.map((i) => {
          const pct = Math.round((i.spent / (totalSpent || 1)) * 100);
          return (
            <div key={i.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: i.color }} />
                <span>{i.name}</span>
              </div>
              <strong>{formatCurrency(i.spent, currencySymbol)} ({pct}%)</strong>
            </div>
          );
        })}
      </div>
    );
  }

  const data = {
    labels: items.map(i => i.name),
    datasets: [
      {
        data: items.map(i => i.spent),
        backgroundColor: items.map(i => i.color),
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        rtl: true,
        textDirection: 'rtl',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { family: "'Alexandria', 'Cairo', sans-serif", size: 11 },
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        rtl: true,
        textDirection: 'rtl',
        titleFont: { family: "'Alexandria', 'Cairo', sans-serif", size: 12 },
        bodyFont: { family: "'Alexandria', 'Cairo', sans-serif", size: 12 },
        callbacks: {
          label: function (context) {
            const val = context.raw || 0;
            const pct = totalSpent > 0 ? Math.round((val / totalSpent) * 100) : 0;
            return ` ${context.label}: ${formatCurrency(val, currencySymbol)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '66%',
  };

  try {
    return (
      <div style={{ position: 'relative', height: '260px', width: '100%' }}>
        <Doughnut data={data} options={options} />
        <div style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>مجموع الشهر</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(totalSpent, currencySymbol)}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    setHasError(true);
    return null;
  }
}
