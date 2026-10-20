const API_URL = (import.meta as any).env.VITE_API_URL || '';

export async function login(body: any) {
  const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text(); return { ok: res.ok, data: text ? JSON.parse(text) : {} };
}

export async function register(body: any) {
  const res = await fetch(`${API_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text(); return { ok: res.ok, data: text ? JSON.parse(text) : {} };
}

export async function transformPoints(s: number, t: number, p: any[]) {
  const r = await fetch(`${API_URL}/api/transform`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ sourceSrid: s, targetSrid: t, points: p }) });
  const txt = await r.text(); return txt ? JSON.parse(txt) : {};
}

export async function getLayers() {
  const r = await fetch(`${API_URL}/api/layers`);
  const txt = await r.text(); return txt ? JSON.parse(txt) : [];
}

export async function createLayer(n: string) {
  const r = await fetch(`${API_URL}/api/layers`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: n }) });
  const txt = await r.text(); return txt ? JSON.parse(txt) : {};
}

export async function updateLayerColor(id: number, color: string) {
  const r = await fetch(`${API_URL}/api/layers/${id}/color`, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ color }) });
  const txt = await r.text(); return txt ? JSON.parse(txt) : {};
}

export async function addFeature(id: number, g: any, p: any) {
  const r = await fetch(`${API_URL}/api/layers/${id}/features`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ type: 'Feature', geometry: g, properties: p }) });
  const txt = await r.text(); return txt ? JSON.parse(txt) : {};
}

export async function getLayerGeoJSON(id: number) {
  const r = await fetch(`${API_URL}/api/layers/${id}/geojson`);
  const txt = await r.text(); return txt ? JSON.parse(txt) : { type: 'FeatureCollection', features: [] };
}