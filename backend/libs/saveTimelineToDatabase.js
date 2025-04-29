// Inisiasi koneksi ke database
import db from "../config/db.js";

const saveTimelineToDatabase = async (ticket, title, subtitle) => {
  try {
    // Validasi input
    if (!ticket) {
      return console.error("Error: Ticket wajib diisi!");
    }
    if (!title) {
      return console.error("Error: Title wajib diisi!");
    }
    if (!subtitle) {
      return console.error("Error: Subtitle wajib diisi!");
    }

    // Simpan timeline ke database
    const data = await db.query(
      "INSERT INTO timeline (ticket, title, subtitle) VALUES ($1, $2, $3) RETURNING *",
      [ticket, title, subtitle]
    );

    // Kembalikan data timeline yang baru ditambahkan
    return data.rows[0];
  } catch (error) {
    // Log error jika terjadi kesalahan
    console.error("Error adding timeline:", error);
  }
};

export default saveTimelineToDatabase;
