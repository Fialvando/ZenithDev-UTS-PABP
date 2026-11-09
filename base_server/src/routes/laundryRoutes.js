const express = require('express');
const router = express.Router();
const laundryController = require('../controllers/laundryController');

// Route Master Data Pelanggan
router.get('/pelanggan', laundryController.getAllPelanggan);
router.post('/pelanggan', laundryController.createPelanggan);
router.put('/pelanggan/:id', laundryController.updatePelanggan);
router.delete('/pelanggan/:id', laundryController.deletePelanggan);

// Route Master Data Layanan
router.get('/layanan', laundryController.getAllLayanan);
router.post('/layanan', laundryController.createLayanan);
router.put('/layanan/:id', laundryController.updateLayanan);
router.delete('/layanan/:id', laundryController.deleteLayanan);

// Route Transaksi Pesanan Laundry
router.get('/pesanan', laundryController.getAllPesanan);
router.get('/laporan-pesanan', laundryController.getLaporanPesanan);
router.post('/pesanan', laundryController.createPesanan);
router.put('/pesanan/:id/status', laundryController.updateStatusPesanan);
router.put('/pesanan/:id/bayar', laundryController.updateStatusBayar);
router.delete('/pesanan/:id', laundryController.deletePesanan);

module.exports = router;