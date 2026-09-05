import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/dateUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PlannedVsActualBarChart({
  categories = [],
  expenses = [],
  salary = 10000,
  currencySymbol = 'ر.س',
  isDark = true,
}) {
  // حساب الفعلي والمخطط لكل فئة
  const catSpentMap = {};
  expenses.forEach((e) => {
    const amt = Number(e.convertedAmount || e.amount || 0);
    catSpentMap[e.categoryId] = (catSpentMap[e.categoryId] || 0) + amt;
  });

  const labels = [];
  const plannedData = [];
  const actualData = [];
  const actualColors = [];

  categories.forEach((cat) => {
    labels.push(cat.name);

    let planned = 0;
    if (cat.limitType === 'percentage') {
      planned = (salary * (cat.limitValue || 0)) / 100;
    } else {
      planned = Number(cat.limitValue || 0);
    }
    plannedData.push(planned);

    const actual = catSpentMap[cat.id] || 0;
    actualData.push(actual);

    // إذا تجاوز الفعلي المخطط نلونه بالأحمر للتحذير
    if (planned > 0 && actual > planned) {
      actualColors.push('#ef4444');
    } else if (planned > 0 && actual >= planned * 0.9) {
      actualColors.push('#f59e0b');
    } else {
      actualColors.push('#10b981');
    }
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'المخطط (الميزانية المخصصة)',
        data: plannedData,
        backgroundColor: isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.5)',
        borderColor: isDark ? '#94a3b8' : '#64748b',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'الفعلي (المصروف الحقيقي)',
        data: actualData,
        backgroundColor: actualColors,
        borderRadius: 6,
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

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
