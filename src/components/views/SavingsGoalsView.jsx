import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  PiggyBank,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Target,
  ShieldCheck,
  CheckCircle2,
  X,
  Check,
  PlusCircle,
  Calendar,
} from 'lucide-react';
import CategoryIcon from '../CategoryIcon';
import { formatCurrency, formatArabicDate } from '../../utils/dateUtils';
import { storageService } from '../../services/storageService';

export default function SavingsGoalsView({
  settings,
  currentExpenses = [],
  currentIncomes = [],
}) {
  const [goals, setGoals] = useState(() => storageService.getSavingsGoals());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // حالة نموذج الهدف
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [goalType, setGoalType] = useState('custom'); // monthly | annual | custom
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('PiggyBank');

  const salary = Number(settings?.salary || 0);
  const currencyObj = settings?.currencies?.find(c => c.code === settings?.baseCurrency);
  const currencySymbol = currencyObj?.symbol || 'ر.س';

  // حساب الفائض القابل للادخار لهذا الشهر
  const totalSpent = currentExpenses.reduce((s, e) => s + Number(e.convertedAmount || e.amount || 0), 0);
  const budgetIncomes = currentIncomes
    .filter(i => i.destination === 'budget')
    .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);
  const directSavingsIncomes = currentIncomes
    .filter(i => i.destination === 'savings')
    .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);

  const totalEffectiveIncome = salary + budgetIncomes;
  const monthlySurplus = Math.max(0, totalEffectiveIncome - totalSpent);
  const totalSavableThisMonth = monthlySurplus + directSavingsIncomes;

  const savingsRate = totalEffectiveIncome > 0 ? (totalSavableThisMonth / totalEffectiveIncome) * 100 : 0;

  // إجمالي رصيد المدخرات التراكمي لجميع الأشهر
  const cumulativeSavings = storageService.getCumulativeSavings(settings);

  const handleOpenAddGoal = () => {
    setSelectedGoal(null);
    setGoalName('');
    setTargetAmount('');
    setInitialAmount('');
    setGoalType('custom');
    setDeadline('');
    setColor('#10B981');
    setIcon('PiggyBank');
    setIsModalOpen(true);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!goalName.trim() || !targetAmount) return;

    if (selectedGoal) {
      const updated = goals.map(g =>
        g.id === selectedGoal.id
          ? {
              ...g,
              name: goalName,
              targetAmount: Number(targetAmount),
              currentAmount: Number(initialAmount || g.currentAmount),
              type: goalType,
              deadline,
              color,
              icon,
            }
          : g
      );
      setGoals(updated);
      storageService.saveSavingsGoals(updated);
    } else {
      const newG = storageService.addSavingsGoal({
        name: goalName,
        targetAmount: Number(targetAmount),
        currentAmount: Number(initialAmount || 0),
        type: goalType,
        deadline,
        color,
        icon,
      });
      setGoals([...goals, newG]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الهدف؟')) {
      const filtered = storageService.deleteSavingsGoal(id);
      setGoals(filtered);
    }
  };

  const handleOpenDeposit = (goal) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0 || !selectedGoal) return;

    const amt = Number(depositAmount);
    const updated = goals.map(g => {
      if (g.id === selectedGoal.id) {
        const newTotal = (Number(g.currentAmount) || 0) + amt;
        if (newTotal >= g.targetAmount && (Number(g.currentAmount) || 0) < g.targetAmount) {
          confetti({ particleCount: 100, spread: 80 });
        }
        return { ...g, currentAmount: newTotal };
      }
      return g;
    });

    setGoals(updated);
    storageService.saveSavingsGoals(updated);
    setIsDepositModalOpen(false);
  };

  const availableIcons = ['PiggyBank', 'ShieldCheck', 'Car', 'Home', 'Plane', 'GraduationCap', 'Gift', 'Wallet'];
  const availableColors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <div>
      {/* بطاقات المؤشرات العلوية للمدخرات */}
      <div className="grid-stats">
        {/* رصيد المدخرات التراكمي */}
        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-title">رصيد المدخرات التراكمي الشامل</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {formatCurrency(cumulativeSavings, currencySymbol)}
          </div>
          <div className="stat-footer">
            <span>مجموع الفوائض والمدخرات عبر كافة الأشهر المسجلة</span>
          </div>
        </div>

        {/* فائض هذا الشهر القابل للادخار */}
        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-title">فائض الشهر الحالي للادخار</span>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value">
            {formatCurrency(totalSavableThisMonth, currencySymbol)}
          </div>
          <div className="stat-footer">
            <span>
              (الراتب والدخل المتاح) - المصاريف + دخل المدخرات
            </span>
          </div>
        </div>

        {/* معدل الادخار لهذا الشهر */}
        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-title">معدل الادخار لهذا الشهر</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Target size={20} />
            </div>
          </div>
          <div className="stat-value">
            {Math.round(savingsRate)}%
          </div>
          <div className="stat-footer">
            <span>الهدف المثالي وفق قاعدة 50/30/20 هو 20% فأكثر</span>
          </div>
        </div>
      </div>

      {/* قسم أهداف الادخار */}
      <div className="glass-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>أهداف الادخار والمستقبل</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              حدد أهدافك المالية (صندوق طوارئ، سيارة، سفر، استثمار) وتابع تقدمك
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAddGoal}>
            <Plus size={16} />
            <span>إضافة هدف ادخار جديد</span>
          </button>
        </div>
      </div>

      {/* قائمة أهداف الادخار */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {goals.map((g) => {
          const current = Number(g.currentAmount || 0);
          const target = Number(g.targetAmount || 1);
          const pct = Math.min(100, Math.round((current / target) * 100));
          const isCompleted = current >= target;

          return (
            <div
              key={g.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '22px',
                border: isCompleted ? '2px solid #10b981' : undefined,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      background: `${g.color}20`,
                      color: g.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CategoryIcon name={g.icon || 'PiggyBank'} size={22} color={g.color} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{g.name}</h4>
                        {isCompleted && (
                          <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                            <CheckCircle2 size={12} />
                            <span>مكتمل!</span>
                          </span>
                        )}
                      </div>
                      {g.deadline && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Calendar size={12} />
                          <span>الهدف حتى: {formatArabicDate(g.deadline)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => {
                        setSelectedGoal(g);
                        setGoalName(g.name);
                        setTargetAmount(g.targetAmount);
                        setInitialAmount(g.currentAmount);
                        setGoalType(g.type || 'custom');
                        setDeadline(g.deadline || '');
                        setColor(g.color || '#10B981');
                        setIcon(g.icon || 'PiggyBank');
                        setIsModalOpen(true);
                      }}
                      title="تعديل الهدف"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      onClick={() => handleDeleteGoal(g.id)}
                      title="حذف الهدف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* المبالغ وشريط التقدم */}
                <div style={{
                  background: 'var(--bg-app)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>تم تجميعه:</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {formatCurrency(current, currencySymbol)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>المبلغ المستهدف:</span>
                    <span>{formatCurrency(target, currencySymbol)}</span>
                  </div>

                  <div className="progress-bar-container" style={{ height: '8px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: isCompleted ? '#10B981' : g.color,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '6px' }}>
                    <span style={{ color: 'var(--brand-500)', fontWeight: 700 }}>{pct}% من الهدف</span>
                    <span>
                      {isCompleted
                        ? 'تهانينا! حققت الهدف بالكامل'
                        : `متبقٍ: ${formatCurrency(target - current, currencySymbol)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* زر إضافة مبالغ للهدف */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleOpenDeposit(g)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <PlusCircle size={15} color="var(--brand-500)" />
                <span>إيداع مبلغ في هذا الهدف</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* نافذة إضافة / تعديل هدف */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {selectedGoal ? 'تعديل هدف الادخار' : 'إضافة هدف ادخار جديد'}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGoal}>
              <div className="form-group">
                <label className="form-label">اسم الهدف *</label>
                <input
                  type="text"
                  className="form-input"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="مثال: صندوق الطوارئ (6 شهور)، شراء سيارة..."
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">المبلغ المستهدف *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="مثال: 30000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">الرصيد المحفوظ حالياً</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    placeholder="مثال: 5000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">تاريخ مستهدف للتحقيق (اختياري)</label>
                <input
                  type="date"
                  className="form-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">اللون المميّز</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {availableColors.map((c) => (
                    <div
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        border: color === c ? '3px solid #ffffff' : 'none',
                        boxShadow: color === c ? '0 0 8px rgba(0,0,0,0.5)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">الأيقونة</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: icon === ic ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                        background: icon === ic ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-app)',
                        color: icon === ic ? 'var(--brand-500)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <CategoryIcon name={ic} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>حفظ الهدف</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إيداع مبلغ في هدف */}
      {isDepositModalOpen && selectedGoal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsDepositModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PiggyBank size={22} color="var(--brand-500)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>إيداع في {selectedGoal.name}</h3>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsDepositModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit}>
              <div className="form-group">
                <label className="form-label">المبلغ المراد إيداعه ({currencySymbol}) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="مثال: 1000"
                  required
                  autoFocus
                  style={{ fontSize: '1.2rem', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsDepositModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>تأكيد الإيداع</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
