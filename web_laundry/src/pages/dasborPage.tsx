import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Banknote, Package, Tag, Users, Wallet, Zap, Clock } from 'lucide-react';
import { useLaundryData } from '../api/useLaundryData';
import { STATUS_AKTIF } from '../types/laundry';
import { isToday, kode, rupiah, waktu } from '../api/format';
import { PayBadge, StatusBadge } from '../api/pills';

function Stat({ icon, tone, label, value, note, loading }: { icon: ReactNode; tone: string; label: string; value: string | number; note: string; loading: boolean }) {
  return (
    <div className="card stat">
      <div className={`tile ${tone}`}>{icon}</div>
      <label>{label}</label>
      <strong>{loading ? <span className="skeleton" /> : value}</strong>
      <small>{note}</small>
    </div>
  );
}

export default function DasborPage() {
  const { pesanan, pelanggan, layanan, isLoading, error, reload } = useLaundryData();

  const validPesanan = pesanan.filter((p) => p.status_pengerjaan !== 'Batal');

  const lunas = validPesanan.filter((p) => p.status_bayar === 'Lunas');
  const belumLunas = validPesanan.filter((p) => p.status_bayar !== 'Lunas');
  const sum = (arr: typeof validPesanan) => arr.reduce((s, p) => s + (p.total_harga || 0), 0);
  const siapAmbil = validPesanan.filter((p) => p.status_pengerjaan === 'Siap Ambil').length;
  const aktif = validPesanan.filter((p) => p.status_pengerjaan !== 'Selesai');
  const berjalan = aktif.slice(0, 5);
  const maxCount = Math.max(1, aktif.length);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Ringkasan hari ini</span>
          <h1>Dasbor operasional</h1>
          <p>Pantau ritme outlet, dari pesanan masuk sampai cucian siap diambil.</p>
        </div>
        <Link to="/pesanan" className="btn"><Zap size={16} /> Buat pesanan <ArrowRight size={16} /></Link>
      </div>

      {error && (
        <div className="alert">{error}<button className="link" onClick={reload}>Coba lagi</button></div>
      )}

      <div className="stats">
        <Stat loading={isLoading} tone="t-blue" icon={<Package size={18} />} label="Pesanan aktif" value={aktif.length} note={`${validPesanan.filter((p) => isToday(p.created_at)).length} masuk hari ini`} />
        <Stat loading={isLoading} tone="t-green" icon={<Banknote size={18} />} label="Pendapatan lunas" value={rupiah(sum(lunas))} note={`${lunas.length} pesanan lunas`} />
        <Stat loading={isLoading} tone="t-amber" icon={<Clock size={18} />} label="Siap diambil" value={siapAmbil} note="menunggu pelanggan" />
        <Stat loading={isLoading} tone="t-rose" icon={<Wallet size={18} />} label="Belum lunas" value={belumLunas.length} note={`${rupiah(sum(belumLunas))} belum tertagih`} />
      </div>

      <div className="dash-grid">
        <section className="card">
          <div className="card-head">
            <div>
              <span className="eyebrow">Aliran terbaru</span>
              <h3>Pesanan yang sedang berjalan</h3>
            </div>
            <Link to="/pesanan" className="link">Lihat semua <ArrowRight size={14} /></Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Pesanan</th><th>Layanan</th><th>Status</th><th>Bayar</th><th>Total</th></tr>
              </thead>
              <tbody>
                {berjalan.map((p) => (
                  <tr key={p.id}>
                    <td><div className="cell-main">{p.nama_pelanggan}</div><div className="cell-sub">{kode(p.id)} · {waktu(p.created_at)}</div></td>
                    <td>{p.nama_layanan}<div className="cell-sub">{p.qty} {p.satuan}</div></td>
                    <td><StatusBadge status={p.status_pengerjaan} jenis={p.jenis_proses} onAdvance={() => {}} disabled /></td>
                    <td><PayBadge status={p.status_bayar} /></td>
                    <td className="cell-main">{rupiah(p.total_harga)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && berjalan.length === 0 && <div className="empty">Tidak ada pesanan yang sedang berjalan.</div>}
          </div>
        </section>

        <div className="stack">
          <section className="card">
            <span className="eyebrow">Alur kerja</span>
            <h3 style={{ margin: '4px 0 16px', fontSize: 18 }}>Tahap pengerjaan</h3>
            {STATUS_AKTIF.map((s) => {
              const n = validPesanan.filter((p) => p.status_pengerjaan === s).length;
              return (
                <div className="bar-row" key={s}>
                  <div className="top"><span>{s}</span><b>{n}</b></div>
                  <div className="bar"><i style={{ width: `${(n / maxCount) * 100}%` }} /></div>
                </div>
              );
            })}
          </section>

          <section className="card">
            <span className="eyebrow">Pemberitahuan</span>
            <h3 style={{ margin: '4px 0 14px', fontSize: 18 }}>Aktivitas terbaru</h3>
            <ul className="feed">
              {validPesanan.slice(0, 4).map((p) => (
                <li key={p.id}><span className="dot" /><div><b>{kode(p.id)}</b> · {p.nama_pelanggan}<div className="cell-sub">{p.status_pengerjaan} · {waktu(p.created_at)}</div></div></li>
              ))}
              {!isLoading && validPesanan.length === 0 && <li className="muted">Belum ada aktivitas.</li>}
            </ul>
          </section>
        </div>
      </div>

      <div className="card strip">
        <span><Users size={16} /> <b>{isLoading ? '–' : pelanggan.length}</b> pelanggan terdaftar</span>
        <span><Tag size={16} /> <b>{isLoading ? '–' : layanan.length}</b> layanan aktif</span>
        <Link to="/pelanggan" className="link">Kelola data master <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}