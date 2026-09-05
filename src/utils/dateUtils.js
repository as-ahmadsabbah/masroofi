/**
 * دوال التواريخ والحسابات الذكية الشاملة للأهداف والتوقعات
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
 * حساب التوقع الشهري الذكي
 */
export function calculateMonthForecast(totalSpentSoFar, salary = 4000, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = date.getDate();
  const daysElapsed = Math.max(1, currentDay);
  const daysRemaining = Math.max(0, totalDaysInMonth - daysElapsed);

  const dailyAverage = totalSpentSoFar / daysElapsed;
  const projectedEndMonth = Math.round(dailyAverage * totalDaysInMonth);
  const projectedRemaining = Math.round(salary - projectedEndMonth);
  const allowedDailyAverage = totalDaysInMonth > 0 ? salary / totalDaysInMonth : 0;

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

/**
 * حساب حالة الهدف المالي (هدف ادخار أو سقف مصروفات)
 */
export function calculateGoalEvaluation(settings, totalSpentSoFar, forecast) {
  const goalType = settings?.goalType || 'savings';
  const target = Number(settings?.goalTargetAmount || 0);
  const salary = Number(settings?.salary || 4000);
  const currencySymbol = settings?.baseCurrency === 'USD' ? '$' : '₪';

  if (!target || target <= 0 || goalType === 'none') {
    return null;
  }

  if (goalType === 'savings') {
    // هدف ادخار مبلغ معين (مثلاً ادخار 1000 ₪)
    const currentSavings = Math.max(0, salary - totalSpentSoFar);
    const projectedSavings = forecast.projectedRemaining;
    const progressPct = Math.min(100, Math.round((currentSavings / target) * 100));

    let status = 'on_track'; // 'on_track' | 'at_risk' | 'off_track'
    let message = '';

    if (projectedSavings >= target) {
      status = 'on_track';
      message = `أنت على المسار الصحيح! متوقع تدخر ${formatCurrency(projectedSavings, currencySymbol)} وتتجاوز هدفك (${formatCurrency(target, currencySymbol)} 🎯).`;
    } else if (projectedSavings >= target * 0.75) {
      status = 'at_risk';
      message = `انتبه: بوتيرتك الحالية ستدخر تقريباً ${formatCurrency(projectedSavings, currencySymbol)}، وهو قريب من هدفك (${formatCurrency(target, currencySymbol)}).`;
    } else {
      status = 'off_track';
      message = `خارج المسار: متوقع تدخر فقط ${formatCurrency(Math.max(0, projectedSavings), currencySymbol)}. تحتاج لترشيد الإنفاق بمقدار ${formatCurrency(target - projectedSavings, currencySymbol)} للوصول لهدفك!`;
    }

    return {
      goalType,
      target,
      currentSavings,
      projectedSavings,
      progressPct,
      status,
      message,
    };
  } else {
    // سقف أقصى للمصاريف (مثلاً لا تتجاوز مصاريفي 3000 ₪)
    const projectedSpend = forecast.projectedEndMonth;
    const progressPct = Math.min(100, Math.round((totalSpentSoFar / target) * 100));

    let status = 'on_track';
    let message = '';

    if (projectedSpend <= target) {
      status = 'on_track';
      message = `ممتاز! متوقع إجمالي صرفك (${formatCurrency(projectedSpend, currencySymbol)}) يبقى تحت سقفك المحدد (${formatCurrency(target, currencySymbol)} 👍).`;
    } else if (projectedSpend <= target * 1.08) {
      status = 'at_risk';
      message = `اقتربت من السقف: متوقع يصل صرفك إلى ${formatCurrency(projectedSpend, currencySymbol)} (سقفك: ${formatCurrency(target, currencySymbol)}).`;
    } else {
      status = 'off_track';
      message = `تجاوز متوقع للسقف: بهذه الوتيرة ستصرف ${formatCurrency(projectedSpend, currencySymbol)} وتتجاوز السقف بـ ${formatCurrency(projectedSpend - target, currencySymbol)}!`;
    }

    return {
      goalType,
      target,
      projectedSpend,
      progressPct,
      status,
      message,
    };
  }
}
