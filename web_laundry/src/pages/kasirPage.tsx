import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Plus, Search, Trash2, XCircle, ChevronDown } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useLaundryData } from '../api/useLaundryData';
import { useToast } from '../api/Toast';
import { PayBadge, StatusBadge, nextStatus } from '../api/pills';
import { errMsg, kode, rupiah, waktu } from '../api/format';
import { ALUR, JENIS_LABEL, STATUS_FLOW, jenisOf, type Pesanan } from '../types/laundry';

interface SelectOption {
  id: number;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

function SearchableSelect({ options, value, onChange, placeholder, disabled }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === Number(value));

  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div
        className="input"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: '#fff',
        }}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <strong>{selectedOption.label}</strong>
              {selectedOption.sublabel && (
                <span style={{ color: '#8aa0ad', fontSize: '0.85em' }}>
                  · {selectedOption.sublabel}
                </span>
              )}
            </span>
          ) : (
            <span style={{ color: '#8aa0ad' }}>{placeholder}</span>
          )}
        </span>
        <ChevronDown size={16} color="#8aa0ad" style={{ flexShrink: 0, marginLeft: 8 }} />
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: 4,
            background: '#fff',
            border: '1px solid var(--line, #e2e8f0)',
            borderRadius: 8,
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxHeight: 220,
            overflowY: 'auto',
            padding: 6,
          }}
        >
          <div className="search" style={{ marginBottom: 6 }}>
            <Search size={14} />
            <input
              type="text"
              className="input"
              style={{ width: '100%', paddingLeft: 30, height: 34, fontSize: 13 }}
              placeholder="Ketik untuk mencari..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {filteredOptions.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: 13, color: '#8aa0ad', textAlign: 'center' }}>
              Tidak ditemukan
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  background: opt.id === Number(value) ? '#e0f2fe' : 'transparent',
                  color: opt.id === Number(value) ? '#0369a1' : 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
                onClick={() => {
                  onChange(String(opt.id));
                  setOpen(false);
                  setQuery('');
                }}
              >
                <strong>{opt.label}</strong>
                {opt.sublabel && (
                  <small style={{ color: '#8aa0ad', flexShrink: 0, fontSize: '0.85em' }}>
                    {opt.sublabel}
                  </small>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function KasirPage() {
  const { pesanan, pelanggan, layanan, isLoading, error, reload } = useLaundryData();
  const toast = useToast();

  const [pelangganId, setPelangganId] = useState('');
  const [layananId, setLayananId] = useState('');
  const [qty, setQty] = useState('1');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Semua');

  const activePelanggan = pelanggan.filter((p) => (p.is_active ?? 1) === 1);
  const activeLayanan = layanan.filter((l) => (l.is_active ?? 1) === 1);

  const selected = activeLayanan.find((l) => l.id === Number(layananId));
  const total = selected ? selected.harga * Number(qty || 0) : 0;
  const valid = !!pelangganId && !!selected && Number(qty) > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || !selected) return;
    try {
      setSaving(true);
      await axiosClient.post('/api/pesanan', {
        pelanggan_id: Number(pelangganId),
        layanan_id: selected.id,
        qty: Number(qty),
        total_harga: total,
      });
      setPelangganId('');
      setLayananId('');
      setQty('1');
      await reload();
      toast('Pesanan baru tersimpan');
    } catch (err) {
      toast('Gagal menyimpan: ' + errMsg(err), 'err');
    } finally {
      setSaving(false);
    }
  };

  const mutate = async (p: Pesanan, fn: () => Promise<unknown>, okMsg: string) => {
    try {
      setBusyId(p.id);
      await fn();
      await reload();
      toast(okMsg);
    } catch (err) {
      toast(errMsg(err), 'err');
    } finally {
      setBusyId(null);
    }
  };

  const advance = (p: Pesanan) => {
    const next = nextStatus(p.status_pengerjaan, p.jenis_proses);
    if (next === 'Selesai' && p.status_bayar !== 'Lunas') {
      toast('Pesanan belum lunas. Tandai Lunas dulu sebelum diserahkan.', 'err');
      return;
    }
    if (next) mutate(p, () => axiosClient.put(`/api/pesanan/${p.id}/status`, { status_pengerjaan: next }), `${kode(p.id)} → ${next}`);
  };

  const togglePay = (p: Pesanan) => {
    if (p.status_pengerjaan === 'Selesai' && p.status_bayar === 'Lunas') return toast('Pesanan yang sudah selesai tidak bisa dibatalkan pelunasannya.', 'err');
    const next = p.status_bayar === 'Lunas' ? 'Belum Lunas' : 'Lunas';
    mutate(p, () => axiosClient.put(`/api/pesanan/${p.id}/bayar`, { status_bayar: next }), `${kode(p.id)} ${next}`);
  };

  const cancelOrder = (p: Pesanan) => {
    if (confirm(`Batalkan pesanan ${kode(p.id)} milik ${p.nama_pelanggan}?`)) {
      const tasks = [
        axiosClient.put(`/api/pesanan/${p.id}/status`, { status_pengerjaan: 'Batal' })
      ];
      if (p.status_bayar === 'Lunas') {
        tasks.push(axiosClient.put(`/api/pesanan/${p.id}/bayar`, { status_bayar: 'Belum Lunas' }));
      }
      mutate(
        p,
        async () => {
          await Promise.all(tasks);
        },
        `Pesanan ${kode(p.id)} dibatalkan dan status bayar direset`
      );
    }
  };

  const remove = (p: Pesanan) => {
    if (confirm(`Hapus riwayat pesanan ${kode(p.id)} dari layar?`)) {
      mutate(p, () => axiosClient.delete(`/api/pesanan/${p.id}`), 'Pesanan dihapus dari daftar');
    }
  };

  const q = search.toLowerCase();

  const rows = pesanan.filter((p) => {
    const matchesSearch =
      p.nama_pelanggan.toLowerCase().includes(q) ||
      p.nama_layanan.toLowerCase().includes(q) ||
      kode(p.id).toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (p.status_pengerjaan === 'Batal') return false;

    if (tab === 'Semua') {
      return p.status_pengerjaan !== 'Selesai';
    }

    if (tab === 'Antri') {
      return p.status_pengerjaan === 'Antri';
    }

    return p.status_pengerjaan === tab;
  });

  const count = (t: string) => {
    const activeValid = pesanan.filter((p) => p.status_pengerjaan !== 'Batal');
    if (t === 'Semua') return activeValid.filter((p) => p.status_pengerjaan !== 'Selesai').length;
    if (t === 'Antri') return activeValid.filter((p) => p.status_pengerjaan === 'Antri').length;
    return activeValid.filter((p) => p.status_pengerjaan === t).length;
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Kasir &amp; alur kerja</span>
          <h1>Pesanan</h1>
          <p>Terima cucian, pantau progres, lalu tutup transaksi dengan rapi.</p>
        </div>
        <span className="live"><i /> Live dari server</span>
      </div>

      {error && <div className="alert">{error}<button className="link" onClick={reload}>Coba lagi</button></div>}

      <div className="split">
        <section className="card">
          <div className="tile t-blue" style={{ marginBottom: 12 }}><Plus size={18} /></div>
          <span className="eyebrow">Transaksi baru</span>
          <h3 style={{ fontSize: 20, margin: '4px 0 18px' }}>Buat pesanan</h3>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Pelanggan</label>
              <SearchableSelect
                options={activePelanggan.map((p) => ({
                  id: p.id,
                  label: p.nama,
                  sublabel: p.no_hp,
                }))}
                value={pelangganId}
                onChange={(val) => setPelangganId(val)}
                placeholder="Cari nama atau no HP pelanggan..."
                disabled={saving}
              />
            </div>

            <div className="field">
              <label>Layanan</label>
              <SearchableSelect
                options={activeLayanan.map((l) => ({
                  id: l.id,
                  label: l.nama_layanan,
                  sublabel: `${rupiah(l.harga)} / ${l.satuan}`,
                }))}
                value={layananId}
                onChange={(val) => setLayananId(val)}
                placeholder="Cari paket layanan..."
                disabled={saving}
              />
            </div>

            <div className="field">
              <label htmlFor="qty">Jumlah {selected && `(${selected.satuan})`}</label>
              <input id="qty" className="input" type="number" min="0.5" step="0.5" value={qty} onChange={(e) => setQty(e.target.value)} required />
            </div>

            <div className="receipt">
              <div className="row"><span>{selected ? `${rupiah(selected.harga)} × ${Number(qty) || 0} ${selected.satuan}` : 'Pilih layanan untuk menghitung'}</span></div>
              <small className="eyebrow">Total estimasi</small>
              <strong>{rupiah(total)}</strong>
              {selected && <div className="flow">Alur: {ALUR[jenisOf(selected.jenis_proses)].join(' → ')}</div>}
            </div>

            <button type="submit" className="btn btn-block" disabled={!valid || saving}>
              <Plus size={16} /> {saving ? 'Menyimpan...' : 'Simpan pesanan'}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <span className="eyebrow">Antrian aktif</span>
              <h3>Daftar pesanan <span className="count">{count('Semua')}</span></h3>
            </div>
            <div className="search">
              <Search size={15} />
              <input className="input" placeholder="Cari kode atau nama" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="tabs">
            {['Semua', 'Antri', ...STATUS_FLOW].map((t) => (
              <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t} <em>{count(t)}</em></button>
            ))}
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Pesanan</th><th>Layanan</th><th>Status proses</th><th>Pembayaran</th><th>Total</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td><div className="cell-main">{kode(p.id)}</div><div className="cell-sub">{p.nama_pelanggan} · {waktu(p.created_at)}</div></td>
                    <td>{p.nama_layanan}<div className="cell-sub">{p.qty} {p.satuan} · {JENIS_LABEL[jenisOf(p.jenis_proses)]}</div></td>
                    <td><StatusBadge status={p.status_pengerjaan} jenis={p.jenis_proses} onAdvance={() => advance(p)} disabled={busyId === p.id} /></td>
                    <td><PayBadge status={p.status_bayar} onToggle={() => togglePay(p)} disabled={busyId === p.id} /></td>
                    <td className="cell-main">{rupiah(p.total_harga)}</td>
                    <td>
                      {p.status_pengerjaan === 'Selesai' ? (
                        <button className="icon-btn" onClick={() => remove(p)} disabled={busyId === p.id} title="Hapus dari daftar">
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button className="icon-btn" onClick={() => cancelOrder(p)} disabled={busyId === p.id} title="Batalkan pesanan" style={{ color: '#ef4444' }}>
                          <XCircle size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <div className="empty">Memuat pesanan...</div>}
            {!isLoading && rows.length === 0 && <div className="empty">Tidak ada pesanan yang cocok.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}