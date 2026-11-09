const { db } = require('../config/database');

/* =========================================================
 * QUERY PESANAN (Filter is_active = 1 untuk antrean kasir)
 * ========================================================= */
const findAllPesanan = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        p.id, 
        pl.nama AS nama_pelanggan, 
        l.nama_layanan, 
        l.jenis_proses,
        p.qty, 
        l.satuan, 
        p.total_harga, 
        p.status_pengerjaan, 
        p.status_bayar, 
        p.created_at
      FROM pesanan p
      JOIN pelanggan pl ON p.pelanggan_id = pl.id
      JOIN layanan l ON p.layanan_id = l.id
      WHERE p.is_active = 1
      ORDER BY p.id ASC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const createPesanan = (data) => {
  return new Promise((resolve, reject) => {
    const { pelanggan_id, layanan_id, qty, total_harga } = data;
    const sql = `
      INSERT INTO pesanan (pelanggan_id, layanan_id, qty, total_harga, status_pengerjaan, status_bayar)
      VALUES (?, ?, ?, ?, 'Antri', 'Belum Lunas')
    `;
    db.run(sql, [pelanggan_id, layanan_id, qty, total_harga], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, ...data });
    });
  });
};

const updateStatusPesanan = (id, status_pengerjaan) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE pesanan SET status_pengerjaan = ? WHERE id = ? AND is_active = 1`;
    db.run(sql, [status_pengerjaan, id], function (err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
};

const updateStatusBayar = (id, status_bayar) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE pesanan SET status_bayar = ? WHERE id = ? AND is_active = 1`;
    db.run(sql, [status_bayar, id], function (err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
};

const deletePesanan = (id) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE pesanan SET is_active = 0 WHERE id = ?', [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
};

/* =========================================================
 * QUERY LAPORAN (Semua pesanan yang tidak batal, mengabaikan is_active agar data yang dihapus dari kasir tetap masuk laporan)
 * ========================================================= */
const findLaporanPesanan = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        p.id, 
        pl.nama AS nama_pelanggan, 
        l.nama_layanan, 
        l.jenis_proses,
        p.qty, 
        l.satuan, 
        p.total_harga, 
        p.status_pengerjaan, 
        p.status_bayar, 
        p.created_at
      FROM pesanan p
      JOIN pelanggan pl ON p.pelanggan_id = pl.id
      JOIN layanan l ON p.layanan_id = l.id
      ORDER BY p.id ASC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

/* =========================================================
 * QUERY MASTER DATA PELANGGAN
 * ========================================================= */
const findAllPelanggan = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM pelanggan ORDER BY id ASC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
const createPelanggan = (data) => {
  return new Promise((resolve, reject) => {
    const { nama, no_hp, alamat } = data;
    db.run('INSERT INTO pelanggan (nama, no_hp, alamat) VALUES (?, ?, ?)', [nama, no_hp, alamat], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, ...data });
    });
  });
};

const updatePelanggan = (id, data) => {
  return new Promise((resolve, reject) => {
    const { nama, no_hp, alamat, is_active } = data; 
    const activeVal = is_active !== undefined ? is_active : 1; 

    db.run(
      'UPDATE pelanggan SET nama = ?, no_hp = ?, alamat = ?, is_active = ? WHERE id = ?',
      [nama, no_hp, alamat, activeVal, id],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
};


const deletePelanggan = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as total FROM pesanan WHERE pelanggan_id = ?', [id], (err, row) => {
      if (err) return reject(err);

      if (row.total > 0) {
        db.run('UPDATE pelanggan SET is_active = 0 WHERE id = ?', [id], function (errUpdate) {
          if (errUpdate) reject(errUpdate);
          else resolve({ type: 'deactivated', success: this.changes > 0 });
        });
      } else {
        db.run('DELETE FROM pelanggan WHERE id = ?', [id], function (errDelete) {
          if (errDelete) reject(errDelete);
          else resolve({ type: 'deleted', success: this.changes > 0 });
        });
      }
    });
  });
};

/* =========================================================
 * QUERY MASTER DATA LAYANAN
 * ========================================================= */
const findAllLayanan = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM layanan ORDER BY id ASC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const createLayanan = (data) => {
  return new Promise((resolve, reject) => {
    const { nama_layanan, harga, satuan, jenis_proses } = data;
    db.run(
      'INSERT INTO layanan (nama_layanan, harga, satuan, jenis_proses) VALUES (?, ?, ?, ?)',
      [nama_layanan, harga, satuan, jenis_proses || 'komplit'],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data });
      }
    );
  });
};

const updateLayanan = (id, data) => {
  return new Promise((resolve, reject) => {
    const { nama_layanan, harga, satuan, jenis_proses, is_active } = data; 
    const activeVal = is_active !== undefined ? is_active : 1;

    db.run(
      'UPDATE layanan SET nama_layanan = ?, harga = ?, satuan = ?, jenis_proses = ?, is_active = ? WHERE id = ?',
      [nama_layanan, harga, satuan, jenis_proses, activeVal, id],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
};


const deleteLayanan = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as total FROM pesanan WHERE layanan_id = ?', [id], (err, row) => {
      if (err) return reject(err);

      if (row.total > 0) {
        db.run('UPDATE layanan SET is_active = 0 WHERE id = ?', [id], function (errUpdate) {
          if (errUpdate) reject(errUpdate);
          else resolve({ type: 'deactivated', success: this.changes > 0 });
        });
      } else {
        db.run('DELETE FROM layanan WHERE id = ?', [id], function (errDelete) {
          if (errDelete) reject(errDelete);
          else resolve({ type: 'deleted', success: this.changes > 0 });
        });
      }
    });
  });
};

module.exports = {
  findAllPesanan,
  createPesanan,
  updateStatusPesanan,
  updateStatusBayar,
  deletePesanan,
  findLaporanPesanan,
  findAllPelanggan,
  createPelanggan,
  updatePelanggan,
  deletePelanggan,
  findAllLayanan,
  createLayanan,
  updateLayanan,
  deleteLayanan,
};