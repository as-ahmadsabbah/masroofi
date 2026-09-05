/**
 * حساب الشهر المالي بناءً على يوم البداية المحدد (مثلاً يوم 25 أو يوم 1)
 */
export function getFinancialMonthInfo(date = new Date(), startDay = 25) {
  const current = new Date(date);
  const day = current.getDate();
  const year = current.getFullYear();
  const month = current.getMonth(); // 0-indexed (0 = Jan, 8 = Sep)

  let cycleStartYear = year;
  let cycleStartMonth = month;
  let cycleEndYear = year;
  let cycleEndMonth = month;

  if (startDay === 1) {
    // شهر تقويمي عادي
    cycleStartMonth = month;
    cycleEndMonth = month;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // آخر يوم في الشهر
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    // الأيام المتبقية
    const diffTime = endDate.getTime() - current.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalDays = endDate.getDate();

    return {
      monthKey,
      startDate: formatDateIso(startDate),
      endDate: formatDateIso(endDate),
      daysRemaining,
      totalDays,
      startDay,
      label: formatArabicMonth(monthKey),
    };
  }

  // إذا كان موعد نزول الراتب في يوم محدد (مثلاً 25)
  if (day >= startDay) {
    // نحن بعد يوم البداية: الدورة بدأت هذا الشهر وستنتهي في الشهر القادم
    cycleStartYear = year;
    cycleStartMonth = month;
    
    cycleEndMonth = month + 1;
    if (cycleEndMonth > 11) {
      cycleEndMonth = 0;
      cycleEndYear = year + 1;
    }
  } else {
    // نحن قبل يوم البداية: الدورة بدأت في الشهر السابق
    cycleEndYear = year;
    cycleEndMonth = month;

    cycleStartMonth = month - 1;
    if (cycleStartMonth < 0) {
      cycleStartMonth = 11;
      cycleStartYear = year - 1;
    }
  }

  const startDate = new Date(cycleStartYear, cycleStartMonth, startDay);
  // نهاية الدورة هي اليوم السابق ليوم البداية في الشهر التالي
  const nextCycleStart = new Date(cycleEndYear, cycleEndMonth, startDay);
  const endDate = new Date(nextCycleStart.getTime() - 24 * 60 * 60 * 1000);

  // مفتاح الشهر المالي يُنسب للشهر الذي تنتهي فيه الدورة (أو شهر الراتب)
  const monthKey = `${cycleEndYear}-${String(cycleEndMonth + 1).padStart(2, '0')}`;

  const diffTime = nextCycleStart.getTime() - current.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalDays = Math.round((nextCycleStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    monthKey,
    startDate: formatDateIso(startDate),
    endDate: formatDateIso(endDate),
    daysRemaining,
    totalDays,
    startDay,
    label: formatArabicMonth(monthKey),
  };
}

export function formatDateIso(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatArabicDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA-u-ca-gregory', {
    day: 'numeric',
    month: 'short',
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

/**
 * تقسيم الدورة المالية الحالية إلى أسابيع
 */
export function getWeeklyBreakdown(monthInfo, expenses = []) {
  const { startDate, endDate, totalDays } = monthInfo;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  const weeks = [];
  let currentWeekStart = new Date(start);
  let weekIndex = 1;

  while (currentWeekStart <= end) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const actualWeekEnd = weekEnd > end ? end : weekEnd;

    // حساب المصاريف الواقعة ضمن هذا الأسبوع
    const weekStartIso = formatDateIso(currentWeekStart);
    const weekEndIso = formatDateIso(actualWeekEnd);

    const weekExpenses = expenses.filter(exp => {
      return exp.date >= weekStartIso && exp.date <= weekEndIso;
    });

    const totalSpent = weekExpenses.reduce((sum, e) => sum + Number(e.convertedAmount || e.amount || 0), 0);

    const isCurrentWeek = (today >= currentWeekStart && today <= actualWeekEnd) || 
      (today > end && weekIndex === weeks.length + 1) || 
      (today < start && weekIndex === 1);

    weeks.push({
      weekIndex,
      name: `الأسبوع ${weekIndex}`,
      startDate: weekStartIso,
      endDate: weekEndIso,
      totalSpent,
      isCurrentWeek,
      daysCount: Math.round((actualWeekEnd.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    });

    currentWeekStart = new Date(actualWeekEnd);
    currentWeekStart.setDate(currentWeekStart.getDate() + 1);
    weekIndex++;
  }

  return weeks;
}

/**
 * تنسيق المبالغ المالية بطريقة عربية أنيقة
 */
export function formatCurrency(amount, currencySymbol = 'ر.س') {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencySymbol}`;
}

export function formatNumber(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}
