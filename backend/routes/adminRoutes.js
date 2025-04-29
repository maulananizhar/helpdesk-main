// Import modul Express untuk membuat router dan aplikasi HTTP
import express from "express";

// Import fungsi-fungsi controller dari file adminController.js
// Fungsi-fungsi tersebut mengatur logika operasi seperti login, pengambilan data, update, delete, dan download
import {
  loginAdmin, // Fungsi untuk login admin
  loginPIC, // Fungsi untuk login PIC (Person In Charge)
  getAllUser, // Fungsi untuk mengambil semua data user
  getUserById, // Fungsi untuk mengambil data user berdasarkan ID
  updateUser, // Fungsi untuk memperbarui data user
  deleteUser, // Fungsi untuk menghapus user
  createUser, // Fungsi untuk membuat user baru
  getFormById, // Fungsi untuk mengambil data formulir berdasarkan ID
  updateForm, // Fungsi untuk memperbarui data formulir
  deleteForm, // Fungsi untuk menghapus formulir
  getAllPICUsers, // Fungsi untuk mengambil data user dengan peran PIC
  getAllFormulir, // Fungsi untuk mengambil semua data formulir
  getJenisLayanan, // Fungsi untuk mengambil semua jenis layanan
  addJenisLayanan, // Fungsi untuk menambahkan jenis layanan baru
  deleteJenisLayanan, // Fungsi untuk menghapus jenis layanan berdasarkan ID
  getJenisLayananById, // Fungsi untuk mengambil jenis layanan berdasarkan ID
  getAllFormulirPIC, // Fungsi untuk mengambil data formulir yang ditugaskan kepada PIC
  getSubJenisLayanan, // Fungsi untuk mengambil semua data sub jenis layanan
  getSubJenisLayananById, // Fungsi untuk mengambil sub jenis layanan berdasarkan ID
  addSubJenisLayanan, // Fungsi untuk menambahkan data sub jenis layanan baru
  deleteSubJenisLayanan, // Fungsi untuk menghapus data sub jenis layanan berdasarkan ID
  downloadFile, // Fungsi untuk mengunduh file
  updatePIC, // Fungsi untuk memperbarui data PIC
  sortFormulirWithDate, // Fungsi untuk mensortir informasi formulir berdasarkan Tanggal
  getUlasanHelpdesk, // Fungsi untuk menambahkan data ulasan helpdesk
  getUlasanPIC, // Fungsi untuk menambahkan data ulasan PIC
} from "../controller/adminController.js";

// Import middleware otentikasi khusus admin
import authAdmin from "../middleware/authAdmin.js";

// Import middleware otentikasi khusus PIC
import authPIC from "../middleware/authPIC.js";

// Buat instance router dari Express untuk mendefinisikan route-route admin
const adminRouter = express.Router();

// Buat instance aplikasi Express (meskipun instance ini tidak digunakan secara langsung dalam route)
const app = express();

// Definisikan route POST untuk login admin, menggunakan fungsi loginAdmin
adminRouter.post("/login", loginAdmin);

// Definisikan route GET untuk mengambil semua user
// Middleware otentikasi authPIC atau authAdmin digunakan untuk mengamankan route ini
adminRouter.get("/users", authPIC || authAdmin, getAllUser);

// Definisikan route GET untuk mengambil semua user dengan peran PIC
// Menggunakan middleware otentikasi authPIC atau authAdmin
adminRouter.get("/users-pic", authPIC || authAdmin, getAllPICUsers);

// Definisikan route GET untuk mengambil user berdasarkan ID
// Route ini menggunakan parameter URL :id dan middleware otentikasi
adminRouter.get("/users/:id", authPIC || authAdmin, getUserById);

// Definisikan route PUT untuk memperbarui data user berdasarkan ID
adminRouter.put("/users/:id", authPIC || authAdmin, updateUser);

// Definisikan route DELETE untuk menghapus user berdasarkan ID
adminRouter.delete("/users/:id", authPIC || authAdmin, deleteUser);

// Definisikan route POST untuk membuat user baru
adminRouter.post("/users", authPIC || authAdmin, createUser);

// Definisikan route GET untuk mengambil semua data formulir
adminRouter.get("/form", authPIC || authAdmin, getAllFormulir);

// Definisikan route GET untuk mengambil data formulir khusus PIC
// Di sini hanya middleware authPIC yang digunakan
adminRouter.get("/formPIC", authPIC, getAllFormulirPIC);

// Definisikan route GET untuk mengambil semua sub jenis layanan
adminRouter.get("/subjenislayanan", authPIC || authAdmin, getSubJenisLayanan);

// Definisikan route POST untuk menambahkan data sub jenis layanan baru
adminRouter.post("/subjenislayanan", authPIC || authAdmin, addSubJenisLayanan);

// Definisikan route GET untuk mengambil sub jenis layanan berdasarkan ID
adminRouter.get(
  "/subjenislayanan/:id",
  authAdmin || authPIC,
  getSubJenisLayananById
);

// Definisikan route DELETE untuk menghapus sub jenis layanan berdasarkan ID
adminRouter.delete(
  "/subjenislayanan/:id",
  authAdmin || authPIC,
  deleteSubJenisLayanan
);

// Definisikan route PUT untuk memperbarui data PIC berdasarkan ID
// Hanya admin yang diizinkan untuk melakukan update data PIC (hanya authAdmin)
adminRouter.put("/pic/:id", authAdmin, updatePIC);

// Definisikan route GET untuk mengambil semua jenis layanan
adminRouter.get("/jenislayanan", authPIC || authAdmin, getJenisLayanan);

// Definisikan route POST untuk menambahkan jenis layanan baru
adminRouter.post("/jenislayanan", authPIC || authAdmin, addJenisLayanan);

// Definisikan route DELETE untuk menghapus jenis layanan berdasarkan ID
adminRouter.delete(
  "/jenislayanan/:id",
  authPIC || authAdmin,
  deleteJenisLayanan
);

// Definisikan route GET untuk mengambil jenis layanan berdasarkan ID
adminRouter.get("/jenislayanan/:id", authPIC || authAdmin, getJenisLayananById);

// --- PIC Routes ---
// Definisikan route POST untuk login PIC, menggunakan fungsi loginPIC
adminRouter.post("/pic/login", loginPIC);

// Definisikan route GET untuk mengambil semua user untuk PIC (tanpa middleware otentikasi khusus)
// Perlu diingat bahwa di sini tidak ada middleware otentikasi sehingga akses bisa lebih terbuka
adminRouter.get("/pic/users", getAllUser);

// Definisikan route GET untuk mengambil data user berdasarkan ID untuk PIC
adminRouter.get("/pic/users/:id", getUserById);

// Definisikan route PUT untuk memperbarui data user berdasarkan ID untuk PIC
adminRouter.put("/pic/users/:id", updateUser);

// Definisikan route DELETE untuk menghapus user berdasarkan ID untuk PIC
adminRouter.delete("/pic/users/:id", deleteUser);

// Definisikan route GET untuk mengambil detail formulir berdasarkan ID
adminRouter.get("/formulir/:id", authPIC || authAdmin, getFormById);

// Definisikan route PUT untuk memperbarui data formulir berdasarkan ID
adminRouter.put("/formulir/:id", authPIC || authAdmin, updateForm);

// Definisikan route DELETE untuk menghapus data formulir berdasarkan ID
adminRouter.delete("/formulir/:id", authPIC || authAdmin, deleteForm);

// Definisikan route GET untuk mengunduh file dari folder uploads berdasarkan nama file
adminRouter.get(
  "/download/uploads/:filename",
  authPIC || authAdmin,
  downloadFile
);

// Definisikan route POST untuk menyortir data formulir berdasarkan Tanggal
adminRouter.post("/form/sort", authPIC || authAdmin, sortFormulirWithDate);

adminRouter.get("/form/:id", getFormById);

adminRouter.post(
  "/testimonial-helpdesk",
  authPIC || authAdmin,
  getUlasanHelpdesk
);

adminRouter.post("/testimonial-pic", authPIC || authAdmin, getUlasanPIC);

// Ekspor router admin agar dapat digunakan di file utama aplikasi
export default adminRouter;
