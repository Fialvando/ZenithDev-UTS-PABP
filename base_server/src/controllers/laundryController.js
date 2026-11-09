const laundryModel = require('../models/laundryModel');

/* =========================================================
 * Helper: standard response biar konsisten
 * ========================================================= */
const success = (res, code, message, data = null) =>
  res.status(code).json({ success: true, message, data });

const fail = (res, code, message, error = null) =>
  res.status(code).json({ success: false, message, error });

/* =========================================================
 * GET /api/pesanan — Ambil semua transaksi pesanan
 * ========================================================= */
const getAllPesanan = async (req, res) => {
  try {
    const pesanan = await laundryModel.findAllPesanan();
    success(res, 200, 'Berhasil mengambil semua pesanan', pesanan);
  } catch (error) {
    console.error('[getAllPesanan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * GET /api/laporan-pesanan — Ambil laporan transaksi
 * ========================================================= */
const getLaporanPesanan = async (req, res) => {
  try {
    const pesanan = await laundryModel.findLaporanPesanan();
    success(res, 200, 'Berhasil mengambil data laporan pesanan', pesanan);
  } catch (error) {
    console.error('[getLaporanPesanan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * MASTER DATA PELANGGAN
 * ========================================================= */
const getAllPelanggan = async (req, res) => {
  try {
    const pelanggan = await laundryModel.findAllPelanggan();
    success(res, 200, 'Berhasil mengambil data pelanggan', pelanggan);
  } catch (error) {
    console.error('[getAllPelanggan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const createPelanggan = async (req, res) => {
  try {
    const { nama, no_hp, alamat } = req.body;
    if (!nama || !no_hp) {
      return fail(res, 400, 'Validasi gagal', 'nama dan no_hp wajib diisi');
    }
    const created = await laundryModel.createPelanggan({ nama, no_hp, alamat });
    success(res, 201, 'Pelanggan berhasil ditambahkan', created);
  } catch (error) {
    console.error('[createPelanggan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const updatePelanggan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, no_hp, alamat, is_active } = req.body;
    const updated = await laundryModel.updatePelanggan(id, { nama, no_hp, alamat, is_active });
    if (!updated) return fail(res, 404, 'Pelanggan tidak ditemukan');
    success(res, 200, 'Pelanggan berhasil diperbarui', updated);
  } catch (error) {
    console.error('[updatePelanggan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const deletePelanggan = async (req, res) => {
  try {
    const deleted = await laundryModel.deletePelanggan(req.params.id);
    if (!deleted) return fail(res, 404, 'Pelanggan tidak ditemukan');
    success(res, 200, 'Pelanggan berhasil dihapus');
  } catch (error) {
    console.error('[deletePelanggan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * MASTER DATA LAYANAN
 * ========================================================= */
const getAllLayanan = async (req, res) => {
  try {
    const layanan = await laundryModel.findAllLayanan();
    success(res, 200, 'Berhasil mengambil data layanan', layanan);
  } catch (error) {
    console.error('[getAllLayanan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const createLayanan = async (req, res) => {
  try {
    const { nama_layanan, harga, satuan, jenis_proses } = req.body;
    if (!nama_layanan || !harga || !satuan) {
      return fail(res, 400, 'Validasi gagal', 'nama_layanan, harga, dan satuan wajib diisi');
    }
    const created = await laundryModel.createLayanan({ nama_layanan, harga, satuan, jenis_proses });
    success(res, 201, 'Layanan berhasil ditambahkan', created);
  } catch (error) {
    console.error('[createLayanan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const updateLayanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_layanan, harga, satuan, jenis_proses, is_active } = req.body;
    const updated = await laundryModel.updateLayanan(id, { nama_layanan, harga, satuan, jenis_proses, is_active });
    if (!updated) return fail(res, 404, 'Layanan tidak ditemukan');
    success(res, 200, 'Layanan berhasil diperbarui', updated);
  } catch (error) {
    console.error('[updateLayanan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const deleteLayanan = async (req, res) => {
  try {
    const deleted = await laundryModel.deleteLayanan(req.params.id);
    if (!deleted) return fail(res, 404, 'Layanan tidak ditemukan');
    success(res, 200, 'Layanan berhasil dihapus');
  } catch (error) {
    console.error('[deleteLayanan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

/* =========================================================
 * TRANSAKSI PESANAN
 * ========================================================= */
const createPesanan = async (req, res) => {
  try {
    const { pelanggan_id, layanan_id, qty, total_harga } = req.body;

    if (!pelanggan_id || !layanan_id) {
      return fail(res, 400, 'Validasi gagal', 'pelanggan_id dan layanan_id wajib diisi');
    }
    if (!qty || isNaN(qty) || qty <= 0) {
      return fail(res, 400, 'Validasi gagal', 'qty harus berupa angka > 0');
    }
    if (!total_harga || isNaN(total_harga) || total_harga <= 0) {
      return fail(res, 400, 'Validasi gagal', 'total_harga harus berupa angka > 0');
    }

    const created = await laundryModel.createPesanan(req.body);
    success(res, 201, 'Pesanan berhasil dibuat', created);
  } catch (error) {
    console.error('[createPesanan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const updateStatusPesanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pengerjaan } = req.body;

    if (!status_pengerjaan) {
      return fail(res, 400, 'Validasi gagal', 'status_pengerjaan wajib diisi');
    }

    const updated = await laundryModel.updateStatusPesanan(id, status_pengerjaan);
    if (!updated) return fail(res, 404, 'Pesanan tidak ditemukan');

    success(res, 200, 'Status pesanan berhasil diupdate', updated);
  } catch (error) {
    console.error('[updateStatusPesanan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const updateStatusBayar = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_bayar } = req.body;

    if (!status_bayar) {
      return fail(res, 400, 'Validasi gagal', 'status_bayar wajib diisi');
    }

    const updated = await laundryModel.updateStatusBayar(id, status_bayar);
    if (!updated) return fail(res, 404, 'Pesanan tidak ditemukan');

    success(res, 200, 'Status pembayaran berhasil diupdate', updated);
  } catch (error) {
    console.error('[updateStatusBayar]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

const deletePesanan = async (req, res) => {
  try {
    const deleted = await laundryModel.deletePesanan(req.params.id);
    if (!deleted) return fail(res, 404, 'Pesanan tidak ditemukan');

    success(res, 200, 'Pesanan berhasil dihapus');
  } catch (error) {
    console.error('[deletePesanan]', error);
    fail(res, 500, 'Server Error', error.message);
  }
};

module.exports = {
  getAllPesanan,
  getLaporanPesanan,
  getAllPelanggan,
  createPelanggan,
  updatePelanggan,
  deletePelanggan,
  getAllLayanan,
  createLayanan,
  updateLayanan,
  deleteLayanan,
  createPesanan,
  updateStatusPesanan,
  updateStatusBayar,
  deletePesanan
};