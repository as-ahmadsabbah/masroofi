import React, { useState } from 'react';
import {
  Calendar,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { formatArabicMonth, formatCurrency } from '../../utils/dateUtils';
import { storageService } from '../../services/storageService';
import CategoryIcon from '../CategoryIcon';

export default function HistoryArchiveView({
  settings,
  categories = [],
  onSelectMonth,
}) {
  const allMonths = storageService.getAllRecordedMonths();
  const [monthA, setMonthA] = useState(allMonths[0] || '2026-09');
  const [monthB, setMonthB] = useState(allMonths[1] || allMonths[0] || '2026-08');
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' | 'archive'

  const salary = Number(settings?.salary || 0);
  const currencyObj = settings?.currencies?.find(c => c.code === settings?.baseCurrency);
  const currencySymbol = currencyObj?.symbol || 'ر.س';
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  // دالة لحساب ملخص أي شهر
  const getMonthSummary = (mKey) => {
    const expenses = storageService.getExpenses(mKey);
    const incomes = storageService.getIncomes(mKey);

    const totalSpent = expenses.reduce((s, e) => s + Number(e.convertedAmount || e.amount || 0), 0);
    const totalIncome = incomes.reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);
    const budgetIncome = incomes
      .filter(i => i.destination === 'budget')
      .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);
    const savingsIncome = incomes
      .filter(i => i.destination === 'savings')
      .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);

    const spendable = salary + budgetIncome;
    const surplus = spendable - totalSpent;
    const netSavings = Math.max(0, surplus) + savingsIncome;

    const catSpent = {};
    expenses.forEach((e) => {
      catSpent[e.categoryId] = (catSpent[e.categoryId] || 0) + Number(e.convertedAmount || e.amount || 0);
    });

    return {
      monthKey: mKey,
      label: formatArabicMonth(mKey),
      expenses,
      incomes,
      totalSpent,
      totalIncome,
      spendable,
      surplus,
      netSavings,
      catSpent,
    };
  };

  const summaryA = getMonthSummary(monthA);
  const summaryB = getMonthSummary(monthB);

  // فروقات المقارنة (Month B - Month A)
  const diffSpent = summaryB.totalSpent - summaryA.totalSpent;
  const diffSavings = summaryB.netSavings - summaryA.netSavings;

  return (
    <div>
      {/* الترويسة ومبدل التبويب */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>السجل الشهري والمقارنة التفاعلية</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              أرشيف لكل دورة مالية سابقة مع أداة مقارنة ذكية بين أي شهرين جنباً إلى جنب
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'comparison' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('comparison')}
            >
              <ArrowUpDown size={15} />
              <span>مقارنة شهرين جنباً إلى جنب</span>
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'archive' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('archive')}
            >
              <Calendar size={15} />
              <span>أرشيف الشهور الشامل</span>
            </button>
          </div>
        </div>
      </div>

      {/* تبويب 1: مقارنة شهرين جنباً إلى جنب */}
      {activeTab === 'comparison' && (
        <div>
          {/* محددات اختيار الشهرين */}
          <div className="glass-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'center' }}>
              <div>
                <label className="form-label" style={{ color: '#3b82f6' }}>الشهر الأول (أ):</label>
                <select
                  className="form-select"
                  value={monthA}
                  onChange={(e) => setMonthA(e.target.value)}
                >
                  {allMonths.map((m) => (
                    <option key={m} value={m}>{formatArabicMonth(m)}</option>
                  ))}
                </select>
              </div>

              <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '20px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--brand-gradient)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--brand-glow)',
                }}>
                  <ArrowUpDown size={20} />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ color: '#10b981' }}>الشهر الثاني (ب):</label>
                <select
                  className="form-select"
                  value={monthB}
                  onChange={(e) => setMonthB(e.target.value)}
                >
                  {allMonths.map((m) => (
                    <option key={m} value={m}>{formatArabicMonth(m)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* بطاقات الفروقات الرئيسية */}
          <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {/* مقارنة إجمالي المصروف */}
            <div className="glass-card stat-card">
              <div className="stat-header">
                <span className="stat-title">مقارنة إجمالي المصروف الفعلي</span>
                <TrendingDown size={20} color={diffSpent > 0 ? '#ef4444' : '#10b981'} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{summaryA.label}</div>
                  <strong style={{ fontSize: '1.2rem' }}>{formatCurrency(summaryA.totalSpent, currencySymbol)}</strong>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{summaryB.label}</div>
                  <strong style={{ fontSize: '1.2rem' }}>{formatCurrency(summaryB.totalSpent, currencySymbol)}</strong>
                </div>
              </div>
              <div className="stat-footer">
                {diffSpent === 0 ? (
                  <span>المصروف متطابق تماماً في الشهرين</span>
                ) : diffSpent > 0 ? (
                  <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                    زاد الصرف في {summaryB.label} بمقدار {formatCurrency(diffSpent, currencySymbol)} (+{Math.round((diffSpent / (summaryA.totalSpent || 1)) * 100)}%)
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                    وفّرت وصرفت أقل في {summaryB.label} بمقدار {formatCurrency(Math.abs(diffSpent), currencySymbol)} (-{Math.round((Math.abs(diffSpent) / (summaryA.totalSpent || 1)) * 100)}%)
                  </span>
                )}
              </div>
            </div>

            {/* مقارنة صافي الفائض والادخار */}
            <div className="glass-card stat-card">
              <div className="stat-header">
                <span className="stat-title">مقارنة صافي المدخرات والفائض</span>
                <PiggyBank size={20} color={diffSavings >= 0 ? '#10b981' : '#f59e0b'} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{summaryA.label}</div>
                  <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>{formatCurrency(summaryA.netSavings, currencySymbol)}</strong>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{summaryB.label}</div>
                  <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>{formatCurrency(summaryB.netSavings, currencySymbol)}</strong>
                </div>
              </div>
              <div className="stat-footer">
                {diffSavings >= 0 ? (
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                    ارتفع ادخارك في {summaryB.label} بمقدار +{formatCurrency(diffSavings, currencySymbol)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                    انخفض ادخارك في {summaryB.label} بمقدار {formatCurrency(Math.abs(diffSavings), currencySymbol)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* جدول المقارنة التفصيلي فئة فئة */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
              المقارنة التفصيلية للمصاريف حسب الفئة
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 10px' }}>الفئة</th>
                    <th style={{ padding: '12px 10px' }}>النوع</th>
                    <th style={{ padding: '12px 10px', color: '#3b82f6' }}>{summaryA.label}</th>
                    <th style={{ padding: '12px 10px', color: '#10b981' }}>{summaryB.label}</th>
                    <th style={{ padding: '12px 10px' }}>الفرق والتغيّر</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const spentA = summaryA.catSpent[cat.id] || 0;
                    const spentB = summaryB.catSpent[cat.id] || 0;
                    const diff = spentB - spentA;
                    const pctDiff = spentA > 0 ? Math.round((diff / spentA) * 100) : spentB > 0 ? 100 : 0;

                    return (
                      <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              background: `${cat.color}20`,
                              color: cat.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <CategoryIcon name={cat.icon} size={15} color={cat.color} />
                            </div>
                            <strong style={{ color: 'var(--text-primary)' }}>{cat.name}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <span className={`badge ${cat.type === 'fixed' ? 'badge-fixed' : 'badge-variable'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {cat.type === 'fixed' ? 'ثابتة' : 'متغيرة'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                          {formatCurrency(spentA, currencySymbol)}
                        </td>
                        <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                          {formatCurrency(spentB, currencySymbol)}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          {diff === 0 ? (
                            <span style={{ color: 'var(--text-muted)' }}>لا يوجد فرق</span>
                          ) : diff > 0 ? (
                            <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                              +{formatCurrency(diff, currencySymbol)} (+{pctDiff}%)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                              -{formatCurrency(Math.abs(diff), currencySymbol)} ({pctDiff}%)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* تبويب 2: قائمة أرشيف كل الشهور */}
      {activeTab === 'archive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {allMonths.map((mKey) => {
            const summary = getMonthSummary(mKey);
            const isDeficit = summary.surplus < 0;

            return (
              <div key={mKey} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                        {summary.label}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {summary.expenses.length} مصروف مسجل • {summary.incomes.length} دخل إضافي
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectMonth(mKey)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={15} />
                    <span>استعراض الشهر في لوحة التحكم</span>
                  </button>
                </div>

                {/* مقاييس الشهر السريع */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  background: 'var(--bg-app)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الميزانية المتاحة</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                      {formatCurrency(summary.spendable, currencySymbol)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>المصروف الفعلي</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: isDeficit ? 'var(--color-danger)' : undefined }}>
                      {formatCurrency(summary.totalSpent, currencySymbol)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الدخل الإضافي</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-500)' }}>
                      +{formatCurrency(summary.totalIncome, currencySymbol)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>صافي الفائض والادخار</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isDeficit ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {isDeficit ? `عجز: ${formatCurrency(Math.abs(summary.surplus), currencySymbol)}` : formatCurrency(summary.netSavings, currencySymbol)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
