export default function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="modern-dashboard" style={{ padding: '2rem', overflowY: 'auto' }}>
      <button className="btn-back" onClick={onBack} style={{ marginBottom: '2rem' }}>← عودة للرئيسية</button>
      
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <span className="egypt-flag-large">🇪🇬</span>
        <h1 className="glowing-text" style={{ marginTop: '1rem' }}>من نحن</h1>
        
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: '1.8', marginTop: '2rem', textAlign: 'justify' }}>
          "إحداثي" هو منصة مصرية متطورة لنظم المعلومات الجغرافية (GIS)، تهدف إلى تمكين الأفراد والمؤسسات من إدارة وتحليل البيانات المكانية بكل سهولة واحترافية.
          نحن نؤمن بأن التكنولوجيا يجب أن تكون في متناول الجميع، لذلك صممنا هذه المنصة لتكون بديلاً عربياً قوياً للتطبيقات العالمية، مع التركيز على احتياجات السوق المصري والشرق الأوسط.
        </p>

        {/* كروت الرؤية والمهمة */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem', textAlign: 'right' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)' }}>
            <h3 style={{ color: 'var(--gold)', marginTop: 0 }}>🎯 رؤيتنا</h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>أن نكون المنصة الأولى والأكثر موثوقية في مجال المعلومات الجغرافية في الوطن العربي.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(64,224,208,0.3)' }}>
            <h3 style={{ color: 'var(--turquoise)', marginTop: 0 }}>🚀 مهمتنا</h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>توفير أدوات GIS قوية وسهلة الاستخدام، مدعومة بالذكاء الاصطناعي، لخدمة التخطيط العمراني والزراعي والخدمي.</p>
          </div>
        </div>

        {/* كارت المصمم */}
        <div style={{ marginTop: '4rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(15,23,42,0.8) 100%)', borderRadius: '20px', border: '1px solid var(--gold)', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--lapis)', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(212,175,55,0.5)' }}>
            K
          </div>
          <h2 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>كريم محمود حنيش</h2>
          <p style={{ color: 'var(--turquoise)', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>أخصائي نظم معلومات جغرافية مصري</p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>مصمم ومطور منصة إحداثي</p>
        </div>

      </div>
    </div>
  );
}
