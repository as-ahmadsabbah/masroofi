import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/dateUtils';

// تسجيل جميع متحكمات Chart.js لتفادي أي خطأ متحكم مفقود
try {
  ChartJS.register(...registerables);
} catch (e) {
  console.warn('ChartJS registration warning:', e);
}

export default function DailySpendingBarChart({
  monthExpenses = [],
  salary = 4000,
  currencySymbol = '₪',
  isDark = true,
}) {
  const [hasError, setHasError] = useState(false);

  const today = new Date();
  const currentDay = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = String(month + 1).padStart(2, '0');

  const allowedDailyAverage = Math.round(salary / (totalDaysInMonth || 30));

  const dailyTotals = {};
  (monthExpenses || []).forEach((e) => {
    if (e && e.date) {
      dailyTotals[e.date] = (dailyTotals[e.date] || 0) + Number(e.convertedAmount || e.amount || 0);
    }
  });

  const displayDays = Math.max(7, currentDay);
  const daysData = [];

  for (let d = 1; d <= displayDays; d++) {
    const dayDateStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
    const spent = dailyTotals[dayDateStr] || 0;
    daysData.push({
      day: d,
      isToday: d === currentDay,
      spent,
      isOver: spent > allowedDailyAverage,
    });
  }

  // إذا حدث أي خطأ في Chart.js نعرض رسم بياني SVG نقي ومباشر ومستقر 100%
  if (hasError) {
    const maxSpent = Math.max(...daysData.map(d => d.spent), allowedDailyAverage * 1.5, 1);

    return (
      <div style={{ height: '220px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '20px' }}>
        {/* خط المعدل المسموح */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.74rem',
          color: '#f59e0b',
          marginBottom: '8px',
        }}>
          <span style={{ borderBottom: '2px dashed #f59e0b', width: '24px' }}></span>
          <span>المعدل المسموح: {allowedDailyAverage} {currencySymbol} / يوم</span>
        </div>

        {/* أعمدة الأيام بـ CSS/SVG فائق الخفة والموثوقية */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
          height: '160px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}>
          {daysData.map((d) => {
            const heightPct = Math.min(100, Math.max(4, (d.spent / maxSpent) * 100));
            return (
              <div
                key={d.day}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '28px',
                  flex: 1,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
                title={`يوم ${d.day}: ${d.spent} ${currencySymbol}`}
              >
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {d.spent > 0 ? Math.round(d.spent) : ''}
                </span>
                <div
                  style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    background: d.isOver ? '#ef4444' : '#10b981',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                />
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: d.isToday ? 800 : 500,
                  color: d.isToday ? 'var(--brand-500)' : 'var(--text-secondary)',
                  marginTop: '4px',
                }}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const labels = daysData.map(d => d.isToday ? `اليوم (${d.day})` : `${d.day}`);
  const barData = daysData.map(d => d.spent);
  const barColors = daysData.map(d => d.isOver ? '#ef4444' : '#10b981');
  const targetLineData = daysData.map(() => allowedDailyAverage);

  const chartConfigData = {
    labels,
    datasets: [
      {
        type: 'line',
        label: `المعدل المسموح (${allowedDailyAverage} ${currencySymbol})`,
        data: targetLineData,
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        type: 'bar',
        label: 'المصروف الفعلي',
        data: barData,
        backgroundColor: barColors,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        rtl: true,
        textDirection: 'rtl',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { family: "'Alexandria', 'Cairo', sans-serif", size: 11 },
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
            return ` ${context.dataset.label}: ${formatCurrency(val, currencySymbol)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: "'Alexandria', 'Cairo', sans-serif", size: 10 },
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: "'Alexandria', 'Cairo', sans-serif", size: 10 },
        },
        grid: {
          color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        },
      },
    },
  };

  try {
    return (
      <div style={{ height: '220px', width: '100%' }}>
        <Bar data={chartConfigData} options={options} />
      </div>
    );
  } catch (err) {
    setHasError(true);
    return null;
  }
}
