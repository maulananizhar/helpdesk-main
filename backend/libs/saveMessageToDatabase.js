// Inisiasi koneksi ke database
import db from "../config/db.js";

const saveMessageToDatabase = async (room, name, sender, role, message) => {
  try {
    // Validasi input
    if (!room) {
      return console.error("Room is required!");
    }
    if (!name) {
      return console.error("Name is required!");
    }
    if (!sender) {
      return console.error("Sender is required!");
    }
    if (!role) {
      return console.error("Role is required!");
    }
    if (!message) {
      return console.error("Message is required!");
    }

    // Simpan pesan ke database
    const result = await db.query(
      "INSERT INTO chat (room, name, sender, role, message) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [room, name, sender, role, message]
    );

    return result.rows[0]; // Mengembalikan pesan yang baru disimpan
  } catch (error) {
    // Log error jika terjadi kesalahan saat menyimpan pesan
    console.error("Error sending message:", error);
  }
};

export default saveMessageToDatabase;
