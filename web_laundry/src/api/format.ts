import axios from 'axios';

export const rupiah = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

// SQLite CURRENT_TIMESTAMP = UTC "YYYY-MM-DD HH:MM:SS"
export const toDate = (s: string) => new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');

export const waktu = (s?: string) =>
  s
    ? toDate(s)
        .toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
        .replace(',', '')
    : '-';

export const isToday = (s?: string) => !!s && toDate(s).toDateString() === new Date().toDateString();

export const kode = (id: number) => `LS-${String(id).padStart(4, '0')}`;

export function errMsg(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (e.response?.status === 404) return 'Endpoint belum tersedia di server API.';
    const d = e.response?.data;
    if (d?.error || d?.message) return String(d.error ?? d.message);
    return e.message;
  }
  return 'Terjadi kesalahan.';
}