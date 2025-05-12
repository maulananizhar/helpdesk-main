// Impor modul db untuk koneksi ke database dari file konfigurasi
import db from "../config/db.js";
// Impor modul axios untuk melakukan request HTTP (digunakan untuk verifikasi reCAPTCHA)
import axios from "axios";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import path from "path"; // Import modul path untuk manipulasi path file
import { fileURLToPath } from "url"; // Import helper untuk mengubah URL file ke path
import validateFields from "../libs/validateFields.js";

// Fungsi submitForm menangani proses penyimpanan formulir yang dikirimkan oleh user
const submitForm = async (req, res) => {
  // Destructuring data yang dikirim dari body request: nama, email, unit, layanan, dan token reCAPTCHA
  const { nama, email, unit, layanan, token } = req.body;
  // Jika terdapat file yang diunggah, simpan path file tersebut; jika tidak, set sebagai null
  const dokumen = req.file ? req.file.path : null;

  // Validasi: Pastikan semua bidang yang diperlukan (nama, email, unit, layanan, token) telah diisi
  if (!validateFields({ nama, email, unit, layanan, token }, res)) return;

  try {
    // Ambil secret key reCAPTCHA dari environment variable
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    // Buat URL verifikasi reCAPTCHA dengan menggabungkan secret key dan token yang diterima dari client
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    // Kirim request POST ke Google untuk memverifikasi reCAPTCHA
    const recaptchaResponse = await axios.post(verificationUrl);
    // Ambil data respons dari verifikasi reCAPTCHA
    const recaptchaData = recaptchaResponse.data;

    // Jika verifikasi gagal atau skor reCAPTCHA kurang dari 0.5, kembalikan error
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return res
        .status(400)
        .json({ message: "Verifikasi reCAPTCHA gagal. Silakan coba lagi!" });
    }

    // Generate nomor ticket dengan format /YYYYMMDD/6-digit angka random
    const now = new Date();
    // Format tanggal menjadi YYYYMMDD
    const dateFormatted = now.toISOString().slice(0, 10).replace(/-/g, "");
    // Generate 6-digit angka random dengan padStart agar selalu memiliki 6 digit
    const randomNumber = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const ticket = `#${dateFormatted}/${randomNumber}`;

    // Lakukan query untuk memasukkan data formulir ke dalam tabel 'formpelayanan'
    // Termasuk field ticket yang sudah dibuat
    const result = await db.query(
      "INSERT INTO formpelayanan (nama, email, unit, layanan, dokumen, ticket) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [nama, email, unit, layanan, dokumen, ticket]
    );

    await db.query(
      "INSERT INTO timeline (ticket, title, subtitle) VALUES ($1, $2, $3)",
      [ticket, "Baru", "Permintaan telah dibuat"]
    );

    await db.query(
      "INSERT INTO timeline (ticket, title, subtitle) VALUES ($1, $2, $3)",
      [ticket, "Diajukan", "Permintaan sedang diajukan"]
    );

    // Dapatkan instance io (WebSocket) yang disimpan dalam aplikasi untuk mengirim notifikasi secara real-time
    const io = req.app.get("io");
    // Emit event 'newForm' ke semua client yang terhubung beserta data formulir yang baru saja disimpan
    io.emit("newForm", result.rows[0]);

    // Kirim respons sukses dengan status 201 (Created) beserta data formulir yang telah disimpan
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Jika terjadi error saat proses penyimpanan atau verifikasi, log error tersebut ke console
    console.error("Error creating formulir:", err);
    // Kembalikan respons error dengan status 500 (Internal Server Error)
    res.status(500).json({ message: "Gagal menyimpan data" });
  }
};

const createUser = async (req, res) => {
  // Ambil data yang diperlukan dari body request
  const { nama, email, unit, password } = req.body;

  // Validasi: Pastikan semua bidang telah diisi
  if (!validateFields({ nama, email, unit, password }, res)) return;

  try {
    // Validasi password
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password harus lebih dari 8 karakter!" });
    }

    // Validasi email
    if (!email.includes("@")) {
      return res.status(400).json({ message: "Email tidak valid!" });
    }

    // Buat salt untuk hashing password
    const salt = await bcrypt.genSalt(10);
    // Hash password menggunakan salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 64 bit random string untuk token
    const token = crypto.randomBytes(32).toString("hex");

    // Query untuk memeriksa apakah email sudah terdaftar
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Email belum diverifikasi
    if (existingUser.rowCount > 0 && !existingUser.rows[0].verify) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar dan belum diverifikasi!",
      });
    }

    // Jika user sudah ada, kembalikan error
    if (existingUser.rowCount > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // Query untuk memasukkan user baru ke database beserta password yang sudah di-hash
    const result = await db.query(
      "INSERT INTO users (nama, role, email, unit, password, verify_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [nama, "User", email, unit, hashedPassword, token]
    );

    // Buat transporter menggunakan nodemailer dengan konfigurasi SMTP
    let transporter = nodemailer.createTransport({
      host: "mail.ombudsman.go.id", // Host mail server
      port: 587, // Port mail server
      secure: false, // Tidak menggunakan koneksi secure (TLS)
      auth: {
        user: process.env.EMAIL_USER, // Username email dari variabel lingkungan
        pass: process.env.EMAIL_PASS, // Password email dari variabel lingkungan
      },
    });

    // Verifikasi koneksi transporter
    transporter.verify((error, success) => {
      if (error) {
        console.error("Transporter verification error:", error);
      } else {
        console.log("Transporter is ready to send emails");
      }
    });

    // Konfigurasi email berdasarkan status
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // Alamat email pemohon
    };

    // Mengatur email
    mailOptions.subject = "Verifikasi Akun Anda";
    mailOptions.html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1>Yth. Bapak/Ibu ${nama},</h1>
        <p>Terima kasih telah mendaftar di layanan kami. Silakan klik tautan di bawah ini untuk memverifikasi akun Anda:</p>
        <a href="${process.env.FRONTEND_URL}/user/verify/${token}">Verifikasi Akun</a>
        <p>Jika Anda tidak mendaftar, abaikan email ini.</p>
        <p>Salam,</p>
        <p>Tim Ombudsman Republik Indonesia</p>
      </div>
      `;

    try {
      // Kirim email verifikasi
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ message: "Gagal mengirim email" });
    }

    // Kirim data user baru dengan status 201 (Created)
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal menambahkan user" });
  }
};

const verifyUser = async (req, res) => {
  // Ambil token dari parameter URL
  const { token } = req.params;

  try {
    // Query untuk memperbarui status verifikasi user berdasarkan token
    const result = await db.query(
      "UPDATE users SET verify = true WHERE verify_token = $1 RETURNING *",
      [token]
    );

    // Jika user berhasil diverifikasi, hapus token verifikasi
    if (result.rowCount > 0) {
      await db.query("UPDATE users SET verify_token = null WHERE id = $1", [
        result.rows[0].id,
      ]);
    }

    // Jika tidak ada user yang ditemukan dengan token tersebut, kembalikan error
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Token tidak valid" })
        .redirect(`${process.env.FRONTEND_URL}/not-found`);
    }

    // Kirim respons sukses dengan status 200 (OK)
    res
      .status(200)
      .json({ success: true, message: "Akun berhasil diverifikasi" });
  } catch (err) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Gagal memverifikasi akun" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validasi: Pastikan semua bidang telah diisi
  if (!validateFields({ email, password }, res)) return;

  try {
    // Query untuk mencari user berdasarkan email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    // Jika user tidak ditemukan, kembalikan error
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    // Apakah email sudah diverifikasi
    const isVerified = await db.query(
      "SELECT * FROM users WHERE email = $1 AND verify = true",
      [email]
    );
    // Jika email belum diverifikasi, kembalikan error
    if (isVerified.rowCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email belum diverifikasi" });
    }

    const user = result.rows[0];

    // Verifikasi password yang dimasukkan dengan password yang tersimpan di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password salah" });
    }

    // Membuat token JWT untuk user yang berhasil login
    const token = jwt.sign(
      {
        id: user.id,
        name: user.nama,
        email: user.email,
        role: user.role,
        unit: user.unit,
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );
    res.json({ success: true, token });
  } catch (err) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error(err);
    res.status(500).json({ message: "Gagal login" });
  }
};

const verifyToken = async (req, res) => {
  try {
    // Ambil token dari body request
    const { token } = req.body;
    // Jika token tidak ada, kembalikan error
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token not found",
      });
    }

    // Verifikasi token menggunakan JWT
    jwt.verify(token, process.env.JWT_SECRET, error => {
      // Jika token tidak valid, kembalikan error
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Token has been modified",
        });
      }

      // Jika token valid, kembalikan respons sukses
      return res.status(200).json({
        success: true,
        message: "Token is valid",
        token: token,
      });
    });
  } catch (error) {
    // Jika terjadi error saat verifikasi token, log error dan kembalikan error 500
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: "Error pada server!",
      });
    }
  }
};

const getForms = async (req, res) => {
  try {
    // Ambil limit dari body request
    const { limit } = req.body;
    // Ambil semua PIC pada tabel form pics
    const result = await db.query(
      `SELECT 
      f.id,
      f.ticket,
      f.email,
      f.created_at AS tanggalDibuat,
      f.unit,
      j.tipelayanan AS jenisLayanan,
      s.subtipelayanan AS subJenisLayanan,
      f.layanan AS deskripsi,
      f.status,
      f.tindak_lanjut AS tindakLanjut,
      f.eskalasi,
      f.proses_at AS tanggalProses,
      f.selesai_at AS tanggalSelesai,
      ARRAY_AGG(u.nama) AS pics
      FROM 
        formpelayanan f
      LEFT JOIN 
        jenisLayanan j ON f.id_jenislayanan = j.id
      LEFT JOIN 
        subJenisLayanan s ON f.id_subjenislayanan = s.id
      LEFT JOIN 
        form_pics fp ON f.id = fp.form_id
      LEFT JOIN 
        users u ON fp.pic_id = u.id
      WHERE 
        f.email = $1
      GROUP BY
        f.id, f.ticket, f.email, f.created_at, f.unit,
        j.tipelayanan, s.subtipelayanan, f.layanan, f.status,
        f.tindak_lanjut, f.eskalasi, f.proses_at, f.selesai_at
      ORDER BY 
        f.created_at DESC
      LIMIT $2`,
      [req.user.email, limit]
    );

    // Jika tidak ada data formulir yang ditemukan, kembalikan error
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada data formulir yang ditemukan",
      });
    }

    // Kirim data formulir sebagai respons
    res.status(200).json(result.rows);
  } catch (err) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data formulir" });
  }
};

const getFormByTicket = async (req, res) => {
  // Ambil tiket dari body request
  const { ticket } = req.body;

  // Validasi input
  if (!validateFields({ ticket }, res)) return;

  try {
    // Ambil data formulir berdasarkan tiket
    const result = await db.query(
      `SELECT 
      f.id,
      f.ticket,
      f.email,
      f.created_at AS tanggalDibuat,
      f.unit,
      j.tipelayanan AS jenisLayanan,
      s.subtipelayanan AS subJenisLayanan,
      f.layanan AS deskripsi,
      f.status,
      f.tindak_lanjut AS tindakLanjut,
      f.eskalasi,
      f.dokumen,
      f.proses_at AS tanggalProses,
      f.selesai_at AS tanggalSelesai,
      ARRAY_AGG(u.nama) AS pics
      FROM 
        formpelayanan f
      LEFT JOIN 
        jenisLayanan j ON f.id_jenislayanan = j.id
      LEFT JOIN 
        subJenisLayanan s ON f.id_subjenislayanan = s.id
      LEFT JOIN 
        form_pics fp ON f.id = fp.form_id
      LEFT JOIN 
        users u ON fp.pic_id = u.id
      WHERE 
        f.ticket = $1
      GROUP BY
        f.id, f.ticket, f.email, f.created_at, f.unit,
        j.tipelayanan, s.subtipelayanan, f.layanan, f.status,
        f.tindak_lanjut, f.eskalasi, f.proses_at, f.selesai_at`,
      [ticket]
    );

    // Jika tidak ada data formulir yang ditemukan, kembalikan error
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada data formulir yang ditemukan",
      });
    }

    // Kirim data formulir sebagai respons
    res.status(200).json(result.rows[0]);
  } catch (err) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data formulir" });
  }
};

const countForm = async (req, res) => {
  try {
    // Ambil jumlah total formulir dari database
    const result = await db.query("SELECT COUNT(*) FROM formpelayanan");

    return res.status(200).json({ success: true, count: result.rows[0].count });
  } catch (error) {
    // Jika terjadi error, log error dan kembalikan error 500
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data formulir" });
  }
};

const getStats = async (req, res) => {
  try {
    // Ambil email dari user yang sedang login
    const email = req.user.email;

    // Query data statistik baru, proses, dan selesai
    const baru = await db.query(
      `SELECT COUNT(*) FROM formpelayanan WHERE email = $1 AND status = 'Baru'`,
      [email]
    );
    const proses = await db.query(
      `SELECT COUNT(*) FROM formpelayanan WHERE email = $1 AND status = 'Proses'`,
      [email]
    );
    const selesai = await db.query(
      `SELECT COUNT(*) FROM formpelayanan WHERE email = $1 AND status = 'Selesai'`,
      [email]
    );
    // Kirim data statistik sebagai respons
    res.status(200).json({
      success: true,
      stats: {
        baru: parseInt(baru.rows[0].count, 10),
        proses: parseInt(proses.rows[0].count, 10),
        selesai: parseInt(selesai.rows[0].count, 10),
      },
    });
  } catch (error) {
    // Jika terjadi error, log error dan kembalikan error 500
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data statistik",
    });
  }
};

const addTestimonial = async (req, res) => {
  try {
    // Ambil data yang diperlukan dari body request
    const {
      ticket,
      id_user,
      testimonial_helpdesk,
      rating_helpdesk,
      testimonial_pic,
      rating_pic,
    } = req.body;

    // Validasi input
    if (
      !validateFields(
        {
          ticket,
          id_user,
          testimonial_helpdesk,
          rating_helpdesk,
          testimonial_pic,
          rating_pic,
        },
        res
      )
    )
      return;

    // Mencegah user mengirim testimonial yang sama lebih dari sekali
    const duplicate = await db.query(
      `SELECT * FROM testimonial WHERE ticket = $1`,
      [ticket]
    );
    // Jika ada data duplikat, kembalikan error
    if (duplicate.rowCount > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Anda sudah melakukan testimonial" });
    }

    // Insert testimonial
    const testimonial = await db.query(
      `INSERT INTO testimonial (
        ticket, id_user, id_layanan,
        testimonial_helpdesk, rating_helpdesk,
        testimonial_pic, rating_pic
      )
      VALUES (
        $1,
        $2,
        (SELECT id_jenislayanan FROM formpelayanan WHERE ticket = $3),
        $4,
        $5,
        $6,
        $7
      ) RETURNING *`,
      [
        ticket,
        id_user,
        ticket,
        testimonial_helpdesk,
        rating_helpdesk,
        testimonial_pic,
        rating_pic,
      ]
    );

    // Cari form_id dari ticket
    const form = await db.query(
      `SELECT id FROM formpelayanan WHERE ticket = $1`,
      [ticket]
    );

    const formId = form.rows[0]?.id;
    // Jika formId tidak ditemukan, kembalikan error
    if (!formId) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }

    // Cari semua pic_id berdasarkan form_id
    const pics = await db.query(
      `SELECT pic_id FROM form_pics WHERE form_id = $1`,
      [formId]
    );

    // Fungsi untuk membuat request parameter testimonial_pics
    if (pics.rows.length > 0) {
      const values = pics.rows
        .map((pic, index) => `($1, $${index + 2})`)
        .join(", ");
      const params = [
        testimonial.rows[0].id,
        ...pics.rows.map(pic => pic.pic_id),
      ];

      // Insert data baru ke tabel testimonial_pics
      await db.query(
        `INSERT INTO testimonial_pics (testimonial_id, pic_id) VALUES ${values}`,
        params
      );
    }

    // Kirim response
    res.status(200).json({
      success: true,
      message: "Terima Kasih! Ulasan anda telah dikirim!",
      data: testimonial.rows[0],
    });
  } catch (error) {
    // Jika terjadi error kirim response status 500
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Fungsi untuk mengunduh file dari server
const downloadFile = async (req, res) => {
  try {
    // Ambil header authorization dari request
    const authHeader = req.headers.authorization;
    // Jika header authorization tidak ada, kembalikan error 401
    if (!authHeader) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: no token provided" });
    }
    // Ambil token dari header (format: "Bearer token")
    const token = authHeader.split(" ")[1];

    try {
      // Verifikasi token menggunakan JWT
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Jika token tidak valid, kembalikan error 403
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: invalid token" });
    }

    // Set header Cache-Control untuk mencegah caching file
    res.set("Cache-Control", "no-store");

    // Ambil nama file dari parameter URL
    const { filename } = req.params;
    // Dapatkan path file dari modul fileURLToPath
    const __filename = fileURLToPath(import.meta.url);
    // Tentukan direktori dari file saat ini
    const __dirname = path.dirname(__filename);
    // Gabungkan path untuk mendapatkan lokasi file dalam folder uploads
    const filePath = path.join(__dirname, "../uploads", filename);

    // Kirim file untuk di-download oleh client
    res.download(filePath, err => {
      if (err) {
        // Jika terjadi error saat download, log error dan kembalikan error 500
        console.error("Error downloading file:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error downloading file" });
      }
    });
  } catch (error) {
    // Tangani error dan kirim respons error 500
    console.error("Download file error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    // Ambil email dari body request
    const { email } = req.body;

    // Validasi input
    if (!validateFields({ email }, res)) return;

    // Query untuk mencari user berdasarkan email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    // Jika user tidak ditemukan, kembalikan error
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    const user = result.rows[0];

    // Generate token untuk reset password
    const token = jwt.sign(
      {
        id: user.id,
        name: user.nama,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Buat transporter menggunakan nodemailer dengan konfigurasi SMTP
    let transporter = nodemailer.createTransport({
      host: "mail.ombudsman.go.id", // Host mail server
      port: 587, // Port mail server
      secure: false, // Tidak menggunakan koneksi secure (TLS)
      auth: {
        user: process.env.EMAIL_USER, // Username email dari variabel lingkungan
        pass: process.env.EMAIL_PASS, // Password email dari variabel lingkungan
      },
    });

    // Verifikasi koneksi transporter
    transporter.verify((error, success) => {
      if (error) {
        console.error("Transporter verification error:", error);
      } else {
        console.log("Transporter is ready to send emails");
      }
    });

    // Konfigurasi email berdasarkan status
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // Alamat email pemohon
    };

    mailOptions.subject = "Reset Password";
    mailOptions.html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1>Yth. Bapak/Ibu ${user.nama},</h1>
        <p>Silakan klik tautan di bawah ini untuk mengatur ulang kata sandi Anda:</p>
        <a href="${process.env.FRONTEND_URL}/user/atur-sandi/${token}">Atur Ulang Kata Sandi</a>
        <p>Email ini hanya berlaku dalam waktu 1 jam.</p>
        <p>Jika Anda tidak meminta ini, abaikan email ini.</p>
      </div>
    `;
    try {
      // Kirim email verifikasi
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Gagal mengirim email" });
    }
    // Kirim respons sukses dengan status 200 (OK)
    res.status(200).json({
      success: true,
      message: "Email untuk mengatur ulang kata sandi telah dikirim",
    });
  } catch (err) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengirim email" });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Ambil token dan password baru dari body request
    const { token, password } = req.body;

    // Validasi input
    if (!validateFields({ token, password }, res)) return;

    // Verifikasi token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Token tidak valid atau telah kedaluwarsa",
        });
      }

      // Hash password baru
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password di database
      await db.query("UPDATE users SET password = $1 WHERE id = $2", [
        hashedPassword,
        decoded.id,
      ]);

      // Kirim respons sukses dengan status 200 (OK)
      res.status(200).json({
        success: true,
        message: "Kata sandi berhasil diatur ulang",
      });
    });
  } catch (err) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error(err);
    res.status(500).json({ message: "Gagal mengatur ulang kata sandi" });
  }
};

// Ekspor fungsi submitForm agar dapat digunakan di file lain
export {
  submitForm, // Fungsi untuk mengirim formulir
  createUser, // Fungsi untuk membuat user baru
  verifyUser, // Fungsi untuk memverifikasi user
  loginUser, // Fungsi untuk login user
  verifyToken, // Fungsi untuk memverifikasi token
  getForms, // Fungsi untuk mendapatkan semua formulir
  getFormByTicket, // Fungsi untuk mendapatkan formulir berdasarkan tiket
  countForm, // Fungsi untuk menghitung jumlah formulir
  getStats, // Fungsi untuk mendapatkan statistik formulir
  addTestimonial, // Fungsi untuk menambahkan testimonial
  downloadFile, // Fungsi untuk mengunduh file
  forgotPassword, // Fungsi untuk mengirim email lupa kata sandi
  resetPassword, // Fungsi untuk mengatur ulang kata sandi
};
