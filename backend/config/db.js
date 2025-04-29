// Impor modul 'pg' untuk berinteraksi dengan database PostgreSQL
import pg from "pg";

// Impor fungsi 'config' dari modul 'dotenv' untuk memuat variabel lingkungan dari file .env
import { config } from "dotenv";

// Jalankan konfigurasi dotenv agar variabel lingkungan (environment variables) tersedia
config();

// Lakukan destrukturisasi objek 'pg' untuk mengambil konstruktor 'Pool'
// Pool digunakan untuk mengelola kumpulan koneksi ke database PostgreSQL
const { Pool } = pg;

// Buat instance pool koneksi ke database dengan menggunakan parameter yang diambil dari variabel lingkungan
const db = new Pool({
    user: process.env.PG_USER,           // Nama pengguna database (PG_USER)
    host: process.env.PG_HOST,           // Alamat host/server database (PG_HOST)
    database: process.env.PG_DATABASE,   // Nama database yang ingin diakses (PG_DATABASE)
    password: process.env.PG_PASSWORD,   // Password untuk koneksi ke database (PG_PASSWORD)
    port: process.env.PG_PORT,           // Port yang digunakan untuk koneksi ke database (PG_PORT)
});

// Mencoba untuk menghubungkan ke database menggunakan pool yang telah dibuat
db.connect()
    // Jika koneksi berhasil, tampilkan pesan sukses di konsol
    .then(() => console.log("Database connected successfully"))
    // Jika terjadi error saat koneksi, tampilkan pesan error di konsol
    .catch(err => console.error("Database connection error:", err));

// Ekspor instance pool 'db' agar dapat digunakan di modul atau file lain
export default db;
