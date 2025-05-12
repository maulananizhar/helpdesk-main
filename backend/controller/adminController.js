import db from "../config/db.js"; // Import koneksi database dari konfigurasi
import jwt from "jsonwebtoken"; // Import modul JSON Web Token untuk otentikasi
import bcrypt from "bcrypt"; // Import bcrypt untuk hashing dan pengecekan password
import path from "path"; // Import modul path untuk manipulasi path file
import nodemailer from "nodemailer"; // Import nodemailer untuk mengirim email
import { fileURLToPath } from "url"; // Import helper untuk mengubah URL file ke path

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false, // Indikator gagal
      message: "Email dan password harus diisi!", // Pesan error
    });
  }

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah!",
      });
    }

    const user = result.rows[0];

    if (user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak! Hanya admin yang bisa login.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah!",
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.nama, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // Token berlaku selama 2 jam
    );

    return res.status(200).json({
      success: true,
      message: "Login berhasil!",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

const loginPIC = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role === "User") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak! Hanya Admin dan PIC yang bisa login.",
        user: user,
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.nama, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

const getAllUser = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data users" });
  }
};

const getAllPICUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, nama, email FROM users WHERE role = 'PIC'"
    );
    res.json(result.rows); // Kirim data dalam format JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data PIC" });
  }
};

const getUserById = async (req, res) => {
  try {
    // Ambil parameter id dari URL
    const { id } = req.params;
    // Query untuk mengambil user dengan id yang diberikan
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    // Jika user tidak ditemukan, kembalikan error 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    // Kirim data user yang ditemukan
    res.json(result.rows[0]);
  } catch (err) {
    // Jika terjadi error, log dan kembalikan error 500
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

// Fungsi untuk memperbarui data user (nama dan role) berdasarkan ID
const updateUser = async (req, res) => {
  // Ambil id dari parameter URL dan data nama serta role dari body request
  const { id } = req.params;
  const { nama, role } = req.body;

  try {
    // Query untuk memperbarui data user berdasarkan id dan mengembalikan data yang diperbarui
    const result = await db.query(
      "UPDATE users SET nama = $1, role = $2 WHERE id = $3 RETURNING *",
      [nama, role, id]
    );
    // Jika tidak ada user yang diupdate, kembalikan error 404
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    // Kirim data user yang telah diperbarui
    res.json(result.rows[0]);
  } catch (err) {
    // Tangani error dengan mengembalikan error 500
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui user" });
  }
};

// Fungsi untuk membuat user baru
const createUser = async (req, res) => {
  // Ambil data yang diperlukan dari body request
  const { nama, role, unit, email, password } = req.body;

  // Validasi: Pastikan semua bidang telah diisi
  if (!nama || !role || !unit || !email || !password) {
    return res.status(400).json({ message: "Semua bidang harus diisi!" });
  }

  try {
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    // Jika email sudah terdaftar, kembalikan error 409 (Conflict)
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar!" });
    }
    // Buat salt untuk hashing password
    const salt = await bcrypt.genSalt(10);
    // Hash password menggunakan salt
    const hashedPassword = await bcrypt.hash(password, salt);
    // Query untuk memasukkan user baru ke database beserta password yang sudah di-hash
    const result = await db.query(
      "INSERT INTO users (nama, role, unit, email, password, verify) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [nama, role, unit, email, hashedPassword, true]
    );
    // Kirim data user baru dengan status 201 (Created)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan user" });
  }
};

// Fungsi untuk mengambil data form pelayanan berdasarkan ID
const getFormById = async (req, res) => {
  try {
    // Ambil id form dari parameter URL
    const { id } = req.params;

    // Query untuk mendapatkan data form dari tabel formpelayanan
    const result = await db.query("SELECT * FROM formpelayanan WHERE id = $1", [
      id,
    ]);
    // Jika form tidak ditemukan, kembalikan error 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    // Simpan data form dari query
    const form = result.rows[0];

    // Query untuk mendapatkan data PIC yang ditugaskan pada form ini
    const picResult = await db.query(
      `SELECT users.id, users.nama 
       FROM form_pics 
       JOIN users ON form_pics.pic_id = users.id 
       WHERE form_pics.form_id = $1`,
      [id]
    );

    // Jika terdapat PIC, gabungkan nama-nama PIC; jika tidak, set sebagai "Belum Ditugaskan"
    const picNames =
      picResult.rows.length > 0
        ? picResult.rows.map(row => row.nama).join(", ")
        : "Belum Ditugaskan";
    // Tambahkan properti pic_nama ke dalam objek form
    form.pic_nama = picNames;

    // Query untuk mendapatkan nama jenis layanan dari tabel jenislayanan
    if (form.id_jenislayanan) {
      const jenisResult = await db.query(
        "SELECT tipelayanan FROM jenislayanan WHERE id = $1",
        [form.id_jenislayanan]
      );
      form.jenis_layanan =
        jenisResult.rows.length > 0 ? jenisResult.rows[0].tipelayanan : null;
    } else {
      form.jenis_layanan = null;
    }

    // Query untuk mendapatkan nama sub jenis layanan dari tabel subjenislayanan
    if (form.id_subjenislayanan) {
      const subjenisResult = await db.query(
        "SELECT subtipelayanan FROM subjenislayanan WHERE id = $1",
        [form.id_subjenislayanan]
      );
      form.subjenis_layanan =
        subjenisResult.rows.length > 0
          ? subjenisResult.rows[0].subtipelayanan
          : null;
    } else {
      form.subjenis_layanan = null;
    }

    // Kirim data form yang sudah dilengkapi dengan informasi PIC, jenis layanan, dan sub jenis layanan
    return res.json(form);
  } catch (error) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error("Error fetching form by ID: ", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data form" });
  }
};

// Fungsi untuk memperbarui data form pelayanan
const updateForm = async (req, res) => {
  try {
    // Ambil data yang diperlukan dari body request dan id form dari parameter URL
    const {
      status,
      tindak_lanjut,
      id_pics,
      id_jenislayanan,
      eskalasi,
      id_subjenislayanan,
      ticket,
    } = req.body;
    const { id } = req.params;

    // Inisialisasi array untuk field yang akan diupdate dan nilainya
    let updateFields = [];
    let updateValues = [];

    // Query untuk mengecek apakah form sudah memiliki PIC yang ditugaskan
    const { rows: existingPICs } = await db.query(
      "SELECT COUNT(*) FROM form_pics WHERE form_id = $1",
      [id]
    );
    // Konversi hasil hitung menjadi integer dan cek apakah ada PIC sebelumnya
    const hasPreviousPICs = parseInt(existingPICs[0].count) > 0;

    // Jika status diberikan dan eskalasi bukan true, masukkan field status untuk diupdate
    if (status !== undefined && eskalasi !== true) {
      updateFields.push(`status = $${updateValues.length + 1}`);
      updateValues.push(status);
    }
    // Jika tindak_lanjut diberikan, masukkan field tindak_lanjut untuk diupdate
    if (tindak_lanjut !== undefined) {
      updateFields.push(`tindak_lanjut = $${updateValues.length + 1}`);
      updateValues.push(tindak_lanjut);
    }
    if (ticket !== undefined) {
      updateFields.push(`ticket = $${updateValues.length + 1}`);
      updateValues.push(ticket);
    }
    // Jika id_jenislayanan diberikan, masukkan field id_jenislayanan dengan konversi nilai ke integer atau NULL
    if (id_jenislayanan !== undefined) {
      updateFields.push(
        `id_jenislayanan = NULLIF($${updateValues.length + 1}, '')::INTEGER`
      );
      updateValues.push(id_jenislayanan);
    }
    // Jika id_subjenislayanan diberikan, masukkan field id_subjenislayanan dengan konversi nilai ke integer atau NULL
    if (id_subjenislayanan !== undefined) {
      updateFields.push(
        `id_subjenislayanan = NULLIF($${updateValues.length + 1}, '')::INTEGER`
      );
      updateValues.push(id_subjenislayanan);
    }
    // Jika eskalasi diberikan, masukkan field eskalasi untuk diupdate
    if (eskalasi !== undefined) {
      updateFields.push(`eskalasi = $${updateValues.length + 1}`);
      updateValues.push(eskalasi);
    }

    // Inisialisasi variabel untuk status baru jika diperlukan
    let newStatus = null;
    // Jika terdapat penugasan PIC baru dan belum ada PIC sebelumnya, serta eskalasi tidak true
    if (id_pics && id_pics.length > 0 && !hasPreviousPICs) {
      if (eskalasi !== true) {
        // Update status menjadi "Proses"
        updateFields.push(`status = $${updateValues.length + 1}`);
        updateValues.push("Proses");
        newStatus = "Proses";
      }
    }

    // Jika eskalasi bernilai true, update status menjadi "Selesai"
    if (eskalasi === true) {
      updateFields.push(`status = $${updateValues.length + 1}`);
      updateValues.push("Selesai");
    }

    // Tentukan status akhir: "Selesai" jika eskalasi true, atau status baru jika ada, atau status yang diberikan
    const finalStatus = eskalasi === true ? "Selesai" : newStatus || status;

    // Sesuaikan field waktu: jika status Proses, set waktu proses; jika Selesai, set waktu selesai
    if (finalStatus === "Proses") {
      updateFields.push("proses_at = NOW()");
    } else if (finalStatus === "Selesai") {
      updateFields.push("selesai_at = NOW()");
    }

    // Jika ada field yang harus diupdate, jalankan query update
    if (updateFields.length > 0) {
      updateValues.push(id);
      // Buat query update dinamis berdasarkan field yang telah dikumpulkan
      const query = `UPDATE formpelayanan SET ${updateFields.join(
        ", "
      )} WHERE id = $${updateValues.length}`;
      await db.query(query, updateValues);
    }

    // Jika ada data PIC yang diberikan untuk penugasan baru
    if (id_pics) {
      // Hapus data PIC yang sudah ada untuk form ini
      await db.query("DELETE FROM form_pics WHERE form_id = $1", [id]);
      if (id_pics.length > 0) {
        // Siapkan query untuk memasukkan penugasan PIC baru
        const insertQuery = `
          INSERT INTO form_pics (form_id, pic_id) 
          VALUES ${id_pics.map((_, i) => `($1, $${i + 2})`).join(", ")}
        `;
        await db.query(insertQuery, [id, ...id_pics]);
      }
    }

    // Ambil data PIC yang telah ditugaskan ke form ini untuk keperluan notifikasi
    const { rows: assignedPICs } = await db.query(
      "SELECT fp.pic_id, u.nama FROM form_pics fp JOIN users u ON fp.pic_id = u.id WHERE fp.form_id = $1",
      [id]
    );
    // Gabungkan nama-nama PIC atau set menjadi "Belum Ditugaskan" jika tidak ada
    const picNames =
      assignedPICs.length > 0
        ? assignedPICs.map(row => row.nama).join(", ")
        : "Belum Ditugaskan";

    // Dapatkan instance io (WebSocket) dari aplikasi
    const io = req.app.get("io");
    // Kirim notifikasi ke setiap PIC yang terhubung menggunakan channel berbasis id
    assignedPICs.forEach(pic => {
      io.to(`pic_${pic.pic_id}`).emit("formUpdated", {
        id,
        status: finalStatus,
      });
    });

    // Kirim email notifikasi jika status akhir adalah "Proses" atau "Selesai"
    if (finalStatus === "Proses" || finalStatus === "Selesai") {
      // Ambil data form yang telah diperbarui
      const { rows: updatedRows } = await db.query(
        "SELECT * FROM formpelayanan WHERE id = $1",
        [id]
      );
      const updatedForm = updatedRows[0];

      // Ambil detail jenis layanan jika tersedia
      let jenisLayananText = "Tidak tersedia";
      if (updatedForm.id_jenislayanan) {
        const { rows: jlRows } = await db.query(
          "SELECT tipelayanan FROM jenislayanan WHERE id = $1",
          [updatedForm.id_jenislayanan]
        );
        jenisLayananText =
          jlRows.length > 0 ? jlRows[0].tipelayanan : "Tidak diketahui";
      }

      // Ambil detail subjenis layanan jika tersedia
      let subjenisLayananText = "Tidak tersedia";
      if (updatedForm.id_subjenislayanan) {
        const { rows: sjlRows } = await db.query(
          "SELECT subtipelayanan FROM subjenislayanan WHERE id = $1",
          [updatedForm.id_subjenislayanan]
        );
        subjenisLayananText =
          sjlRows.length > 0 ? sjlRows[0].subtipelayanan : "Tidak diketahui";
      }

      // Format waktu selesai dan eskalasi
      const selesaiAt = updatedForm.selesai_at
        ? new Date(updatedForm.selesai_at).toLocaleString()
        : "Tidak tersedia";
      const eskalasiText =
        updatedForm.eskalasi === true || updatedForm.eskalasi === "true"
          ? "Ya"
          : "Tidak";

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
        to: updatedForm.email, // Alamat email pemohon
      };

      if (finalStatus === "Proses") {
        mailOptions.subject = "Pemberitahuan Proses Formulir Pelayanan";
        mailOptions.html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <p>Yth. Bapak/Ibu ${updatedForm.nama || "(Nama Pengirim)"},</p>
            <p>Nomor ticket: ${updatedForm.ticket}</p>
            <p>Kami informasikan bahwa formulir pelayanan yang Anda ajukan sedang diproses.</p>
            <p>Detail singkat:</p>
            <ul>
              <li>Jenis Layanan: ${jenisLayananText}</li>
              <li>Sub Jenis Layanan: ${subjenisLayananText}</li>
              <li>PIC: ${picNames}</li>
            </ul>
            <p>Untuk melihat informasi lengkap mengenai formulir, silakan klik link berikut:</p>
            <p>
              <a href="http://localhost:3000/formInformation/${id}" 
                 style="color: #1976d2; text-decoration: none; font-weight: bold;">
                Lihat Detail Formulir
              </a>
            </p>
            <p>Terima kasih atas kepercayaan Anda kepada Ombudsman Republik Indonesia.</p>
            <p>Hormat kami,<br>Ombudsman Republik Indonesia</p>
          </div>
        `;
      } else if (finalStatus === "Selesai") {
        mailOptions.subject = "Pemberitahuan Penyelesaian Formulir Pelayanan";
        mailOptions.html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <p>Yth. Bapak/Ibu ${updatedForm.nama || "(Nama Pengirim)"},</p>
            <p>Nomor ticket: ${updatedForm.ticket}</p>
            <p>Kami informasikan bahwa formulir pelayanan yang Anda ajukan telah selesai diproses.</p>
            <p>Detail penyelesaian:</p>
            <ul>
              <li>Layanan: ${updatedForm.layanan || "-"}</li>
              <li>Tanggal Selesai: ${selesaiAt}</li>
              <li>Status Eskalasi: ${eskalasiText}</li>
              <li>Tindak Lanjut: ${
                updatedForm.tindak_lanjut || "Tidak ada"
              }</li>
              <li>Jenis Layanan: ${jenisLayananText}</li>
              <li>Sub Jenis Layanan: ${subjenisLayananText}</li>
              <li>PIC: ${picNames}</li>
            </ul>
            <p>Untuk melihat informasi lengkap mengenai formulir, silakan klik link berikut:</p>
            <p>
              <a href="http//localhost:3000/formInformation/${id}" 
                 style="color: #1976d2; text-decoration: none; font-weight: bold;">
                Lihat Detail Formulir
              </a>
            </p>
            <p>Terima kasih atas kepercayaan Anda kepada Ombudsman Republik Indonesia.</p>
            <p>Hormat kami,<br>Ombudsman Republik Indonesia</p>
          </div>
        `;
      }

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
      } catch (mailError) {
        console.error("Error sending email:", mailError);
      }
    }

    // Kirim respons sukses beserta status akhir form
    return res.status(200).json({
      message: "Formulir berhasil diperbarui",
      newStatus: finalStatus,
    });
  } catch (error) {
    console.error("❌ Error saat update formulir:", error);
    return res
      .status(500)
      .json({ error: "Terjadi kesalahan saat memperbarui formulir" });
  }
};

// Fungsi untuk menghapus data form pelayanan berdasarkan ID
const deleteForm = async (req, res) => {
  // Ambil id form dari parameter URL
  const { id } = req.params;

  try {
    // Query untuk menghapus form dan mengembalikan data yang dihapus
    const result = await db.query(
      "DELETE FROM formpelayanan WHERE id = $1 RETURNING *",
      [id]
    );
    // Jika tidak ditemukan data untuk dihapus, kirim respons error 404
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    // Kirim respons sukses dengan pesan
    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    // Jika terjadi error, log error dan kirim respons error 500
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus data" });
  }
};

// Fungsi untuk menghapus user berdasarkan ID
const deleteUser = async (req, res) => {
  // Ambil id user dari parameter URL
  const { id } = req.params;

  try {
    // Query untuk menghapus user dari database dan mengembalikan data yang dihapus
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    // Jika user tidak ditemukan, kirim respons error 404
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    // Kirim respons sukses dengan pesan bahwa user telah dihapus
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    // Jika terjadi error, log error dan kirim respons error 500
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};

// Fungsi untuk mengambil semua data formulir pelayanan beserta detail terkait
const getAllFormulir = async (req, res) => {
  try {
    // Query untuk mengambil data formulir beserta jenis layanan, sub jenis layanan, ticket, dan menggabungkan nama PIC
    const result = await db.query(`
      SELECT 
        f.id, 
        f.nama, 
        f.email, 
        f.unit, 
        f.layanan, 
        f.ticket, 
        f.status, 
        f.tindak_lanjut, 
        f.eskalasi,
        f.dokumen, -- Pengambilan dokumen terkait form
        jl.tipelayanan AS jenis_layanan,
        sjl.subtipelayanan AS sub_jenis_layanan,
        COALESCE(string_agg(u.nama, ', '), 'Belum Ditugaskan') AS pic_nama
      FROM formpelayanan f
      LEFT JOIN jenislayanan jl ON f.id_jenislayanan = jl.id
      LEFT JOIN subjenislayanan sjl ON f.id_subjenislayanan = sjl.id
      LEFT JOIN form_pics fp ON f.id = fp.form_id
      LEFT JOIN users u ON fp.pic_id = u.id
      GROUP BY f.id, jl.tipelayanan, sjl.subtipelayanan
      ORDER BY f.created_at DESC
    `);

    // Kirim data formulir dalam format JSON
    res.json(result.rows);
  } catch (error) {
    // Jika terjadi error, log error dan kirim respons error 500
    console.error(error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
  }
};

// Fungsi untuk mengambil data formulir pelayanan yang ditugaskan kepada PIC tertentu
const getAllFormulirPIC = async (req, res) => {
  try {
    // Validasi: Pastikan token sudah mengandung data PIC dengan id
    if (!req.pic || !req.pic.id) {
      return res
        .status(400)
        .json({ error: "PIC ID tidak ditemukan dalam token" });
    }

    // Ambil id PIC dari data token
    const { id: pic_id } = req.pic;

    // Query untuk mengambil data form yang ditugaskan kepada PIC berdasarkan id PIC
    const result = await db.query(
      `
      SELECT 
        f.id, 
        f.nama, 
        f.email, 
        f.unit, 
        f.layanan, 
        f.ticket, 
        f.status, 
        f.tindak_lanjut, 
        f.eskalasi,
        f.dokumen,
        jl.tipelayanan AS jenis_layanan,
        sjl.subtipelayanan AS sub_jenis_layanan,
        COALESCE(string_agg(u.nama, ', '), 'Belum Ditugaskan') AS pic_nama,
        f.created_at
      FROM formpelayanan f
      LEFT JOIN jenislayanan jl ON f.id_jenislayanan = jl.id
      LEFT JOIN subjenislayanan sjl ON f.id_subjenislayanan = sjl.id
      LEFT JOIN form_pics fp ON f.id = fp.form_id
      LEFT JOIN users u ON fp.pic_id = u.id
      WHERE fp.pic_id = $1
      GROUP BY 
        f.id, 
        f.nama, 
        f.email, 
        f.unit, 
        f.layanan, 
        f.ticket,
        f.status, 
        f.tindak_lanjut, 
        f.eskalasi, 
        f.dokumen,
        f.created_at,
        jl.tipelayanan,
        sjl.subtipelayanan
      ORDER BY f.created_at DESC
    `,
      [pic_id]
    );

    // Kirim data formulir untuk PIC dalam format JSON
    res.json(result.rows);
  } catch (error) {
    // Jika terjadi error, log error dan kembalikan error 500
    console.error(error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
  }
};

// Fungsi untuk mengambil semua jenis layanan
const getJenisLayanan = async (req, res) => {
  try {
    // Query untuk mengambil data dari tabel jenislayanan
    const result = await db.query("SELECT * FROM jenislayanan");
    res.json(result.rows); // Kirim data dalam format JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil jenis layanan" });
  }
};

// Fungsi untuk menambahkan jenis layanan baru
const addJenisLayanan = async (req, res) => {
  try {
    // Ambil nama layanan dari body request
    const { tipelayanan } = req.body;
    // Validasi: Pastikan nama layanan sudah diisi
    if (!tipelayanan) {
      return res.status(400).json({ error: "Nama layanan diperlukan" });
    }

    // Query untuk memasukkan jenis layanan baru ke database
    const result = await db.query(
      "INSERT INTO jenislayanan (tipelayanan) VALUES ($1) RETURNING *",
      [tipelayanan]
    );

    // Kirim data jenis layanan baru dengan status 201 (Created)
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan jenis layanan" });
  }
};

// Fungsi untuk menghapus jenis layanan berdasarkan ID
const deleteJenisLayanan = async (req, res) => {
  // Ambil id jenis layanan dari parameter URL
  const { id } = req.params;

  try {
    // Query untuk menghapus data jenis layanan dan mengembalikan data yang dihapus
    const result = await db.query(
      "DELETE FROM jenislayanan WHERE id = $1 RETURNING *",
      [id]
    );

    // Jika tidak ditemukan data yang dihapus, kembalikan error 404
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Kirim data jenis layanan yang dihapus dengan status 201
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus jenis layanan" });
  }
};

// Fungsi untuk mengambil detail jenis layanan berdasarkan ID
const getJenisLayananById = async (request, res) => {
  // Ambil id dari parameter URL
  const { id } = req.params;

  try {
    // Query untuk mendapatkan data jenis layanan berdasarkan id
    const result = await db.query("SELECT * FROM jenislayanan WHERE id = $1", [
      id,
    ]);

    // Jika tidak ditemukan, kembalikan error 404
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Kirim data jenis layanan yang ditemukan dengan status 201
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mendapatkan jenis layanan" });
  }
};

// Fungsi untuk mengambil semua data sub jenis layanan
const getSubJenisLayanan = async (req, res) => {
  try {
    // Query untuk mengambil data dari tabel subjenislayanan
    const result = await db.query("SELECT * FROM subjenislayanan");
    res.json(result.rows); // Kirim data dalam format JSON
  } catch (error) {
    console.error("Error getting sub jenis layanan:", error);
    res.status(500).json({ error: "Gagal mengambil data sub jenis layanan" });
  }
};

// Fungsi untuk mengambil data sub jenis layanan berdasarkan ID
const getSubJenisLayananById = async (req, res) => {
  // Ambil id dari parameter URL
  const { id } = req.params;
  try {
    // Query untuk mendapatkan data sub jenis layanan berdasarkan id
    const result = await db.query(
      "SELECT * FROM subjenislayanan WHERE id = $1",
      [id]
    );
    // Jika tidak ditemukan, kembalikan error 404
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }
    // Kirim data sub jenis layanan yang ditemukan dengan status 201
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error getting sub jenis layanan:", error);
    res.status(500).json({ error: "Gagal mendapatkan sub jenis layanan" });
  }
};

// Fungsi untuk menambahkan data sub jenis layanan
const addSubJenisLayanan = async (req, res) => {
  try {
    // Ambil nama sub jenis layanan dari body request
    const { subtipelayanan } = req.body;
    // Validasi: Pastikan sub jenis layanan sudah diisi
    if (!subtipelayanan) {
      return res.status(400).json({ error: "Sub jenis layanan diperlukan" });
    }
    // Query untuk memasukkan data sub jenis layanan baru ke database
    const result = await db.query(
      "INSERT INTO subjenislayanan (subtipelayanan) VALUES ($1) RETURNING *",
      [subtipelayanan]
    );
    // Kirim data sub jenis layanan baru dengan status 201 (Created)
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding sub jenis layanan:", error);
    res.status(500).json({ error: "Gagal menambahkan sub jenis layanan" });
  }
};

// Fungsi untuk menghapus data sub jenis layanan berdasarkan ID
const deleteSubJenisLayanan = async (req, res) => {
  // Ambil id dari parameter URL
  const { id } = req.params;
  try {
    // Query untuk menghapus data sub jenis layanan dan mengembalikan data yang dihapus
    const result = await db.query(
      "DELETE FROM subJenisLayanan WHERE id = $1 RETURNING *",
      [id]
    );

    // Jika tidak ditemukan data yang dihapus, kembalikan error 404
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Kirim data yang dihapus dengan status 201
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus jenis layanan" });
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
        .json({ message: "Unauthorized: no token provided" });
    }
    // Ambil token dari header (format: "Bearer token")
    const token = authHeader.split(" ")[1];

    try {
      // Verifikasi token menggunakan JWT
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Jika token tidak valid, kembalikan error 403
      return res.status(403).json({ message: "Forbidden: invalid token" });
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
        return res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    // Tangani error dan kirim respons error 500
    console.error("Download file error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fungsi untuk memperbarui data PIC (Person In Charge)
const updatePIC = async (req, res) => {
  // Ambil id dari parameter URL dan nama, email, serta password dari body request
  const { id } = req.params;
  const { nama, email, password } = req.body;

  // Validasi: Pastikan nama dan email sudah diisi
  if (!nama || !email) {
    return res.status(400).json({ message: "Nama dan email harus diisi!" });
  }

  try {
    // Deklarasikan variabel query dan values untuk query update nanti
    let query, values;
    // Jika password diberikan dan tidak kosong
    if (password && password.trim() !== "") {
      // Buat salt untuk hashing password
      const salt = await bcrypt.genSalt(10);
      // Hash password menggunakan salt
      const hashedPassword = await bcrypt.hash(password, salt);
      // Siapkan query untuk mengupdate nama, email, dan password user dengan role 'PIC'
      query =
        "UPDATE users SET nama = $1, email = $2, password = $3 WHERE id = $4 AND role = 'PIC' RETURNING *";
      // Nilai yang akan digunakan pada query
      values = [nama, email, hashedPassword, id];
    } else {
      // Jika password tidak diupdate, hanya update nama dan email
      query =
        "UPDATE users SET nama = $1, email = $2 WHERE id = $3 AND role = 'PIC' RETURNING *";
      values = [nama, email, id];
    }

    // Jalankan query update dan simpan hasilnya
    const result = await db.query(query, values);

    // Jika tidak ditemukan PIC yang diupdate, kembalikan error 404
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "PIC tidak ditemukan" });
    }

    // Kirim data PIC yang telah diperbarui sebagai respons
    res.json(result.rows[0]);
  } catch (error) {
    // Tangani error dan kembalikan respons error 500
    console.error("Error updating PIC:", error);
    res.status(500).json({ message: "Gagal memperbarui PIC" });
  }
};

const sortFormulirWithDate = async (req, res) => {
  // Ambil tanggal mulai dan tanggal selesai dari body request
  const { startDate, endDate } = req.body;

  // Validasi bahwa kedua parameter disediakan
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "startDate dan endDate harus disediakan",
    });
  }

  try {
    // Query untuk mengambil data formulir yang dibuat antara startDate dan endDate
    const queryText = `
      SELECT *
      FROM formpelayanan
      WHERE created_at BETWEEN $1 AND $2
      ORDER BY created_at DESC;
    `;
    const { rows } = await db.query(queryText, [startDate, endDate]);

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error sorting formulir by date:", error);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

const getUlasanHelpdesk = async (req, res) => {
  try {
    // Ambil rating dari request body
    const { rating } = req.body;

    // Query untuk mendapatkan data ulasan berdasarkan rating
    const result = await db.query(
      `SELECT
        t.id,
        t.ticket,
        u.email,
        u.nama,
        l.subtipelayanan AS jenislayanan,
        t.rating_helpdesk AS ratingHelpdesk,
        t.testimonial_helpdesk AS testimonialHelpdesk,
        t.created_at AS createdAt
      FROM
        testimonial t
      JOIN
        users u ON t.id_user = u.id
      JOIN
        subjenislayanan l ON t.id_layanan = l.id
      ${rating ? `WHERE t.rating_helpdesk = ${rating}` : ""}
      ORDER BY t.id desc;`
    );

    const average = await db.query(
      `SELECT sum(rating_helpdesk) AS sum, count(rating_helpdesk) AS count FROM testimonial`
    );

    // Kirim data ulasan yang ditemukan dengan status 200
    res.status(200).json({
      success: true,
      message: "Data ditemukan",
      average: average.rows[0].sum / average.rows[0].count,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting ulasan:", error);
    res.status(500).json({ error: "Gagal mendapatkan ulasan" });
  }
};

const getUlasanPIC = async (req, res) => {
  try {
    // Ambil rating dari request body
    const { rating } = req.body;

    // Query untuk mendapatkan data ulasan berdasarkan rating
    const result = await db.query(
      `SELECT
        t.id,
        t.ticket,
        u.email,
        u.nama,
        l.subtipelayanan AS jenisLayanan,
        ARRAY_AGG(p.nama) AS pic,
        t.rating_pic AS ratingPIC,
        t.testimonial_pic AS testimonialPIC,
        t.created_at AS createdAt
      FROM
        testimonial t
      JOIN
        users u ON t.id_user = u.id
      JOIN
        subjenislayanan l ON t.id_layanan = l.id
      JOIN
        testimonial_pics tp ON t.id = tp.testimonial_id
      JOIN
        users p ON tp.pic_id = p.id
      ${rating ? `WHERE t.rating_pic = ${rating}` : ""}
      GROUP BY
        t.id, t.ticket, u.email, u.nama, l.subtipelayanan, t.rating_pic, t.testimonial_pic, t.created_at
      ORDER BY t.id desc;`
    );

    const average = await db.query(
      `SELECT sum(rating_pic) AS sum, count(rating_pic) AS count FROM testimonial`
    );

    // Kirim data ulasan yang ditemukan dengan status 200
    res.status(200).json({
      success: true,
      message: "Data ditemukan",
      average: average.rows[0].sum / average.rows[0].count,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting ulasan:", error);
    res.status(500).json({ error: "Gagal mendapatkan ulasan" });
  }
};

// Ekspor semua fungsi agar dapat digunakan di bagian lain aplikasi
export {
  loginAdmin, // Ekspor fungsi login admin
  loginPIC, // Ekspor fungsi login PIC
  getAllUser, // Ekspor fungsi untuk mendapatkan semua user
  getUserById, // Ekspor fungsi untuk mendapatkan user berdasarkan ID
  updateUser, // Ekspor fungsi untuk memperbarui data user
  deleteUser, // Ekspor fungsi untuk menghapus user
  createUser, // Ekspor fungsi untuk membuat user baru
  getFormById, // Ekspor fungsi untuk mendapatkan form berdasarkan ID
  updateForm, // Ekspor fungsi untuk memperbarui data form pelayanan
  deleteForm, // Ekspor fungsi untuk menghapus form pelayanan
  getAllPICUsers, // Ekspor fungsi untuk mendapatkan data PIC
  getAllFormulir, // Ekspor fungsi untuk mendapatkan seluruh data formulir pelayanan
  getJenisLayanan, // Ekspor fungsi untuk mendapatkan semua jenis layanan
  addJenisLayanan, // Ekspor fungsi untuk menambahkan jenis layanan baru
  deleteJenisLayanan, // Ekspor fungsi untuk menghapus jenis layanan berdasarkan ID
  getJenisLayananById, // Ekspor fungsi untuk mendapatkan jenis layanan berdasarkan ID
  getAllFormulirPIC, // Ekspor fungsi untuk mendapatkan data formulir yang ditugaskan kepada PIC
  getSubJenisLayanan, // Ekspor fungsi untuk mendapatkan semua sub jenis layanan
  addSubJenisLayanan, // Ekspor fungsi untuk menambahkan sub jenis layanan baru
  getSubJenisLayananById, // Ekspor fungsi untuk mendapatkan sub jenis layanan berdasarkan ID
  deleteSubJenisLayanan, // Ekspor fungsi untuk menghapus sub jenis layanan berdasarkan ID
  downloadFile, // Ekspor fungsi untuk mengunduh file
  updatePIC, // Ekspor fungsi untuk memperbarui data PIC
  sortFormulirWithDate, // Ekspor fungsi untuk mengurutkan formulir berdasarkan tanggal
  getUlasanHelpdesk, // Ekspor fungsi untuk mendapatkan ulasan Helpdesk
  getUlasanPIC, // Ekspor fungsi untuk mendapatkan ulasan PIC
};
