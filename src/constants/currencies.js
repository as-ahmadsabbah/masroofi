export const DEFAULT_CURRENCIES = [
  { code: 'ILS', symbol: '₪', name: 'شيكل', rateToBase: 1.0, isDefaultBase: true },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', rateToBase: 3.65, isDefaultBase: false },
];

export const DEFAULT_SETTINGS = {
  salary: 4000,
  baseCurrency: 'ILS',
  currencies: DEFAULT_CURRENCIES,
  financialMonthStartDay: 1, // بداية الشهر
  priorSpentAmount: 0, // مصروفات سابقة قبل بدء استخدام التطبيق لهذا الشهر
  goalType: 'savings', // 'savings' (هدف ادخار) | 'spend_limit' (سقف مصاريف) | 'none'
  goalTargetAmount: 1000, // المبلغ المستهدف
  pinLockEnabled: false,
  pinHash: '',
  theme: 'dark',
  isInitialized: true,
};
