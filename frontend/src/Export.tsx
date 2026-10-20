import { useState, useEffect } from 'react';
import { getLayers, getLayerGeoJSON } from './api';

export default function Export({ onBack }: { onBack: () => void }) {
  const [layers, setLayers] = useState<any[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLayers().then(data => {
      setLayers(data);
      if (data.length > 0) setSelectedLayer(data[0].id);
    });
  }, []);

  const getLayerName = () => layers.find(l => l.id === selectedLayer)?.name || 'layer';
  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const fetchData = async () => {
    if (!selectedLayer) return null;
    return await getLayerGeoJSON(selectedLayer);
  };

  const exportGeoJSON = async () => {
    setLoading(true);
    const data = await fetchData();
    if (data) downloadFile(JSON.stringify(data, null, 2), `${getLayerName()}.geojson`, 'application/json');
    setLoading(false);
  };

  const exportCSV = async () => {
    setLoading(true);
    const data = await fetchData();
    if (!data || !data.features.length) { alert('الطبقة فارغة'); setLoading(false); return; }
    
    // BOM لضمان ظهور العربي في Excel
    let csv = '\ufeffName,Description,Category,Type,Longitude,Latitude\n';
    data.features.forEach((f: any) => {
      const p = f.properties || {};
      let lon = '', lat = '';
      if (f.geometry.type === 'Point') {
        lon = f.geometry.coordinates[0];
        lat = f.geometry.coordinates[1];
      }
      csv += `"${p.name||''}","${p.description||''}","${p.category||''}",${f.geometry.type},${lon},${lat}\n`;
    });
    downloadFile(csv, `${getLayerName()}.csv`, 'text/csv;charset=utf-8');
    setLoading(false);
  };

  const exportKML = async () => {
    setLoading(true);
    const data = await fetchData();
    if (!data) { setLoading(false); return; }
    
    let kml = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n';
    kml += `<name>${getLayerName()}</name>\n`;
    data.features.forEach((f: any) => {
      const p = f.properties || {};
      if (f.geometry.type === 'Point') {
        const [lon, lat] = f.geometry.coordinates;
        kml += `<Placemark>\n<name>${p.name || 'نقطة'}</name>\n<description>${p.description || ''}</description>\n<Point><coordinates>${lon},${lat},0</coordinates></Point>\n</Placemark>\n`;
      } else if (f.geometry.type === 'LineString') {
        const coords = f.geometry.coordinates.map((c: any) => `${c[0]},${c[1]},0`).join(' ');
        kml += `<Placemark>\n<name>${p.name || 'خط'}</name>\n<LineString><coordinates>${coords}</coordinates></LineString>\n</Placemark>\n`;
      } else if (f.geometry.type === 'Polygon') {
        const coords = f.geometry.coordinates[0].map((c: any) => `${c[0]},${c[1]},0`).join(' ');
        kml += `<Placemark>\n<name>${p.name || 'مضلع'}</name>\n<Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon>\n</Placemark>\n`;
      }
    });
    kml += '</Document>\n</kml>';
    downloadFile(kml, `${getLayerName()}.kml`, 'application/vnd.google-earth.kml+xml');
    setLoading(false);
  };

  const exportDXF = async () => {
    setLoading(true);
    const data = await fetchData();
    if (!data) { setLoading(false); return; }
    
    let dxf = '0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';
    data.features.forEach((f: any) => {
      if (f.geometry.type === 'Point') {
        const [x, y] = f.geometry.coordinates;
        dxf += `0\nPOINT\n8\nEHDATHI\n10\n${x}\n20\n${y}\n30\n0.0\n`;
      } else if (f.geometry.type === 'LineString' || f.geometry.type === 'Polygon') {
        const coords = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates;
        for (let i = 0; i < coords.length - 1; i++) {
          dxf += `0\nLINE\n8\nEHDATHI\n10\n${coords[i][0]}\n20\n${coords[i][1]}\n30\n0.0\n11\n${coords[i+1][0]}\n21\n${coords[i+1][1]}\n31\n0.0\n`;
        }
      }
    });
    dxf += '0\nENDSEC\n0\nEOF';
    downloadFile(dxf, `${getLayerName()}.dxf`, 'application/dxf');
    setLoading(false);
  };

  const exportTXT = async () => {
    setLoading(true);
    const data = await fetchData();
    if (!data) { setLoading(false); return; }
    
    let txt = '\ufeffPN,Easting,Northing,Elevation,Code\n';
    let counter = 1;
    data.features.forEach((f: any) => {
      if (f.geometry.type === 'Point') {
        const [x, y] = f.geometry.coordinates;
        const p = f.properties || {};
        txt += `${counter},${x},${y},0,${p.name || 'PT'}\n`;
        counter++;
      }
    });
    downloadFile(txt, `${getLayerName()}.txt`, 'text/plain;charset=utf-8');
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '1rem' }}>← عودة للرئيسية</button>
        
        <div className="transform-container" style={{ maxWidth: '100%' }}>
          <h2>📤 التصدير الاحترافي</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>صدّر بياناتك مباشرة لبرامج ArcGIS, AutoCAD, Google Earth, Total Station</p>
          
          <div className="form-group">
            <label>اختر الطبقة</label>
            <select value={selectedLayer || ''} onChange={(e) => setSelectedLayer(Number(e.target.value))}>
              {layers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={exportGeoJSON} disabled={loading} style={{ padding: '1.2rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Tajawal' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🗺️</div>
              <div style={{ fontWeight: 'bold' }}>GeoJSON</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>ArcGIS / QGIS</div>
            </button>
            
            <button onClick={exportCSV} disabled={loading} style={{ padding: '1.2rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Tajawal' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: 'bold' }}>CSV / Excel</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Easting & Northing</div>
            </button>
            
            <button onClick={exportKML} disabled={loading} style={{ padding: '1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Tajawal' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🌍</div>
              <div style={{ fontWeight: 'bold' }}>Google Earth</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>KML</div>
            </button>
            
            <button onClick={exportDXF} disabled={loading} style={{ padding: '1.2rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Tajawal' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📐</div>
              <div style={{ fontWeight: 'bold' }}>AutoCAD</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>DXF</div>
            </button>
            
            <button onClick={exportTXT} disabled={loading} style={{ padding: '1.2rem', background: '#ec4899', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Tajawal' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📡</div>
              <div style={{ fontWeight: 'bold' }}>Total Station</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>PN, E, N, Z</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}