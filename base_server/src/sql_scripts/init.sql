CREATE TABLE IF NOT EXISTS pelanggan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  no_hp TEXT NOT NULL,
  alamat TEXT,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS layanan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_layanan TEXT NOT NULL,
  harga REAL NOT NULL,
  satuan TEXT NOT NULL,
  jenis_proses TEXT DEFAULT 'komplit',
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS pesanan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pelanggan_id INTEGER NOT NULL,
  layanan_id INTEGER NOT NULL,
  qty REAL NOT NULL,
  total_harga REAL NOT NULL,
  status_pengerjaan TEXT DEFAULT 'Antri',
  status_bayar TEXT DEFAULT 'Belum Lunas',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id),
  FOREIGN KEY (layanan_id) REFERENCES layanan(id)
);