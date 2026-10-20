import { useState } from 'react';
import { login, register } from './api';

export default function Login({ onLogin }: { onLogin: (user: any, token: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const body = isLogin ? { email, password } : { name, email, password };
      const res = isLogin ? await login(body) : await register(body);
      
      if (!res.ok) throw new Error(res.data.message || 'حدث خطأ في البيانات');
      
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>مرحباً بك في منصة إحداثي</p>
        
        {error && <div style={{ background: 'rgba(220,53,69,0.2)', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>الاسم بالكامل</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
          </div>
          <div className="form-group">
            <label>كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            {isLogin ? 'دخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--turquoise)', cursor: 'pointer', fontFamily: 'Tajawal' }}>
            {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>
      </div>
    </div>
  );
}