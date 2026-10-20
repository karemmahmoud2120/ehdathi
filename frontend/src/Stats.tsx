import { useEffect, useState } from 'react';

export default function Stats({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState({ layers: 0, features: 0 });

  useEffect(() => {
    fetch('/api/layers/stats')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="modern-dashboard" style={{ padding: '2rem' }}>
      <button className="btn-back" onClick={onBack} style={{ marginBottom: '2rem' }}>← عودة للرئيسية</button>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="glowing-text">إحصائيات النظام</h1>
        <p style={{ color: '#94a3b8', marginTop: '1rem' }}>نظرة عامة على البيانات المخزنة في قاعدة بيانات إحداثي</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '4rem', flexWrap: 'wrap' }}>
          <div className="stat-card">
            <div className="stat-number">{data.layers}</div>
            <div className="stat-label">طبقة مسجلة</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{data.features}</div>
            <div className="stat-label">عنصر جغرافي</div>
          </div>
        </div>
      </div>
    </div>
  );
}
