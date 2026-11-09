import { useMemo, useState, useEffect } from 'react';
import { Banknote, Check, Package, Wallet, Search } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { kode, rupiah, toDate, waktu } from '../api/format';
import { PayBadge, StatusBadge } from '../api/pills';
import type { Pesanan } from '../types/laundry';

const RANGES = [
  { k: 'hari', l: 'Hari ini' },
  { k: '7', l: '7 hari' },
  { k: 'bulan', l: 'Bulan ini' },
  { k: 'semua', l: 'Semua' },
];

function startOf(k: string): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (k === '7') d.setDate(d.getDate() - 6);
  else if (k === 'bulan') d.setDate(1);
  else if (k === 'semua') return new Date(0);
  return d;
}

export default function LaporanPage() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('7');
  const [q, setQ] = useState('');

  const fetchLaporan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axiosClient.get('/api/laporan-pesanan');
      const dataPesanan = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setPesanan(dataPesanan);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const rows = useMemo(() => {
    return pesanan.filter((p) => {
      const matchRange = toDate(p.created_at) >= startOf(range);
      const query = q.toLowerCase();
      const matchQuery =
        p.nama_pelanggan.toLowerCase().includes(query) ||
        p.nama_layanan.toLowerCase().includes(query) ||
        kode(p.id).toLowerCase().includes(query);
      return matchRange && matchQuery;
    });
  }, [pesanan, range, q]);

  const lunas = rows.filter((p) => p.status_bayar === 'Lunas' && p.status_pengerjaan !== 'Batal');
  const piutang = rows.filter((p) => p.status_bayar !== 'Lunas' && p.status_pengerjaan !== 'Batal');
  const sum = (a: typeof rows) => a.reduce((s, p) => s + (p.status_pengerjaan === 'Batal' ? 0 : (p.total_harga || 0)), 0);

  const perHari = useMemo(() => {
    const m = new Map<string, { ts: number; label: string; total: number; n: number }>();
    lunas.forEach((p) => {
      const d = toDate(p.created_at);
      const key = d.toDateString();
      const cur = m.get(key) ?? { ts: d.getTime(), label: d.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' }), total: 0, n: 0 };
      cur.total += p.total_harga; cur.n += 1;
      m.set(key, cur);
    });
    return [...m.values()].sort((a, b) => b.ts - a.ts).slice(0, 10);
  }, [lunas]);
  const maxHari = Math.max(1, ...perHari.map((h) => h.total));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Riwayat &amp; keuangan</span>
          <h1>Laporan</h1>
          <p>Pendapatan dihitung dari pesanan yang sudah Lunas, berdasarkan tanggal pesanan dibuat.</p>
        </div>
        <div className="tabs" style={{ margin: 0 }}>
          {RANGES.map((r) => <button key={r.k} className={`tab ${range === r.k ? 'on' : ''}`} onClick={() => setRange(r.k)}>{r.l}</button>)}
        </div>
      </div>

      {error && <div className="alert">{error}<button className="link" onClick={fetchLaporan}>Coba lagi</button></div>}

      <div className="stats">
        {[
          { tone: 't-green', icon: <Banknote size={18} />, label: 'Pendapatan', value: rupiah(sum(lunas)), note: `${lunas.length} pesanan lunas` },
          { tone: 't-blue', icon: <Package size={18} />, label: 'Jumlah pesanan', value: rows.length, note: 'pada periode ini' },
          { tone: 't-rose', icon: <Wallet size={18} />, label: 'Belum tertagih', value: rupiah(sum(piutang)), note: `${piutang.length} pesanan belum lunas` },
          { tone: 't-amber', icon: <Check size={18} />, label: 'Pesanan selesai', value: rows.filter((p) => p.status_pengerjaan === 'Selesai').length, note: 'sudah diserahkan' },
        ].map((s) => (
          <div className="card stat" key={s.label}>
            <div className={`tile ${s.tone}`}>{s.icon}</div>
            <label>{s.label}</label>
            <strong>{isLoading ? <span className="skeleton" /> : s.value}</strong>
            <small>{s.note}</small>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="card">
          <div className="card-head">
            <div>
              <span className="eyebrow">Riwayat</span>
              <h3>Daftar transaksi <span className="count">{rows.length}</span></h3>
            </div>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ width: '100%', paddingLeft: 32, paddingRight: 12, height: 36, borderRadius: 8, border: '1px solid var(--border, #ccc)', background: 'transparent' }}
              />
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tanggal</th><th>Pesanan</th><th>Layanan</th><th>Status</th><th>Bayar</th><th>Total</th></tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-sub">{waktu(p.created_at)}</td>
                    <td><div className="cell-main">{kode(p.id)}</div><div className="cell-sub">{p.nama_pelanggan}</div></td>
                    <td>{p.nama_layanan}<div className="cell-sub">{p.qty} {p.satuan}</div></td>
                    <td><StatusBadge status={p.status_pengerjaan} jenis={p.jenis_proses} onAdvance={() => {}} disabled /></td>
                    <td><PayBadge status={p.status_bayar} /></td>
                    <td className="cell-main">{rupiah(p.total_harga)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && rows.length === 0 && <div className="empty">Tidak ada transaksi yang cocok.</div>}
          </div>
        </section>

        <section className="card">
          <span className="eyebrow">Tren</span>
          <h3 style={{ margin: '4px 0 16px', fontSize: 18 }}>Pendapatan per hari</h3>
          {perHari.map((h) => (
            <div className="bar-row" key={h.ts}>
              <div className="top"><span>{h.label}</span><b>{rupiah(h.total)}</b></div>
              <div className="bar"><i style={{ width: `${(h.total / maxHari) * 100}%` }} /></div>
            </div>
          ))}
          {!isLoading && perHari.length === 0 && <div className="empty">Belum ada pendapatan.</div>}
        </section>
      </div>
    </div>
  );
}git: