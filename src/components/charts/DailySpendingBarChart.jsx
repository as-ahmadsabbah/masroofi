import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/dateUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function DailySpendingBarChart({
  monthExpenses = [],
  salary = 4000,
  currencySymbol = '₪',
  isDark = true,
}) {
  const today = new Date();
  const currentDay = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = String(month + 1).padStart(2, '0');

  // المعدل اليومي المسموح
  const allowedDailyAverage = Math.round(salary / (totalDaysInMonth || 30));

  // تجميع المصاريف حسب كل يوم من بداية الشهر
  const dailyTotals = {};
  monthExpenses.forEach((e) => {
    if (e.date) {
      dailyTotals[e.date] = (dailyTotals[e.date] || 0) + Number(e.convertedAmount || e.amount || 0);
    }
  });

  const labels = [];
  const barData = [];
  const barColors = [];
  const targetLineData = [];

  // عرض أيام الشهر حتى اليوم الحالي (أو على الأقل 7 أيام إن كان الشهر ببدايته)
  const displayDays = Math.max(7, currentDay);

  for (let d = 1; d <= displayDays; d++) {
    const dayDateStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
    const spent = dailyTotals[dayDateStr] || 0;

    labels.push(d === currentDay ? `اليوم (${d})` : `${d}`);
    barData.push(spent);
    targetLineData.push(allowedDailyAverage);

    // إذا تجاوز المصروف اليومي المعدل المسموح، نلونه باللون الأحمر، وإلا بالأخضر
    if (spent > allowedDailyAverage) {
      barColors.push('#ef4444');
    } else {
      barColors.push('#10b981');
    }
  }

  const data = {
    labels,
    datasets: [
      {
        type: 'line',
        label: `المعدل اليومي المسموح (${allowedDailyAverage} ${currencySymbol})`,
        data: targetLineData,
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      {
        type: 'bar',
        label: 'المصروف الفعلي لليوم',
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

  return (
    <div style={{ height: '240px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
