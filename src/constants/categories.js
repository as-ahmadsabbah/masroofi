export const DEFAULT_CATEGORIES = [
  {
    id: 'smoke',
    name: 'دخان',
    type: 'daily', // يومي
    defaultAmount: 5, // مبلغ افتراضي
    color: '#f59e0b',
    icon: 'Flame',
  },
  {
    id: 'coffee',
    name: 'قهوة وكافيه',
    type: 'daily', // يومي
    defaultAmount: 5,
    color: '#8b5cf6',
    icon: 'Coffee',
  },
  {
    id: 'food',
    name: 'أكل ومطاعم',
    type: 'daily',
    defaultAmount: '',
    color: '#10b981',
    icon: 'Utensils',
  },
  {
    id: 'transport',
    name: 'مواصلات وبنزين',
    type: 'daily',
    defaultAmount: '',
    color: '#3b82f6',
    icon: 'Car',
  },
  {
    id: 'groceries',
    name: 'سوبرماركت ونثريات',
    type: 'daily',
    defaultAmount: '',
    color: '#06b6d4',
    icon: 'ShoppingBag',
  },
  {
    id: 'pharmacy',
    name: 'صيدلية وصحة',
    type: 'daily',
    defaultAmount: '',
    color: '#ec4899',
    icon: 'HeartPulse',
  },
];

export const DEFAULT_SUBSCRIPTIONS = [
  {
    id: 'sub_netflix',
    name: 'اشتراك نتفليكس',
    amount: 35,
    billingDay: 1, // يوم 1 من كل شهر
    icon: 'Tv',
    color: '#ef4444',
  },
  {
    id: 'sub_mobile',
    name: 'فاتورة الموبايل والإنترنت',
    amount: 70,
    billingDay: 5,
    icon: 'Smartphone',
    color: '#3b82f6',
  },
];
