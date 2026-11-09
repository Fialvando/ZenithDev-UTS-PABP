import React, { useState, type FormEvent } from 'react';
import { Plus, Search, Edit2, Users } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useLaundryData } from '../api/useLaundryData';
import { useToast } from '../api/Toast';
import { errMsg } from '../api/format';
import type { Pelanggan } from '../types/laundry';

export default function PelangganPage() {
  const { pelanggan, isLoading, error, reload } = useLaundryData();
  const toast = useToast();

  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [isActive, setIsActive] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Validasi agar hanya angka yang bisa diketik/masuk
  const handleNoHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setNoHp(val);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nama || !noHp) return;

    try {
      setSaving(true);
      const payload = { 
        nama, 
        no_hp: noHp, 
        alamat, 
        is_active: Number(isActive) 
      };

      if (editId) {
        await axiosClient.put(`/api/pelanggan/${editId}`, payload);
        toast('Data pelanggan berhasil diperbarui');
      } else {
        await axiosClient.post('/api/pelanggan', payload);
        toast('Pelanggan baru tersimpan');
      }
      resetForm();
      await reload();
    } catch (err) {
      toast('Gagal menyimpan: ' + errMsg(err), 'err');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: Pelanggan) => {
    setEditId(p.id);
    setNama(p.nama);
    setNoHp(p.no_hp);
    setAlamat(p.alamat || '');
    setIsActive(p.is_active ?? 1);
  };

  const resetForm = () => {
    setEditId(null);
    setNama('');
    setNoHp('');
    setAlamat('');
    setIsActive(1);
  };

  const filtered = pelanggan.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.no_hp.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <span className="eyebrow">Master Data</span>
          <h1>Pelanggan</h1>
          <p>Kelola daftar pelanggan aktif yang berhak melakukan transaksi.</p>
        </div>
      </div>

      {error && <div className="alert">{error}<button className="link" onClick={reload}>Coba lagi</button></div>}

      <div className="split">
        <section className="card">
          <div className="tile t-blue" style={{ marginBottom: 12 }}><Users size={18} /></div>
          <span className="eyebrow">{editId ? 'Edit Data' : 'Tambah Baru'}</span>
          <h3 style={{ fontSize: 20, margin: '4px 0 18px' }}>{editId ? 'Edit Pelanggan' : 'Pelanggan Baru'}</h3>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="nama">Nama Lengkap</label>
              <input id="nama" className="input" value={nama} onChange={(e) => setNama(e.target.value)} required placeholder="Contoh: Vickyanto" />
            </div>

            <div className="field">
              <label htmlFor="hp">No. Telepon / WhatsApp</label>
              <input 
                id="hp" 
                className="input" 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={noHp} 
                onChange={handleNoHpChange} 
                required 
                placeholder="Contoh: 081234567890" 
              />
            </div>

            <div className="field">
              <label htmlFor="alamat">Alamat (Opsional)</label>
              <input id="alamat" className="input" value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Contoh: Jl. Ring Road No. 12" />
            </div>

            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" className="select" value={isActive} onChange={(e) => setIsActive(Number(e.target.value))}>
                <option value={1}>Aktif</option>
                <option value={0}>Nonaktif</option>
              </select>
            </div>

            <button type="submit" className="btn btn-block" disabled={saving}>
              <Plus size={16} /> {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
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
              <h3>Pelanggan <span className="count">{pelanggan.length}</span></h3>
            </div>
            <div className="search">
              <Search size={15} />
              <input className="input" placeholder="Cari nama atau HP" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Pelanggan</th>
                  <th>No. HP</th>
                  <th>Alamat</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td className="cell-main">{p.nama}</td>
                    <td>{p.no_hp}</td>
                    <td>{p.alamat || '-'}</td>
                    <td>
                      <span className={`badge ${(p.is_active ?? 1) === 1 ? 'badge-success' : 'badge-secondary'}`}>
                        {(p.is_active ?? 1) === 1 ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="icon-btn" onClick={() => handleEdit(p)} title="Edit Data & Status"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <div className="empty">Memuat pelanggan...</div>}
            {!isLoading && filtered.length === 0 && <div className="empty">Tidak ada pelanggan ditemukan.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}