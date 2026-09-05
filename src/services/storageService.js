import { DEFAULT_SETTINGS } from '../constants/currencies';
import { DEFAULT_CATEGORIES, DEFAULT_SUBSCRIPTIONS } from '../constants/categories';
import { getTodayIso, getCurrentMonthKey, formatDateIso } from '../utils/dateUtils';

const STORAGE_KEYS = {
  SETTINGS: 'masroofi_settings',
  CATEGORIES: 'masroofi_categories',
  SUBSCRIPTIONS: 'masroofi_subscriptions',
  DAILY_RECURRING: 'masroofi_daily_recurring',
  MONTHLY_GOALS: 'masroofi_monthly_goals',
  EXPENSES_PREFIX: 'masroofi_expenses_',
  APPLIED_SUBS_PREFIX: 'masroofi_applied_subs_',
};

export const storageService = {
  // --- الإعدادات (Settings) ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') {
        return DEFAULT_SETTINGS;
      }
      if (!parsed.baseCurrency || parsed.baseCurrency === 'SAR') {
        parsed.baseCurrency = 'ILS';
        parsed.currencies = DEFAULT_SETTINGS.currencies;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  },

  // --- الفئات (Categories) ---
  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      // التأكد من وجود فئات التبسيط الجديدة
      const hasSmokeOrCoffee = parsed.some(c => c && (c.id === 'smoke' || c.id === 'coffee' || c.name === 'دخان' || c.name === 'قهوة'));
      if (!hasSmokeOrCoffee) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return parsed;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  },

  addCategory(category) {
    const cats = this.getCategories();
    const newCat = {
      id: 'cat_' + Date.now(),
      name: category.name,
      type: category.type || 'daily',
      defaultAmount: category.defaultAmount ? Number(category.defaultAmount) : '',
      color: category.color || '#10b981',
      icon: category.icon || 'ShoppingBag',
    };
    cats.push(newCat);
    this.saveCategories(cats);
    return newCat;
  },

  deleteCategory(catId) {
    const cats = this.getCategories();
    const filtered = cats.filter(c => c.id !== catId);
    this.saveCategories(filtered);
    return filtered;
  },

  // --- الاشتراكات الشهرية التلقائية (Subscriptions) ---
  getSubscriptions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      if (!data) {
        this.saveSubscriptions(DEFAULT_SUBSCRIPTIONS);
        return DEFAULT_SUBSCRIPTIONS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        this.saveSubscriptions(DEFAULT_SUBSCRIPTIONS);
        return DEFAULT_SUBSCRIPTIONS;
      }
      return parsed;
    } catch (e) {
      return DEFAULT_SUBSCRIPTIONS;
    }
  },

  saveSubscriptions(subs) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
  },

  addSubscription(sub) {
    const subs = this.getSubscriptions();
    const newSub = {
      id: 'sub_' + Date.now(),
      name: sub.name,
      amount: Number(sub.amount),
      billingDay: Number(sub.billingDay || 1),
      icon: sub.icon || 'Tv',
      color: sub.color || '#3b82f6',
    };
    subs.push(newSub);
    this.saveSubscriptions(subs);
    return newSub;
  },

  deleteSubscription(id) {
    const subs = this.getSubscriptions();
    const filtered = subs.filter(s => s.id !== id);
    this.saveSubscriptions(filtered);
    return filtered;
  },

  processSubscriptionsForMonth(monthKey = getCurrentMonthKey()) {
    try {
      const subs = this.getSubscriptions();
      if (!Array.isArray(subs) || subs.length === 0) return;

      const appliedKey = `${STORAGE_KEYS.APPLIED_SUBS_PREFIX}${monthKey}`;
      let appliedSubIds = [];
      try {
        const existing = localStorage.getItem(appliedKey);
        if (existing) appliedSubIds = JSON.parse(existing);
      } catch (e) {}

      const today = new Date();
      const currentDay = today.getDate();
      const [year, month] = monthKey.split('-').map(Number);
      const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;

      const expenses = this.getExpenses(monthKey);
      let changed = false;

      subs.forEach(sub => {
        if (!appliedSubIds.includes(sub.id)) {
          if (!isCurrentMonth || currentDay >= sub.billingDay) {
            const billingDate = `${monthKey}-${String(sub.billingDay).padStart(2, '0')}`;
            
            expenses.unshift({
              id: 'exp_sub_' + sub.id + '_' + monthKey,
              amount: Number(sub.amount),
              currency: 'ILS',
              convertedAmount: Number(sub.amount),
              categoryId: 'subscription',
              categoryName: sub.name,
              date: billingDate,
              note: 'اشتراك شهري ثابت (تلقائي)',
              isSubscription: true,
              createdAt: new Date().toISOString(),
            });

            appliedSubIds.push(sub.id);
            changed = true;
          }
        }
      });

      if (changed) {
        this.saveExpenses(monthKey, expenses);
        localStorage.setItem(appliedKey, JSON.stringify(appliedSubIds));
      }
    } catch (e) {
      console.error('Error processing subscriptions:', e);
    }
  },

  // --- المصاريف اليومية المتكررة تلقائياً (Daily Recurring Expenses) ---
  getDailyRecurring() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_RECURRING);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  saveDailyRecurring(items) {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_RECURRING, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving daily recurring:', e);
    }
  },

  addDailyRecurring(item) {
    const items = this.getDailyRecurring();
    const newItem = {
      id: 'rec_' + Date.now(),
      name: item.name.trim(),
      amountPerDay: Number(item.amountPerDay) || 0,
      categoryId: item.categoryId || 'smoke',
      categoryName: item.categoryName || item.name.trim(),
      icon: item.icon || 'Flame',
      color: item.color || '#ef4444',
      repeatTillEndOfMonth: item.repeatTillEndOfMonth !== false,
      startDate: item.startDate || getTodayIso(),
      endDate: item.endDate || null,
      active: true,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    this.saveDailyRecurring(items);
    return newItem;
  },

  updateDailyRecurring(updated) {
    const items = this.getDailyRecurring();
    const idx = items.findIndex(i => i.id === updated.id);
    if (idx !== -1) {
      items[idx] = {
        ...items[idx],
        ...updated,
        amountPerDay: Number(updated.amountPerDay) || items[idx].amountPerDay,
      };
      this.saveDailyRecurring(items);
    }
    return items;
  },

  deleteDailyRecurring(id) {
    const items = this.getDailyRecurring();
    const filtered = items.filter(i => i.id !== id);
    this.saveDailyRecurring(filtered);
    return filtered;
  },

  toggleDailyRecurring(id) {
    const items = this.getDailyRecurring();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx].active = !items[idx].active;
      this.saveDailyRecurring(items);
    }
    return items;
  },

  processDailyRecurringExpenses(monthKey = getCurrentMonthKey()) {
    try {
      const items = this.getDailyRecurring();
      if (!Array.isArray(items) || items.length === 0) return;

      const [year, month] = monthKey.split('-').map(Number);
      const totalDaysInMonth = new Date(year, month, 0).getDate();
      const today = new Date();
      const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
      const currentDay = today.getDate();

      const lastDayToProcess = isCurrentMonth ? currentDay : totalDaysInMonth;
      const expenses = this.getExpenses(monthKey);
      let changed = false;

      items.forEach(item => {
        if (!item.active) return;

        const startDay = item.startDate ? Number(item.startDate.split('-')[2]) : 1;
        const startMonthKey = item.startDate ? item.startDate.substring(0, 7) : monthKey;

        // إذا كان تاريخ البدء بعد هذا الشهر نتجاهله
        if (startMonthKey > monthKey) return;

        const effectiveStartDay = startMonthKey === monthKey ? Math.max(1, startDay) : 1;

        for (let d = effectiveStartDay; d <= lastDayToProcess; d++) {
          const dateStr = `${monthKey}-${String(d).padStart(2, '0')}`;
          
          if (item.endDate && dateStr > item.endDate) continue;

          const expId = `exp_rec_${item.id}_${dateStr}`;
          const alreadyExists = expenses.some(e => e.id === expId || (e.recurringId === item.id && e.date === dateStr));

          if (!alreadyExists) {
            expenses.unshift({
              id: expId,
              amount: Number(item.amountPerDay),
              currency: 'ILS',
              convertedAmount: Number(item.amountPerDay),
              categoryId: item.categoryId,
              categoryName: item.name,
              date: dateStr,
              note: 'مصروف متكرر يومياً (تلقائي)',
              isRecurring: true,
              recurringId: item.id,
              createdAt: new Date().toISOString(),
            });
            changed = true;
          }
        }
      });

      if (changed) {
        this.saveExpenses(monthKey, expenses);
      }
    } catch (e) {
      console.error('Error processing daily recurring expenses:', e);
    }
  },

  // --- الأهداف الشهرية المستقلة (Monthly Goals) ---
  getMonthlyGoals() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MONTHLY_GOALS);
      if (!data) return {};
      const parsed = JSON.parse(data);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  },

  saveMonthlyGoals(goals) {
    try {
      localStorage.setItem(STORAGE_KEYS.MONTHLY_GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Error saving monthly goals:', e);
    }
  },

  getGoalForMonth(monthKey = getCurrentMonthKey()) {
    const safeMonthKey = (typeof monthKey === 'string' && monthKey.includes('-')) ? monthKey : getCurrentMonthKey();
    const goals = this.getMonthlyGoals();
    if (goals && goals[safeMonthKey]) {
      return goals[safeMonthKey];
    }
    const settings = this.getSettings();
    if (settings.goalType && settings.goalType !== 'none' && Number(settings.goalTargetAmount) > 0) {
      return {
        goalType: settings.goalType,
        goalTargetAmount: Number(settings.goalTargetAmount),
        isInherited: true,
      };
    }
    return {
      goalType: 'none',
      goalTargetAmount: 0,
      isInherited: true,
    };
  },

  saveGoalForMonth(monthKey, goalData) {
    const safeMonthKey = (typeof monthKey === 'string' && monthKey.includes('-')) ? monthKey : getCurrentMonthKey();
    const goals = this.getMonthlyGoals();
    const cleanGoalType = goalData.goalType === 'spend_limit' ? 'spend_limit' : (goalData.goalType === 'savings' ? 'savings' : 'none');
    const cleanAmount = cleanGoalType === 'none' ? 0 : (Number(goalData.goalTargetAmount) || 0);

    goals[safeMonthKey] = {
      goalType: cleanGoalType,
      goalTargetAmount: cleanAmount,
      updatedAt: new Date().toISOString(),
    };
    this.saveMonthlyGoals(goals);

    // تحديث الإعدادات العامة لتبقى متوافقة
    if (safeMonthKey === getCurrentMonthKey()) {
      const s = this.getSettings();
      this.saveSettings({
        ...s,
        goalType: cleanGoalType,
        goalTargetAmount: cleanAmount,
      });
    }

    return goals[safeMonthKey];
  },

  // --- تقرير المدخرات التراكمية عبر كافة الأشهر (All-Time Savings Summary) ---
  getAllTimeSavingsSummary(settings) {
    const months = this.getAllRecordedMonths();
    const currentMonthKey = getCurrentMonthKey();
    const salary = Number(settings?.salary || 4000);
    const currencySymbol = settings?.baseCurrency === 'USD' ? '$' : '₪';

    let totalCumulativeSavings = 0;
    const monthlyBreakdown = [];

    months.forEach((mKey) => {
      const expenses = this.getExpenses(mKey);
      const isCurrentMonth = mKey === currentMonthKey;
      const isFutureMonth = mKey > currentMonthKey;
      const priorSpent = isCurrentMonth ? Number(settings?.priorSpentAmount || 0) : 0;
      
      const regularSpent = expenses.reduce(
        (sum, e) => sum + Number(e.convertedAmount || e.amount || 0),
        0
      );
      const totalSpent = isFutureMonth ? 0 : (regularSpent + priorSpent);
      const savings = isFutureMonth ? 0 : Math.max(0, salary - totalSpent);
      const goal = this.getGoalForMonth(mKey);

      let goalAchieved = false;
      const hasGoal = goal && goal.goalType !== 'none' && Number(goal.goalTargetAmount) > 0;
      if (hasGoal) {
        if (isFutureMonth) {
          goalAchieved = false;
        } else if (goal.goalType === 'savings') {
          goalAchieved = savings >= goal.goalTargetAmount;
        } else if (goal.goalType === 'spend_limit') {
          goalAchieved = totalSpent <= goal.goalTargetAmount;
        }
      }

      if (!isFutureMonth) {
        totalCumulativeSavings += savings;
      }

      monthlyBreakdown.push({
        monthKey: mKey,
        salary,
        totalSpent,
        savings,
        isCurrentMonth,
        isFutureMonth,
        goal,
        hasGoal,
        goalAchieved,
      });
    });

    return {
      totalCumulativeSavings,
      monthlyBreakdown,
      currencySymbol,
    };
  },

  // --- المصاريف (Expenses) ---
  getExpenses(monthKey = getCurrentMonthKey()) {
    try {
      const key = `${STORAGE_KEYS.EXPENSES_PREFIX}${monthKey}`;
      const data = localStorage.getItem(key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  saveExpenses(monthKey, expenses) {
    try {
      const key = `${STORAGE_KEYS.EXPENSES_PREFIX}${monthKey}`;
      localStorage.setItem(key, JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  },

  addExpense(expense) {
    const date = expense.date || getTodayIso();
    const monthKey = date.substring(0, 7);
    const expenses = this.getExpenses(monthKey);

    const newExpense = {
      id: expense.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      amount: Number(expense.amount),
      currency: expense.currency || 'ILS',
      convertedAmount: Number(expense.convertedAmount || expense.amount),
      categoryId: expense.categoryId,
      categoryName: expense.categoryName || '',
      date,
      note: expense.note || '',
      createdAt: new Date().toISOString(),
    };

    expenses.unshift(newExpense);
    this.saveExpenses(monthKey, expenses);
    return newExpense;
  },

  updateExpense(updated) {
    const date = updated.date || getTodayIso();
    const monthKey = date.substring(0, 7);
    const expenses = this.getExpenses(monthKey);
    const idx = expenses.findIndex(e => e.id === updated.id);
    if (idx !== -1) {
      expenses[idx] = {
        ...expenses[idx],
        ...updated,
        amount: Number(updated.amount),
        convertedAmount: Number(updated.convertedAmount || updated.amount),
      };
      this.saveExpenses(monthKey, expenses);
    }
    return expenses;
  },

  deleteExpense(monthKey, expenseId) {
    const expenses = this.getExpenses(monthKey);
    const filtered = expenses.filter(e => e.id !== expenseId);
    this.saveExpenses(monthKey, filtered);
    return filtered;
  },

  getTodayExpenses(todayDateStr = getTodayIso()) {
    const monthKey = todayDateStr.substring(0, 7);
    const expenses = this.getExpenses(monthKey);
    return expenses.filter(e => e.date === todayDateStr);
  },

  getAllRecordedMonths() {
    const months = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.EXPENSES_PREFIX)) {
        months.add(key.replace(STORAGE_KEYS.EXPENSES_PREFIX, ''));
      }
    }
    const goals = this.getMonthlyGoals();
    if (goals && typeof goals === 'object') {
      Object.keys(goals).forEach((mKey) => {
        if (typeof mKey === 'string' && mKey.includes('-')) {
          months.add(mKey);
        }
      });
    }
    months.add(getCurrentMonthKey());
    return Array.from(months).sort().reverse();
  },

  exportAllDataAsJson() {
    const backup = {
      version: '2.1.0',
      exportedAt: new Date().toISOString(),
      appName: 'مصروفي - Masroofi Daily',
      settings: this.getSettings(),
      categories: this.getCategories(),
      subscriptions: this.getSubscriptions(),
      dailyRecurring: this.getDailyRecurring(),
      monthlyGoals: this.getMonthlyGoals(),
      monthlyExpenses: {},
    };

    this.getAllRecordedMonths().forEach(mKey => {
      backup.monthlyExpenses[mKey] = this.getExpenses(mKey);
    });

    return JSON.stringify(backup, null, 2);
  },

  importAllDataFromJson(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data) throw new Error('الملف فارغ أو غير صالح');

      if (data.settings) this.saveSettings(data.settings);
      if (data.categories) this.saveCategories(data.categories);
      if (data.subscriptions) this.saveSubscriptions(data.subscriptions);
      if (data.dailyRecurring) this.saveDailyRecurring(data.dailyRecurring);
      if (data.monthlyGoals) this.saveMonthlyGoals(data.monthlyGoals);

      if (data.monthlyExpenses) {
        Object.entries(data.monthlyExpenses).forEach(([mKey, expList]) => {
          this.saveExpenses(mKey, expList);
        });
      }

      return { success: true, message: 'تمت استعادة البيانات بنجاح!' };
    } catch (e) {
      return { success: false, message: e.message || 'فشل استيراد الملف' };
    }
  },

  exportExpensesAsCsv(monthKey = getCurrentMonthKey(), currencySymbol = '₪') {
    const expenses = this.getExpenses(monthKey);
    const categories = this.getCategories();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    let csv = '\uFEFF';
    csv += 'المعرف,التاريخ,الفئة,المبلغ,العملة,الملاحظات\n';

    expenses.forEach((e, idx) => {
      const catName = e.categoryName || catMap[e.categoryId] || 'غير محدد';
      const cleanNote = (e.note || '').replace(/"/g, '""');
      csv += `"${idx + 1}","${e.date}","${catName}","${e.amount}","${e.currency || 'ILS'}","${cleanNote}"\n`;
    });

    return csv;
  },

  generateDemoData() {
    const currentMonthKey = getCurrentMonthKey();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = today.getDate();

    const settings = {
      ...DEFAULT_SETTINGS,
      salary: 4500,
      baseCurrency: 'ILS',
      isInitialized: true,
      theme: 'dark',
    };
    this.saveSettings(settings);
    this.saveCategories(DEFAULT_CATEGORIES);
    this.saveSubscriptions(DEFAULT_SUBSCRIPTIONS);

    const demoExpenses = [];

    demoExpenses.push(
      { id: 'exp_td_1', amount: 5, currency: 'ILS', convertedAmount: 5, categoryId: 'smoke', categoryName: 'دخان', date: getTodayIso(), note: 'باكيت دخان الصباح' },
      { id: 'exp_td_2', amount: 5, currency: 'ILS', convertedAmount: 5, categoryId: 'coffee', categoryName: 'قهوة وكافيه', date: getTodayIso(), note: 'قهوة مع الشباب' },
      { id: 'exp_td_3', amount: 15, currency: 'ILS', convertedAmount: 15, categoryId: 'food', categoryName: 'أكل ومطاعم', date: getTodayIso(), note: 'ساندويش شاورما غداء' },
      { id: 'exp_td_4', amount: 8, currency: 'ILS', convertedAmount: 8, categoryId: 'transport', categoryName: 'مواصلات وبنزين', date: getTodayIso(), note: 'تكسي للدوام' }
    );

    for (let d = 1; d < day; d++) {
      const dayStr = `${year}-${month}-${String(d).padStart(2, '0')}`;
      demoExpenses.push(
        { id: `exp_d_${d}_1`, amount: 5, currency: 'ILS', convertedAmount: 5, categoryId: 'smoke', categoryName: 'دخان', date: dayStr },
        { id: `exp_d_${d}_2`, amount: 5, currency: 'ILS', convertedAmount: 5, categoryId: 'coffee', categoryName: 'قهوة وكافيه', date: dayStr },
        { id: `exp_d_${d}_3`, amount: Math.floor(Math.random() * 15) + 10, currency: 'ILS', convertedAmount: 15, categoryId: 'food', categoryName: 'أكل ومطاعم', date: dayStr }
      );
      if (d % 2 === 0) {
        demoExpenses.push(
          { id: `exp_d_${d}_4`, amount: 7, currency: 'ILS', convertedAmount: 7, categoryId: 'transport', categoryName: 'مواصلات وبنزين', date: dayStr }
        );
      }
    }

    demoExpenses.push(
      { id: 'exp_sub_1', amount: 35, currency: 'ILS', convertedAmount: 35, categoryId: 'subscription', categoryName: 'اشتراك نتفليكس', date: `${year}-${month}-01`, note: 'اشتراك شهري ثابت (تلقائي)', isSubscription: true }
    );

    this.saveExpenses(currentMonthKey, demoExpenses);
    return true;
  },

  clearAllData() {
    localStorage.clear();
  },
};
