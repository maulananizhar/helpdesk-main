import express from "express"; // Import express js
import authUser from "../middleware/authUser.js"; // Import middleware untuk autentifikasi pengguna
import authPIC from "../middleware/authPIC.js"; // Import middleware untuk autentifikasi PIC
import authAdmin from "../middleware/authAdmin.js"; // Import middleware untuk autentifikasi admin

import {
  addTimeline, // Fungsi untuk menambahkan timeline
  deleteTimeline, // Fungsi untuk menghapus timeline
  getChatsByRoom, // Fungsi untuk mendapatkan chat berdasarkan room
  getTimelineByTicket, // Fungsi untuk mendapatkan timeline berdasarkan tiket
  newChat, // Fungsi untuk menambahkan chat
} from "../controller/formController.js";

// Inisiasi router express
const formRouter = express.Router();

// Endpoint untuk menambahkan chat baru
formRouter.post("/new-chat/", authUser || authPIC || authAdmin, newChat);

// Endpoint untuk mendapatkan chat berdasarkan room
formRouter.post(
  "/get-chats-by-room/",
  authUser || authPIC || authAdmin,
  getChatsByRoom
);

// Endpoint untuk menambahkan timeline
formRouter.post(
  "/add-timeline/",
  authUser || authPIC || authAdmin,
  addTimeline
);

// Endpoint untuk menghapus timeline
formRouter.delete("/delete-timeline/", authPIC || authAdmin, deleteTimeline);

// Endpoint untuk mendapatkan timeline berdasarkan tiket
formRouter.post(
  "/get-timeline-by-ticket/",
  authUser || authPIC || authAdmin,
  getTimelineByTicket
);

export default formRouter;
