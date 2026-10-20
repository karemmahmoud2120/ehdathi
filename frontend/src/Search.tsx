import { useState } from 'react';
import maplibregl from 'maplibre-gl';

export default function Search({ mapRef, onClose }: { mapRef: React.MutableRefObject<maplibregl.Map | undefined>, onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState<maplibregl.Marker | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=eg&limit=5`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToLocation = (lat: number, lon: number) => {
    if (mapRef.current) {
      // تحريك الخريطة وهي حية
      mapRef.current.flyTo({ center: [lon, lat], zoom: 15 });
      
      // إضافة علامة ذهبية للمكان المختار
      marker?.remove();
      const newMarker = new maplibregl.Marker({ color: '#D4AF37' })
        .setLngLat([lon, lat])
        .addTo(mapRef.current);
      setMarker(newMarker);
      
      // إغلاق نافذة البحث والعودة للخريطة
      onClose();
    }
  };

  return (
    <div className="search-overlay">
      <div className="search-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--gold)', margin: 0 }}>🔍 البحث بالعنوان</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="ابحث عن مكان في مصر (مثال: برج القاهرة)" 
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: 'white', fontFamily: 'Cairo' }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 1.5rem' }} disabled={loading}>
            {loading ? '...' : 'بحث'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '50vh', overflowY: 'auto' }}>
          {results.length === 0 && query && !loading && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>لا توجد نتائج، جرب اسماً آخر</div>
          )}
          {results.map((r, i) => (
            <div key={i} onClick={() => goToLocation(Number(r.lat), Number(r.lon))} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', border: '1px solid #334155', transition: 'all 0.2s' }} className="search-result-item">
              <div style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{r.display_name.split(',')[0]}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{r.display_name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
