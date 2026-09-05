import React, { useState } from 'react';
import { Sparkles, TrendingUp, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/dateUtils';

export default function FutureForecastChart({
  monthExpenses = [],
  salary = 2000,
  priorSpentAmount = 0,
  dailyRecurring = [],
  forecast,
  currencySymbol = '₪',
  isDark = true,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const today = new Date();
  const currentDay = Math.max(1, today.getDate());
  const year = today.getFullYear();
  const month = today.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate() || 30;
  const monthStr = String(month + 1).padStart(2, '0');

  // جمع المصاريف الفعلية اليومية
  const dailyExpensesMap = {};
  (monthExpenses || []).forEach((e) => {
    if (e && e.date) {
      dailyExpensesMap[e.date] = (dailyExpensesMap[e.date] || 0) + Number(e.convertedAmount || e.amount || 0);
    }
  });

  const dailyRate = Number(forecast?.dailyAverage) || 20;

  // إعداد البيانات لجميع أيام الشهر
  const points = [];
  let runningActual = Number(priorSpentAmount) || 0;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dayDateStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`;
    const daySpent = dailyExpensesMap[dayDateStr] || 0;

    if (d <= currentDay) {
      runningActual += daySpent;
      points.push({
        day: d,
        dateStr: dayDateStr,
        actual: Math.round(runningActual),
        forecast: d === currentDay ? Math.round(runningActual) : null,
        isToday: d === currentDay,
        isFuture: false,
      });
    } else {
      const daysAhead = d - currentDay;
      const proj = Math.round(runningActual + (daysAhead * dailyRate));
      points.push({
        day: d,
        dateStr: dayDateStr,
        actual: null,
        forecast: proj,
        isToday: false,
        isFuture: true,
      });
    }
  }

  const totalSpentSoFar = Math.round(runningActual);
  const remainingDays = Math.max(0, totalDaysInMonth - currentDay);
  const futureSpend = Number(forecast?.projectedFutureSpend) || (remainingDays * dailyRate);
  const projectedEndMonth = Number(forecast?.projectedEndMonth) || (totalSpentSoFar + futureSpend);
  const projectedRemaining = salary - projectedEndMonth;

  // إعداد إحداثيات الرسم البياني SVG
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const maxVal = Math.max(salary * 1.15, projectedEndMonth * 1.15, totalSpentSoFar * 1.15, 100);

  const getX = (day) => paddingX + ((day - 1) / (totalDaysInMonth - 1)) * chartW;
  const getY = (val) => svgHeight - paddingY - (val / maxVal) * chartH;

  // مسار الخط الفعلي (Actual Path)
  const actualPoints = points.filter(p => p.actual !== null);
  let actualPathD = '';
  actualPoints.forEach((p, idx) => {
    const x = getX(p.day);
    const y = getY(p.actual);
    actualPathD += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  // مسار التعبئة المظللة للفعلي
  let actualAreaD = '';
  if (actualPoints.length > 0) {
    const firstX = getX(actualPoints[0].day);
    const lastX = getX(actualPoints[actualPoints.length - 1].day);
    const bottomY = svgHeight - paddingY;
    actualAreaD = `${actualPathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  // مسار الخط التخيلي (Forecast Path)
  const forecastPoints = points.filter(p => p.forecast !== null);
  let forecastPathD = '';
  forecastPoints.forEach((p, idx) => {
    const x = getX(p.day);
    const y = getY(p.forecast);
    forecastPathD += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  const salaryY = getY(salary);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 1. بطاقات الإحصاءات السريعة */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
      }}>
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

      {/* 2. الرسم البياني التفاعلي الفائق السلاسة */}
      <div style={{
        background: 'var(--bg-app)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '16px 12px 10px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* مفتاح الدلالات (Legend) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '10px',
          fontSize: '0.76rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: '#10b981', borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>الإنفاق الفعلي حتى اليوم</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: '#8b5cf6', borderTop: '2px dashed #8b5cf6' }} />
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>المسار التخيلي المتوقع 🔮</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', background: '#ef4444', borderTop: '1px dashed #ef4444' }} />
            <span style={{ color: '#ef4444', fontWeight: 600 }}>سقف الراتب ({formatCurrency(salary, currencySymbol)})</span>
          </div>
        </div>

        {/* مساحة الرسم SVG */}
        <div style={{ width: '100%', height: '220px', position: 'relative' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* خطوط الشبكة الأفقية */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = svgHeight - paddingY - ratio * chartH;
              const val = Math.round(ratio * maxVal);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill="var(--text-muted)"
                    fontSize="9"
                    fontFamily="'Alexandria', sans-serif"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* خط سقف الراتب */}
            <line
              x1={paddingX}
              y1={salaryY}
              x2={svgWidth - paddingX}
              y2={salaryY}
              stroke="rgba(239, 68, 68, 0.7)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={svgWidth - paddingX}
              y={salaryY - 5}
              textAnchor="end"
              fill="#ef4444"
              fontSize="9"
              fontWeight="bold"
              fontFamily="'Alexandria', sans-serif"
            >
              سقف الراتب ({salary} {currencySymbol})
            </text>

            {/* مساحة التظليل الفعلي */}
            {actualAreaD && (
              <path d={actualAreaD} fill="url(#actualGrad)" />
            )}

            {/* خط المسار التخيلي */}
            {forecastPathD && (
              <path
                d={forecastPathD}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
            )}

            {/* خط المسار الفعلي */}
            {actualPathD && (
              <path
                d={actualPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* نقاط الأيام الهامة والأيام التفاعلية */}
            {points.map((p) => {
              const x = getX(p.day);
              const val = p.actual !== null ? p.actual : p.forecast;
              const y = getY(val);
              const isMajor = p.day === 1 || p.isToday || p.day === totalDaysInMonth || p.day % 5 === 0;

              return (
                <g key={p.day}>
                  {/* تسميات الأيام على المحور السيني */}
                  {isMajor && (
                    <text
                      x={x}
                      y={svgHeight - paddingY + 16}
                      textAnchor="middle"
                      fill={p.isToday ? 'var(--brand-500)' : 'var(--text-muted)'}
                      fontSize="9"
                      fontWeight={p.isToday ? 'bold' : 'normal'}
                      fontFamily="'Alexandria', sans-serif"
                    >
                      {p.isToday ? `اليوم (${p.day})` : p.day}
                    </text>
                  )}

                  {/* نقاط المنحنى */}
                  {isMajor && (
                    <circle
                      cx={x}
                      y={y}
                      r={p.isToday ? 5.5 : 3.5}
                      fill={p.isToday ? '#10b981' : (p.isFuture ? '#8b5cf6' : '#10b981')}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                      onMouseEnter={() => setHoveredPoint(p)}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* نافذة التلميح السريعة عند التمرير */}
          {hoveredPoint && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#f8fafc',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              zIndex: 10,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>يوم {hoveredPoint.day}:</span>
              <strong style={{ color: hoveredPoint.isFuture ? '#a78bfa' : 'var(--color-success)' }}>
                {formatCurrency(hoveredPoint.actual !== null ? hoveredPoint.actual : hoveredPoint.forecast, currencySymbol)}
              </strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                ({hoveredPoint.isFuture ? 'تخيلي متوقع' : 'فعلي تراكمي'})
              </span>
            </div>
          )}
        </div>
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
