import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Settings,
  Lock,
  DollarSign,
  Bell,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { DEFAULT_CURRENCIES } from '../../constants/currencies';

export default function SettingsView({
  settings,
  onUpdateSettings,
  activeMonth,
  onDataReload,
}) {
  const fileInputRef = useRef(null);

  const [salary, setSalary] = useState(settings?.salary || 10000);
  const [baseCurrency, setBaseCurrency] = useState(settings?.baseCurrency || 'SAR');
  const [startDay, setStartDay] = useState(settings?.financialMonthStartDay || 25);
  const [alertsEnabled, setAlertsEnabled] = useState(settings?.alertsEnabled !== false);
  const [pinLockEnabled, setPinLockEnabled] = useState(!!settings?.pinLockEnabled);
  const [pinCode, setPinCode] = useState(settings?.pinHash || '');
  const [currencies, setCurrencies] = useState(settings?.currencies || DEFAULT_CURRENCIES);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    if (pinLockEnabled && pinCode.length !== 4) {
      alert('يجب أن يتكون رمز PIN من 4 أرقام بالضبط!');
      return;
    }

    const updated = {
      ...settings,
      salary: Number(salary),
      baseCurrency,
      financialMonthStartDay: Number(startDay),
      alertsEnabled,
      pinLockEnabled,
      pinHash: pinLockEnabled ? pinCode : '',
      currencies,
    };

    onUpdateSettings(updated);
    confetti({ particleCount: 50, spread: 60 });
    alert('تم حفظ الإعدادات بنجاح!');
  };

  const handleCurrencyRateChange = (code, newRate) => {
    const updatedCurrencies = currencies.map((c) =>
      c.code === code ? { ...c, rateToBase: Number(newRate) || 1 } : c
    );
    setCurrencies(updatedCurrencies);
  };

  // تصدير النسخ الاحتياطي الشامل كـ JSON
  const handleExportJson = () => {
    const jsonStr = storageService.exportAllDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `masroofi_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // استيراد النسخ الاحتياطي من JSON
  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const res = storageService.importAllDataFromJson(content);
      if (res.success) {
        confetti({ particleCount: 80, spread: 70 });
        alert(res.message);
        onDataReload();
      } else {
        alert('خطأ أثناء الاستيراد: ' + res.message);
      }
    };
    reader.readAsText(file);
  };

  // تصدير المصاريف الحالية كـ CSV
  const handleExportCsv = () => {
    const currencyObj = settings?.currencies?.find((c) => c.code === settings?.baseCurrency);
    const csvContent = storageService.exportExpensesAsCsv(activeMonth, currencyObj?.symbol || 'ر.س');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `masroofi_expenses_${activeMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // توليد بيانات تجريبية
  const handleGenerateDemo = () => {
    if (window.confirm('هل تريد ملء التطبيق ببيانات واقعية لتجربة كافة الرسوم البيانية والشاشات فوراً؟ (ستستبدل البيانات الحالية)')) {
      storageService.generateDemoData();
      confetti({ particleCount: 100, spread: 80 });
      alert('تم تحميل البيانات التجريبية بنجاح!');
      onDataReload();
    }
  };

  // مسح كافة البيانات
  const handleClearAll = () => {
    if (window.confirm('تحذير نهائي: هل أنت متأكد من مسح جميع البيانات نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      storageService.clearAllData();
      alert('تم مسح جميع البيانات وإعادة ضبط المصنع.');
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. الإعدادات العامة والمالية */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={22} color="var(--brand-500)" />
          <span>الإعدادات المالية العامة</span>
        </h2>

        <form onSubmit={handleSaveGeneral}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '18px' }}>
            <div>
              <label className="form-label">الراتب الشهري الصافي</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            <div>
              <label className="form-label">العملة الأساسية للحسابات</label>
              <select
                className="form-select"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol} - {c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">يوم بداية الدورة المالية (نزول الراتب)</label>
              <select
                className="form-select"
                value={startDay}
                onChange={(e) => setStartDay(Number(e.target.value))}
              >
                <option value={1}>1 من كل شهر ميلادي</option>
                <option value={25}>25 من كل شهر ميلادي (القطاع الحكومي الخليجي)</option>
                <option value={27}>27 من كل شهر ميلادي</option>
                <option value={28}>28 من كل شهر ميلادي</option>
                <option value={30}>30 من كل شهر ميلادي</option>
                {[...Array(28)].map((_, i) => (
                  i + 1 !== 1 && i + 1 !== 25 && i + 1 !== 27 && i + 1 !== 28 ? (
                    <option key={i + 1} value={i + 1}>
                      يوم {i + 1} من الشهر
                    </option>
                  ) : null
                ))}
              </select>
            </div>
          </div>

          {/* تفعيل التنبيهات الذكية */}
          <div style={{
            background: 'var(--bg-app)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '18px',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-500)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.92rem' }}>
                  <Bell size={16} color="var(--brand-500)" />
                  <span>تفعيل التنبيهات الذكية (تجاوز الفئات وعجز الميزانية)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  إظهار تنبيه لطيف عند وصول الفئة إلى 90% من حدها وتنبيه أحمر بارز عند التجاوز.
                </div>
              </div>
            </label>
          </div>

          {/* قفل التطبيق برمز PIN */}
          <div style={{
            background: 'var(--bg-app)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: pinLockEnabled ? '14px' : '0' }}>
              <input
                type="checkbox"
                checked={pinLockEnabled}
                onChange={(e) => setPinLockEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-500)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.92rem' }}>
                  <Shield size={16} color="var(--brand-500)" />
                  <span>تفعيل قفل الخصوصية برقم سري (PIN Lock)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  يطلب رمز أمان مكوّن من 4 أرقام في كل مرة يُفتح فيها التطبيق لحماية خصوصية أموالك.
                </div>
              </div>
            </label>

            {pinLockEnabled && (
              <div style={{ maxWidth: '280px', marginTop: '10px' }}>
                <label className="form-label">أدخل رمز PIN المكوّن من 4 أرقام:</label>
                <input
                  type="password"
                  maxLength={4}
                  className="form-input"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px', fontWeight: 800 }}
                  required={pinLockEnabled}
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={16} />
            <span>حفظ التعديلات العامة</span>
          </button>
        </form>
      </div>

      {/* 2. إدارة العملات وأسعار الصرف */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={22} color="var(--brand-500)" />
          <span>العملات الإضافية وأسعار الصرف</span>
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          حدد كم تساوي كل عملة بالنسبة لعملتك الأساسية ({baseCurrency}) لتحويل دخل الفريلانس والمصاريف الدولية تلقائياً.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {currencies.map((c) => {
            const isBase = c.code === baseCurrency;
            return (
              <div
                key={c.code}
                style={{
                  background: 'var(--bg-app)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: isBase ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{c.name} ({c.symbol})</strong>
                  {isBase ? (
                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>الأساسية</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.code}</span>
                  )}
                </div>

                {!isBase ? (
                  <div>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      1 {c.code} = كم {baseCurrency}؟
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      className="form-input"
                      value={c.rateToBase}
                      onChange={(e) => handleCurrencyRateChange(c.code, e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--brand-500)', fontWeight: 600, padding: '6px 0' }}>
                    1 {baseCurrency} = 1.00 (المرجع الأساسي)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. تصدير واستيراد البيانات والنسخ الاحتياطي (Backup & Restore) */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={22} color="var(--brand-500)" />
          <span>النسخ الاحتياطي وتصدير البيانات</span>
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          بياناتك محفوظة محلياً في متصفحك. يمكنك تنزيل نسخة احتياطية واستعادتها في أي وقت أو تصديرها لملف Excel.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {/* تصدير JSON كامل */}
          <button className="btn btn-primary btn-sm" onClick={handleExportJson}>
            <Download size={16} />
            <span>تصدير نسخة احتياطية كاملة (JSON)</span>
          </button>

          {/* استيراد JSON كامل */}
          <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} />
            <span>استعادة نسخة احتياطية (استيراد JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            style={{ display: 'none' }}
          />

          {/* تصدير CSV للشهر الحالي */}
          <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
            <FileSpreadsheet size={16} color="#10b981" />
            <span>تصدير مصاريف هذا الشهر (CSV / Excel)</span>
          </button>
        </div>
      </div>

      {/* 4. أدوات المطور والتجربة ومسح البيانات */}
      <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
          إدارة النظام والبيانات التجريبية
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          أدوات للمساعدة في اختبار كافة وظائف التطبيق أو تصفير البيانات للبدء من الصفر.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {/* زر توليد بيانات تجريبية */}
          <button className="btn btn-secondary btn-sm" onClick={handleGenerateDemo} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
            <Sparkles size={16} color="#f59e0b" />
            <span>توليد بيانات تجريبية واقعية لأشهر سابقة</span>
          </button>

          {/* زر مسح البيانات بالكامل */}
          <button className="btn btn-danger btn-sm" onClick={handleClearAll}>
            <Trash2 size={16} />
            <span>مسح جميع البيانات والبدء من الصفر</span>
          </button>
        </div>
      </div>
    </div>
  );
}
