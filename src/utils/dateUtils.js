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
  if (!monthKey || typeof monthKey !== 'string' || !monthKey.includes('-')) {
    const today = new Date();
    const [y, m] = [today.getFullYear(), today.getMonth() + 1];
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('ar-SA-u-ca-gregory', {
      month: 'long',
      year: 'numeric',
    });
  }
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return '';
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
 * حساب التوقع الشهري الذكي والواقعي
 * يعزل المصاريف السابقة والاستثنائية ويعتمد على وتيرة الصرف اليومية الحقيقية (المتكررات ومصاريف الأيام الفعلية)
 */
export function calculateMonthForecast(arg1, arg2, arg3) {
  let totalSpentSoFar = 0;
  let salary = 4000;
  let priorSpentAmount = 0;
  let monthExpenses = [];
  let dailyRecurring = [];
  let subscriptions = [];
  let monthKey = null;
  let date = new Date();

  if (typeof arg1 === 'object' && arg1 !== null && !(arg1 instanceof Date)) {
    totalSpentSoFar = Number(arg1.totalSpentSoFar) || 0;
    salary = Number(arg1.salary) || 4000;
    priorSpentAmount = Number(arg1.priorSpentAmount) || 0;
    monthExpenses = Array.isArray(arg1.monthExpenses) ? arg1.monthExpenses : [];
    dailyRecurring = Array.isArray(arg1.dailyRecurring) ? arg1.dailyRecurring : [];
    subscriptions = Array.isArray(arg1.subscriptions) ? arg1.subscriptions : [];
    monthKey = arg1.monthKey || null;
    date = arg1.date instanceof Date ? arg1.date : new Date();
  } else {
    totalSpentSoFar = Number(arg1) || 0;
    salary = Number(arg2) || 4000;
    date = arg3 instanceof Date ? arg3 : new Date();
  }

  const currentMonthKey = getCurrentMonthKey(date);
  const targetKey = (typeof monthKey === 'string' && monthKey.includes('-')) ? monthKey : currentMonthKey;

  const [tYear, tMonth] = targetKey.split('-').map(Number);
  const totalDaysInMonth = new Date(tYear, tMonth, 0).getDate();

  const isFutureMonth = targetKey > currentMonthKey;
  const isPastMonth = targetKey < currentMonthKey;

  let daysElapsed = 0;
  let daysRemaining = 0;

  if (isFutureMonth) {
    daysElapsed = 0;
    daysRemaining = totalDaysInMonth;
  } else if (isPastMonth) {
    daysElapsed = totalDaysInMonth;
    daysRemaining = 0;
  } else {
    const currentDay = date.getDate();
    daysElapsed = Math.min(totalDaysInMonth, Math.max(1, currentDay));
    daysRemaining = Math.max(0, totalDaysInMonth - daysElapsed);
  }

  // 1. حساب المصاريف اليومية المتكررة الفعالة (دخان، قهوة، أكل...)
  const activeDailyRecurringSum = (dailyRecurring || [])
    .filter(r => r.active !== false)
    .reduce((sum, r) => sum + (Number(r.amountPerDay) || 0), 0);

  // 2. حساب الاشتراكات الشهرية الثابتة
  const monthlySubsSum = (subscriptions || [])
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  // 3. عزل المصاريف السابقة والاستثنائية لحساب الوتيرة اليومية الواقعية
  const regularMonthSpent = Math.max(0, totalSpentSoFar - priorSpentAmount);
  
  let realisticDailyPace = 0;
  if (activeDailyRecurringSum > 0) {
    // إذا كان لدى المستخدم مصاريف متكررة مسجلة ومعروفة (مثل 20 ₪/يوم)
    const extraDaily = daysElapsed > 0 ? Math.max(0, (regularMonthSpent - (activeDailyRecurringSum * daysElapsed)) / daysElapsed) : 0;
    realisticDailyPace = activeDailyRecurringSum + extraDaily;
  } else if (daysElapsed > 0) {
    // إذا لم تسجل متكررات، نأخذ متوسط المصاريف العادية بدون المصروف السابق
    const avg = regularMonthSpent / daysElapsed;
    realisticDailyPace = avg > 0 ? avg : (totalSpentSoFar / daysElapsed);
  } else {
    realisticDailyPace = totalDaysInMonth > 0 ? Math.round((salary / totalDaysInMonth) * 0.5) : 0;
  }

  // حساب المتوقع لباقي الأيام والإجمالي بنهاية الشهر
  let projectedFutureSpend = 0;
  let projectedEndMonth = 0;

  if (isFutureMonth) {
    projectedFutureSpend = Math.round((totalDaysInMonth * (activeDailyRecurringSum || realisticDailyPace)) + monthlySubsSum);
    projectedEndMonth = projectedFutureSpend;
  } else if (isPastMonth) {
    projectedFutureSpend = 0;
    projectedEndMonth = Math.round(totalSpentSoFar);
  } else {
    projectedFutureSpend = Math.round(daysRemaining * realisticDailyPace);
    projectedEndMonth = Math.round(totalSpentSoFar + projectedFutureSpend);
  }

  const projectedRemaining = Math.round(salary - projectedEndMonth);
  const allowedDailyAverage = totalDaysInMonth > 0 ? Math.round(salary / totalDaysInMonth) : 0;

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
    dailyAverage: Math.round(realisticDailyPace),
    allowedDailyAverage,
    projectedEndMonth,
    projectedRemaining,
    projectedFutureSpend,
    isFutureMonth,
    isPastMonth,
    status,
  };
}

/**
 * حساب حالة الهدف المالي (هدف ادخار أو سقف مصروفات)
 */
export function calculateGoalEvaluation(settings, totalSpentSoFar, forecast, monthGoal = null) {
  const goalType = monthGoal?.goalType || settings?.goalType || 'savings';
  const target = Number(monthGoal?.goalTargetAmount || settings?.goalTargetAmount || 0);
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
