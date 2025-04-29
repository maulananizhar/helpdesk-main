// Impor modul express untuk membuat aplikasi web
import express from "express";
// Impor modul cors untuk mengizinkan permintaan dari domain lain (Cross-Origin Resource Sharing)
import cors from "cors";
// Impor fungsi createServer dari modul http untuk membuat server HTTP
import { createServer, get } from "http";
// Impor kelas Server dari modul socket.io untuk membuat server WebSocket
import { Server } from "socket.io";
// Impor konfigurasi database dari file db.js
import db from "./config/db.js";
// Impor router untuk user dari file userRoutes.js
import userRouter from "./routes/userRoutes.js";
// Impor router untuk admin dari file adminRoutes.js
import adminRouter from "./routes/adminRoutes.js";
// Impor middleware otentikasi untuk admin (tidak langsung digunakan di sini, tetapi diimpor jika dibutuhkan)
import authAdmin from "./middleware/authAdmin.js";
// Impor middleware otentikasi untuk PIC (Person In Charge) (tidak langsung digunakan di sini, tetapi diimpor jika dibutuhkan)
import authPIC from "./middleware/authPIC.js";
import formRouter from "./routes/formRoutes.js";
import getChatsByRoom from "./libs/getChatsByRoom.js";
import saveMessageToDatabase from "./libs/saveMessageToDatabase.js";
import getTimeline from "./libs/getTimeline.js";
import saveTimelineToDatabase from "./libs/saveTimelineToDatabase.js";
import {
  deleteTimeline,
  joinRoom,
  notification,
  sendMessage,
  sendTimeline,
} from "./controller/socketController.js";

// Buat instance aplikasi Express
const app = express();
// Tentukan port yang digunakan dari environment variable PORT atau default ke 3500
const port = process.env.PORT || 3500;

// Buat server HTTP menggunakan instance aplikasi Express
const server = createServer(app);

// Buat instance server socket.io dengan konfigurasi CORS agar dapat menerima koneksi dari origin manapun
const io = new Server(server, {
  cors: {
    origin: "*", // Mengizinkan koneksi dari semua origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Metode HTTP yang diizinkan
  },
});

// Middleware untuk mengurai body request dalam format JSON
app.use(express.json());
// Middleware untuk mengaktifkan CORS pada aplikasi
app.use(cors());

// Definisikan route dasar (root) yang mengembalikan pesan sederhana untuk memastikan API berjalan
app.get("/", (req, res) => {
  res.send("API Working");
});

// Gunakan router user untuk semua route yang diawali dengan "/user"
app.use("/user", userRouter);
// Gunakan router admin untuk semua route yang diawali dengan "/admin"
app.use("/admin", adminRouter);
// Gunakan router chat untuk semua route yang diawali dengan "/chat"
app.use("/form", formRouter);

// Konfigurasi event handler untuk socket.io saat ada koneksi dari client
io.on("connection", socket => {
  // Log bahwa client telah terhubung dan tampilkan id socket
  console.log("Client connected:", socket.id);

  joinRoom(io, socket);

  sendMessage(io, socket);

  sendTimeline(io, socket);

  deleteTimeline(io, socket);

  notification(io, socket);

  // Tangani event disconnect ketika client memutuskan koneksi
  socket.on("disconnect", () => {
    // Log bahwa client telah terputus
    console.log("Client disconnected:", socket.id);
  });
});

// Simpan instance io ke dalam aplikasi Express agar bisa diakses di route lainnya
app.set("io", io);

// Jalankan server HTTP pada port yang telah ditentukan dan log pesan bahwa server sudah berjalan
server.listen(port, () => console.log(`🚀 Server started on PORT:${port}`));
