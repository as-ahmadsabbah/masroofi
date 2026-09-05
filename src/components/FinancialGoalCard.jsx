import React from 'react';
import { Target, CheckCircle2, AlertTriangle, AlertCircle, Edit3, TrendingUp, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

export default function FinancialGoalCard({
  goalEval,
  currencySymbol = '₪',
  onEditGoal,
}) {
  if (!goalEval) {
    return (
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Target size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '0.94rem' }}>لم تحدد هدفك المالي لهذا الشهر بعد</strong>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              حدد هدف ادخار أو سقف أقصى للمصاريف ليتابع التطبيق التزامك به تلقائياً
            </div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onEditGoal}>
          <Target size={14} />
          <span>تحديد هدف الشهر</span>
        </button>
      </div>
    );
  }

  const { goalType, target, progressPct, status, message, projectedSavings, projectedSpend } = goalEval;

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
          className="btn btn-secondary btn-icon btn-sm"
          onClick={onEditGoal}
          title="تعديل الهدف"
        >
          <Edit3 size={14} />
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
