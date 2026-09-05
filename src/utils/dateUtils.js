/**
 * دوال التواريخ والحسابات اليومية والشهرية التلقائية
 */

export function getTodayIso() {
  const d = new Date();
  return formatDateIso(d);
}

export function formatDateIso(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatArabicDateRelative(dateStr) {
  if (!dateStr) return '';
  const today = getTodayIso();
  
  const d = new Date(dateStr + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const diffDays = Math.round((todayDate - d) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'أمس';
  if (diffDays === 2) return 'أول أمس';

  return d.toLocaleDateString('ar-SA-u-ca-gregory', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatArabicDateFull(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ar-SA-u-ca-gregory', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatArabicMonth(monthKey) {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('ar-SA-u-ca-gregory', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatCurrency(amount, currencySymbol = '₪') {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencySymbol}`;
}

/**
 * حساب التوقع الشهري بناءً على معدل الصرف اليومي
 */
export function calculateMonthForecast(totalSpentSoFar, salary = 4000, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  
  // إجمالي عدد أيام الشهر
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  
  // عدد الأيام التي مرت من الشهر (بما فيها اليوم)
  const currentDay = date.getDate();
  const daysElapsed = Math.max(1, currentDay);
  const daysRemaining = Math.max(0, totalDaysInMonth - daysElapsed);

  // معدل الصرف اليومي حتى الآن
  const dailyAverage = totalSpentSoFar / daysElapsed;

  // التوقع لنهاية الشهر = معدل الصرف اليومي × إجمالي عدد أيام الشهر
  const projectedEndMonth = Math.round(dailyAverage * totalDaysInMonth);

  // المتبقي المتوقع من الراتب آخر الشهر
  const projectedRemaining = Math.round(salary - projectedEndMonth);

  // المعدل اليومي المسموح من الراتب = الراتب ÷ عدد أيام الشهر
  const allowedDailyAverage = totalDaysInMonth > 0 ? salary / totalDaysInMonth : 0;

  // مؤشر الحالة اللوني:
  // أخضر: التوقع أقل من الراتب بأمان
  // أصفر: التوقع يقترب من الراتب (بين 85% و 100%)
  // أحمر: التوقع سيتجاوز الراتب (عجز محتمل)
  let status = 'safe'; // 'safe' | 'warning' | 'danger'
  if (projectedEndMonth > salary) {
    status = 'danger';
  } else if (projectedEndMonth >= salary * 0.88) {
    status = 'warning';
  }

  return {
    totalDaysInMonth,
    daysElapsed,
    daysRemaining,
    dailyAverage: Math.round(dailyAverage),
    allowedDailyAverage: Math.round(allowedDailyAverage),
    projectedEndMonth,
    projectedRemaining,
    status,
  };
}
