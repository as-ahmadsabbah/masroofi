import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatArabicMonth, formatCurrency } from '../../utils/dateUtils';
import { storageService } from '../../services/storageService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function MonthlyTrendLineChart({
  salary = 10000,
  currencySymbol = 'ر.س',
  isDark = true,
}) {
  const months = storageService.getAllRecordedMonths().slice(0, 6).reverse(); // آخر 6 شهور

  const labels = months.map(m => formatArabicMonth(m));
  const spendingData = [];
  const savingsData = [];

  months.forEach(mKey => {
    const expenses = storageService.getExpenses(mKey);
    const incomes = storageService.getIncomes(mKey);

    const totalSpent = expenses.reduce((s, e) => s + Number(e.convertedAmount || e.amount || 0), 0);
    spendingData.push(totalSpent);

    const savingsIncomes = incomes
      .filter(i => i.destination === 'savings')
      .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);
    const budgetIncomes = incomes
      .filter(i => i.destination === 'budget')
      .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);

    const monthlySurplus = (salary + budgetIncomes) - totalSpent;
    const netSavings = Math.max(0, monthlySurplus) + savingsIncomes;
    savingsData.push(netSavings);
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'إجمالي المصاريف',
        data: spendingData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#ef4444',
        pointRadius: 4,
      },
      {
        label: 'صافي الادخار',
        data: savingsData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointRadius: 5,
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
      <Line data={data} options={options} />
    </div>
  );
}
