import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/dateUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart({ categories = [], expenses = [], currencySymbol = 'ر.س', isDark = true }) {
  // تجميع المصاريف حسب الفئات
  const catSpentMap = {};
  expenses.forEach((e) => {
    const amt = Number(e.convertedAmount || e.amount || 0);
    catSpentMap[e.categoryId] = (catSpentMap[e.categoryId] || 0) + amt;
  });

  const categoriesWithSpent = categories
    .map((c) => ({
      ...c,
      spent: catSpentMap[c.id] || 0,
    }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const totalSpent = categoriesWithSpent.reduce((s, c) => s + c.spent, 0);

  // إحصائيات الفئات الثابتة مقابل المتغيرة
  const fixedSpent = categoriesWithSpent
    .filter((c) => c.type === 'fixed')
    .reduce((s, c) => s + c.spent, 0);
  const variableSpent = categoriesWithSpent
    .filter((c) => c.type === 'variable')
    .reduce((s, c) => s + c.spent, 0);

  const fixedPercent = totalSpent > 0 ? Math.round((fixedSpent / totalSpent) * 100) : 0;
  const variablePercent = totalSpent > 0 ? Math.round((variableSpent / totalSpent) * 100) : 0;

  if (categoriesWithSpent.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <p>لا توجد مصاريف مسجلة لهذا الشهر حتى الآن.</p>
      </div>
    );
  }

  const data = {
    labels: categoriesWithSpent.map((c) => `${c.name} (${c.type === 'fixed' ? 'ثابتة' : 'متغيرة'})`),
    datasets: [
      {
        data: categoriesWithSpent.map((c) => c.spent),
        backgroundColor: categoriesWithSpent.map((c) => c.color || '#10b981'),
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
          font: {
            family: "'Alexandria', 'Cairo', sans-serif",
            size: 11,
          },
          padding: 12,
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
    cutout: '68%',
  };

  return (
    <div>
      {/* مؤشر تمييز الفئات الثابتة مقابل المتغيرة */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '16px',
        padding: '8px 12px',
        background: 'var(--bg-app)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
          <span>فئات ثابتة (إيجار، فواتير): <strong>{formatCurrency(fixedSpent, currencySymbol)} ({fixedPercent}%)</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
          <span>فئات متغيرة (يومية، ترفيه): <strong>{formatCurrency(variableSpent, currencySymbol)} ({variablePercent}%)</strong></span>
        </div>
      </div>

      {/* الرسم الدائري */}
      <div style={{ position: 'relative', height: '270px', width: '100%' }}>
        <Doughnut data={data} options={options} />
        {/* ملخص في قلب الدونات */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>إجمالي المصروف</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(totalSpent, currencySymbol)}
          </div>
        </div>
      </div>
    </div>
  );
}
