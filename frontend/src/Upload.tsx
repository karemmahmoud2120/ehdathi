import { useState } from 'react';

export default function Upload({ onBack }: { onBack: () => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.geojson') && !file.name.endsWith('.json')) {
      setError('الرجاء رفع ملف GeoJSON صالح');
      return;
    }

    setFileName(file.name);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target?.result as string);
        // حفظ الملف في الـ LocalStorage مؤقتاً لقراءته من الخريطة
        localStorage.setItem('uploaded_geojson', JSON.stringify(geojson));
        alert('تم رفع الملف بنجاح! سيتم عرضه على الخريطة.');
        onBack();
      } catch (err) {
        setError('الملف غير صالح أو ليس بصيغة GeoJSON صحيحة');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '1rem' }}>عودة للرئيسية</button>
        <div className="transform-container" style={{ textAlign: 'center' }}>
          <h2>📤 رفع بيانات GIS</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>قم برفع ملف GeoJSON لعرضه على الخريطة فوراً</p>
          
          <div style={{ border: '2px dashed #334155', borderRadius: '16px', padding: '3rem 1rem', cursor: 'pointer', position: 'relative' }}>
            <input 
              type="file" 
              accept=".geojson,.json" 
              onChange={handleFileUpload}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <div style={{ color: 'var(--gold)', fontWeight: 'bold' }}>اضغط لاختيار ملف</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>يدعم .geojson و .json</div>
          </div>

          {fileName && <div style={{ marginTop: '1rem', color: 'var(--turquoise)' }}>تم اختيار: {fileName}</div>}
          {error && <div style={{ marginTop: '1rem', color: '#dc3545' }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
