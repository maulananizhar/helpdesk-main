// Impor modul multer untuk menangani unggahan file
import multer from "multer";
// Impor modul path untuk mengelola path file
import path from "path";

// Konfigurasi penyimpanan file menggunakan multer.diskStorage
const storage = multer.diskStorage({
  // Fungsi destination menentukan folder tujuan penyimpanan file
  destination: (req, file, cb) => {
    // cb menerima null sebagai error dan "uploads/" sebagai folder tujuan
    cb(null, "uploads/"); 
  },
  // Fungsi filename menentukan nama file yang disimpan
  filename: (req, file, cb) => {
    // Gabungkan timestamp (Date.now()) dengan ekstensi file asli
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Fungsi fileFilter untuk memfilter jenis file yang diizinkan
const fileFilter = (req, file, cb) => {
  // Daftar tipe file yang diizinkan (di sini hanya PDF)
  const allowedTypes = [
    "application/pdf",  // PDF
    // Jika diperlukan, tipe file lainnya dapat diaktifkan dengan menghilangkan komentar
    // "image/jpeg", // JPEG
    // "image/png", // PNG
    // "application/msword", // DOC
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    // "application/zip", // ZIP
    // "application/x-zip-compressed", // ZIP lainnya
    // "application/vnd.ms-excel", // XLS
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
    // "video/mp4", // MP4
    // "video/quicktime", // MOV
    // "video/x-msvideo", // AVI
    // "video/x-matroska" // MKV
  ];
  
  // Cek apakah tipe file (mimetype) ada dalam daftar allowedTypes
  if (allowedTypes.includes(file.mimetype)) {
    // Jika diizinkan, callback menerima null sebagai error dan true untuk mengizinkan file
    cb(null, true);
  } else {
    // Jika tidak diizinkan, callback mengembalikan error dan false
    cb(new Error("Tipe file tidak diizinkan!"), false);
  }
};

// Konfigurasi middleware multer dengan penyimpanan, filter file, dan batas ukuran file
const upload = multer({
  storage: storage,               // Gunakan konfigurasi penyimpanan yang telah didefinisikan
  fileFilter: fileFilter,         // Gunakan filter untuk memeriksa tipe file
  limits: { fileSize: 1024 * 1024 * 20 } // Batasi ukuran file maksimum sebesar 20 MB (1024*1024*20 byte)
});

// Ekspor middleware upload agar dapat digunakan di bagian lain aplikasi
export default upload;
