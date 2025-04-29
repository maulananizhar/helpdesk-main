// Inisiasi koneksi ke database
import db from "../config/db.js";

const saveNotificationsToDatabase = async (receiver, message) => {
  try {
    // Validasi input
    if (!receiver) {
      return console.error("Error: Receiver wajib diisi!");
    }
    if (!message) {
      return console.error("Error: Message wajib diisi!");
    }

    // Simpan notifikasi ke database
    const data = await db.query(
      "INSERT INTO notifications (receiver, message) VALUES ($1, $2) RETURNING *",
      [receiver, message]
    );

    return data.rows[0];
  } catch (error) {
    // Log error jika terjadi kesalahan
    console.error("Error adding timeline:", error);
  }
};

export default saveNotificationsToDatabase;
