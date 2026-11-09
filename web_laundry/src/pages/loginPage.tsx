import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Droplets, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useToast } from '../api/Toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      localStorage.setItem('user_session', JSON.stringify({ name: 'Admin Laundry', role: 'Kasir Utama' }));
      toast('Selamat datang kembali');
      navigate('/', { replace: true });
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="login">
      <section className="login-hero">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <b>Smart Laundry</b>
        </div>

        <div className="copy">
          <span className="eyebrow eyebrow-aqua"><Droplets size={14} /> Operasional lebih jernih</span>
          <h1>Setiap cucian,<br /><em>terasa terurus.</em></h1>
          <p>Satu ruang untuk menerima, memproses, dan menyelesaikan pesanan tanpa kehilangan detail kecil.</p>
          <ul>
            <li><Check size={16} /> Status real-time</li>
            <li><Check size={16} /> Data tersimpan rapi</li>
          </ul>
        </div>

        <small className="login-foot">Smart Laundry &nbsp;•&nbsp; by ZenithDev</small>
      </section>

      <section className="login-form">
        <div className="login-box">
          <span className="eyebrow eyebrow-aqua">Selamat datang</span>
          <h2>Masuk ke ruang kerja</h2>
          <p className="muted">Kelola operasional laundry dengan lebih ringan hari ini.</p>

          {error && (
            <div className="alert"><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><X size={16} /> {error}</span></div>
          )}

          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="u">Username</label>
              <input id="u" className="input" placeholder="Masukkan username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="p">Password</label>
              <input id="p" type="password" className="input" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-block">Masuk ke dasbor <ArrowRight size={16} /></button>
          </form>

          <div className="demo"><ShieldCheck size={16} /> Akun demo: <b>admin / 123456</b></div>
        </div>
      </section>
    </div>
  );
}
