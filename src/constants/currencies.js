export const DEFAULT_CURRENCIES = [
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', rateToBase: 1.0, isDefaultBase: true },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي', rateToBase: 0.98, isDefaultBase: false },
  { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري', rateToBase: 0.076, isDefaultBase: false },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي', rateToBase: 12.25, isDefaultBase: false },
  { code: 'QAR', symbol: 'ر.ق', name: 'ريال قطري', rateToBase: 1.03, isDefaultBase: false },
  { code: 'BHD', symbol: 'د.ب', name: 'دينار بحريني', rateToBase: 9.95, isDefaultBase: false },
  { code: 'OMR', symbol: 'ر.ع', name: 'ريال عماني', rateToBase: 9.74, isDefaultBase: false },
  { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني', rateToBase: 5.29, isDefaultBase: false },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', rateToBase: 3.75, isDefaultBase: false },
  { code: 'EUR', symbol: '€', name: 'يورو أوروبي', rateToBase: 4.10, isDefaultBase: false },
  { code: 'GBP', symbol: '£', name: 'جنيه إسترليني', rateToBase: 4.80, isDefaultBase: false },
];

export const DEFAULT_SETTINGS = {
  salary: 10000,
  baseCurrency: 'SAR',
  currencies: DEFAULT_CURRENCIES,
  financialMonthStartDay: 25, // موعد نزول الرواتب المعتاد (25 أو 1)
  pinLockEnabled: false,
  pinHash: '',
  alertsEnabled: true,
  theme: 'dark', // الوضع الليلي هو الوضع الافتراضي العصري
  isInitialized: false, // أول مرة يفتح التطبيق يظهر معالج الإعداد
};
