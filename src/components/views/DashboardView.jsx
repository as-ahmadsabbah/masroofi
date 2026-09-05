import React from 'react';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Calendar,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatArabicDate } from '../../utils/dateUtils';
import CategoryIcon from '../CategoryIcon';
import CategoryPieChart from '../charts/CategoryPieChart';
import PlannedVsActualBarChart from '../charts/PlannedVsActualBarChart';
import MonthlyTrendLineChart from '../charts/MonthlyTrendLineChart';
import WeeklyCard from '../WeeklyCard';
import QuickAlertsBanner from '../QuickAlertsBanner';

export default function DashboardView({
  settings,
  monthInfo,
  expenses = [],
  incomes = [],
  categories = [],
  onOpenAddExpense,
  onOpenAddIncome,
  onViewExpenses,
  onDeleteExpense,
  isDark = true,
}) {
  const currencyObj = settings?.currencies?.find(c => c.code === settings?.baseCurrency);
  const currencySymbol = currencyObj?.symbol || 'ر.س';
  const salary = Number(settings?.salary || 0);

  // الدخل الإضافي الموجه للميزانية
  const budgetIncomes = incomes
    .filter(i => i.destination === 'budget')
    .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);

  // الدخل الإضافي الموجه للمدخرات
  const savingsIncomes = incomes
    .filter(i => i.destination === 'savings')
    .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);

  // إجمالي الميزانية المتاحة للصرف = الراتب + دخل الميزانية
  const totalSpendableBudget = salary + budgetIncomes;

  // إجمالي المصروف الفعلي
  const totalSpent = expenses.reduce((s, e) => s + Number(e.convertedAmount || e.amount || 0), 0);

  // المتبقي من الميزانية
  const remainingBudget = totalSpendableBudget - totalSpent;
  const spentPercent = totalSpendableBudget > 0 ? (totalSpent / totalSpendableBudget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;

  // الفائض القابل للادخار للشهر = المتبقي (إن كان موجباً) + دخل المدخرات
  const monthlySavingsSurplus = Math.max(0, remainingBudget) + savingsIncomes;

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  return (
    <div>
      {/* 1. بطاقات المؤشرات العلوية (Top KPI Stats) */}
      <div className="grid-stats">
        {/* بطاقة الراتب والميزانية */}
        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-title">الراتب والميزانية المتاحة</span>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="stat-value">
            {formatCurrency(totalSpendableBudget, currencySymbol)}
          </div>
          <div className="stat-footer">
            {budgetIncomes > 0 ? (
              <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={14} />
                <span>يشمل {formatCurrency(budgetIncomes, currencySymbol)} دخل إضافي</span>
              </span>
            ) : (
              <span>الراتب الأساسي الصافي المحدد</span>
            )}
          </div>
        </div>

        {/* بطاقة المصروف الفعلي */}
        <div className={`glass-card stat-card ${isOverBudget ? 'alert-danger' : ''}`}>
          <div className="stat-header">
            <span className="stat-title">المصروف الفعلي حتى الآن</span>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: isOverBudget ? 'var(--color-danger)' : undefined }}>
            {formatCurrency(totalSpent, currencySymbol)}
          </div>
          <div className="stat-footer" style={{ width: '100%', flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span>نسبة الصرف من الميزانية:</span>
              <strong style={{ color: isOverBudget ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                {Math.round(spentPercent)}%
              </strong>
            </div>
            <div className="progress-bar-container" style={{ height: '6px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, spentPercent)}%`,
                  background: isOverBudget ? 'var(--color-danger)' : spentPercent >= 85 ? 'var(--color-warning)' : 'var(--brand-500)',
                }}
              />
            </div>
          </div>
        </div>

        {/* بطاقة المتبقي من الراتب */}
        <div className={`glass-card stat-card ${isOverBudget ? 'alert-danger' : ''}`}>
          <div className="stat-header">
            <span className="stat-title">المتبقي من الراتب</span>
            <div className="stat-icon" style={{
              background: isOverBudget ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: isOverBudget ? '#ef4444' : '#10b981',
            }}>
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: isOverBudget ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {formatCurrency(Math.abs(remainingBudget), currencySymbol)}
            {isOverBudget && <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-danger)' }}> (عجز)</span>}
          </div>
          <div className="stat-footer">
            <span>
              {isOverBudget
                ? 'تجاوزت الراتب! يلزم ترشيد الإنفاق'
                : `متاح للصرف أو التوفير حتى نهاية الدورة`}
            </span>
          </div>
        </div>

        {/* بطاقة الأيام المتبقية في الدورة */}
        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-title">الأيام المتبقية للشهر الجديد</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value">
            {monthInfo.daysRemaining} <span style={{ fontSize: '1rem', fontWeight: 600 }}>يوم</span>
          </div>
          <div className="stat-footer">
            <span>
              تنتهي الدورة الحالية في: {formatArabicDate(monthInfo.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. شريط التنبيهات النشطة الذكية */}
      {settings.alertsEnabled && (
        <QuickAlertsBanner
          categories={categories}
          expenses={expenses}
          totalBudget={totalSpendableBudget}
          currencySymbol={currencySymbol}
          salary={salary}
          onViewExpenses={onViewExpenses}
        />
      )}

      {/* 3. شبكة الرسوم البيانية والملخص الأسبوعي */}
      <div className="grid-charts">
        {/* رسم توزيع الفئات الدائري Donut مع تمييز الثابت والمتغير */}
        <div className="glass-card col-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                توزيع المصروف الفعلي حسب الفئة
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                مع تمييز لوني بين الفئات الثابتة والمتغيرة
              </p>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
              دائري تفاعلي
            </span>
          </div>
          <CategoryPieChart
            categories={categories}
            expenses={expenses}
            currencySymbol={currencySymbol}
            isDark={isDark}
          />
        </div>

        {/* بطاقة الملخص الأسبوعي المصغّر */}
        <div className="col-6">
          <WeeklyCard
            monthInfo={monthInfo}
            expenses={expenses}
            totalBudget={totalSpendableBudget}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* رسم أعمدة المقارنة: المخطط مقابل الفعلي */}
        <div className="glass-card col-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                المقارنة: المخطط مقابل الفعلي لكل فئة
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                مقارنة ما تم تخصيصه في الميزانية مع ما تم صرفه واقعياً
              </p>
            </div>
            <span className="badge badge-variable" style={{ fontSize: '0.75rem' }}>
              رسم أعمدة
            </span>
          </div>
          <PlannedVsActualBarChart
            categories={categories}
            expenses={expenses}
            salary={salary}
            currencySymbol={currencySymbol}
            isDark={isDark}
          />
        </div>

        {/* رسم خطي لتطور الصرف والادخار عبر الأشهر */}
        <div className="glass-card col-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                تطور الصرف والادخار عبر الشهور
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                مسار الإنفاق وفائض التوفير في الأشهر السابقة والحالية
              </p>
            </div>
            <span className="badge badge-fixed" style={{ fontSize: '0.75rem' }}>
              رسم خطي
            </span>
          </div>
          <MonthlyTrendLineChart
            salary={salary}
            currencySymbol={currencySymbol}
            isDark={isDark}
          />
        </div>
      </div>

      {/* 4. قائمة آخر المصاريف المسجلة في هذا الشهر */}
      <div className="glass-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              أحدث العمليات المسجلة
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              آخر المصاريف المضافة في هذا الشهر
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={onViewExpenses}>
              <span>عرض جميع العمليات ({expenses.length})</span>
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-primary btn-sm" onClick={onOpenAddExpense}>
              <Plus size={16} />
              <span>إضافة مصروف</span>
            </button>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
            <p>لا توجد مصاريف مضافة لهذا الشهر حتى الآن.</p>
            <button className="btn btn-primary btn-sm" onClick={onOpenAddExpense} style={{ marginTop: '10px' }}>
              <Plus size={16} />
              <span>سجل أول مصروف بنقرة واحدة</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.slice(0, 5).map((exp) => {
              const cat = catMap[exp.categoryId] || { name: 'أخرى', color: '#64748b', icon: 'HelpCircle' };
              return (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: `${cat.color}18`,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CategoryIcon name={cat.icon} size={20} color={cat.color} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                          {cat.name}
                        </span>
                        {exp.isRecurring && (
                          <span className="badge badge-fixed" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                            متكرر
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {exp.note ? `${exp.note} • ` : ''}{formatArabicDate(exp.date)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      -{formatCurrency(exp.convertedAmount || exp.amount, currencySymbol)}
                    </div>
                    {exp.currency !== settings.baseCurrency && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ({exp.amount} {exp.currency})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
