import React, { useState, type FormEvent } from 'react';
import { Plus, Search, Edit2, Package } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useLaundryData } from '../api/useLaundryData';
import { useToast } from '../api/Toast';
import { errMsg, rupiah } from '../api/format';
import { JENIS_LABEL, jenisOf, type Layanan } from '../types/laundry';

export default function LayananPage() {
  const { layanan, isLoading, error, reload } = useLaundryData();
  const toast = useToast();

  const [namaLayanan, setNamaLayanan] = useState('');
  const [harga, setHarga] = useState('');
  const [satuan, setSatuan] = useState('Kg');
  const [jenisProses, setJenisProses] = useState('komplit');
  const [isActive, setIsActive] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!namaLayanan || !harga) return;

    try {
      setSaving(true);
      const payload = {
        nama_layanan: namaLayanan,
        harga: Number(harga),
        satuan,
        jenis_proses: jenisProses,
        is_active: Number(isActive),
      };

      if (editId) {
        await axiosClient.put(`/api/layanan/${editId}`, payload);
        toast('Paket layanan diperbarui');
      } else {
        await axiosClient.post('/api/layanan', payload);
        toast('Layanan baru tersimpan');
      }
      resetForm();
      await reload();
    } catch (err) {
      toast('Gagal menyimpan: ' + errMsg(err), 'err');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (l: Layanan) => {
    setEditId(l.id);
    setNamaLayanan(l.nama_layanan);
    setHarga(String(l.harga));
    setSatuan(l.satuan);
    setJenisProses(l.jenis_proses || 'komplit');
    setIsActive(l.is_active ?? 1);
  };

  const resetForm = () => {
    setEditId(null);
    setNamaLayanan('');
    setHarga('');
    setSatuan('Kg');
    setJenisProses('komplit');
    setIsActive(1);
  };

  const filtered = layanan.filter((l) =>
    l.nama_layanan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Master Data</span>
          <h1>Paket Layanan</h1>
          <p>Kelola tarif dan jenis proses pencucian aktif.</p>
        </div>
      </div>

      {error && <div className="alert">{error}<button className="link" onClick={reload}>Coba lagi</button></div>}

      <div className="split">
        <section className="card">
          <div className="tile t-blue" style={{ marginBottom: 12 }}><Package size={18} /></div>
          <span className="eyebrow">{editId ? 'Edit Data' : 'Tambah Baru'}</span>
          <h3 style={{ fontSize: 20, margin: '4px 0 18px' }}>{editId ? 'Edit Layanan' : 'Layanan Baru'}</h3>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="nama">Nama Layanan</label>
              <input id="nama" className="input" value={namaLayanan} onChange={(e) => setNamaLayanan(e.target.value)} required placeholder="Contoh: Cuci Komplit Reguler" />
            </div>

            <div className="field">
              <label htmlFor="hrg">Harga Tarif (Rp)</label>
              <input id="hrg" className="input" type="number" min="0" value={harga} onChange={(e) => setHarga(e.target.value)} required placeholder="7000" />
            </div>

            <div className="field">
              <label htmlFor="sat">Satuan Tarif</label>
              <select id="sat" className="select" value={satuan} onChange={(e) => setSatuan(e.target.value)}>
                <option value="Kg">Kg</option>
                <option value="Pcs">Pcs</option>
                <option value="Meter">Meter</option>
                <option value="Pasang">Pasang</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="jns">Jenis Proses</label>
              <select id="jns" className="select" value={jenisProses} onChange={(e) => setJenisProses(e.target.value)}>
                <option value="komplit">Komplit (Cuci + Kering + Setrika)</option>
                <option value="cuci">Cuci saja (Tanpa Setrika)</option>
                <option value="setrika">Setrika Saja</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="statusLayanan">Status</label>
              <select id="statusLayanan" className="select" value={isActive} onChange={(e) => setIsActive(Number(e.target.value))}>
                <option value={1}>Aktif</option>
                <option value={0}>Nonaktif</option>
              </select>
            </div>

            <button type="submit" className="btn btn-block" disabled={saving}>
              <Plus size={16} /> {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Layanan'}
            </button>
            {editId && (
              <button type="button" className="btn btn-block" style={{ marginTop: 8, background: 'transparent', border: '1px solid var(--line)' }} onClick={resetForm}>
                Batal Edit
              </button>
            )}
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <div>
              <span className="eyebrow">Master Data</span>
              <h3>Layanan <span className="count">{layanan.length}</span></h3>
            </div>
            <div className="search">
              <Search size={15} />
              <input className="input" placeholder="Cari nama layanan" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Layanan</th>
                  <th>Tarif</th>
                  <th>Proses</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td>#{l.id}</td>
                    <td className="cell-main">{l.nama_layanan}</td>
                    <td><strong>{rupiah(l.harga)}</strong> / {l.satuan}</td>
                    <td>{JENIS_LABEL[jenisOf(l.jenis_proses)]}</td>
                    <td>
                      <span className={`badge ${(l.is_active ?? 1) === 1 ? 'badge-success' : 'badge-secondary'}`}>
                        {(l.is_active ?? 1) === 1 ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="icon-btn" onClick={() => handleEdit(l)} title="Edit Data & Status"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <div className="empty">Memuat layanan...</div>}
            {!isLoading && filtered.length === 0 && <div className="empty">Tidak ada layanan ditemukan.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}