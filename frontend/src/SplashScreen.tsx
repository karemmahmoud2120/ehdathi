import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => { setFadeOut(true); setTimeout(onFinish, 800); }, 3500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? 'opacity-0' : ''}`} style={{ opacity: fadeOut ? 0 : 1 }}>
      <svg className="splash-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 C 20 10, 5 30, 5 50 C 5 70, 20 90, 50 90 C 80 90, 95 70, 95 50 C 95 30, 80 10, 50 10 Z" fill="none" stroke="currentColor" strokeWidth="4"/>
        <circle cx="50" cy="50" r="15" fill="currentColor"/>
        <path d="M50 10 L 50 35" stroke="currentColor" strokeWidth="4"/>
        <path d="M30 90 Q 50 110 70 90" fill="none" stroke="currentColor" strokeWidth="4"/>
      </svg>
      <h1 className="splash-title">إحداثي</h1>
      <p className="splash-subtitle">نظام المعلومات الجغرافية الذكي</p>
      <div className="splash-egypt" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <span className="egypt-flag-large">🇪🇬</span>
        <span className="splash-long-live" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--gold)', animation: 'pulse 2s infinite' }}>تحيا مصر</span>
      </div>
    </div>
  );
}
