import { useCallback, useEffect, useState } from 'react';
import axiosClient from './axiosClient';
import type { ApiResponse, Layanan, Pelanggan, Pesanan } from '../types/laundry';

export function useLaundryData() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [layanan, setLayanan] = useState<Layanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [a, b, c] = await Promise.all([
        axiosClient.get<ApiResponse<Pesanan[]>>('/api/pesanan'),
        axiosClient.get<ApiResponse<Pelanggan[]>>('/api/pelanggan'),
        axiosClient.get<ApiResponse<Layanan[]>>('/api/layanan'),
      ]);
      setPesanan(a.data.data ?? []);
      setPelanggan(b.data.data ?? []);
      setLayanan(c.data.data ?? []);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Gagal mengambil data dari server. Pastikan API Node.js sudah berjalan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { pesanan, pelanggan, layanan, isLoading, error, reload };
}
