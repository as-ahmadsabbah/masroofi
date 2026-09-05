export const DEFAULT_CATEGORIES = [
  {
    id: 'housing-bills',
    name: 'سكن وفواتير',
    type: 'fixed', // ثابتة
    limitType: 'percentage',
    limitValue: 25, // 25% من الراتب
    color: '#3B82F6', // أزرق
    icon: 'Home',
    classification: 'needs', // احتياجات
  },
  {
    id: 'food',
    name: 'طعام وتموينات',
    type: 'variable', // متغيرة
    limitType: 'percentage',
    limitValue: 15, // 15%
    color: '#10B981', // أخضر زمردي
    icon: 'Utensils',
    classification: 'needs',
  },
  {
    id: 'transport',
    name: 'مواصلات وبنزين',
    type: 'variable', // متغيرة
    limitType: 'percentage',
    limitValue: 10, // 10%
    color: '#F59E0B', // كهرماني
    icon: 'Car',
    classification: 'needs',
  },
  {
    id: 'health',
    name: 'صحة ورعاية طبية',
    type: 'variable', // متغيرة
    limitType: 'percentage',
    limitValue: 5, // 5%
    color: '#EC4899', // وردي
    icon: 'HeartPulse',
    classification: 'needs',
  },
  {
    id: 'entertainment',
    name: 'ترفيه ونزهات',
    type: 'variable', // متغيرة
    limitType: 'percentage',
    limitValue: 10, // 10%
    color: '#8B5CF6', // بنفسجي
    icon: 'Film',
    classification: 'wants', // رغبات
  },
  {
    id: 'shopping',
    name: 'تسوق وملابس',
    type: 'variable', // متغيرة
    limitType: 'percentage',
    limitValue: 10, // 10%
    color: '#06B6D4', // سماوي
    icon: 'ShoppingBag',
    classification: 'wants',
  },
  {
    id: 'other',
    name: 'مصاريف أخرى ونثريات',
    type: 'variable', // متغيرة
    limitType: 'percentage',
    limitValue: 5, // 5%
    color: '#64748B', // رمادي
    icon: 'HelpCircle',
    classification: 'wants',
  },
  {
    id: 'savings',
    name: 'ادخار واستثمار',
    type: 'fixed', // ثابتة
    limitType: 'percentage',
    limitValue: 20, // 20%
    color: '#059669', // أخضر عميق
    icon: 'PiggyBank',
    classification: 'savings', // ادخار
  },
];

// اقتراح الميزانية الذكية وفق قاعدة 50/30/20:
// 50% احتياجات أساسية (Needs): سكن وفواتير 25%، طعام 15%، مواصلات 5%، صحة 5%
// 30% رغبات ونمط حياة (Wants): ترفيه 12%، تسوق 13%، أخرى 5%
// 20% ادخار واستثمار (Savings): ادخار 20%
export const SMART_50_30_20_PRESET = {
  'housing-bills': { limitType: 'percentage', limitValue: 25 },
  'food': { limitType: 'percentage', limitValue: 15 },
  'transport': { limitType: 'percentage', limitValue: 5 },
  'health': { limitType: 'percentage', limitValue: 5 },
  'entertainment': { limitType: 'percentage', limitValue: 12 },
  'shopping': { limitType: 'percentage', limitValue: 13 },
  'other': { limitType: 'percentage', limitValue: 5 },
  'savings': { limitType: 'percentage', limitValue: 20 },
};
