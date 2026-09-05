import React, { useState } from 'react';
import { X, Check, Wallet, PiggyBank, PlusCircle, HelpCircle } from 'lucide-react';
import { formatDateIso, formatCurrency } from '../utils/dateUtils';

export default function AddIncomeModal({
  isOpen,
  onClose,
  onSave,
  settings,
}) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(settings?.baseCurrency || 'SAR');
  const [source, setSource] = useState('عمل حر / فريلانس');
  const [destination, setDestination] = useState('savings'); // savings | budget | free
  const [date, setDate] = useState(formatDateIso(new Date()));
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const baseCurrency = settings?.baseCurrency || 'SAR';
  const selectedCurrencyObj = settings?.currencies?.find(c => c.code === currency);
  const baseCurrencyObj = settings?.currencies?.find(c => c.code === baseCurrency);
  const rate = selectedCurrencyObj ? (selectedCurrencyObj.rateToBase || 1) : 1;
  const convertedAmount = (Number(amount) || 0) * rate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    onSave({
      amount: Number(amount),
      currency,
      convertedAmount,
      source,
      destination,
      date,
      note,
    });

    setAmount('');
    setNote('');
    onClose();
  };

  const quickSources = ['مشروع فريلانس', 'مكافأة عمل', 'هدية مالية', 'بيع غرض مستعمل', 'أرباح استثمار', 'استرداد نقدي'];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        {/* رأس النافذة */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Wallet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>تسجيل دخل إضافي</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>فريلانس، مكافأة، مبيعات، أو هدايا نقدية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* المبلغ والعملة */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">مبلغ الدخل *</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                required
                style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-500)' }}
              />
            </div>
            <div>
              <label className="form-label">العملة</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {settings?.currencies?.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* سعر الصرف والتحويل الفوري */}
          {currency !== baseCurrency && Number(amount) > 0 && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
            }}>
              يساوي بالعملة الأساسية: <strong style={{ color: 'var(--brand-500)' }}>{formatCurrency(convertedAmount, baseCurrencyObj?.symbol)}</strong> (سعر الصرف: 1 {currency} = {rate} {baseCurrency})
            </div>
          )}

          {/* مصدر الدخل */}
          <div className="form-group">
            <label className="form-label">مصدر الدخل / التصنيف</label>
            <input
              type="text"
              className="form-input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="مثال: فريلانس تطوير موقع..."
              required
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {quickSources.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSource(q)}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* تحديد وجهة الدخل */}
          <div className="form-group">
            <label className="form-label">أين تريد توجيه هذا المبلغ؟ *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* الخيار 1: إضافة تلقائية للمدخرات */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: destination === 'savings' ? '2px solid var(--brand-500)' : '1px solid var(--border-subtle)',
                  background: destination === 'savings' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-app)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="destination"
                  value="savings"
                  checked={destination === 'savings'}
                  onChange={() => setDestination('savings')}
                  style={{ accentColor: 'var(--brand-500)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem' }}>
                    <PiggyBank size={16} color="var(--brand-500)" />
                    <span>إضافة تلقائية إلى المدخرات التراكمية (موصى به)</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    يُحفظ المبلغ مباشرة في رصيدك الادخاري ولا يُحسب ضمن ميزانية الصرف.
                  </div>
                </div>
              </label>

              {/* الخيار 2: توزيعه ضمن ميزانية الشهر الحالي */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: destination === 'budget' ? '2px solid var(--color-info)' : '1px solid var(--border-subtle)',
                  background: destination === 'budget' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-app)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="destination"
                  value="budget"
                  checked={destination === 'budget'}
                  onChange={() => setDestination('budget')}
                  style={{ accentColor: 'var(--color-info)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem' }}>
                    <PlusCircle size={16} color="var(--color-info)" />
                    <span>زيادة ميزانية الشهر الحالي المتاحة للصرف</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    يُضاف للراتب الشهري ليوسع السقف المالي للمصاريف لهذا الشهر.
                  </div>
                </div>
              </label>

              {/* الخيار 3: تركه كـ دخل حر */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: destination === 'free' ? '2px solid var(--color-purple)' : '1px solid var(--border-subtle)',
                  background: destination === 'free' ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-app)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="destination"
                  value="free"
                  checked={destination === 'free'}
                  onChange={() => setDestination('free')}
                  style={{ accentColor: 'var(--color-purple)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem' }}>
                    <HelpCircle size={16} color="var(--color-purple)" />
                    <span>تركه كـ "دخل حر" أقرر مصيره لاحقاً</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    يُسجل في الأرشيف ويبقى معلقاً لا يؤثر على الميزانية أو أهداف الادخار.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* التاريخ والملاحظات */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px', marginBottom: '22px' }}>
            <div>
              <label className="form-label">تاريخ الاستلام</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">ملاحظات إضافية</label>
              <input
                type="text"
                className="form-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="اسم العميل أو جهة الدفع..."
              />
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!amount || Number(amount) <= 0}
            >
              <Check size={18} />
              <span>إضافة الدخل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
