import React from 'react';
import { Target, CheckCircle2, AlertTriangle, AlertCircle, Edit3, Compass, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

export default function FinancialGoalCard({
  goalEval,
  forecast,
  currencySymbol = '₪',
  onEditGoal,
}) {
  // 1. في حال اختيار "فش هدف" أو عدم تحديد هدف بعد: نعرض التنبؤ الشهري الذكي مباشرة وبوضوح
  if (!goalEval) {
    return (
      <div className="glass-card" style={{
        borderLeft: '4px solid var(--brand-500)',
        padding: '18px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--brand-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Compass size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '1rem' }}>بدون هدف مالي محدد لهذا الشهر</strong>
                <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                  <Sparkles size={11} />
                  <span>تتبع حر</span>
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                تتبع مصاريفك بحرية مع تنبؤ ذكي بتكلفة الشهر التقديرية
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onEditGoal && onEditGoal()}
            style={{ fontSize: '0.78rem' }}
          >
            <Target size={13} />
            <span>تحديد أو تعديل الهدف</span>
          </button>
        </div>

        {/* صندوق التنبؤ الشهري الذكي عندما لا يوجد هدف */}
        {forecast && (
          <div style={{
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
              <TrendingUp size={16} color="var(--brand-500)" />
              <span>
                التنبؤ المالي بناءً على وتيرة صرفك الحالية (<strong>{formatCurrency(forecast.dailyAverage, currencySymbol)}/يوم</strong>):
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
            }}>
              {/* التنبؤ بإجمالي المصروف لنهاية الشهر */}
              <div style={{
                background: 'var(--bg-surface)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                  متوقع تصرف حتى نهاية الشهر
                </span>
                <strong style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: forecast.status === 'danger' ? 'var(--color-danger)' : forecast.status === 'warning' ? 'var(--color-warning)' : 'var(--brand-500)',
                }}>
                  {formatCurrency(forecast.projectedEndMonth, currencySymbol)}
                </strong>
              </div>

              {/* التنبؤ بالمتبقي من الراتب بنهاية الشهر */}
              <div style={{
                background: 'var(--bg-surface)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                  متوقع يتبقى معك من الراتب
                </span>
                <strong style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: forecast.projectedRemaining < 0 ? 'var(--color-danger)' : 'var(--color-success)',
                }}>
                  {formatCurrency(forecast.projectedRemaining, currencySymbol)}
                </strong>
              </div>
            </div>

            {/* إرشاد سريع للوتيرة */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginTop: '2px' }}>
              {forecast.status === 'safe' && (
                <>
                  <CheckCircle2 size={15} color="var(--color-success)" />
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                    ممتاز! وتيرة صرفك الحالية آمنة وستبقى تحت سقف الراتب.
                  </span>
                </>
              )}
              {forecast.status === 'warning' && (
                <>
                  <AlertTriangle size={15} color="var(--color-warning)" />
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                    تنبيه: وتيرة صرفك الحالية تقترب من استهلاك كامل الراتب.
                  </span>
                </>
              )}
              {forecast.status === 'danger' && (
                <>
                  <AlertCircle size={15} color="var(--color-danger)" />
                  <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                    تحذير: بهذه الوتيرة ستتجاوز الراتب بـ {formatCurrency(Math.abs(forecast.projectedRemaining), currencySymbol)} مع نهاية الشهر!
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. في حال وجود هدف ادخار أو سقف مصروفات
  const { goalType, target, progressPct, status, message } = goalEval;

  const statusConfig = {
    on_track: {
      title: 'على المسار الصحيح 🎯',
      color: '#10b981',
      badgeClass: 'badge-success',
      icon: CheckCircle2,
    },
    at_risk: {
      title: 'في منطقة الخطر ⚠️',
      color: '#f59e0b',
      badgeClass: 'badge-variable',
      icon: AlertTriangle,
    },
    off_track: {
      title: 'خارج المسار 🚨',
      color: '#ef4444',
      badgeClass: 'badge-danger',
      icon: AlertCircle,
    },
  }[status] || {
    title: 'قيد المتابعة',
    color: '#3b82f6',
    badgeClass: 'badge-fixed',
    icon: Target,
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="glass-card" style={{
      borderLeft: `4px solid ${statusConfig.color}`,
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: `${statusConfig.color}20`,
            color: statusConfig.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Target size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '1rem' }}>
                {goalType === 'savings' ? 'هدف الادخار الشهري' : 'سقف المصاريف الشهري'}
              </strong>
              <span className={`badge ${statusConfig.badgeClass}`} style={{ fontSize: '0.72rem' }}>
                <StatusIcon size={12} />
                <span>{statusConfig.title}</span>
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              المستهدف: <strong>{formatCurrency(target, currencySymbol)}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onEditGoal && onEditGoal()}
          style={{ fontSize: '0.78rem' }}
        >
          <Edit3 size={13} />
          <span>تعديل أو إلغاء الهدف</span>
        </button>
      </div>

      {/* شريط التقدم للهدف */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {goalType === 'savings' ? 'نسبة تغطية الهدف حالياً' : 'نسبة استهلاك السقف المسموح'}
          </span>
          <strong style={{ color: statusConfig.color }}>{progressPct}%</strong>
        </div>
        <div className="progress-bar-container" style={{ height: '8px' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, progressPct)}%`,
              background: statusConfig.color,
            }}
          />
        </div>
      </div>

      {/* التقييم الذكي والتوجيه */}
      <div style={{
        background: 'var(--bg-app)',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.84rem',
        color: 'var(--text-primary)',
        lineHeight: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <StatusIcon size={16} color={statusConfig.color} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
    </div>
  );
}
