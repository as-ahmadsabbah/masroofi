import React from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  Wallet,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CategoryIcon from '../CategoryIcon';
import DailySpendingBarChart from '../charts/DailySpendingBarChart';
import {
  formatCurrency,
  formatArabicDateRelative,
  calculateMonthForecast,
  getTodayIso,
} from '../../utils/dateUtils';

export default function TodayView({
  settings,
  todayExpenses = [],
  monthExpenses = [],
  categories = [],
  onOpenAddExpense,
  onQuickAdd,
  onEditExpense,
  onDeleteExpense,
  isDark = true,
}) {
  const salary = Number(settings?.salary || 4000);
  const currencySymbol = settings?.baseCurrency === 'USD' ? '$' : '₪';

  // 1. حساب إجمالي مصروف اليوم
  const todayTotal = todayExpenses.reduce(
    (sum, e) => sum + Number(e.convertedAmount || e.amount || 0),
    0
  );

  // 2. حساب التراكمي للشهر الحالي تلقائياً
  const monthTotal = monthExpenses.reduce(
    (sum, e) => sum + Number(e.convertedAmount || e.amount || 0),
    0
  );

  // 3. الباقي من الراتب
  const remainingSalary = salary - monthTotal;

  // 4. التوقع لنهاية الشهر بناءً على وتيرة الصرف اليومية
  const forecast = calculateMonthForecast(monthTotal, salary);

  // فئات سريعة لها مبالغ افتراضية
  const quickCats = categories.filter(c => c.defaultAmount && Number(c.defaultAmount) > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. الشريط المالي العلوي المبسط: الراتب والمتبقي والشهر */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
      }}>
        {/* الباقي من الراتب */}
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>الباقي من راتبك</span>
          <div style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            color: remainingSalary < 0 ? 'var(--color-danger)' : 'var(--color-success)',
            marginTop: '2px',
          }}>
            {formatCurrency(remainingSalary, currencySymbol)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            من راتب {formatCurrency(salary, currencySymbol)}
          </span>
        </div>

        {/* صرفت هالشهر لغاية الآن */}
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>صرفت هالشهر لغاية الآن</span>
          <div style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            marginTop: '2px',
          }}>
            {formatCurrency(monthTotal, currencySymbol)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            مجموع تراكمي تلقائي ({forecast.daysElapsed} يوم)
          </span>
        </div>
      </div>

      {/* 2. بطاقة "صرفت اليوم: X ₪" البارزة والأساسية */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.04) 100%)',
        border: '2px solid rgba(16, 185, 129, 0.35)',
        textAlign: 'center',
        padding: '28px 20px',
        borderRadius: '24px',
        boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)',
      }}>
        <span style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: 'var(--brand-500)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          مجموع مصروفك لليوم ({formatArabicDateRelative(getTodayIso())})
        </span>

        <div style={{
          fontSize: '3.2rem',
          fontWeight: 900,
          color: 'var(--text-primary)',
          margin: '6px 0',
          lineHeight: 1.1,
          fontFeatureSettings: '"tnum"',
        }}>
          {formatCurrency(todayTotal, currencySymbol)}
        </div>

        {/* زر الإضافة الكبير والمميز */}
        <button
          className="btn btn-primary"
          onClick={() => onOpenAddExpense()}
          style={{
            marginTop: '16px',
            padding: '14px 28px',
            fontSize: '1.1rem',
            fontWeight: 800,
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
          }}
        >
          <Plus size={22} />
          <span>+ إضافة مصروف اليوم</span>
        </button>

        {/* أزرار الإضافة السريعة بنقرة واحدة (دخان 5 ₪، قهوة 5 ₪...) */}
        {quickCats.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: '100%', marginBottom: '2px' }}>
              تسجيل سريع بنقرة واحدة:
            </span>
            {quickCats.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onQuickAdd(cat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <CategoryIcon name={cat.icon} size={15} color={cat.color} />
                <span>+ {cat.name} ({cat.defaultAmount} ₪)</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. تفاصيل مصاريف اليوم مباشرة تحت بطاقة المجموع */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
            تفاصيل مصاريف اليوم ({todayExpenses.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {todayExpenses.length > 0 ? `المجموع: ${formatCurrency(todayTotal, currencySymbol)}` : ''}
          </span>
        </div>

        {todayExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.9rem' }}>لسّة ما سجلت أي مصروف اليوم.</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>
              اضغط على زر "إضافة مصروف اليوم" أو استخدم الأزرار السريعة أعلاه.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayExpenses.map((exp) => {
              const cat = categories.find(c => c.id === exp.categoryId) || {
                name: exp.categoryName || 'مصروف',
                color: '#10b981',
                icon: 'ShoppingBag',
              };

              return (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: `${cat.color}20`,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '0.92rem' }}>{exp.categoryName || cat.name}</strong>
                        {exp.isSubscription && (
                          <span className="badge badge-fixed" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                            اشتراك شهري تلقائي
                          </span>
                        )}
                      </div>
                      {exp.note && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {exp.note}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {formatCurrency(exp.convertedAmount || exp.amount, currencySymbol)}
                    </span>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => onEditExpense(exp)}
                      title="تعديل"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      onClick={() => {
                        if (window.confirm('هل تريد حذف هذا المصروف؟')) {
                          onDeleteExpense(exp.id);
                        }
                      }}
                      title="حذف"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. بطاقة التوقع الشهري الذكي (Forecast) */}
      <div className="glass-card" style={{
        borderLeft: forecast.status === 'danger'
          ? '4px solid var(--color-danger)'
          : forecast.status === 'warning'
          ? '4px solid var(--color-warning)'
          : '4px solid var(--color-success)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="var(--brand-500)" />
          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>
            التوقع الشهري الذكي بناءً على وتيرة صرفك
          </h4>
        </div>

        <div style={{
          background: 'var(--bg-app)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '10px',
        }}>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
            لو استمريت بنفس وتيرة الصرف اليومية (<strong>{formatCurrency(forecast.dailyAverage, currencySymbol)}/يوم</strong>)، متوقع تصرف هالشهر:{' '}
            <strong style={{
              color: forecast.status === 'danger' ? 'var(--color-danger)' : forecast.status === 'warning' ? 'var(--color-warning)' : 'var(--brand-500)'
            }}>
              {formatCurrency(forecast.projectedEndMonth, currencySymbol)}
            </strong>
            {' '}ويضلّلك:{' '}
            <strong style={{
              color: forecast.projectedRemaining < 0 ? 'var(--color-danger)' : 'var(--color-success)'
            }}>
              {formatCurrency(forecast.projectedRemaining, currencySymbol)}
            </strong>.
          </p>
        </div>

        {/* مؤشر تحذيري مبكر */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          {forecast.status === 'safe' && (
            <>
              <CheckCircle2 size={15} color="var(--color-success)" />
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                ممتاز! وتيرة صرفك الحالية آمنة وتحت سقف الراتب.
              </span>
            </>
          )}
          {forecast.status === 'warning' && (
            <>
              <AlertTriangle size={15} color="var(--color-warning)" />
              <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                تنبيه مبكر: وتيرة صرفك تقترب من حد الراتب الشهري بالكامل.
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

      {/* 5. الرسم البياني اليومي مع خط المعدل المسموح */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              رسم بياني للصرف اليومي
            </h4>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              الخط الأصفر يمثل المعدل اليومي المسموح من الراتب ({forecast.allowedDailyAverage} {currencySymbol}/يوم)
            </span>
          </div>
        </div>

        <DailySpendingBarChart
          monthExpenses={monthExpenses}
          salary={salary}
          currencySymbol={currencySymbol}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
