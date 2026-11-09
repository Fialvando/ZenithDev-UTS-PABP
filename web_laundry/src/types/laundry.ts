export type JenisProses = 'cuci' | 'setrika' | 'komplit';

export const JENIS_LABEL: Record<JenisProses, string> = {
  cuci: 'Cuci saja',
  setrika: 'Setrika saja',
  komplit: 'Cuci + setrika',
};

// Alur status mengikuti jenis proses layanan
export const ALUR: Record<JenisProses, string[]> = {
  cuci: ['Diterima', 'Dicuci', 'Siap Ambil', 'Selesai'],
  setrika: ['Diterima', 'Disetrika', 'Siap Ambil', 'Selesai'],
  komplit: ['Diterima', 'Dicuci', 'Disetrika', 'Siap Ambil', 'Selesai'],
};

export const STATUS_FLOW = ['Diterima', 'Dicuci', 'Disetrika', 'Siap Ambil', 'Selesai'] as const;
export const STATUS_AKTIF: string[] = STATUS_FLOW.slice(0, -1);

export const jenisOf = (j?: string | null): JenisProses => {
  if (!j) return 'komplit';
  const val = j.toLowerCase().trim();
  if (val === 'cuci' || val === 'cuci_kering' || val === 'cuci-kering') return 'cuci';
  if (val === 'setrika') return 'setrika';
  return 'komplit';
};

export type StatusBayar = 'Belum Lunas' | 'Lunas';

export interface Pelanggan {
  id: number;
  nama: string;
  no_hp: string;
  alamat: string | null;
  is_active?: number;
  created_at: string;
}

export interface Layanan {
  id: number;
  nama_layanan: string;
  harga: number;
  satuan: string;
  jenis_proses?: JenisProses;
  is_active?: number;
  created_at: string;
}

export interface Pesanan {
  id: number;
  nama_pelanggan: string;
  nama_layanan: string;
  jenis_proses?: JenisProses;
  qty: number;
  satuan: string;
  total_harga: number;
  status_pengerjaan: string;
  status_bayar: StatusBayar;
  is_active?: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}