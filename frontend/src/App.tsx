import { useState, useRef, useEffect, useCallback } from 'react';
import SplashScreen from './SplashScreen';
import Dashboard from './Dashboard';
import MapView from './MapView';
import AI from './AI';
import Upload from './Upload';
import Login from './Login';
import LayersManagement from './LayersManagement';
import About from './About';
import Stats from './Stats';
import Transform from './Transform';
import Export from './Export';
import LandCalculator from './LandCalculator';
import { transformPoints, getLayers, createLayer, addFeature } from './api';
import maplibregl from 'maplibre-gl';
import InstallPWA from './InstallPWA';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'dashboard' | 'map' | 'transform' | 'ai' | 'upload' | 'layers' | 'about' | 'stats' | 'export' | 'calculator'>('dashboard');
  const [mapStyle, setMapStyle] = useState('streets');
  const [activeTool, setActiveTool] = useState('none');
  const [isHeatmapOn, setIsHeatmapOn] = useState(false);

  const [toasts, setToasts] = useState<{id: number, msg: string, type: string}[]>([]);
  const showToast = useCallback((msg: string, type: 'success'|'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const [measureResult, setMeasureResult] = useState<string | null>(null);
  const handleMeasure = useCallback((res: string) => setMeasureResult(res), []);

  const [pendingGeometry, setPendingGeometry] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', desc: '', type: '' });

  const [layers, setLayers] = useState<any[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [layerColor, setLayerColor] = useState('#D4AF37');
  const [newLayerName, setNewLayerName] = useState('');

  const mapRef = useRef<maplibregl.Map>();
  const mapComponentRef = useRef<any>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setUser({ name: 'مستخدم إحداثي' });
  }, []);

  useEffect(() => {
    (window as any).deleteMapFeature = async (id: number) => {
      if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
      await fetch(`/api/layers/features/${id}`, { method: 'DELETE' });
      if (mapRef.current) mapRef.current.fire('reload-layer');
      showToast('✅ تم حذف العنصر');
    };
  }, [showToast]);

  const loadLayers = useCallback(async () => {
    try {
      const data = await getLayers(); setLayers(data);
      if (data.length > 0 && !selectedLayer) {
        setSelectedLayer(data[0].id);
        setLayerColor(data[0].color || '#D4AF37');
      }
    } catch (e) { console.error(e); }
  }, [selectedLayer]);

  const handleCreateLayer = useCallback(async () => {
    if (!newLayerName.trim()) return;
    await createLayer(newLayerName); setNewLayerName(''); loadLayers();
    showToast('✅ تم إنشاء الطبقة بنجاح');
  }, [newLayerName, loadLayers, showToast]);

  const handleFeatureCreated = useCallback((geometry: any) => {
    if (!selectedLayer) return showToast('⚠️ الرجاء اختيار طبقة أولاً', 'error');
    setPendingGeometry(geometry);
  }, [selectedLayer, showToast]);

  const saveFeature = async () => {
    if (!pendingGeometry || !selectedLayer) return;
    const properties = { name: formData.name || 'بدون اسم', description: formData.desc, category: formData.type };
    await addFeature(selectedLayer, pendingGeometry, properties);
    setPendingGeometry(null); setFormData({ name: '', desc: '', type: '' });
    if (mapRef.current) mapRef.current.fire('reload-layer');
    showToast('✅ تم حفظ العنصر بنجاح');
  };

  const handleLogout = () => { localStorage.removeItem('token'); setUser(null); setView('dashboard'); };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    <div>
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: t.type === 'error' ? '#dc3545' : '#22c55e', color: 'white', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', fontWeight: 'bold' }}>{t.msg}</div>
        ))}
      </div>

      {view === 'dashboard' && (
        <div>
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }}>
             <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', marginRight: '15px' }}>خروج</button>
             <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>أهلاً، {user.name}</span>
          </div>
          <Dashboard onSelectService={(s) => { 
            if (s === 'map') { loadLayers(); setView('map'); setActiveTool('none'); }
            else if (s === 'routing') { loadLayers(); setView('map'); setActiveTool('route'); }
            else setView(s as any); 
          }} />
        </div>
      )}

      {view === 'layers' && <LayersManagement onBack={() => setView('dashboard')} onOpenMap={() => { loadLayers(); setView('map'); }} />}

      {view === 'map' && (
        <div className="map-layout">
          <div className="map-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><span className='egypt-flag-small'>🇪🇬</span> إحداثي</h2>
              <button className="btn-back" onClick={() => setView('dashboard')}>عودة</button>
            </div>
            <div className="sidebar-section" style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', margin: '0 0 10px 0', color: 'var(--turquoise)' }}>الطبقات</h3>
              {layers.map((l) => (
                <div
                  key={l.id}
                  onClick={() => {
                    setSelectedLayer(l.id);
                    setLayerColor(l.color || '#D4AF37');
                    mapComponentRef.current?.zoomToLayer();
                  }}
                  className={`layer-item ${selectedLayer === l.id ? 'active' : ''}`}
                  style={{ borderRight: selectedLayer === l.id ? `4px solid ${l.color}` : 'none' }}
                >
                  {l.name}
                </div>
              ))}
              <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                <input value={newLayerName} onChange={(e) => setNewLayerName(e.target.value)} placeholder="طبقة جديدة..." style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
                <button onClick={handleCreateLayer} style={{ padding: '8px 12px', background: 'var(--gold)', color: 'var(--lapis)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              </div>
            </div>
            {measureResult && (
              <div style={{ background: 'rgba(64, 224, 208, 0.1)', border: '1px solid var(--turquoise)', padding: '10px', borderRadius: '8px', marginTop: '10px', fontSize: '0.9rem', textAlign: 'center', color: 'var(--turquoise)' }}>
                {measureResult}
                <button onClick={() => setMeasureResult(null)} style={{ display: 'block', margin: '5px auto 0', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>مسح</button>
              </div>
            )}
          </div>

          <div className="map-main">
            <MapView
              ref={mapComponentRef}
              onMapReady={(m) => { mapRef.current = m; }}
              selectedLayerId={selectedLayer}
              layerColor={layerColor}
              mapStyle={mapStyle}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              onFeatureCreated={handleFeatureCreated}
              onMeasure={handleMeasure}
              onToast={showToast}
              showHeatmap={isHeatmapOn}
            />

            <div className="floating-toolbar">
              <button className={activeTool === 'point' ? 'active' : ''} onClick={() => setActiveTool(activeTool === 'point' ? 'none' : 'point')} title="إضافة نقطة">📍</button>
              <button className={activeTool === 'polygon' ? 'active' : ''} onClick={() => setActiveTool(activeTool === 'polygon' ? 'none' : 'polygon')} title="رسم مضلع">⬛</button>
              <button className={activeTool === 'measure_distance' ? 'active' : ''} onClick={() => setActiveTool(activeTool === 'measure_distance' ? 'none' : 'measure_distance')} title="قياس مسافة">📏</button>
              <button className={activeTool === 'measure_area' ? 'active' : ''} onClick={() => setActiveTool(activeTool === 'measure_area' ? 'none' : 'measure_area')} title="قياس مساحة">📐</button>
              <button className={activeTool === 'route' ? 'active' : ''} onClick={() => setActiveTool(activeTool === 'route' ? 'none' : 'route')} title="توجيه متعدد">🚗</button>
              
              <div style={{ height: '1px', background: '#334155', margin: '5px 0' }}></div>
              
              <button onClick={() => setIsHeatmapOn(!isHeatmapOn)} title="الخريطة الحرارية" style={{ color: isHeatmapOn ? '#e63946' : 'inherit' }}>🔥</button>
              <button onClick={() => mapComponentRef.current?.exportMapImage()} title="تصدير كصورة">📸</button>
              
              {(activeTool === 'polygon' || activeTool === 'measure_area' || activeTool === 'route') && (
                <button onClick={() => {
                  if (activeTool === 'route') mapComponentRef.current?.finishRouting();
                  else mapComponentRef.current?.finishDrawing();
                }} title="حفظ وإنهاء" style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', padding: '0 15px', display: 'flex', alignItems: 'center', gap: '5px' }}>✔️</button>
              )}
            </div>

            <div className="map-style-btns">
              <button className={mapStyle === 'streets' ? 'active' : ''} onClick={() => setMapStyle('streets')}>شوارع</button>
              <button className={mapStyle === 'satellite' ? 'active' : ''} onClick={() => setMapStyle('satellite')}>أقمار</button>
              <button className={mapStyle === 'dark' ? 'active' : ''} onClick={() => setMapStyle('dark')}>ليلي</button>
            </div>

            {pendingGeometry && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid var(--gold)', width: '90%', maxWidth: '450px' }}>
                  <h3 style={{ color: 'var(--gold)', marginTop: 0, textAlign: 'center' }}>إضافة بيانات العنصر</h3>
                  <div className="form-group"><label>الاسم</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: فرع الإسكندرية" autoFocus /></div>
                  <div className="form-group"><label>الوصف</label><input value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="تفاصيل إضافية..." /></div>
                  <div className="form-group"><label>التصنيف</label><input value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="مثال: مبنى، محطة، مزرعة..." /></div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                    <button onClick={saveFeature} className="btn-primary" style={{ flex: 1 }}>حفظ في الطبقة</button>
                    <button onClick={() => setPendingGeometry(null)} style={{ flex: 1, background: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Tajawal' }}>إلغاء</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'transform' && <Transform onBack={() => setView('dashboard')} />}
      {view === 'export' && <Export onBack={() => setView('dashboard')} />}
      {view === 'calculator' && <LandCalculator onBack={() => setView('dashboard')} />}
      {view === 'ai' && <AI onBack={() => setView('dashboard')} />}
      {view === 'upload' && <Upload onBack={() => { setView('map'); loadLayers(); }} />}
      {view === 'about' && <About onBack={() => setView('dashboard')} />}
      {view === 'stats' && <Stats onBack={() => setView('dashboard')} />}
    </div>
  );
}
      <InstallPWA />