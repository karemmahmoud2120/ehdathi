import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import { getLayerGeoJSON } from './api';

const mapStyles: any = {
  streets: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 } }, layers: [{ id: 'osm', type: 'raster', source: 'osm' }] },
  satellite: { version: 8, sources: { sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 } }, layers: [{ id: 'sat', type: 'raster', source: 'sat' }] },
  dark: { version: 8, sources: { carto: { type: 'raster', tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'], tileSize: 256 } }, layers: [{ id: 'carto', type: 'raster', source: 'carto' }] }
};

const MapView = forwardRef(({ onMapReady, selectedLayerId, layerColor, mapStyle, activeTool, setActiveTool, onFeatureCreated, onMeasure, onToast, showHeatmap }: any, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map>();
  const drawCoords = useRef<[number, number][]>([]);
  const activeToolRef = useRef(activeTool);
  const currentGeojson = useRef<any>(null);

  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);

  useImperativeHandle(ref, () => ({
    finishDrawing: () => {
      if (drawCoords.current.length >= 3) {
        if (activeToolRef.current === 'polygon') onFeatureCreated({ type: 'Polygon', coordinates: [[...drawCoords.current, drawCoords.current[0]]] });
        else if (activeToolRef.current === 'measure_area') {
          const a = turf.area(turf.polygon([[...drawCoords.current, drawCoords.current[0]]]));
          onMeasure(`المساحة: ${(a/4200.83).toFixed(2)} فدان | ${a.toFixed(0)} م²`);
        }
      } else { onToast('تحتاج 3 نقاط على الأقل', 'error'); return; }
      drawCoords.current = [];
      const map = mapRef.current;
      if (map) {
        ['temp-layer', 'temp-vertices'].forEach(l => { if(map.getLayer(l)) map.removeLayer(l); });
        ['temp-source', 'temp-vertices-source'].forEach(s => { if(map.getSource(s)) map.removeSource(s); });
      }
      setActiveTool('none');
    },
    zoomToLayer: () => {
      if (currentGeojson.current && currentGeojson.current.features.length > 0) {
        const bbox = turf.bbox(currentGeojson.current);
        mapRef.current?.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 60, duration: 1500 });
      } else {
        onToast('هذه الطبقة لا تحتوي على بيانات', 'error');
      }
    },
    exportMapImage: () => {
      const map = mapRef.current;
      if (!map) return;
      const canvas = map.getCanvas();
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ehdathi-map-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      onToast('تم تصدير الخريطة بنجاح');
    },
    finishRouting: async () => {
      if (drawCoords.current.length < 2) {
        onToast('تحتاج نقطتين على الأقل', 'error');
        return;
      }
      const coordsString = drawCoords.current.map(c => `${c[0]},${c[1]}`).join(';');
      const map = mapRef.current;
      setActiveTool('none');
      onToast('جاري حساب المسار...', 'success');
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
        const d = await res.json();
        if (d.routes?.length && map) {
          if (map.getLayer('route-layer')) map.removeLayer('route-layer');
          if (map.getSource('route-source')) map.removeSource('route-source');
          map.addSource('route-source', { type: 'geojson', data: d.routes[0].geometry });
          map.addLayer({ id: 'route-layer', type: 'line', source: 'route-source', paint: { 'line-color': '#3b82f6', 'line-width': 6 } });
          onMeasure(`المسار: ${(d.routes[0].distance/1000).toFixed(1)} كم | الوقت: ${Math.round(d.routes[0].duration/60)} دقيقة`);
        }
      } catch (e) {
        onToast('فشل حساب المسار', 'error');
      }
      drawCoords.current = [];
      ['temp-layer', 'temp-vertices'].forEach(l => { if(map.getLayer(l)) map.removeLayer(l); });
      ['temp-source', 'temp-vertices-source'].forEach(s => { if(map.getSource(s)) map.removeSource(s); });
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({ 
      container: containerRef.current, 
      style: mapStyles.streets, 
      center: [31.2357, 30.0444], 
      zoom: 10,
      preserveDrawingBuffer: true
    });
    map.doubleClickZoom.disable();
    map.addControl(new maplibregl.NavigationControl(), 'top-left');
    mapRef.current = map;
    onMapReady(map);
    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const popup = new maplibregl.Popup({ offset: 15, closeButton: true });

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const lng = e.lngLat.lng, lat = e.lngLat.lat;
      const tool = activeToolRef.current;

      if (tool === 'none') {
        const f = map.queryRenderedFeatures(e.point, { layers: ['dynamic-points', 'dynamic-lines', 'dynamic-polygons'] });
        if (f.length > 0) {
          const p = f[0].properties;
          const featureId = f[0].id;
          let html = `<div style="direction:rtl;font-family:Tajawal;color:#0F172A;min-width:150px"><h4 style="color:${layerColor};margin:0 0 8px;border-bottom:1px solid #ccc;padding-bottom:4px">${p.name}</h4>`;
          for (const k in p) if (k !== 'name' && k !== 'id' && k !== 'layer_id') html += `<div style="font-size:0.85rem;margin-bottom:4px"><b>${k}:</b> ${p[k]}</div>`;
          if (featureId) html += `<button onclick="window.deleteMapFeature(${featureId})" style="margin-top:10px;width:100%;background:#dc3545;color:white;border:none;padding:6px;border-radius:4px;cursor:pointer;font-family:Tajawal">حذف العنصر</button>`;
          popup.setLngLat(e.lngLat).setHTML(html + '</div>').addTo(map);
        }
        return;
      }

      if (tool === 'point') { onFeatureCreated({ type: 'Point', coordinates: [lng, lat] }); setActiveTool('none'); }
      else if (tool === 'polygon' || tool === 'measure_area' || tool === 'measure_distance' || tool === 'route') {
        drawCoords.current.push([lng, lat]);
        onToast(`النقطة ${drawCoords.current.length}`, 'success');
        drawTemp();
        
        if (tool === 'measure_distance' && drawCoords.current.length > 1) {
          const dist = turf.length(turf.lineString(drawCoords.current), { units: 'kilometers' });
          onMeasure(`المسافة: ${dist.toFixed(3)} كم`);
        }
      }
    };

    const drawTemp = () => {
      if (!map.isStyleLoaded()) return;
      ['temp-layer', 'temp-vertices'].forEach(l => { if(map.getLayer(l)) map.removeLayer(l); });
      ['temp-source', 'temp-vertices-source'].forEach(s => { if(map.getSource(s)) map.removeSource(s); });
      const isPoly = activeToolRef.current === 'polygon' || activeToolRef.current === 'measure_area';
      const g = isPoly && drawCoords.current.length >= 3 ? turf.polygon([[...drawCoords.current, drawCoords.current[0]]]) : { type: 'LineString', coordinates: drawCoords.current };
      
      map.addSource('temp-source', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: g as any } });
      map.addLayer({ id: 'temp-layer', type: isPoly ? 'fill' : 'line', source: 'temp-source', paint: isPoly ? { 'fill-color': '#40E0D0', 'fill-opacity': 0.4 } : { 'line-color': '#40E0D0', 'line-width': 4 } });
      
      map.addSource('temp-vertices-source', { type: 'geojson', data: { type: 'FeatureCollection', features: drawCoords.current.map(c => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: c } })) } });
      map.addLayer({ id: 'temp-vertices', type: 'circle', source: 'temp-vertices-source', paint: { 'circle-radius': 5, 'circle-color': '#D4AF37', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
    };

    map.on('click', handleClick);
    map.getCanvas().style.cursor = activeTool !== 'none' ? 'crosshair' : '';
    return () => { map.off('click', handleClick); };
  }, [activeTool, onFeatureCreated, onMeasure, onToast, setActiveTool, layerColor]);

  useEffect(() => { if (mapRef.current) mapRef.current.setStyle(mapStyles[mapStyle]); }, [mapStyle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const updateHeatmap = () => {
      if (!map.isStyleLoaded() || !map.getLayer('dynamic-points')) return;
      if (showHeatmap) {
        if (!map.getLayer('heatmap-layer')) {
          map.addLayer({
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'dynamic-source',
            maxzoom: 15,
            paint: {
              'heatmap-weight': 1,
              'heatmap-intensity': 1,
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'rgb(103,169,207)',
                0.4, 'rgb(209,229,240)',
                0.6, 'rgb(253,219,199)',
                0.8, 'rgb(239,138,98)',
                1, 'rgb(178,24,43)'
              ],
              'heatmap-radius': 20,
              'heatmap-opacity': 0.8
            }
          }, 'dynamic-points');
        }
      } else {
        if (map.getLayer('heatmap-layer')) map.removeLayer('heatmap-layer');
      }
    };
    updateHeatmap();
    map.on('styledata', updateHeatmap);
    return () => { map.off('styledata', updateHeatmap); };
  }, [showHeatmap, selectedLayerId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLayerId) return;
    const draw = async () => {
      if (!map.isStyleLoaded()) return;
      ['dynamic-points', 'dynamic-lines', 'dynamic-polygons'].forEach(l => { if(map.getLayer(l)) map.removeLayer(l); });
      if (map.getSource('dynamic-source')) map.removeSource('dynamic-source');
      const g = await getLayerGeoJSON(selectedLayerId);
      currentGeojson.current = g;
      map.addSource('dynamic-source', { type: 'geojson', data: g });
      map.addLayer({ id: 'dynamic-polygons', type: 'fill', source: 'dynamic-source', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': layerColor, 'fill-opacity': 0.4, 'fill-outline-color': '#fff' } });
      map.addLayer({ id: 'dynamic-lines', type: 'line', source: 'dynamic-source', filter: ['==', '$type', 'LineString'], paint: { 'line-color': layerColor, 'line-width': 3 } });
      map.addLayer({ id: 'dynamic-points', type: 'circle', source: 'dynamic-source', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 8, 'circle-color': layerColor, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
    };
    if (map.isStyleLoaded()) draw(); else map.on('load', draw);
    map.on('reload-layer', draw);
    return () => { map.off('reload-layer', draw); };
  }, [selectedLayerId, mapStyle, layerColor]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});

export default MapView;