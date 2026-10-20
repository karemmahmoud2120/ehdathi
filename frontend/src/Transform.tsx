import { useState } from 'react';
import { transformPoints } from './api';

export default function Transform({ onBack }: { onBack: () => void }) {
  const [sourceSrid, setSourceSrid] = useState(4326);
  const [targetSrid, setTargetSrid] = useState(22992);
  const [x, setX] = useState('31.2357');
  const [y, setY] = useState('30.0444');
  const [result, setResult] = useState<{x: number, y: number} | null>(null);
  const [loading, setLoading] = useState(false);

  // حالة محول DMS
  const [dms, setDms] = useState({ d: 30, m: 2, s: 38.4, dir: 'N' });
  const [dmsResult, setDmsResult] = useState<number | null>(null);

  const handleTransform = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const pts = await transformPoints(sourceSrid, targetSrid, [{ x: Number(x), y: Number(y) }]);
      setResult(pts[0]);
    } catch (err) {
      alert('حدث خطأ أثناء التحويل، تأكد من صحة الإحداثيات');
    } finally {
      setLoading(false);
    }
  };

  const handleDmsToDd = (e: React.FormEvent) => {
    e.preventDefault();
    let dd = dms.d + dms.m / 60 + dms.s / 3600;
    if (dms.dir === 'S' || dms.dir === 'W') dd = -dd;
    setDmsResult(dd);
  };

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '1rem' }}>← عودة للرئيسية</button>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          {/* محول الأنظمة (WGS84 <-> UTM) */}
          <div className="transform-container" style={{ maxWidth: '100%', margin: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>🔄 تحويل الأنظمة</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>تحويل بين خطوط الطول والعرض (WGS84) ونظام UTM</p>
            
            <form onSubmit={handleTransform}>
              <div className="form-group">
                <label>النظام المصدر</label>
                <select value={sourceSrid} onChange={(e) => setSourceSrid(Number(e.target.value))}>
                  <option value={4326}>WGS 84 (Lat/Lon)</option>
                  <option value={22992}>Egypt Red Belt (UTM)</option>
                  <option value={3857}>Web Mercator</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>النظام الهدف</label>
                <select value={targetSrid} onChange={(e) => setTargetSrid(Number(e.target.value))}>
                  <option value={22992}>Egypt Red Belt (UTM)</option>
                  <option value={4326}>WGS 84 (Lat/Lon)</option>
                  <option value={3857}>Web Mercator</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>الإحداثي X (أو Lon)</label>
                  <input type="number" step="any" value={x} onChange={(e) => setX(e.target.value)} required dir="ltr" />
                </div>
                <div className="form-group">
                  <label>الإحداثي Y (أو Lat)</label>
                  <input type="number" step="any" value={y} onChange={(e) => setY(e.target.value)} required dir="ltr" />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'جاري التحويل...' : 'تحويل الآن'}
              </button>
            </form>

            {result && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(64, 224, 208, 0.1)', border: '1px solid var(--turquoise)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>النتيجة:</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--turquoise)', direction: 'ltr' }}>
                  X: {result.x.toFixed(4)} <br/> Y: {result.y.toFixed(4)}
                </div>
              </div>
            )}
          </div>

          {/* محول DMS */}
          <div className="transform-container" style={{ maxWidth: '100%', margin: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>🧭 الدرجات والدقائق</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>تحويل الإحداثيات من (درجة، دقيقة، ثانية) إلى النظام العشري</p>
            
            <form onSubmit={handleDmsToDd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>الدرجة (°)</label>
                  <input type="number" value={dms.d} onChange={(e) => setDms({...dms, d: Number(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label>الدقيقة (')</label>
                  <input type="number" value={dms.m} onChange={(e) => setDms({...dms, m: Number(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label>الثانية (")</label>
                  <input type="number" step="any" value={dms.s} onChange={(e) => setDms({...dms, s: Number(e.target.value)})} required />
                </div>
              </div>
              
              <div className="form-group">
                <label>الاتجاه</label>
                <select value={dms.dir} onChange={(e) => setDms({...dms, dir: e.target.value})}>
                  <option value="N">شمال (N)</option>
                  <option value="S">جنوب (S)</option>
                  <option value="E">شرق (E)</option>
                  <option value="W">غرب (W)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">تحويل إلى عشري</button>
            </form>

            {dmsResult !== null && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--gold)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>النظام العشري (DD):</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)' }}>
                  {dmsResult.toFixed(6)}°
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}