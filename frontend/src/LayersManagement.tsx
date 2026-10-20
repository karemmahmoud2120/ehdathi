import { useState, useEffect } from 'react';
import { getLayers, createLayer, updateLayerColor } from './api';

export default function LayersManagement({ onBack, onOpenMap }: { onBack: () => void, onOpenMap: () => void }) {
  const [layers, setLayers] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => { setLayers(await getLayers()); };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createLayer(newName);
    setNewName('');
    load();
  };

  const handleRename = async (id: number) => {
    if (!editName.trim()) return;
    await fetch(`/api/layers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName })
    });
    setEditingId(null);
    load();
  };

  const handleColorChange = async (id: number, color: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, color } : l)); 
    await updateLayerColor(id, color); 
  };

  const handleDelete = async (id: number) => {
    if (!confirm('تحذير: سيتم حذف الطبقة وكل بياناتها نهائياً. هل أنت متأكد؟')) return;
    await fetch(`/api/layers/${id}`, { method: 'DELETE' });
    load();
  };

  const handleExport = async (id: number, name: string) => {
    const res = await fetch(`/api/layers/${id}/geojson`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `layer_${name}.geojson`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = layers.filter(l => l.name.includes(search));

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '1rem' }}>← عودة للرئيسية</button>
        <div className="transform-container" style={{ maxWidth: '100%' }}>
          <h2>📚 إدارة الطبقات</h2>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="اسم طبقة جديدة..." style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: 'white' }} />
            <button onClick={handleCreate} className="btn-primary" style={{ width: 'auto', padding: '0 2rem' }}>إنشاء</button>
          </div>

          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 ابحث..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0F172A', color: 'white', marginBottom: '1rem' }} />

          {filtered.map(l => (
            <div key={l.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '10px', gap: '10px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <input 
                  type="color" 
                  value={l.color || '#D4AF37'} 
                  onInput={(e: any) => handleColorChange(l.id, e.target.value)} 
                  title="تغيير لون الطبقة" 
                  style={{ width: '45px', height: '45px', cursor: 'pointer', border: '2px solid #fff', borderRadius: '50%', background: 'transparent', padding: 0 }} 
                />
                
                <div>
                  {editingId === l.id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '5px', borderRadius: '4px', border: '1px solid var(--gold)', background: '#0F172A', color: 'white' }} autoFocus />
                      <button onClick={() => handleRename(l.id)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>حفظ</button>
                      <button onClick={() => setEditingId(null)} style={{ background: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>إلغاء</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 'bold', color: l.color || 'var(--gold)', fontSize: '1.1rem' }}>{l.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(l.created_at).toLocaleDateString('ar-EG')}</div>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={onOpenMap} style={{ padding: '8px 16px', background: 'var(--turquoise)', color: 'var(--lapis)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>عرض</button>
                <button onClick={() => handleExport(l.id, l.name)} style={{ padding: '8px 16px', background: '#D4AF37', color: '#0F172A', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تصدير</button>
                <button onClick={() => { setEditingId(l.id); setEditName(l.name); }} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>تعديل</button>
                <button onClick={() => handleDelete(l.id)} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
