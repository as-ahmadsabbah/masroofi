import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sun,
  Calendar,
  Tv,
  Tag,
  Settings as SettingsIcon,
  Plus,
} from 'lucide-react';

import { storageService } from './services/storageService';
import { getCurrentMonthKey, getTodayIso } from './utils/dateUtils';

import Header from './components/Header';
import PinLockScreen from './components/PinLockScreen';
import AddExpenseModal from './components/AddExpenseModal';

import TodayView from './components/views/TodayView';
import DailyHistoryView from './components/views/DailyHistoryView';
import SubscriptionsView from './components/views/SubscriptionsView';
import CategoriesManagerView from './components/views/CategoriesManagerView';
import SettingsView from './components/views/SettingsView';

export default function App() {
  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [categories, setCategories] = useState(() => storageService.getCategories());
  const [subscriptions, setSubscriptions] = useState(() => storageService.getSubscriptions());
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history' | 'subscriptions' | 'categories' | 'settings'

  const currentMonthKey = getCurrentMonthKey();
  const [monthExpenses, setMonthExpenses] = useState([]);
  const [todayExpenses, setTodayExpenses] = useState([]);

  // حالات النوافذ المنبثقة
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
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

  // تحديث بيانات المصاريف للشهر واليوم ومعالجة الاشتراكات
  const loadData = useCallback(() => {
    // معالجة الاشتراكات التلقائية إذا حان موعدها
    storageService.processSubscriptionsForMonth(currentMonthKey);

    const mExpenses = storageService.getExpenses(currentMonthKey);
    setMonthExpenses(mExpenses);

    const tExpenses = storageService.getTodayExpenses(getTodayIso());
    setTodayExpenses(tExpenses);
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

  // حفظ أو تعديل مصروف
  const handleSaveExpense = (expenseData) => {
    if (expenseData.id) {
      storageService.updateExpense(expenseData);
    } else {
      storageService.addExpense(expenseData);
    }
    loadData();
  };

  // إضافة سريعة بنقرة واحدة للفئات ذات المبلغ الافتراضي (مثال: دخان 5 ₪)
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

  // إضافة اشتراك شهري جديد
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

  // إضافة فئة جديدة
  const handleAddCategory = (catData) => {
    storageService.addCategory(catData);
    setCategories(storageService.getCategories());
  };

  // حذف فئة
  const handleDeleteCategory = (catId) => {
    const updated = storageService.deleteCategory(catId);
    setCategories(updated);
  };

  // تحديث الإعدادات
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
    loadData();
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

  const navTabs = [
    { id: 'today', label: 'اليوم', icon: Sun },
    { id: 'history', label: `السجل (${monthExpenses.length})`, icon: Calendar },
    { id: 'subscriptions', label: `الاشتراكات (${subscriptions.length})`, icon: Tv },
    { id: 'categories', label: 'الفئات', icon: Tag },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
  ];

  const currencySymbol = settings.baseCurrency === 'USD' ? '$' : '₪';

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
        {/* 2. شريط التبويبات المبسط */}
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
            isDark={settings.theme === 'dark'}
          />
        )}

        {/* 4. شاشة السجل والحركات */}
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

        {/* 5. شاشة الاشتراكات الشهرية الثابتة */}
        {activeTab === 'subscriptions' && (
          <SubscriptionsView
            subscriptions={subscriptions}
            onAddSubscription={handleAddSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            currencySymbol={currencySymbol}
          />
        )}

        {/* 6. شاشة إدارة الفئات */}
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

        {/* 7. شاشة الإعدادات */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onDataReload={handleFullReload}
          />
        )}
      </div>

      {/* 8. الزر العائم للإضافة السريعة */}
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

      {/* 9. نافذة تسجيل المصروف السريعة */}
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
      />
    </div>
  );
}
