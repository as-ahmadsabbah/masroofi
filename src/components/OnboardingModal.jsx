import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2, Wallet, Calendar, PieChart } from 'lucide-react';
import { DEFAULT_CURRENCIES } from '../constants/currencies';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export default function OnboardingModal({ isOpen, onComplete, initialSettings }) {
  const [step, setStep] = useState(1);
  const [salary, setSalary] = useState(initialSettings?.salary || 10000);
  const [currency, setCurrency] = useState(initialSettings?.baseCurrency || 'SAR');
  const [startDay, setStartDay] = useState(initialSettings?.financialMonthStartDay || 25);
  const [apply503020, setApply503020] = useState(true);

  if (!isOpen) return null;

  const handleFinish = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onComplete({
      salary: Number(salary) || 10000,
      baseCurrency: currency,
      financialMonthStartDay: Number(startDay) || 25,
      isInitialized: true,
      apply503020,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px', padding: '36px 30px' }}>
        {/* شريط الخطوات */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: step === s ? '36px' : '10px',
                height: '10px',
                borderRadius: 'var(--radius-full)',
                background: step === s ? 'var(--brand-500)' : step > s ? 'var(--brand-700)' : 'var(--border-subtle)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </div>

        {/* الشعار والترحيب */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            margin: '0 auto 12px',
            overflow: 'hidden',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 6px 18px rgba(16, 185, 129, 0.25)',
            background: '#ffffff',
          }}>
            <img src="/logo.png" alt="مصروفي" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>مرحباً بك في "مصروفي"</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            دعنا نجهز ميزانيتك المالية خلال دقيقة واحدة لتتحكم في راتبك بذكاء
          </p>
        </div>

        {/* الخطوة 1: الراتب والعملة */}
        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wallet size={18} color="var(--brand-500)" />
                <span>كم راتبك الشهري الصافي؟</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="مثال: 10000"
                autoFocus
                style={{ fontSize: '1.2rem', fontWeight: 700 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">العملة الأساسية لحساباتك</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {DEFAULT_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol} - {c.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={!salary || salary <= 0}
              >
                <span>التالي: دورة الراتب</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 2: موعد نزول الراتب والشهر المالي */}
        {step === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={18} color="var(--brand-500)" />
                <span>في أي يوم من الشهر الميلادي ينزل راتبك؟</span>
              </label>
              <select
                className="form-select"
                value={startDay}
                onChange={(e) => setStartDay(Number(e.target.value))}
              >
                <option value={1}>1 من كل شهر (بداية الشهر الميلادي)</option>
                <option value={25}>25 من كل شهر (موعد صرف رواتب القطاع العام في الخليج)</option>
                <option value={27}>27 من كل شهر (رواتب الحكومة والشركات)</option>
                <option value={28}>28 من كل شهر</option>
                <option value={30}>30 من كل شهر</option>
                {[...Array(28)].map((_, i) => (
                  i + 1 !== 1 && i + 1 !== 25 && i + 1 !== 27 && i + 1 !== 28 ? (
                    <option key={i + 1} value={i + 1}>
                      يوم {i + 1} من الشهر
                    </option>
                  ) : null
                ))}
              </select>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px', fontSize: '0.8rem' }}>
                * سيتم تدوير مصاريفك وتقاريرك بناءً على هذه الدورة لتطابق حقيقة حسابك البنكي.
              </small>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                <ArrowRight size={16} />
                <span>السابق</span>
              </button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                <span>التالي: توزيع الميزانية</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        )}

        {/* الخطوة 3: اقتراح الميزانية الذكية */}
        {step === 3 && (
          <div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PieChart size={18} color="var(--brand-500)" />
                <span>توزيع الميزانية الذكية المقترحة</span>
              </label>

              <div
                style={{
                  background: 'var(--bg-app)',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <Sparkles size={20} color="#f59e0b" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>قاعدة 50 / 30 / 20 الذهبية</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  نوصي بتوزيع راتبك ({(Number(salary) || 0).toLocaleString('ar-SA')} {currency}) كالتالي:
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>🏠 50% احتياجات أساسية (سكن، فواتير، طعام، صحة)</span>
                    <strong style={{ color: '#3b82f6' }}>{((Number(salary) || 0) * 0.5).toLocaleString('ar-SA')} {currency}</strong>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>✨ 30% رغبات ونمط حياة (ترفيه، تسوق، نزهات)</span>
                    <strong style={{ color: '#8b5cf6' }}>{((Number(salary) || 0) * 0.3).toLocaleString('ar-SA')} {currency}</strong>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>💰 20% ادخار واستثمار للمستقبل</span>
                    <strong style={{ color: '#10b981' }}>{((Number(salary) || 0) * 0.2).toLocaleString('ar-SA')} {currency}</strong>
                  </li>
                </ul>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={apply503020}
                  onChange={(e) => setApply503020(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--brand-500)' }}
                />
                <span>تطبيق هذا التوزيع تلقائياً على فئاتي (يمكنك تعديل أي نسبة لاحقاً)</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                <ArrowRight size={16} />
                <span>السابق</span>
              </button>
              <button className="btn btn-primary" onClick={handleFinish}>
                <CheckCircle2 size={16} />
                <span>انطلق وابدأ الإدارة الآن!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
