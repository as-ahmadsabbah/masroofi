import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Download,
  Calendar,
  Layers,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import CategoryIcon from '../CategoryIcon';
import { formatCurrency, formatArabicDate } from '../../utils/dateUtils';
import { storageService } from '../../services/storageService';

export default function ExpensesView({
  monthKey,
  expenses = [],
  categories = [],
  settings,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // all | fixed | variable
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | highest | lowest

  const currencyObj = settings?.currencies?.find(c => c.code === settings?.baseCurrency);
  const currencySymbol = currencyObj?.symbol || 'ر.س';

  const catMap = useMemo(() => {
    return Object.fromEntries(categories.map(c => [c.id, c]));
  }, [categories]);

  // تصفية وفرز المصاريف
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const cat = catMap[exp.categoryId];
      const matchSearch =
        (exp.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(exp.amount).includes(searchTerm);

      const matchCategory = selectedCategory === 'all' || exp.categoryId === selectedCategory;
      const matchType = selectedType === 'all' || cat?.type === selectedType;

      return matchSearch && matchCategory && matchType;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'highest') return (b.convertedAmount || b.amount) - (a.convertedAmount || a.amount);
      if (sortBy === 'lowest') return (a.convertedAmount || a.amount) - (b.convertedAmount || b.amount);
      return 0;
    });
  }, [expenses, searchTerm, selectedCategory, selectedType, sortBy, catMap]);

  const totalFilteredSpent = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.convertedAmount || e.amount || 0),
    0
  );

  const handleExportCsv = () => {
    const csvContent = storageService.exportExpensesAsCsv(monthKey, currencySymbol);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `masroofi_expenses_${monthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* رأس الصفحة والإحصائيات السريعة */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>سجل المصاريف والعمليات</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              إجمالي ما تم عرضه: {filteredExpenses.length} عملية بإجمالي{' '}
              <strong style={{ color: 'var(--brand-500)' }}>{formatCurrency(totalFilteredSpent, currencySymbol)}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCsv} title="تصدير جدول المصاريف كملف Excel متوافق بالعربي">
              <Download size={16} />
              <span>تصدير CSV / Excel</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={onOpenAddExpense}>
              <Plus size={16} />
              <span>تسجيل مصروف جديد</span>
            </button>
          </div>
        </div>

        {/* أدوات البحث والفلترة */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {/* حقل البحث */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '14px', right: '12px' }} />
            <input
              type="text"
              className="form-input"
              placeholder="ابحث بالاسم، الفئة، أو المبلغ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingRight: '36px', fontSize: '0.88rem' }}
            />
          </div>

          {/* فلتر الفئة */}
          <div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="all">جميع الفئات</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* فلتر النوع (ثابتة أو متغيرة) */}
          <div>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="all">كل الأنواع (ثابتة ومتغيرة)</option>
              <option value="fixed">فئات ثابتة فقط (سكن، فواتير...)</option>
              <option value="variable">فئات متغيرة فقط (تسوق، ترفيه...)</option>
            </select>
          </div>

          {/* الترتيب */}
          <div>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="newest">الأحدث تاريخاً</option>
              <option value="oldest">الأقدم تاريخاً</option>
              <option value="highest">الأعلى مبلغاً</option>
              <option value="lowest">الأقل مبلغاً</option>
            </select>
          </div>
        </div>
      </div>

      {/* قائمة المصاريف */}
      <div className="glass-card">
        {filteredExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>لم يتم العثور على أي مصاريف تطابق الفلاتر.</p>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>جرب تغيير عبارة البحث أو إضافة مصروف جديد.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredExpenses.map((exp) => {
              const cat = catMap[exp.categoryId] || { name: 'أخرى', color: '#64748b', icon: 'HelpCircle', type: 'variable' };
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
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* بيانات المصروف */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: `${cat.color}20`,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <CategoryIcon name={cat.icon} size={20} color={cat.color} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>
                          {cat.name}
                        </span>
                        <span className={`badge ${cat.type === 'fixed' ? 'badge-fixed' : 'badge-variable'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {cat.type === 'fixed' ? 'ثابتة' : 'متغيرة'}
                        </span>
                        {exp.isRecurring && (
                          <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            <RefreshCw size={10} />
                            <span>شهري متكرر</span>
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {exp.note && <span style={{ color: 'var(--text-secondary)' }}>{exp.note} • </span>}
                        <span>{formatArabicDate(exp.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* المبلغ والإجراءات */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        -{formatCurrency(exp.convertedAmount || exp.amount, currencySymbol)}
                      </div>
                      {exp.currency !== settings.baseCurrency && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          ({exp.amount} {exp.currency})
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => onEditExpense(exp)}
                        title="تعديل المصروف"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        title="حذف المصروف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
