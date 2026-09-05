import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Settings,
  Shield,
  Download,
  Upload,
  Sparkles,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  Target,
  History,
  PiggyBank,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { DEFAULT_CURRENCIES } from '../../constants/currencies';

export default function SettingsView({
  settings,
  onUpdateSettings,
  onDataReload,
}) {
  const fileInputRef = useRef(null);

  const [salary, setSalary] = useState(settings?.salary || 4000);
  const [baseCurrency, setBaseCurrency] = useState(settings?.baseCurrency || 'ILS');
  const [usdRate, setUsdRate] = useState(
    settings?.currencies?.find(c => c.code === 'USD')?.rateToBase || 3.65
  );
  const [priorSpentAmount, setPriorSpentAmount] = useState(settings?.priorSpentAmount || 0);
  const [goalType, setGoalType] = useState(settings?.goalType || 'savings');
  const [goalTargetAmount, setGoalTargetAmount] = useState(settings?.goalTargetAmount || 1000);
  const [pinLockEnabled, setPinLockEnabled] = useState(!!settings?.pinLockEnabled);
  const [pinCode, setPinCode] = useState(settings?.pinHash || '');

  const currencySymbol = baseCurrency === 'USD' ? '$' : '₪';

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    if (pinLockEnabled && pinCode.length !== 4) {
      alert('يجب أن يتكون رمز PIN من 4 أرقام بالضبط!');
      return;
    }

    const updatedCurrencies = [
      { code: 'ILS', symbol: '₪', name: 'شيكل', rateToBase: 1.0, isDefaultBase: baseCurrency === 'ILS' },
      { code: 'USD', symbol: '$', name: 'دولار أمريكي', rateToBase: Number(usdRate) || 3.65, isDefaultBase: baseCurrency === 'USD' },
    ];

    const updated = {
      ...settings,
      salary: Number(salary) || 4000,
      baseCurrency,
      currencies: updatedCurrencies,
      priorSpentAmount: Number(priorSpentAmount) || 0,
      goalType,
      goalTargetAmount: Number(goalTargetAmount) || 0,
      pinLockEnabled,
      pinHash: pinLockEnabled ? pinCode : '',
    };

    onUpdateSettings(updated);
    confetti({ particleCount: 50, spread: 60 });
    alert('تم حفظ جميع الإعدادات بنجاح!');
  };

  // تصدير نسخة احتياطية JSON
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

  // استيراد JSON
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

  // تصدير CSV
  const handleExportCsv = () => {
    const csvContent = storageService.exportExpensesAsCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `masroofi_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // توليد بيانات تجريبية
  const handleGenerateDemo = () => {
    if (window.confirm('هل تريد ملء التطبيق ببيانات تجريبية بالشيكل (دخان، قهوة، أكل، مواصلات، اشتراك) لتجربة الشاشة الرئيسية والتوقع والرسم البياني؟')) {
      storageService.generateDemoData();
      confetti({ particleCount: 90, spread: 70 });
      alert('تم تحميل البيانات التجريبية بنجاح!');
      onDataReload();
    }
  };

  // مسح جميع البيانات
  const handleClearAll = () => {
    if (window.confirm('تحذير: هل أنت متأكد من مسح جميع البيانات والبدء من الصفر؟')) {
      storageService.clearAllData();
      alert('تم مسح جميع البيانات.');
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. الإعدادات المالية والراتب والعملة */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={20} color="var(--brand-500)" />
          <span>الراتب والعملة والهدف المالي</span>
        </h2>

        <form onSubmit={handleSaveGeneral}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">الراتب الشهري الصافي</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
                style={{ fontSize: '1.2rem', fontWeight: 800 }}
              />
            </div>

            <div>
              <label className="form-label">العملة الأساسية للحسابات</label>
              <select
                className="form-select"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                style={{ fontSize: '1rem', fontWeight: 700 }}
              >
                <option value="ILS">شيكل فلسطيني (₪ - ILS)</option>
                <option value="USD">دولار أمريكي ($ - USD)</option>
              </select>
            </div>

            <div>
              <label className="form-label">سعر صرف الدولار مقابل الشيكل (1$ = كم ₪)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
                style={{ fontSize: '1rem' }}
              />
            </div>
          </div>

          {/* الرصيد السابق غير المسجل عند بدء استخدام التطبيق بمنتصف الشهر */}
          <div style={{
            background: 'var(--bg-app)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <History size={18} color="var(--brand-500)" />
              <strong style={{ fontSize: '0.94rem' }}>المصروفات السابقة قبل استخدام التطبيق لهذا الشهر</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              إذا بدأت باستخدام التطبيق بعد استلام الراتب بأيام وصرفت منه جزءاً دون تسجيل، ضع المبلغ هنا ليتم خصمه تلقائياً من الراتب واحتسابه في مجموع الشهر.
            </p>
            <div style={{ maxWidth: '280px' }}>
              <input
                type="number"
                step="any"
                className="form-input"
                value={priorSpentAmount}
                onChange={(e) => setPriorSpentAmount(e.target.value)}
                placeholder="0"
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* الهدف المالي الشهري */}
          <div style={{
            background: 'var(--bg-app)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Target size={18} color="#3b82f6" />
              <strong style={{ fontSize: '0.94rem' }}>الهدف المالي الشهري (ادخار أو سقف مصاريف)</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              حدد ما إذا كنت تسعى لادخار مبلغ محدد، أو وضع سقف أقصى لا تتجاوزه مصاريفك، ليتابع التطبيق التزامك به يومياً.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label">نوع الهدف</label>
                <select
                  className="form-select"
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="savings">🎯 هدف ادخار شهري</option>
                  <option value="spend_limit">🛡️ سقف أقصى للمصاريف</option>
                  <option value="none">بدون هدف مالي محدد</option>
                </select>
              </div>

              {goalType !== 'none' && (
                <div>
                  <label className="form-label">المبلغ المستهدف ({currencySymbol})</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={goalTargetAmount}
                    onChange={(e) => setGoalTargetAmount(e.target.value)}
                    placeholder="مثال: 1000"
                    style={{ fontSize: '1.1rem', fontWeight: 800 }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* قفل التطبيق بالرقم السري */}
          <div style={{
            background: 'var(--bg-app)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '18px',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: pinLockEnabled ? '10px' : '0' }}>
              <input
                type="checkbox"
                checked={pinLockEnabled}
                onChange={(e) => setPinLockEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-500)' }}
              />
              <div>
                <strong style={{ fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="var(--brand-500)" />
                  <span>تفعيل قفل الأمان برقم سري (PIN Lock)</span>
                </strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  طلب رمز مكوّن من 4 أرقام عند فتح التطبيق لحماية خصوصية مصاريفك
                </span>
              </div>
            </label>

            {pinLockEnabled && (
              <div style={{ maxWidth: '240px', marginTop: '8px' }}>
                <input
                  type="password"
                  maxLength={4}
                  className="form-input"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: 900 }}
                  required={pinLockEnabled}
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={16} />
            <span>حفظ الإعدادات</span>
          </button>
        </form>
      </div>

      {/* 2. النسخ الاحتياطي وتصدير البيانات */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} color="var(--brand-500)" />
          <span>النسخ الاحتياطي وتصدير البيانات</span>
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          بياناتك مخزنة محلياً في متصفحك. يمكنك تنزيل نسخة احتياطية أو تصدير المصاريف لـ Excel.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button className="btn btn-primary btn-sm" onClick={handleExportJson}>
            <Download size={15} />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
            <Upload size={15} />
            <span>استعادة نسخة احتياطية (استيراد JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            style={{ display: 'none' }}
          />

          <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
            <FileSpreadsheet size={15} color="#10b981" />
            <span>تصدير ملف Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* 3. أدوات التجربة ومسح البيانات */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
          بيانات تجريبية وإعادة ضبط
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          جرب التطبيق ببيانات واقعية فوراً (شيكل، دخان، قهوة، أكل، مواصلات).
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleGenerateDemo} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
            <Sparkles size={15} color="#f59e0b" />
            <span>توليد بيانات تجريبية بالشيكل (دخان، قهوة، أكل)</span>
          </button>

          <button className="btn btn-danger btn-sm" onClick={handleClearAll}>
            <Trash2 size={15} />
            <span>تصفير جميع البيانات والبدء من الصفر</span>
          </button>
        </div>
      </div>
    </div>
  );
}
