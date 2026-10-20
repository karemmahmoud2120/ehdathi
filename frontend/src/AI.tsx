import { useState, useEffect, useRef } from 'react';

// أيقونة الكرة الأرضية مع دبوس الموقع
const GlobeIcon = ({ size = 32, className = '' }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(212,175,55,0.25)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#globeGrad)" />
    <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="32" cy="32" rx="8" ry="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <ellipse cx="32" cy="32" rx="16" ry="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <line x1="10" y1="32" x2="54" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <path d="M 14 22 Q 32 16 50 22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <path d="M 14 42 Q 32 48 50 42" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <g className="location-pin">
      <path d="M 32 22 C 27.5 22, 24 25.5, 24 30 C 24 36, 32 43, 32 43 C 32 43, 40 36, 40 30 C 40 25.5, 36.5 22, 32 22 Z" fill="currentColor" />
      <circle cx="32" cy="29" r="2.5" fill="#0F172A" />
    </g>
  </svg>
);

const UserIcon = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 12c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/>
  </svg>
);

export default function AI({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<any[]>([
    { role: 'bot', text: 'أهلاً بك في المساعد الذكي لإحداثي! 🌍\nاسألني عن أي مكان، أو معلومة جغرافية، أو وحدات القياس المصرية (فدان، قيراط، سهم).' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    const newHistory = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'لم أتمكن من الرد.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ تعذر الاتصال بالخادم. تأكد من تشغيل الخدمات.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-page-inner">
        <button className="btn-back" onClick={onBack} style={{ marginBottom: '1rem' }}>← عودة للرئيسية</button>
        
        <div className="ai-container-v2">
          {/* Header */}
          <div className="ai-header-v2">
            <div className="ai-header-icon">
              <GlobeIcon size={40} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.5rem' }}>المساعد الذكي</h2>
              <p style={{ margin: 0, color: 'var(--turquoise)', fontSize: '0.85rem' }}>إحداثي • مساعدك الجغرافي الذكي</p>
            </div>
            <div className="ai-status-dot"></div>
          </div>

          {/* Messages */}
          <div className="ai-messages-v2">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg-wrapper ${m.role}`}>
                <div className={`ai-avatar ${m.role}`}>
                  {m.role === 'bot' ? <GlobeIcon size={26} /> : <UserIcon size={22} />}
                </div>
                <div className={`ai-bubble ${m.role}`}>
                  {m.text.split('\n').map((line: string, idx: number) => (
                    <span key={idx}>{line}<br/></span>
                  ))}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="ai-msg-wrapper bot">
                <div className="ai-avatar bot"><GlobeIcon size={26} /></div>
                <div className="ai-bubble bot typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="ai-input-v2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل عن أي مكان أو معلومة جغرافية..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? '...' : '➤'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
