import React from 'react';

export default function Dashboard({ onSelectService }: { onSelectService: (service: string) => void }) {
  const services = [
    { id: 'map', icon: '🗺️', title: 'الخريطة', desc: 'رسم وإدارة البيانات المكانية', color: '#40E0D0' },
    { id: 'layers', icon: '📚', title: 'إدارة الطبقات', desc: 'تعديل، حذف وتلوين الطبقات', color: '#D4AF37' },
    { id: 'routing', icon: '🚗', title: 'التوجيه الذكي', desc: 'حساب المسارات وأوقات الوصول', color: '#10b981' },
    { id: 'export', icon: '📤', title: 'التصدير الاحترافي', desc: 'ArcGIS, AutoCAD, Google Earth', color: '#8b5cf6' },
    { id: 'transform', icon: '🔄', title: 'تحويل الإحداثيات', desc: 'WGS84, UTM, DMS بدقة عالية', color: '#3b82f6' },
    { id: 'calculator', icon: '🏞️', title: 'حاسبة الأراضي', desc: 'فدان، قيراط، سهم، متر مربع', color: '#f59e0b' },
    { id: 'ai', icon: '🤖', title: 'المساعد الذكي', desc: 'استشارات جغرافية بالذكاء الاصطناعي', color: '#ec4899' },
    { id: 'upload', icon: '📂', title: 'رفع البيانات', desc: 'استيراد ملفات GeoJSON و KML', color: '#06b6d4' },
    { id: 'stats', icon: '📊', title: 'الإحصائيات', desc: 'نظرة عامة على بيانات النظام', color: '#ef4444' },
    { id: 'about', icon: 'ℹ️', title: 'من نحن', desc: 'تعرف على رؤية منصة إحداثي', color: '#84cc16' },
  ];

  return (
    <div className="modern-dashboard">
      <header className="dashboard-header" style={{ marginTop: '3rem' }}>
        <div style={{ marginBottom: '1rem' }}><span className="egypt-flag-large">🇪🇬</span></div>
        <h1 className="glowing-text">إحداثي</h1>
        <p style={{ color: 'var(--turquoise)', fontSize: '1.2rem', letterSpacing: '1px' }}>نظام المعلومات الجغرافية الذكي</p>
      </header>
      
      <div className="services-grid" style={{ padding: '0 2rem', marginTop: '2rem', marginBottom: '3rem' }}>
        {services.map((s) => (
          <div key={s.id} className="service-card glass" onClick={() => onSelectService(s.id)} style={{ '--glow-color': s.color } as React.CSSProperties}>
            <div className="service-icon-wrapper" style={{ color: s.color }}>{s.icon}</div>
            <div className="service-title" style={{ color: s.color, fontSize: '1.3rem', marginBottom: '0.5rem' }}>{s.title}</div>
            <div className="service-desc" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>© 2026 منصة إحداثي - تصميم: كريم محمود حنيش</p>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>صُنع بكل حب في مصر 🇪🇬</p>
      </footer>
    </div>
  );
}