// Inisiasi koneksi ke database
import db from "../config/db.js";

const getTimeline = async ticket => {
  try {
    // Validasi input
    if (!ticket) {
      return console.error("Ticket is required!");
    }

    // Query untuk mendapatkan timeline berdasarkan ticket
    const result = await db.query(
      "SELECT * FROM timeline WHERE ticket = $1 ORDER BY id",
      [ticket]
    );

    return result.rows;
  } catch (error) {
    // Tangani error jika terjadi kesalahan saat query
    console.error("Error retrieving timeline:", error);
  }
};

export default getTimeline;
