import React, { useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert, Calendar } from 'lucide-react';
import { formatCurrency, getCurrentMonthKey } from '../../utils/dateUtils';

try {
  ChartJS.register(...registerables);
} catch (e) {
  console.warn('ChartJS registration warning in FutureForecastChart:', e);
}

export default function FutureForecastChart({
  monthExpenses = [],
  salary = 2000,
  priorSpentAmount = 0,
  dailyRecurring = [],
  forecast,
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

  // حساب المصروف اليومي التراكمي الفعلي
  const dailyExpensesMap = {};
  (monthExpenses || []).forEach((e) => {
    if (e && e.date) {
      dailyExpensesMap[e.date] = (dailyExpensesMap[e.date] || 0) + Number(e.convertedAmount || e.amount || 0);
    }
  });

  const dailyRate = forecast?.dailyAverage || 20;

  // إعداد نقاط البيانات التراكمية لكل يوم في الشهر
  const labels = [];
  const actualCumulativeData = [];
  const forecastCumulativeData = [];
  const salaryLimitData = [];

  let runningActual = priorSpentAmount;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    labels.push(`${d}`);
    salaryLimitData.push(salary);

    const dayDateStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
    const daySpent = dailyExpensesMap[dayDateStr] || 0;

    if (d <= currentDay) {
      runningActual += daySpent;
      actualCumulativeData.push(Math.round(runningActual));
      // عند اليوم الحالي نجعل نقطة التلاقي للتوقع التخيلي
      if (d === currentDay) {
        forecastCumulativeData.push(Math.round(runningActual));
      } else {
        forecastCumulativeData.push(null);
      }
    } else {
      // أيام المستقبل بعد اليوم الحالي: المسار التخيلي
      actualCumulativeData.push(null);
      const daysAhead = d - currentDay;
      const projectedVal = Math.round(runningActual + (daysAhead * dailyRate));
      forecastCumulativeData.push(projectedVal);
    }
  }

  // إعدادات Chart.js
  const chartData = {
    labels,
    datasets: [
      {
        label: 'الإنفاق الفعلي حتى اليوم',
        data: actualCumulativeData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.18)',
        borderWidth: 3,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#10b981',
        pointRadius: (ctx) => (ctx.dataIndex === currentDay - 1 ? 6 : 2),
        pointHoverRadius: 7,
      },
      {
        label: 'المسار التخيلي لباقي الشهر 🔮',
        data: forecastCumulativeData,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderWidth: 2.5,
        borderDash: [6, 4],
        fill: true,
        tension: 0.1,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: (ctx) => (ctx.dataIndex === totalDaysInMonth - 1 ? 6 : 2),
        pointHoverRadius: 7,
      },
      {
        label: `سقف الراتب (${formatCurrency(salary, currencySymbol)})`,
        data: salaryLimitData,
        borderColor: 'rgba(239, 68, 68, 0.65)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        rtl: true,
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { family: "'Alexandria', sans-serif", size: 11, weight: '600' },
          usePointStyle: true,
          padding: 14,
        },
      },
      tooltip: {
        rtl: true,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          title: (items) => `يوم ${items[0].label} من الشهر`,
          label: (context) => {
            const val = context.raw;
            if (val === null || val === undefined) return '';
            return `${context.dataset.label}: ${formatCurrency(val, currencySymbol)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: "'Alexandria', sans-serif", size: 10 },
          maxRotation: 0,
          callback: function(val, index) {
            // إظهار الأيام الهامة فقط لتفادي الازدحام
            const dayNum = index + 1;
            if (dayNum === 1 || dayNum === currentDay || dayNum % 5 === 0 || dayNum === totalDaysInMonth) {
              return `يوم ${dayNum}`;
            }
            return '';
          },
        },
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: "'Alexandria', sans-serif", size: 10 },
          callback: (value) => `${value} ${currencySymbol}`,
        },
      },
    },
  };

  const totalSpentSoFar = Math.round(runningActual);
  const remainingDays = Math.max(0, totalDaysInMonth - currentDay);
  const futureSpend = forecast?.projectedFutureSpend || (remainingDays * dailyRate);
  const projectedEndMonth = forecast?.projectedEndMonth || (totalSpentSoFar + futureSpend);
  const projectedRemaining = salary - projectedEndMonth;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* بطاقات الإحصاءات التوضيحية السريعة */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
      }}>
        {/* الفعلي حتى اليوم */}
        <div style={{
          background: 'var(--bg-app)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
            الفعلي حتى اليوم ({currentDay} يوم)
          </span>
          <strong style={{ fontSize: '1.05rem', color: 'var(--color-success)', fontWeight: 800 }}>
            {formatCurrency(totalSpentSoFar, currencySymbol)}
          </strong>
        </div>

        {/* التوقع لباقي الشهر */}
        <div style={{
          background: 'var(--bg-app)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
            توقع باقي الشهر ({remainingDays} يوم)
          </span>
          <strong style={{ fontSize: '1.05rem', color: '#a78bfa', fontWeight: 800 }}>
            +{formatCurrency(futureSpend, currencySymbol)}
          </strong>
        </div>

        {/* المتوقع الإجمالي نهاية الشهر */}
        <div style={{
          background: 'var(--bg-app)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
            المتوقع الإجمالي بنهاية الشهر
          </span>
          <strong style={{
            fontSize: '1.05rem',
            color: projectedEndMonth > salary ? 'var(--color-danger)' : 'var(--brand-500)',
            fontWeight: 900,
          }}>
            {formatCurrency(projectedEndMonth, currencySymbol)}
          </strong>
        </div>

        {/* الفائض المالي المتوقع */}
        <div style={{
          background: 'var(--bg-app)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
            المتبقي الصافي المتوقع
          </span>
          <strong style={{
            fontSize: '1.05rem',
            color: projectedRemaining < 0 ? 'var(--color-danger)' : 'var(--color-success)',
            fontWeight: 900,
          }}>
            {formatCurrency(projectedRemaining, currencySymbol)}
          </strong>
        </div>
      </div>

      {/* منطقة الرسم البياني */}
      <div style={{ height: '240px', width: '100%', position: 'relative' }}>
        {!hasError ? (
          <Line
            data={chartData}
            options={chartOptions}
            onError={() => setHasError(true)}
          />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}>
            <span>مسار التوقع التخيلي: متوقع تصرف {formatCurrency(projectedEndMonth, currencySymbol)} بنهاية الشهر</span>
          </div>
        )}
      </div>

      <div style={{
        fontSize: '0.76rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }}>
        <Sparkles size={13} color="#a78bfa" />
        <span>
          الخط الأخضر يمثل مصروفك الفعلي التراكمي، والخط البنفسجي المتقطع يرسم مسارك التخيلي المتوقع بمعدل (<strong>{formatCurrency(dailyRate, currencySymbol)}/يوم</strong>)
        </span>
      </div>
    </div>
  );
}
