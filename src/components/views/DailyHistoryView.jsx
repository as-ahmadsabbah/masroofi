import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  Trash2,
  Edit2,
  Clock,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';
import CategoryIcon from '../CategoryIcon';
import {
  formatCurrency,
  formatArabicDateRelative,
  formatArabicDateFull,
} from '../../utils/dateUtils';

export default function DailyHistoryView({
  monthExpenses = [],
  categories = [],
  currencySymbol = '₪',
  onEditExpense,
  onDeleteExpense,
}) {
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'transactions'
  const [expandedDays, setExpandedDays] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // 1. تجميع المصاريف حسب الأيام
  const groupedDays = useMemo(() => {
    const map = {};
    monthExpenses.forEach((exp) => {
      const d = exp.date;
      if (!map[d]) {
        map[d] = {
          date: d,
          total: 0,
          items: [],
        };
      }
      map[d].total += Number(exp.convertedAmount || exp.amount || 0);
      map[d].items.push(exp);
    });

    return Object.values(map).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [monthExpenses]);

  // تبديل توسيع يوم معين
  const toggleDayExpand = (dayDate) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayDate]: !prev[dayDate],
    }));
  };

  // فلترة الحركات بحسب البحث
  const filteredTransactions = useMemo(() => {
    return monthExpenses
      .filter((exp) => {
        const q = searchQuery.toLowerCase();
        return (
          (exp.categoryName || '').toLowerCase().includes(q) ||
          (exp.note || '').toLowerCase().includes(q) ||
          String(exp.amount).includes(q)
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [monthExpenses, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* الترويسة ومبدل طريقة العرض */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              سجل المصاريف والحركات
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              استعرض مصاريفك يوماً بيوم أو كقائمة حركات زمنية متتابعة
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`btn btn-sm ${viewMode === 'days' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('days')}
            >
              <Calendar size={15} />
              <span>مجمّع بالأيام</span>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('transactions')}
            >
              <ListFilter size={15} />
              <span>كل الحركات ({monthExpenses.length})</span>
            </button>
          </div>
        </div>

        {/* شريط البحث */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '12px', right: '12px' }} />
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالفئة، الملاحظة، أو المبلغ..."
            style={{ paddingRight: '36px', fontSize: '0.86rem' }}
          />
        </div>
      </div>

      {/* العرض الأول: مجمّع بالأيام (Daily Grouping) */}
      {viewMode === 'days' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {groupedDays.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
              لا توجد مصاريف مسجلة في هذا الشهر حتى الآن.
            </div>
          ) : (
            groupedDays.map((dayGroup) => {
              const isExpanded = expandedDays[dayGroup.date] !== false; // مفتوح افتراضياً
              return (
                <div key={dayGroup.date} className="glass-card" style={{ padding: '16px' }}>
                  {/* رأس اليوم: التاريخ والإجمالي وزر التوسيع */}
                  <div
                    onClick={() => toggleDayExpand(dayGroup.date)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
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
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '1rem' }}>
                            {formatArabicDateRelative(dayGroup.date)}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ({formatArabicDateFull(dayGroup.date)})
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {dayGroup.items.length} حركات
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                        {formatCurrency(dayGroup.total, currencySymbol)}
                      </span>
                      {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* قائمة تفاصيل مصاريف هذا اليوم عند التوسيع */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '14px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {dayGroup.items.map((exp) => {
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
                              padding: '10px 12px',
                              background: 'var(--bg-app)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <CategoryIcon name={cat.icon} size={16} color={cat.color} />
                              <div>
                                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                                  {exp.categoryName || cat.name}
                                </span>
                                {exp.note && (
                                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginRight: '6px' }}>
                                    • {exp.note}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <strong style={{ fontSize: '0.98rem' }}>
                                {formatCurrency(exp.convertedAmount || exp.amount, currencySymbol)}
                              </strong>
                              <button
                                className="btn btn-secondary btn-icon btn-sm"
                                onClick={() => onEditExpense(exp)}
                                title="تعديل"
                              >
                                <Edit2 size={12} />
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
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* العرض الثاني: سجل الحركات المتتابع (Transactions Log) */}
      {viewMode === 'transactions' && (
        <div className="glass-card">
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
              لم يتم العثور على حركات تطابق البحث.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTransactions.map((exp) => {
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
                        borderRadius: '8px',
                        background: `${cat.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.92rem' }}>{exp.categoryName || cat.name}</strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            ({formatArabicDateRelative(exp.date)})
                          </span>
                        </div>
                        {exp.note && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {exp.note}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '1.05rem' }}>
                        {formatCurrency(exp.convertedAmount || exp.amount, currencySymbol)}
                      </strong>
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => onEditExpense(exp)}
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
      )}
    </div>
  );
}
