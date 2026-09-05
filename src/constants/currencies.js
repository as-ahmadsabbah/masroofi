export const DEFAULT_CURRENCIES = [
  { code: 'ILS', symbol: '₪', name: 'شيكل', rateToBase: 1.0, isDefaultBase: true },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', rateToBase: 3.65, isDefaultBase: false },
];

export const DEFAULT_SETTINGS = {
  salary: 4000,
  baseCurrency: 'ILS',
  currencies: DEFAULT_CURRENCIES,
  financialMonthStartDay: 1, // بداية الشهر
  pinLockEnabled: false,
  pinHash: '',
  theme: 'dark',
  isInitialized: true,
};
