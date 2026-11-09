import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Bell, FileText, LayoutGrid, LogOut, Package, Sparkles, Tag, Users } from 'lucide-react';
import { ToastProvider } from './api/Toast';
import LoginPage from './pages/loginPage';
import DasborPage from './pages/dasborPage';
import KasirPage from './pages/kasirPage';
import PelangganPage from './pages/pelangganPage';
import LayananPage from './pages/layananPage';
import LaporanPage from './pages/laporanPage';

const NAV = [
  { to: '/', label: 'Dasbor', icon: LayoutGrid, end: true },
  { to: '/pesanan', label: 'Pesanan', icon: Package },
  { to: '/pelanggan', label: 'Pelanggan', icon: Users },
  { to: '/layanan', label: 'Layanan', icon: Tag },
  { to: '/laporan', label: 'Laporan', icon: FileText },
];

function ProtectedLayout() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user_session');
  if (!raw) return <Navigate to="/login" replace />;
  const user: { name: string; role: string } = JSON.parse(raw);

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      localStorage.removeItem('user_session');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} /></div>
            <div className="nav-label">
              <b>Smart Laundry</b>
              <small>by ZenithDev</small>
            </div>
          </div>

        <nav className="nav">
          <span className="eyebrow nav-label">Workspace</span>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={18} /> <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="side-note nav-label">
          <b><Sparkles size={14} /> Rapi dari awal.</b>
          Pantau setiap kilogram dengan tenang.
        </div>
        <button className="logout" onClick={handleLogout}><LogOut size={18} /> <span className="nav-label">Keluar</span></button>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Ruang kerja kasir</span>
            <div className="hello">Halo, {user.name.split(' ')[0]} <Sparkles size={15} color="#f59e0b" /></div>
          </div>
          <div className="user">
            <Bell size={18} color="#8aa0ad" />
            <div className="user-meta"><b>{user.name}</b><small>{user.role}</small></div>
            <div className="avatar">{user.name[0]}</div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<DasborPage />} />
            <Route path="/pesanan" element={<KasirPage />} />
            <Route path="/pelanggan" element={<PelangganPage />} />
            <Route path="/layanan" element={<LayananPage />} />
            <Route path="/laporan" element={<LaporanPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
