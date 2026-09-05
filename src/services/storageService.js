import { DEFAULT_CURRENCIES, DEFAULT_SETTINGS } from '../constants/currencies';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { getFinancialMonthInfo, formatDateIso } from '../utils/dateUtils';

const STORAGE_KEYS = {
  SETTINGS: 'masroofi_settings',
  CATEGORIES: 'masroofi_categories',
  EXPENSES_PREFIX: 'masroofi_expenses_',
  INCOMES_PREFIX: 'masroofi_incomes_',
  RECURRING_RULES: 'masroofi_recurring_rules',
  SAVINGS_GOALS: 'masroofi_savings_goals',
  ACTIVE_MONTH: 'masroofi_active_month',
  PROCESSED_RECURRING: 'masroofi_processed_recurring_',
};

export const storageService = {
  // --- الإعدادات (Settings) ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.error('Error reading settings:', e);
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
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading categories:', e);
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

  // --- المصاريف (Expenses) ---
  getExpenses(monthKey) {
    try {
      const key = `${STORAGE_KEYS.EXPENSES_PREFIX}${monthKey}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading expenses for ${monthKey}:`, e);
      return [];
    }
  },

  saveExpenses(monthKey, expenses) {
    try {
      const key = `${STORAGE_KEYS.EXPENSES_PREFIX}${monthKey}`;
      localStorage.setItem(key, JSON.stringify(expenses));
    } catch (e) {
      console.error(`Error saving expenses for ${monthKey}:`, e);
    }
  },

  addExpense(monthKey, expense) {
    const expenses = this.getExpenses(monthKey);
    const newExpense = {
      id: expense.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      amount: Number(expense.amount),
      currency: expense.currency || 'SAR',
      convertedAmount: Number(expense.convertedAmount || expense.amount),
      categoryId: expense.categoryId,
      date: expense.date || formatDateIso(new Date()),
      note: expense.note || '',
      isRecurring: !!expense.isRecurring,
      createdAt: new Date().toISOString(),
    };

    expenses.unshift(newExpense);
    this.saveExpenses(monthKey, expenses);

    // إذا كان متكررًا، نضيفه لقواعد المصاريف المتكررة
    if (expense.isRecurring) {
      this.addRecurringRule({
        amount: newExpense.amount,
        currency: newExpense.currency,
        convertedAmount: newExpense.convertedAmount,
        categoryId: newExpense.categoryId,
        note: newExpense.note,
        dayOfMonth: new Date(newExpense.date).getDate(),
      });
    }

    return newExpense;
  },

  updateExpense(monthKey, updatedExpense) {
    const expenses = this.getExpenses(monthKey);
    const index = expenses.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
      expenses[index] = {
        ...expenses[index],
        ...updatedExpense,
        amount: Number(updatedExpense.amount),
        convertedAmount: Number(updatedExpense.convertedAmount || updatedExpense.amount),
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

  // --- الدخل الإضافي (Extra Incomes) ---
  getIncomes(monthKey) {
    try {
      const key = `${STORAGE_KEYS.INCOMES_PREFIX}${monthKey}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading incomes for ${monthKey}:`, e);
      return [];
    }
  },

  saveIncomes(monthKey, incomes) {
    try {
      const key = `${STORAGE_KEYS.INCOMES_PREFIX}${monthKey}`;
      localStorage.setItem(key, JSON.stringify(incomes));
    } catch (e) {
      console.error(`Error saving incomes for ${monthKey}:`, e);
    }
  },

  addIncome(monthKey, income) {
    const incomes = this.getIncomes(monthKey);
    const newIncome = {
      id: income.id || 'inc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      amount: Number(income.amount),
      currency: income.currency || 'SAR',
      convertedAmount: Number(income.convertedAmount || income.amount),
      source: income.source || 'عمل حر / فريلانس',
      destination: income.destination || 'savings', // savings | budget | free
      date: income.date || formatDateIso(new Date()),
      note: income.note || '',
      createdAt: new Date().toISOString(),
    };

    incomes.unshift(newIncome);
    this.saveIncomes(monthKey, incomes);
    return newIncome;
  },

  deleteIncome(monthKey, incomeId) {
    const incomes = this.getIncomes(monthKey);
    const filtered = incomes.filter(i => i.id !== incomeId);
    this.saveIncomes(monthKey, filtered);
    return filtered;
  },

  // --- المصاريف المتكررة (Recurring Rules) ---
  getRecurringRules() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING_RULES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveRecurringRules(rules) {
    localStorage.setItem(STORAGE_KEYS.RECURRING_RULES, JSON.stringify(rules));
  },

  addRecurringRule(rule) {
    const rules = this.getRecurringRules();
    const existing = rules.find(r => r.categoryId === rule.categoryId && r.note === rule.note);
    if (!existing) {
      rules.push({
        id: 'rec_' + Date.now(),
        ...rule,
        active: true,
      });
      this.saveRecurringRules(rules);
    }
  },

  processRecurringForMonth(monthKey) {
    const processedKey = `${STORAGE_KEYS.PROCESSED_RECURRING}${monthKey}`;
    if (localStorage.getItem(processedKey)) {
      return; // تمت المعالجة مسبقاً لهذا الشهر
    }

    const rules = this.getRecurringRules().filter(r => r.active);
    if (rules.length === 0) return;

    const expenses = this.getExpenses(monthKey);
    const [year, month] = monthKey.split('-');

    rules.forEach(rule => {
      const day = String(rule.dayOfMonth || 1).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      // تجنب التكرار إذا كان موجوداً
      const alreadyExists = expenses.some(e => e.isRecurring && e.categoryId === rule.categoryId && e.amount === rule.amount);
      if (!alreadyExists) {
        expenses.push({
          id: 'rec_inst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          amount: rule.amount,
          currency: rule.currency || 'SAR',
          convertedAmount: rule.convertedAmount || rule.amount,
          categoryId: rule.categoryId,
          date,
          note: `${rule.note || ''} (متكرر شهرياً)`,
          isRecurring: true,
          createdAt: new Date().toISOString(),
        });
      }
    });

    this.saveExpenses(monthKey, expenses);
    localStorage.setItem(processedKey, 'true');
  },

  // --- أهداف الادخار (Savings Goals) ---
  getSavingsGoals() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
      return data ? JSON.parse(data) : [
        {
          id: 'goal_emergency',
          name: 'صندوق الطوارئ',
          targetAmount: 30000,
          currentAmount: 12500,
          type: 'annual',
          color: '#10B981',
          icon: 'ShieldCheck',
        },
        {
          id: 'goal_vacation',
          name: 'رحلة الإجازة الصيفية',
          targetAmount: 8000,
          currentAmount: 3400,
          type: 'custom',
          deadline: '2026-12-31',
          color: '#3B82F6',
          icon: 'Palmtree',
        },
      ];
    } catch (e) {
      return [];
    }
  },

  saveSavingsGoals(goals) {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  },

  addSavingsGoal(goal) {
    const goals = this.getSavingsGoals();
    const newGoal = {
      id: 'goal_' + Date.now(),
      name: goal.name,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount || 0),
      type: goal.type || 'custom',
      deadline: goal.deadline || '',
      color: goal.color || '#10B981',
      icon: goal.icon || 'PiggyBank',
    };
    goals.push(newGoal);
    this.saveSavingsGoals(goals);
    return newGoal;
  },

  updateSavingsGoal(updated) {
    const goals = this.getSavingsGoals();
    const idx = goals.findIndex(g => g.id === updated.id);
    if (idx !== -1) {
      goals[idx] = { ...goals[idx], ...updated };
      this.saveSavingsGoals(goals);
    }
    return goals;
  },

  deleteSavingsGoal(goalId) {
    const goals = this.getSavingsGoals();
    const filtered = goals.filter(g => g.id !== goalId);
    this.saveSavingsGoals(filtered);
    return filtered;
  },

  // --- جميع الشهور المسجلة (Recorded Months) ---
  getAllRecordedMonths() {
    const months = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.EXPENSES_PREFIX)) {
        months.add(key.replace(STORAGE_KEYS.EXPENSES_PREFIX, ''));
      }
      if (key && key.startsWith(STORAGE_KEYS.INCOMES_PREFIX)) {
        months.add(key.replace(STORAGE_KEYS.INCOMES_PREFIX, ''));
      }
    }

    // إضافة الشهر الحالي دائماً
    const currentMonthKey = getFinancialMonthInfo(new Date(), this.getSettings().financialMonthStartDay).monthKey;
    months.add(currentMonthKey);

    return Array.from(months).sort().reverse();
  },

  // --- حساب إجمالي المدخرات التراكمي لجميع الشهور ---
  getCumulativeSavings(currentSettings) {
    const months = this.getAllRecordedMonths();
    let totalSavings = 0;
    const salary = Number(currentSettings?.salary || 0);

    months.forEach(monthKey => {
      const expenses = this.getExpenses(monthKey);
      const incomes = this.getIncomes(monthKey);

      const totalSpent = expenses.reduce((s, e) => s + Number(e.convertedAmount || e.amount || 0), 0);
      
      // الدخل الإضافي الموجه للمدخرات
      const savingsIncomes = incomes
        .filter(i => i.destination === 'savings')
        .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);
      
      // الدخل الإضافي الموجه للميزانية
      const budgetIncomes = incomes
        .filter(i => i.destination === 'budget')
        .reduce((s, i) => s + Number(i.convertedAmount || i.amount || 0), 0);

      // الفائض الشهري = (الراتب + دخل الميزانية) - المصاريف
      const monthlySurplus = (salary + budgetIncomes) - totalSpent;
      
      totalSavings += Math.max(0, monthlySurplus) + savingsIncomes;
    });

    return totalSavings;
  },

  // --- استيراد وتصدير البيانات بالكامل (JSON Backup & Restore) ---
  exportAllDataAsJson() {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'مصروفي - Masroofi',
      settings: this.getSettings(),
      categories: this.getCategories(),
      recurringRules: this.getRecurringRules(),
      savingsGoals: this.getSavingsGoals(),
      monthlyData: {},
    };

    this.getAllRecordedMonths().forEach(monthKey => {
      backupData.monthlyData[monthKey] = {
        expenses: this.getExpenses(monthKey),
        incomes: this.getIncomes(monthKey),
      };
    });

    return JSON.stringify(backupData, null, 2);
  },

  importAllDataFromJson(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !data.settings || !data.categories) {
        throw new Error('صيغة ملف النسخ الاحتياطي غير صالحة أو ينقصها بيانات أساسية');
      }

      this.saveSettings(data.settings);
      this.saveCategories(data.categories);

      if (data.recurringRules) this.saveRecurringRules(data.recurringRules);
      if (data.savingsGoals) this.saveSavingsGoals(data.savingsGoals);

      if (data.monthlyData) {
        Object.entries(data.monthlyData).forEach(([mKey, mVal]) => {
          if (mVal.expenses) this.saveExpenses(mKey, mVal.expenses);
          if (mVal.incomes) this.saveIncomes(mKey, mVal.incomes);
        });
      }

      return { success: true, message: 'تمت استعادة البيانات بنجاح!' };
    } catch (e) {
      return { success: false, message: e.message || 'فشل استيراد الملف' };
    }
  },

  // --- تصدير المصاريف كـ CSV مع دعم العربية (UTF-8 with BOM) ---
  exportExpensesAsCsv(monthKey, currencySymbol = 'ر.س') {
    const expenses = this.getExpenses(monthKey);
    const categories = this.getCategories();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    let csv = '\uFEFF'; // UTF-8 BOM لكي يتعرف Excel على الأحرف العربية مباشرة
    csv += 'المعرف,التاريخ,الفئة,المبلغ,العملة,المبلغ بالعملة الأساسية,متكرر شهرياً,الملاحظات\n';

    expenses.forEach((e, idx) => {
      const catName = catMap[e.categoryId] || 'غير محدد';
      const cleanNote = (e.note || '').replace(/"/g, '""');
      const isRec = e.isRecurring ? 'نعم' : 'لا';
      csv += `"${idx + 1}","${e.date}","${catName}","${e.amount}","${e.currency}","${e.convertedAmount}","${isRec}","${cleanNote}"\n`;
    });

    return csv;
  },

  // --- توليد بيانات تجريبية واقعية لأشهر سابقة (Demo Data) ---
  generateDemoData() {
    const currentMonthKey = '2026-09';
    const prevMonthKey1 = '2026-08';
    const prevMonthKey2 = '2026-07';

    // ضبط الإعدادات الافتراضية
    const settings = {
      ...DEFAULT_SETTINGS,
      salary: 12000,
      baseCurrency: 'SAR',
      financialMonthStartDay: 25,
      isInitialized: true,
      theme: 'dark',
    };
    this.saveSettings(settings);
    this.saveCategories(DEFAULT_CATEGORIES);

    // مصاريف الشهر الحالي (2026-09)
    const expensesCurrent = [
      { id: 'e1', amount: 2800, currency: 'SAR', convertedAmount: 2800, categoryId: 'housing-bills', date: '2026-08-26', note: 'إيجار وفاتورة كهرباء', isRecurring: true },
      { id: 'e2', amount: 450, currency: 'SAR', convertedAmount: 450, categoryId: 'food', date: '2026-08-28', note: 'تسوق هايبر ماركت التموين الأسبوعي', isRecurring: false },
      { id: 'e3', amount: 120, currency: 'USD', convertedAmount: 450, categoryId: 'entertainment', date: '2026-08-30', note: 'اشتراك نتفلكس وبلايستيشن سنوي', isRecurring: false },
      { id: 'e4', amount: 220, currency: 'SAR', convertedAmount: 220, categoryId: 'transport', date: '2026-09-01', note: 'بنزين وغسيل سيارة', isRecurring: false },
      { id: 'e5', amount: 350, currency: 'SAR', convertedAmount: 350, categoryId: 'food', date: '2026-09-02', note: 'عشاء مطعم مع العائلة', isRecurring: false },
      { id: 'e6', amount: 650, currency: 'SAR', convertedAmount: 650, categoryId: 'shopping', date: '2026-09-03', note: 'ملابس وأحذية رياضية', isRecurring: false },
      { id: 'e7', amount: 150, currency: 'SAR', convertedAmount: 150, categoryId: 'health', date: '2026-09-04', note: 'أدوية ومكملات صيدلية', isRecurring: false },
      { id: 'e8', amount: 2400, currency: 'SAR', convertedAmount: 2400, categoryId: 'savings', date: '2026-08-25', note: 'تحويل الحصة الشهرية لصندوق الاستثمار', isRecurring: true },
    ];
    this.saveExpenses(currentMonthKey, expensesCurrent);

    // دخل إضافي للشهر الحالي
    const incomesCurrent = [
      { id: 'i1', amount: 600, currency: 'USD', convertedAmount: 2250, source: 'مشروع فريلانس تصميم موقع', destination: 'savings', date: '2026-08-29', note: 'دفعة مشروع Upwork' },
      { id: 'i2', amount: 500, currency: 'SAR', convertedAmount: 500, source: 'بيع جهاز قديم', destination: 'budget', date: '2026-09-02', note: 'بيع شاشة قديمة في حراج' },
    ];
    this.saveIncomes(currentMonthKey, incomesCurrent);

    // مصاريف الشهر الماضي (2026-08)
    const expensesPrev1 = [
      { id: 'ep1_1', amount: 2800, currency: 'SAR', convertedAmount: 2800, categoryId: 'housing-bills', date: '2026-07-26', note: 'إيجار وسداد فواتير', isRecurring: true },
      { id: 'ep1_2', amount: 1650, currency: 'SAR', convertedAmount: 1650, categoryId: 'food', date: '2026-08-05', note: 'مشتريات غذائية ومطاعم', isRecurring: false },
      { id: 'ep1_3', amount: 550, currency: 'SAR', convertedAmount: 550, categoryId: 'transport', date: '2026-08-10', note: 'صيانة ومحروقات', isRecurring: false },
      { id: 'ep1_4', amount: 850, currency: 'SAR', convertedAmount: 850, categoryId: 'entertainment', date: '2026-08-14', note: 'سينما وأنشطة صيفية', isRecurring: false },
      { id: 'ep1_5', amount: 900, currency: 'SAR', convertedAmount: 900, categoryId: 'shopping', date: '2026-08-18', note: 'تسوق إلكتروني', isRecurring: false },
      { id: 'ep1_6', amount: 300, currency: 'SAR', convertedAmount: 300, categoryId: 'health', date: '2026-08-20', note: 'كشفية أسنان', isRecurring: false },
      { id: 'ep1_7', amount: 2400, currency: 'SAR', convertedAmount: 2400, categoryId: 'savings', date: '2026-07-25', note: 'ادخار شهري', isRecurring: true },
    ];
    this.saveExpenses(prevMonthKey1, expensesPrev1);

    const incomesPrev1 = [
      { id: 'ip1_1', amount: 1500, currency: 'SAR', convertedAmount: 1500, source: 'مكافأة تميز عمل', destination: 'savings', date: '2026-08-15', note: 'بونص فصلي من العمل' },
    ];
    this.saveIncomes(prevMonthKey1, incomesPrev1);

    // مصاريف الشهر الأسبق (2026-07)
    const expensesPrev2 = [
      { id: 'ep2_1', amount: 2800, currency: 'SAR', convertedAmount: 2800, categoryId: 'housing-bills', date: '2026-06-26', note: 'إيجار وسداد فواتير', isRecurring: true },
      { id: 'ep2_2', amount: 1800, currency: 'SAR', convertedAmount: 1800, categoryId: 'food', date: '2026-07-08', note: 'مشتريات غذائية', isRecurring: false },
      { id: 'ep2_3', amount: 600, currency: 'SAR', convertedAmount: 600, categoryId: 'transport', date: '2026-07-12', note: 'مواصلات', isRecurring: false },
      { id: 'ep2_4', amount: 1200, currency: 'SAR', convertedAmount: 1200, categoryId: 'entertainment', date: '2026-07-15', note: 'نزهات العيد', isRecurring: false },
      { id: 'ep2_5', amount: 1400, currency: 'SAR', convertedAmount: 1400, categoryId: 'shopping', date: '2026-07-18', note: 'ملابس العيد', isRecurring: false },
      { id: 'ep2_6', amount: 2400, currency: 'SAR', convertedAmount: 2400, categoryId: 'savings', date: '2026-06-25', note: 'ادخار شهري', isRecurring: true },
    ];
    this.saveExpenses(prevMonthKey2, expensesPrev2);

    return true;
  },

  clearAllData() {
    localStorage.clear();
  },
};
