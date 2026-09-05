import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sun,
  Calendar,
  Tv,
  Tag,
  Settings as SettingsIcon,
  Plus,
  PiggyBank,
  Repeat,
} from 'lucide-react';

import { storageService } from './services/storageService';
import {
  getCurrentMonthKey,
  getTodayIso,
  calculateMonthForecast,
  calculateGoalEvaluation,
} from './utils/dateUtils';

import Header from './components/Header';
import PinLockScreen from './components/PinLockScreen';
import AddExpenseModal from './components/AddExpenseModal';
import SetGoalModal from './components/SetGoalModal';
import SetPriorSpentModal from './components/SetPriorSpentModal';
import DailyRecurringModal from './components/DailyRecurringModal';

import TodayView from './components/views/TodayView';
import DailyHistoryView from './components/views/DailyHistoryView';
import SubscriptionsView from './components/views/SubscriptionsView';
import CategoriesManagerView from './components/views/CategoriesManagerView';
import SettingsView from './components/views/SettingsView';
import SavingsAndGoalsView from './components/views/SavingsAndGoalsView';

export default function App() {
  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [categories, setCategories] = useState(() => storageService.getCategories());
  const [subscriptions, setSubscriptions] = useState(() => storageService.getSubscriptions());
  const [dailyRecurring, setDailyRecurring] = useState(() => storageService.getDailyRecurring());

  const currentMonthKey = getCurrentMonthKey();
  const [currentMonthGoal, setCurrentMonthGoal] = useState(() => storageService.getGoalForMonth(currentMonthKey));
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'savings' | 'subscriptions' | 'history' | 'categories' | 'settings'

  const [monthExpenses, setMonthExpenses] = useState([]);
  const [todayExpenses, setTodayExpenses] = useState([]);

  // حالات النوافذ المنبثقة
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSetGoalOpen, setIsSetGoalOpen] = useState(false);
  const [targetGoalMonthKey, setTargetGoalMonthKey] = useState(currentMonthKey);
  const [isSetPriorSpentOpen, setIsSetPriorSpentOpen] = useState(false);
  const [isAddDailyRecurringOpen, setIsAddDailyRecurringOpen] = useState(false);
  const [editingDailyRecurring, setEditingDailyRecurring] = useState(null);

  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedInitialCategory, setSelectedInitialCategory] = useState(null);

  // شاشة قفل الأمان PIN
  const [isLocked, setIsLocked] = useState(() => {
    const s = storageService.getSettings();
    return !!(s.pinLockEnabled && s.pinHash);
  });

  // مزامنة المظهر (Dark / Light)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
  }, [settings.theme]);

  // تحديث ومعالجة البيانات
  const loadData = useCallback(() => {
    // 1. معالجة الاشتراكات التلقائية للشهر الحالي
    storageService.processSubscriptionsForMonth(currentMonthKey);

    // 2. معالجة المصاريف اليومية المتكررة التلقائية (دخان، قهوة...)
    storageService.processDailyRecurringExpenses(currentMonthKey);

    // 3. جلب مصاريف الشهر واليوم
    const mExpenses = storageService.getExpenses(currentMonthKey);
    setMonthExpenses(mExpenses);

    const tExpenses = storageService.getTodayExpenses(getTodayIso());
    setTodayExpenses(tExpenses);

    setDailyRecurring(storageService.getDailyRecurring());
    setCurrentMonthGoal(storageService.getGoalForMonth(currentMonthKey));
  }, [currentMonthKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // تبديل المظهر
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  // حفظ أو تعديل مصروف يدوي
  const handleSaveExpense = (expenseData) => {
    if (expenseData.id) {
      storageService.updateExpense(expenseData);
    } else {
      storageService.addExpense(expenseData);
    }
    loadData();
  };

  // إضافة سريعة بنقرة واحدة للفئات ذات المبلغ الافتراضي
  const handleQuickAdd = (cat) => {
    if (!cat.defaultAmount) return;

    storageService.addExpense({
      amount: Number(cat.defaultAmount),
      currency: 'ILS',
      convertedAmount: Number(cat.defaultAmount),
      categoryId: cat.id,
      categoryName: cat.name,
      date: getTodayIso(),
      note: '',
    });

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.7 },
    });

    loadData();
  };

  // حذف مصروف
  const handleDeleteExpense = (expenseId) => {
    storageService.deleteExpense(currentMonthKey, expenseId);
    loadData();
  };

  // إضافة اشتراك شهري
  const handleAddSubscription = (subData) => {
    storageService.addSubscription(subData);
    setSubscriptions(storageService.getSubscriptions());
    loadData();
  };

  // حذف اشتراك شهري
  const handleDeleteSubscription = (id) => {
    const updated = storageService.deleteSubscription(id);
    setSubscriptions(updated);
  };

  // حفظ أو تعديل مصروف متكرر يومي
  const handleSaveDailyRecurring = (itemData) => {
    if (itemData.id) {
      storageService.updateDailyRecurring(itemData);
    } else {
      storageService.addDailyRecurring(itemData);
    }
    confetti({ particleCount: 35, spread: 50 });
    loadData();
  };

  // حذف مصروف متكرر يومي
  const handleDeleteDailyRecurring = (id) => {
    storageService.deleteDailyRecurring(id);
    loadData();
  };

  // تشغيل / إيقاف مصروف متكرر يومي
  const handleToggleDailyRecurring = (id) => {
    storageService.toggleDailyRecurring(id);
    loadData();
  };

  // إضافة فئة جديدة
  const handleAddCategory = (catData) => {
    const newCat = storageService.addCategory(catData);
    setCategories(storageService.getCategories());
    return newCat;
  };

  // حذف فئة
  const handleDeleteCategory = (catId) => {
    const updated = storageService.deleteCategory(catId);
    setCategories(updated);
  };

  // حفظ الهدف المالي لشهر محدد
  const handleSaveGoal = ({ goalType, goalTargetAmount, monthKey = currentMonthKey }) => {
    const safeKey = (typeof monthKey === 'string' && monthKey.includes('-')) ? monthKey : currentMonthKey;
    storageService.saveGoalForMonth(safeKey, { goalType, goalTargetAmount });
    if (safeKey === currentMonthKey) {
      setSettings(prev => ({ ...prev, goalType, goalTargetAmount }));
      setCurrentMonthGoal(storageService.getGoalForMonth(currentMonthKey));
    }
    confetti({ particleCount: 45, spread: 60 });
    loadData();
  };

  // فتح نافذة تحديد الهدف المالي بشكل آمن
  const handleOpenSetGoal = (mKey) => {
    const safeKey = (typeof mKey === 'string' && mKey.includes('-')) ? mKey : currentMonthKey;
    setTargetGoalMonthKey(safeKey);
    setIsSetGoalOpen(true);
  };

  // حفظ المصاريف السابقة قبل استخدام التطبيق
  const handleSavePriorSpent = (amount) => {
    const updated = {
      ...settings,
      priorSpentAmount: Number(amount) || 0,
    };
    setSettings(updated);
    storageService.saveSettings(updated);
    loadData();
  };

  // تحديث الإعدادات العامة
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    loadData();
  };

  // إعادة تحميل كامل للبيانات بعد الاستيراد أو الديمو
  const handleFullReload = () => {
    setSettings(storageService.getSettings());
    setCategories(storageService.getCategories());
    setSubscriptions(storageService.getSubscriptions());
    setDailyRecurring(storageService.getDailyRecurring());
    setCurrentMonthGoal(storageService.getGoalForMonth(currentMonthKey));
    loadData();
  };

  // الحسابات المالية الإجمالية
  const currencySymbol = settings.baseCurrency === 'USD' ? '$' : '₪';
  const salary = Number(settings?.salary || 4000);
  const priorSpentAmount = Number(settings?.priorSpentAmount || 0);

  const regularMonthTotal = monthExpenses.reduce(
    (sum, e) => sum + Number(e.convertedAmount || e.amount || 0),
    0
  );
  const forecast = calculateMonthForecast({
    totalSpentSoFar: totalMonthSpent,
    salary,
    priorSpentAmount,
    monthExpenses,
    dailyRecurring,
    subscriptions,
    monthKey: currentMonthKey,
  });
  const currentGoalEval = calculateGoalEvaluation(settings, totalMonthSpent, forecast, currentMonthGoal);
  const savingsSummary = storageService.getAllTimeSavingsSummary(settings);

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

  const navTabs = [
    { id: 'today', label: 'اليوم', icon: Sun },
    { id: 'savings', label: 'المدخرات والأهداف', icon: PiggyBank },
    { id: 'subscriptions', label: `المتكررة (${dailyRecurring.length + subscriptions.length})`, icon: Repeat },
    { id: 'history', label: `السجل (${monthExpenses.length})`, icon: Calendar },
    { id: 'categories', label: 'الفئات', icon: Tag },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
  ];

  return (
    <div className="app-layout">
      {/* 1. ترويسة التطبيق والشعار والوضع الداكن */}
      <Header
        settings={settings}
        onToggleTheme={handleToggleTheme}
        onLockApp={() => setIsLocked(true)}
        isPinEnabled={settings.pinLockEnabled && !!settings.pinHash}
      />

      <div className="main-content">
        {/* 2. شريط التبويبات المطور */}
        <nav className="nav-tabs">
          {navTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 3. الشاشة الرئيسية: اليوم (Today) */}
        {activeTab === 'today' && (
          <TodayView
            settings={settings}
            todayExpenses={todayExpenses}
            monthExpenses={monthExpenses}
            categories={categories}
            dailyRecurring={dailyRecurring}
            currentMonthGoal={currentMonthGoal}
            onOpenAddExpense={(cat = null) => {
              setEditingExpense(null);
              setSelectedInitialCategory(cat);
              setIsAddExpenseOpen(true);
            }}
            onQuickAdd={handleQuickAdd}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsAddExpenseOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onOpenSetGoal={handleOpenSetGoal}
            onOpenSetPriorSpent={() => setIsSetPriorSpentOpen(true)}
            onOpenAddDailyRecurring={() => {
              setEditingDailyRecurring(null);
              setIsAddDailyRecurringOpen(true);
            }}
            isDark={settings.theme === 'dark'}
          />
        )}

        {/* 4. شاشة المدخرات التراكمية والأهداف الشهرية */}
        {activeTab === 'savings' && (
          <SavingsAndGoalsView
            settings={settings}
            savingsSummary={savingsSummary}
            currentGoalEval={currentGoalEval}
            forecast={forecast}
            onOpenSetGoal={handleOpenSetGoal}
            currencySymbol={currencySymbol}
          />
        )}

        {/* 5. شاشة المصاريف المتكررة والاشتراكات */}
        {activeTab === 'subscriptions' && (
          <SubscriptionsView
            subscriptions={subscriptions}
            dailyRecurring={dailyRecurring}
            onAddSubscription={handleAddSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            onOpenAddDailyRecurring={() => {
              setEditingDailyRecurring(null);
              setIsAddDailyRecurringOpen(true);
            }}
            onEditDailyRecurring={(item) => {
              setEditingDailyRecurring(item);
              setIsAddDailyRecurringOpen(true);
            }}
            onDeleteDailyRecurring={handleDeleteDailyRecurring}
            onToggleDailyRecurring={handleToggleDailyRecurring}
            currencySymbol={currencySymbol}
          />
        )}

        {/* 6. شاشة السجل والحركات */}
        {activeTab === 'history' && (
          <DailyHistoryView
            monthExpenses={monthExpenses}
            categories={categories}
            currencySymbol={currencySymbol}
            onEditExpense={(exp) => {
              setEditingExpense(exp);
              setIsAddExpenseOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {/* 7. شاشة إدارة الفئات */}
        {activeTab === 'categories' && (
          <CategoriesManagerView
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onSaveCategories={(updated) => {
              setCategories(updated);
              storageService.saveCategories(updated);
            }}
            currencySymbol={currencySymbol}
          />
        )}

        {/* 8. شاشة الإعدادات */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onDataReload={handleFullReload}
          />
        )}
      </div>

      {/* 9. الزر العائم للإضافة السريعة لمصروف اليوم */}
      <button
        className="fab-btn"
        onClick={() => {
          setEditingExpense(null);
          setSelectedInitialCategory(null);
          setIsAddExpenseOpen(true);
        }}
        title="إضافة مصروف اليوم"
      >
        <Plus size={28} />
      </button>

      {/* 10. نافذة تسجيل المصروف السريعة */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
          setSelectedInitialCategory(null);
        }}
        onSave={handleSaveExpense}
        categories={categories}
        settings={settings}
        editingExpense={editingExpense}
        initialCategory={selectedInitialCategory}
        onAddNewCategory={handleAddCategory}
      />

      {/* 11. نافذة تحديد الهدف المالي لشهر محدد */}
      <SetGoalModal
        isOpen={isSetGoalOpen}
        onClose={() => setIsSetGoalOpen(false)}
        onSave={handleSaveGoal}
        settings={settings}
        targetMonthKey={targetGoalMonthKey}
        currentGoal={storageService.getGoalForMonth(targetGoalMonthKey)}
      />

      {/* 12. نافذة تسجيل الرصيد والمصروف السابق */}
      <SetPriorSpentModal
        isOpen={isSetPriorSpentOpen}
        onClose={() => setIsSetPriorSpentOpen(false)}
        onSave={handleSavePriorSpent}
        salary={salary}
        currentPriorSpent={priorSpentAmount}
        currencySymbol={currencySymbol}
      />

      {/* 13. نافذة إضافة أو تعديل المصروف المتكرر يومياً */}
      <DailyRecurringModal
        isOpen={isAddDailyRecurringOpen}
        onClose={() => {
          setIsAddDailyRecurringOpen(false);
          setEditingDailyRecurring(null);
        }}
        onSave={handleSaveDailyRecurring}
        categories={categories}
        editingItem={editingDailyRecurring}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
