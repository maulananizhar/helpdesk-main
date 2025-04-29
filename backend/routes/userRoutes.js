import express from "express"; // Import express untuk membuat router
import {
  submitForm, // Fungsi untuk mengirim formulir
  createUser, // Fungsi untuk membuat user baru
  verifyUser, // Fungsi untuk memverifikasi user
  loginUser, // Fungsi untuk login user
  verifyToken, // Fungsi untuk memverifikasi token
  getForms, // Fungsi untuk mendapatkan semua formulir
  getFormByTicket, // Fungsi untuk mendapatkan formulir berdasarkan tiket
  countForm, // Fungsi untuk menghitung jumlah formulir
  getStats, // Fungsi untuk mendapatkan statistik formulir
  addTestimonial, // Fungsi untuk menambahkan testimonial
  downloadFile, // Fungsi untuk mengunduh file
  forgotPassword, // Fungsi untuk mengirim email lupa kata sandi
  resetPassword, // Fungsi untuk mengatur ulang kata sandi
} from "../controller/userController.js";
import upload from "../middleware/multer.js"; // Import middleware untuk mengunggah file
import authUser from "../middleware/authUser.js"; // Import middleware untuk otentikasi user

// Create a new router instance
const userRouter = express.Router();

// Endpoint untuk mengirim formulir
userRouter.post("/formulir", upload.single("document"), submitForm);

// Endpoint untuk membuat user baru
userRouter.post("/auth/register", createUser);

// Endpoint untuk memverifikasi user
userRouter.get("/auth/verify/:token", verifyUser);

// Endpoint untuk login user
userRouter.post("/auth/login", loginUser);

// Endpoint untuk memverifikasi token
userRouter.post("/auth/token", verifyToken);

// Endpoint untuk mendapatkan semua formulir
userRouter.post("/get-forms", authUser, getForms);

// Endpoint untuk mendapatkan formulir berdasarkan tiket
userRouter.post("/get-form", authUser, getFormByTicket);

// Endpoint untuk menghitung jumlah formulir
userRouter.get("/count-form", countForm);

// Endpoint untuk mendapatkan statistik formulir
userRouter.get("/get-stats", authUser, getStats);

// Endpoint untuk menambahkan testimonial
userRouter.post("/add-testimonial", authUser, addTestimonial);

// Endpoint untuk mengunduh file
userRouter.get("/download/uploads/:filename", authUser, downloadFile);

// Endpoint untuk mengirim email lupa kata sandi
userRouter.post("/auth/forgot-password", forgotPassword);

// Endpoint untuk mengatur ulang kata sandi
userRouter.post("/auth/reset-password", resetPassword);

export default userRouter;
