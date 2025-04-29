// Inisiasi koneksi ke database
import db from "../config/db.js";

const deleteTimelineById = async id => {
  try {
    // Validasi input
    if (!id) {
      return console.error("ID wajib diisi!");
    }

    // Hapus timeline dari database berdasarkan ID
    await db.query("DELETE FROM timeline WHERE id = $1", [id]);

    return;
  } catch (error) {
    // Tangani error jika terjadi kesalahan saat menghapus
    console.error("Error deleting timeline:", error);
  }
};

export default deleteTimelineById;
