// Impor modul db untuk koneksi ke database dari file konfigurasi
import db from "../config/db.js";
// Import fungsi validasi dari file libs
import validateFields from "../libs/validateFields.js";

const newChat = async (req, res) => {
  try {
    // Ambil data dari request body
    const { room, name, sender, role, message } = req.body;

    // Validasi input
    if (!validateFields({ room, name, sender, role, message }, res)) return;

    // Simpan pesan ke database
    await db.query(
      "INSERT INTO chat (room, name, sender, role, message) VALUES ($1, $2, $3, $4, $5)",
      [room, name, sender, role, message]
    );

    // Kirim respons sukses
    return res
      .status(200)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    // Tangani kesalahan dan kirim respons error
    console.error("Error sending message:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getChatsByRoom = async (req, res) => {
  try {
    // Ambil data room dari request body
    const { room } = req.body;

    // Validasi input
    if (!validateFields({ room }, res)) return;

    // Ambil pesan dari database berdasarkan room
    const result = await db.query(
      "SELECT * FROM chat WHERE room = $1 ORDER BY id",
      [room]
    );

    // Kirim respons dengan data pesan
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    // Tangani kesalahan dan kirim respons error
    console.error("Error retrieving chats:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const addTimeline = async (req, res) => {
  try {
    // Ambil data dari request body
    const { ticket, title, subtitle } = req.body;

    // Validasi input
    if (!validateFields({ ticket, title, subtitle }, res)) return;

    // Simpan timeline ke database
    await db.query(
      "INSERT INTO timeline (ticket, title, subtitle) VALUES ($1, $2, $3)",
      [ticket, title, subtitle]
    );

    // Kirim respons sukses
    res
      .status(200)
      .json({ success: true, message: "Timeline added successfully" });
  } catch (error) {
    // Tangani kesalahan dan kirim respons error
    console.error("Error adding timeline:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const deleteTimeline = async (req, res) => {
  try {
    // Ambil data dari request body
    const { id } = req.body;

    // Validasi input
    if (!validateFields({ id }, res)) return;

    // Hapus timeline dari database berdasarkan id
    await db.query("DELETE FROM timeline WHERE id = $1", [id]);

    // Kirim respons sukses
    res
      .status(200)
      .json({ success: true, message: "Timeline deleted successfully" });
  } catch (error) {
    // Tangani kesalahan dan kirim respons error
    console.error("Error deleting timeline:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getTimelineByTicket = async (req, res) => {
  try {
    // Ambil data ticket dari request body
    const { ticket } = req.body;

    // Validasi input
    if (!validateFields({ ticket }, res)) return;

    // Ambil timeline dari database berdasarkan ticket
    const result = await db.query(
      "SELECT * FROM timeline WHERE ticket = $1 ORDER BY id",
      [ticket]
    );

    // Kirim respons dengan data timeline
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving timeline:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export {
  newChat, // fungsi untuk mengirim pesan baru
  getChatsByRoom, // fungsi untuk mendapatkan pesan berdasarkan room
  addTimeline, // fungsi untuk menambahkan timeline baru
  deleteTimeline, // fungsi untuk menghapus timeline berdasarkan id
  getTimelineByTicket, // fungsi untuk mendapatkan timeline berdasarkan ticket
};
