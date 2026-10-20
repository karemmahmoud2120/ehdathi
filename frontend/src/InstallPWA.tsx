import { useEffect, useState } from 'react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // لو التطبيق متثبت بالفعل
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert('لتثبيت التطبيق:\n• على Chrome: اضغط على القائمة (⋮) → "تثبيت إحداثي"\n• على iPhone: اضغط Share → "Add to Home Screen"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', color: '#22c55e', padding: '10px 20px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', zIndex: 9999 }}>
        ✅ التطبيق مثبت
      </div>
    );
  }

  return (
    <button
      onClick={installApp}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)',
        color: '#0F172A',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '30px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 8px 25px rgba(212,175,55,0.4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'Tajawal',
        animation: 'pulse 2s infinite'
      }}
    >
      📲 ثبّت التطبيق
    </button>
  );
}