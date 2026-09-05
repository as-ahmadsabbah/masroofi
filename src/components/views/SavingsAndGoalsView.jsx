import React from 'react';
import {
  PiggyBank,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Edit3,
  Award,
  Wallet,
} from 'lucide-react';
import { formatCurrency, formatArabicMonth } from '../../utils/dateUtils';
import FinancialGoalCard from '../FinancialGoalCard';

export default function SavingsAndGoalsView({
  settings,
  savingsSummary,
  currentGoalEval,
  forecast,
  onOpenSetGoal,
  currencySymbol = '₪',
}) {
  const { totalCumulativeSavings = 0, monthlyBreakdown = [] } = savingsSummary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. بطاقة الثروة الكبرى: إجمالي المدخرات التراكمية عبر كل الأشهر */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(59, 130, 246, 0.12) 100%)',
        border: '2px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '24px',
        padding: '28px 22px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.2)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          color: 'var(--brand-500)',
          fontWeight: 800,
          fontSize: '0.85rem',
          marginBottom: '10px',
        }}>
          <PiggyBank size={18} />
          <span>إجمالي مدخراتك التراكمية عبر كل الأشهر</span>
        </div>

        <div style={{
          fontSize: '3.4rem',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: '6px 0 12px',
          fontFeatureSettings: '"tnum"',
        }}>
          {formatCurrency(totalCumulativeSavings, currencySymbol)}
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          مجموع المبالغ الصافية التي نجحت في توفيرها من رواتبك عبر ({monthlyBreakdown.length}) شهر مسجل.
        </p>
      </div>

      {/* 2. بطاقة هدف الشهر الحالي التفاعلية */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--brand-500)" />
            <span>هدف الشهر الحالي</span>
          </h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenSetGoal()}
          >
            <Edit3 size={14} />
            <span>تحديد أو تعديل هدف هذا الشهر</span>
          </button>
        </div>

        <FinancialGoalCard
          goalEval={currentGoalEval}
          forecast={forecast}
          currencySymbol={currencySymbol}
          onEditGoal={() => onOpenSetGoal()}
        />
      </div>

      {/* 3. سجل المدخرات التاريخي للأشهر (Month-by-Month Savings Timeline) */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#3b82f6" />
              <span>سجل المدخرات والأهداف لكل شهر</span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              تفاصيل ما ادخرته في كل شهر ومقارنته بهدف ذلك الشهر المحدد
            </span>
          </div>
        </div>

        {monthlyBreakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <p>لا توجد بيانات سابقة حتى الآن.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {monthlyBreakdown.map((item) => {
              const monthLabel = formatArabicMonth(item.monthKey);
              const goal = item.goal;
              const hasGoal = goal && goal.goalTargetAmount > 0;

              return (
                <div
                  key={item.monthKey}
                  style={{
                    background: item.isCurrentMonth ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-app)',
                    border: item.isCurrentMonth ? '2px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '1.05rem' }}>{monthLabel}</strong>
                          {item.isCurrentMonth && (
                            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                              الشهر الحالي
                            </span>
                          )}
                          {item.isFutureMonth && (
                            <span className="badge badge-variable" style={{ fontSize: '0.7rem' }}>
                              شهر قادم 🔮
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {item.isFutureMonth
                            ? `الراتب المتوقع: ${formatCurrency(item.salary, currencySymbol)}`
                            : `الراتب: ${formatCurrency(item.salary, currencySymbol)} • المصاريف: ${formatCurrency(item.totalSpent, currencySymbol)}`}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>
                          {item.isFutureMonth ? 'الهدف المالي' : 'المدخر من الشهر'}
                        </span>
                        <strong style={{
                          fontSize: '1.3rem',
                          fontWeight: 900,
                          color: item.isFutureMonth ? '#3b82f6' : (item.savings > 0 ? 'var(--color-success)' : 'var(--text-muted)'),
                        }}>
                          {item.isFutureMonth && hasGoal
                            ? formatCurrency(goal.goalTargetAmount, currencySymbol)
                            : `+${formatCurrency(item.savings, currencySymbol)}`}
                        </strong>
                      </div>

                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => onOpenSetGoal(item.monthKey)}
                        title={`تعديل هدف شهر ${monthLabel}`}
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* تفاصيل هدف ذلك الشهر إن وُجد */}
                  {hasGoal ? (
                    <div style={{
                      background: 'var(--bg-surface)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Target size={14} color="#3b82f6" />
                        <span>
                          هدف {goal.goalType === 'savings' ? 'الادخار' : 'سقف المصاريف'}:{' '}
                          <strong>{formatCurrency(goal.goalTargetAmount, currencySymbol)}</strong>
                        </span>
                      </div>

                      {item.isFutureMonth ? (
                        <span style={{ color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Target size={14} />
                          <span>هدف محدد للمستقبل 🔮</span>
                        </span>
                      ) : item.goalAchieved ? (
                        <span style={{ color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} />
                          <span>تم تحقيق الهدف 🎯</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} />
                          <span>{item.isCurrentMonth ? 'قيد المتابعة' : 'لم يتحقق الهدف'}</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      background: 'var(--bg-surface)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      border: '1px dashed var(--border-subtle)',
                      color: 'var(--text-muted)',
                    }}>
                      <span>بدون هدف مالي محدد لشهر {monthLabel}</span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenSetGoal(item.monthKey)}
                        style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                      >
                        + تحديد هدف
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
