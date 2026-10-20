import { useState } from 'react';

export default function LandCalculator({ onBack }: { onBack: () => void }) {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('feddan');

  const units = {
    m2: { label: 'متر مربع (م²)', ratio: 1 },
    feddan: { label: 'فدان', ratio: 4200.83 },
    qirat: { label: 'قيراط', ratio: 175.035 },
    sahm: { label: 'سهم', ratio: 7.293 },
    hectare: { label: 'هكتار', ratio: 10000 },
    acre: { label: 'أكر (Acre)', ratio: 4046.86 },
  };

  const convert = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return null;
    const m2 = num * units[unit as keyof typeof units].ratio;
    return Object.entries(units).map(([key, u]) => ({
      key, label: u.label, value: m2 / u.ratio,
    }));
  };

  const results = convert();

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%' }}>
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '1rem' }}>← عودة للرئيسية</button>
        
        <div className="transform-container" style={{ maxWidth: '100%' }}>
          <h2>🏞️ حاسبة الأراضي المصرية</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>تحويل دقيق بين وحدات المساحة المصرية والعالمية</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label>القيمة</label>
              <input type="number" step="any" value={value} onChange={e => setValue(e.target.value)} placeholder="مثال: 5" />
            </div>
            <div className="form-group">
              <label>الوحدة</label>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                {Object.entries(units).map(([key, u]) => (
                  <option key={key} value={key}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          {results && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {results.map(r => (
                <div key={r.key} style={{
                  background: r.key === unit ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                  border: r.key === unit ? '2px solid var(--gold)' : '1px solid #334155',
                  padding: '1rem', borderRadius: '8px', textAlign: 'center'
                }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{r.label}</div>
                  <div style={{ color: r.key === unit ? 'var(--gold)' : 'var(--turquoise)', fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {r.value.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(64,224,208,0.1)', border: '1px solid var(--turquoise)', borderRadius: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <strong style={{ color: 'var(--turquoise)' }}>💡 معلومة:</strong> 1 فدان = 24 قيراط = 333.3 سهم ≈ 4200.83 متر مربع
          </div>
        </div>
      </div>
    </div>
  );
}