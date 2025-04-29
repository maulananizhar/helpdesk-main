// Impor modul jsonwebtoken untuk melakukan verifikasi token JWT
import jwt from "jsonwebtoken";

// Middleware authAdmin untuk memverifikasi token JWT dan memastikan user memiliki role "Admin"
const authAdmin = async (req, res, next) => {
  try {
    // Ambil header authorization dari request
    const authHeader = req.headers.authorization;
    
    // Jika header tidak ada atau tidak diawali dengan "Bearer ", kembalikan respons error 401 (Unauthorized)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: No token provided" 
      });
    }

    // Pisahkan token dari header; asumsikan format header adalah "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verifikasi token menggunakan secret key yang disimpan di environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Jika role dari token yang didekode bukan "Admin", kembalikan respons error 403 (Forbidden)
    if (decoded.role !== "Admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: Admin Only" 
      });
    }

    // Simpan data hasil decode token ke dalam request agar bisa digunakan di route selanjutnya
    req.admin = decoded;

    // Lanjutkan ke middleware atau handler berikutnya
    next();
  } catch (error) {
    // Jika terjadi error saat verifikasi token (misalnya token tidak valid atau kedaluwarsa), log error
    console.error("JWT Verification Error:", error);
    // Kembalikan respons error 403 dengan pesan token tidak valid atau kadaluarsa
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or Expired Token" 
    });
  }
};

// Ekspor middleware authAdmin agar dapat digunakan di file lain
export default authAdmin;
