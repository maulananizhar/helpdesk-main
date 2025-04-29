// Inisiasi koneksi ke database
import db from "../config/db.js";

const getNotifications = async receiver => {
  try {
    // Validasi input
    if (!receiver) {
      return console.error("Receiver is required!");
    }

    // Ambil notifikasi dari database
    const result = await db.query(
      "SELECT * FROM notifications WHERE receiver = $1 ORDER BY id DESC LIMIT 10",
      [receiver]
    );

    return result.rows;
  } catch (error) {
    // Tangani kesalahan
    console.error("Error retrieving notifications:", error);
  }
};

export default getNotifications;
