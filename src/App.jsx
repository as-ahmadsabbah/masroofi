import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PieChart,
  PiggyBank,
  Calendar,
  Settings as SettingsIcon,
  Plus,
} from 'lucide-react';

import { storageService } from './services/storageService';
import { getFinancialMonthInfo } from './utils/dateUtils';

import Header from './components/Header';
import PinLockScreen from './components/PinLockScreen';
import OnboardingModal from './components/OnboardingModal';
import AddExpenseModal from './components/AddExpenseModal';
import AddIncomeModal from './components/AddIncomeModal';

import DashboardView from './components/views/DashboardView';
import ExpensesView from './components/views/ExpensesView';
import IncomeView from './components/views/IncomeView';
import BudgetSetupView from './components/views/BudgetSetupView';
import SavingsGoalsView from './components/views/SavingsGoalsView';
import HistoryArchiveView from './components/views/HistoryArchiveView';
import SettingsView from './components/views/SettingsView';

export default function App() {
  // الحالة العامة للتطبيق
  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [categories, setCategories] = useState(() => storageService.getCategories());
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | expenses | income | budget | savings | history | settings

  // الشهر المالي النشط
  const [activeMonth, setActiveMonth] = useState(() => {
    const currentSettings = storageService.getSettings();
    return getFinancialMonthInfo(new Date(), currentSettings.financialMonthStartDay).monthKey;
  });

  // قائمة الشهور المسجلة
  const [availableMonths, setAvailableMonths] = useState(() => storageService.getAllRecordedMonths());

  // مصاريف ودخل الشهر النشط
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  // حالات النوافذ المنبثقة
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);

  // شاشة القفل PIN
  const [isLocked, setIsLocked] = useState(() => {
    const currentSettings = storageService.getSettings();
    return !!(currentSettings.pinLockEnabled && currentSettings.pinHash);
  });

  // مزامنة المظهر (Dark / Light)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
  }, [settings.theme]);

  // تحديث بيانات الشهر النشط ومعالجة المصاريف المتكررة
  const loadMonthData = useCallback(() => {
    // معالجة المصاريف المتكررة إذا لم تكن عولجت لهذا الشهر
    storageService.processRecurringForMonth(activeMonth);

    const mExpenses = storageService.getExpenses(activeMonth);
    const mIncomes = storageService.getIncomes(activeMonth);
    setExpenses(mExpenses);
    setIncomes(mIncomes);
    setAvailableMonths(storageService.getAllRecordedMonths());
  }, [activeMonth]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  // معلومات الشهر المالي الحالي
  const monthInfo = getFinancialMonthInfo(new Date(), settings.financialMonthStartDay);

  // تبديل المظهر
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  // إكمال معالج الإعداد الأولي
  const handleCompleteOnboarding = (data) => {
    const updatedSettings = {
      ...settings,
      salary: data.salary,
      baseCurrency: data.baseCurrency,
      financialMonthStartDay: data.financialMonthStartDay,
      isInitialized: true,
    };
    setSettings(updatedSettings);
    storageService.saveSettings(updatedSettings);

    if (data.apply503020) {
      const updatedCats = storageService.getCategories();
      setCategories(updatedCats);
    }

    // إعادة حساب الشهر النشط
    const newMonthKey = getFinancialMonthInfo(new Date(), data.financialMonthStartDay).monthKey;
    setActiveMonth(newMonthKey);
    loadMonthData();
  };

  // حفظ أو تعديل المصروف
  const handleSaveExpense = (expenseData) => {
    if (expenseData.id) {
      storageService.updateExpense(activeMonth, expenseData);
    } else {
      storageService.addExpense(activeMonth, expenseData);
    }
    loadMonthData();
  };

  // حذف مصروف
  const handleDeleteExpense = (expenseId) => {
    storageService.deleteExpense(activeMonth, expenseId);
    loadMonthData();
  };

  // حفظ دخل إضافي
  const handleSaveIncome = (incomeData) => {
    storageService.addIncome(activeMonth, incomeData);
    loadMonthData();
  };

  // حذف دخل إضافي
  const handleDeleteIncome = (incomeId) => {
    storageService.deleteIncome(activeMonth, incomeId);
    loadMonthData();
  };

  // حفظ الفئات
  const handleSaveCategories = (newCategories) => {
    setCategories(newCategories);
    storageService.saveCategories(newCategories);
  };

  // تحديث الإعدادات
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    loadMonthData();
  };

  // إعادة تحميل كل البيانات (بعد استيراد النسخة الاحتياطية أو توليد الديمو)
  const handleFullReload = () => {
    const s = storageService.getSettings();
    const c = storageService.getCategories();
    setSettings(s);
    setCategories(c);
    const m = getFinancialMonthInfo(new Date(), s.financialMonthStartDay).monthKey;
    setActiveMonth(m);
    loadMonthData();
  };

  // شاشة قفل الـ PIN
  if (isLocked) {
    return (
      <PinLockScreen
        correctPin={settings.pinHash}
        onUnlock={() => setIsLocked(false)}
        onResetPin={() => {
          if (window.confirm('هل تريد إلغاء رمز PIN وفتح التطبيق؟')) {
            const updated = { ...settings, pinLockEnabled: false, pinHash: '' };
            setSettings(updated);
            storageService.saveSettings(updated);
            setIsLocked(false);
          }
        }}
      />
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'expenses', label: `المصاريف (${expenses.length})`, icon: Receipt },
    { id: 'income', label: `الدخل الإضافي (${incomes.length})`, icon: Wallet },
    { id: 'budget', label: 'الميزانية والفئات', icon: PieChart },
    { id: 'savings', label: 'المدخرات والأهداف', icon: PiggyBank },
    { id: 'history', label: 'السجل والمقارنة', icon: Calendar },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
  ];

  return (
    <div className="app-layout">
      {/* 1. معالج الإعداد الأولي للترحيب وضبط الراتب */}
      <OnboardingModal
        isOpen={!settings.isInitialized}
        initialSettings={settings}
        onComplete={handleCompleteOnboarding}
      />

      {/* 2. رأس الصفحة الثابت والشعار والتحكم */}
      <Header
        settings={settings}
        activeMonth={activeMonth}
        setActiveMonth={setActiveMonth}
        availableMonths={availableMonths}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddExpenseOpen(true);
        }}
        onOpenAddIncome={() => setIsAddIncomeOpen(true)}
        onToggleTheme={handleToggleTheme}
        onLockApp={() => setIsLocked(true)}
        isPinEnabled={settings.pinLockEnabled && !!settings.pinHash}
      />

      {/* 3. شريط التنقل بين الأقسام */}
      <div className="main-content">
        <nav className="nav-tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 4. الشاشات والأقسام حسب التبويب */}
        {activeTab === 'dashboard' && (
          <DashboardView
            settings={settings}
            monthInfo={monthInfo}
            expenses={expenses}
            incomes={incomes}
            categories={categories}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            onOpenAddIncome={() => setIsAddIncomeOpen(true)}
            onViewExpenses={() => setActiveTab('expenses')}
            onDeleteExpense={handleDeleteExpense}
            isDark={settings.theme === 'dark'}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            monthKey={activeMonth}
            expenses={expenses}
            categories={categories}
            settings={settings}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsAddExpenseOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'income' && (
          <IncomeView
            incomes={incomes}
            settings={settings}
            onOpenAddIncome={() => setIsAddIncomeOpen(true)}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetSetupView
            categories={categories}
            onSaveCategories={handleSaveCategories}
            settings={settings}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsGoalsView
            settings={settings}
            currentExpenses={expenses}
            currentIncomes={incomes}
          />
        )}

        {activeTab === 'history' && (
          <HistoryArchiveView
            settings={settings}
            categories={categories}
            onSelectMonth={(mKey) => {
              setActiveMonth(mKey);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            activeMonth={activeMonth}
            onDataReload={handleFullReload}
          />
        )}
      </div>

      {/* 5. الزر العائم للإضافة السريعة في أي وقت */}
      <button
        className="fab-btn"
        onClick={() => {
          setEditingExpense(null);
          setIsAddExpenseOpen(true);
        }}
        title="إضافة مصروف سريع بنقرة واحدة"
      >
        <Plus size={28} />
      </button>

      {/* 6. نافذة إضافة وتعديل المصروف */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        categories={categories}
        settings={settings}
        currentExpenses={expenses}
        editingExpense={editingExpense}
      />

      {/* 7. نافذة إضافة الدخل الإضافي */}
      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        onSave={handleSaveIncome}
        settings={settings}
      />
    </div>
  );
}
