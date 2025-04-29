// Import modul jsonwebtoken untuk melakukan verifikasi token JWT
import jwt from "jsonwebtoken";

// Middleware authPIC untuk memverifikasi token JWT bagi user dengan peran PIC
const authUser = async (req, res, next) => {
  try {
    // Ambil header authorization dari request
    const authHeader = req.headers.authorization;

    // Jika header authorization tidak ada atau tidak diawali dengan "Bearer ",
    // kembalikan respons error 401 (Unauthorized) dengan pesan yang sesuai
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // Pisahkan token dari header dengan asumsi format header adalah "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verifikasi token menggunakan secret key yang tersimpan pada environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data hasil decode token ke dalam request pada properti 'pic'
    // Hal ini memungkinkan data token (misalnya id atau role) untuk diakses di middleware/handler berikutnya
    req.user = decoded;

    // Lanjutkan ke middleware atau route handler berikutnya
    next();
  } catch (error) {
    // Jika terjadi error selama verifikasi token (misalnya token tidak valid atau sudah kadaluarsa),
    // log error tersebut ke console
    console.error("JWT Verification Error:", error);
    // Kembalikan respons error 403 (Forbidden) dengan pesan yang sesuai
    return res.status(403).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

// Ekspor middleware authPIC agar dapat digunakan di file lain
export default authUser;
