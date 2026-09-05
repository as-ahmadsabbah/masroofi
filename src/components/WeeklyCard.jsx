import React from 'react';
import { Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { getWeeklyBreakdown, formatCurrency, formatArabicDate } from '../utils/dateUtils';

export default function WeeklyCard({ monthInfo, expenses = [], totalBudget = 0, currencySymbol = 'ر.س' }) {
  const weeks = getWeeklyBreakdown(monthInfo, expenses);
  const currentWeek = weeks.find(w => w.isCurrentWeek) || weeks[0];

  // الحصة الأسبوعية المخططة = إجمالي ميزانية الشهر / عدد الأسابيع
  const totalWeeksCount = weeks.length || 4;
  const weeklyQuota = totalWeeksCount > 0 ? totalBudget / totalWeeksCount : 0;
  const currentWeekSpent = currentWeek?.totalSpent || 0;
  const percentOfQuota = weeklyQuota > 0 ? (currentWeekSpent / weeklyQuota) * 100 : 0;

  let paceStatus = {
    title: 'وتيرة ممتازة وفي نطاق الأمان',
    color: '#10b981',
    icon: CheckCircle2,
    badgeClass: 'badge-success',
  };

  if (percentOfQuota > 100) {
    paceStatus = {
      title: 'وتيرة صرف سريعة تجاوزت حصة الأسبوع',
      color: '#ef4444',
      icon: AlertCircle,
      badgeClass: 'badge-danger',
    };
  } else if (percentOfQuota >= 80) {
    paceStatus = {
      title: 'اقتربت من الحد الأقصى لحصة هذا الأسبوع',
      color: '#f59e0b',
      icon: TrendingUp,
      badgeClass: 'badge-variable',
    };
  }

  const StatusIcon = paceStatus.icon;

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>الملخص الأسبوعي المصغّر</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentWeek?.name} ({formatArabicDate(currentWeek?.startDate)} - {formatArabicDate(currentWeek?.endDate)})
              </span>
            </div>
          </div>
          <span className={`badge ${paceStatus.badgeClass}`} style={{ fontSize: '0.75rem' }}>
            {Math.round(percentOfQuota)}%
          </span>
        </div>

        {/* أرقام الأسبوع الحالي */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          background: 'var(--bg-app)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '14px',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>مصروف هذا الأسبوع</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatCurrency(currentWeekSpent, currencySymbol)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الحصة الأسبوعية التقريبية</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
              {formatCurrency(weeklyQuota, currencySymbol)}
            </div>
          </div>
        </div>

        {/* شريط التقدم لحصة الأسبوع */}
        <div style={{ marginBottom: '12px' }}>
          <div className="progress-bar-container" style={{ height: '8px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, percentOfQuota)}%`,
                background: paceStatus.color,
              }}
            />
          </div>
        </div>

        {/* حالة وتيرة الصرف */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: paceStatus.color,
          marginBottom: '16px',
        }}>
          <StatusIcon size={15} />
          <span style={{ fontWeight: 600 }}>{paceStatus.title}</span>
        </div>
      </div>

      {/* استعراض مصغر لكافة أسابيع الشهر */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          مسار أسابيع هذا الشهر ({weeks.length} أسابيع):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks.length}, 1fr)`, gap: '6px' }}>
          {weeks.map((w) => {
            const isOver = weeklyQuota > 0 && w.totalSpent > weeklyQuota;
            return (
              <div
                key={w.weekIndex}
                style={{
                  background: w.isCurrentWeek ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-app)',
                  border: w.isCurrentWeek ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 4px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: w.isCurrentWeek ? 800 : 500, color: w.isCurrentWeek ? 'var(--brand-500)' : 'var(--text-secondary)' }}>
                  س {w.weekIndex}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isOver ? 'var(--color-danger)' : 'var(--text-primary)', marginTop: '2px' }}>
                  {w.totalSpent > 0 ? Math.round(w.totalSpent) : '0'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
