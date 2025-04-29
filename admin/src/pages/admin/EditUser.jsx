// Import React dan hooks yang diperlukan
import React, { useState, useEffect, useContext } from "react";
// Import axios untuk melakukan HTTP request
import axios from "axios";
// Import useNavigate dan useParams dari react-router-dom untuk navigasi dan mengakses parameter URL
import { useNavigate, useParams } from "react-router-dom";
// Import toast dari react-toastify untuk menampilkan notifikasi kepada pengguna
import { toast } from "react-toastify";
// Import komponen Material UI yang akan digunakan untuk membuat UI form
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Box,
} from "@mui/material";
// Import fungsi styled dari Material UI untuk membuat komponen kustom dengan styling
import { styled } from "@mui/material/styles";
// Import AdminContext untuk mengakses data dan fungsi terkait administrasi (misalnya, token aToken)
import { AdminContext } from "../../context/AdminContext";
// Import SidebarContext untuk mendapatkan status sidebar (misalnya, apakah sidebar terbuka)
import { SidebarContext } from "../../context/SidebarContext";

// Impor ikon-ikon yang digunakan dalam form
import userIcon from "../../assets/user.png";
import emailIcon from "../../assets/email.png";
import passIcon from "../../assets/pass2.png";
import EyeCloseIcon from "../../assets/EyeClose.png";
import EyeOpenIcon from "../../assets/EyeOpen.png";

// Membuat komponen kustom StyledPaper menggunakan fungsi styled dari Material UI
// Komponen ini berfungsi sebagai pembungkus form dengan padding, bayangan, dan lebar maksimum
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4), // Mengatur padding menggunakan spacing dari tema
  maxWidth: 500, // Lebar maksimum 500px
  margin: "auto", // Mengatur margin agar form terpusat secara horizontal
  marginTop: theme.spacing(8), // Margin atas untuk memberikan jarak dari atas
  [theme.breakpoints.down("sm")]: {
    // Responsif: jika layar kecil, sesuaikan lebar dan padding
    maxWidth: "90%",
    padding: theme.spacing(3),
  },
}));

// Komponen EditUser: digunakan untuk mengedit data user (PIC)
const EditUser = () => {
  // Mengambil 'id' dari URL menggunakan useParams (contoh: /edit-user/123, maka id = 123)
  const { id } = useParams();
  // Mengakses aToken dari AdminContext untuk otorisasi request
  const { aToken } = useContext(AdminContext);
  // Mendapatkan fungsi navigate untuk berpindah halaman setelah aksi tertentu
  const navigate = useNavigate();
  // Mengambil status sidebar dari SidebarContext, misalnya untuk mengatur margin container
  const { isSidebarOpen } = useContext(SidebarContext);

  // State formData untuk menyimpan data input form, dengan properti nama, email, password, dan confirmPassword
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  // State loading untuk menandai status pengiriman data (digunakan untuk menonaktifkan tombol saat loading)
  const [loading, setLoading] = useState(false);
  // State untuk mengatur apakah password ditampilkan dalam bentuk teks atau disembunyikan
  const [showPassword, setShowPassword] = useState(false);
  // State untuk mengatur apakah konfirmasi password ditampilkan atau disembunyikan
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // useEffect untuk mengambil data user ketika komponen dimount atau saat id/aToken berubah
  useEffect(() => {
    // Fungsi async untuk mengambil data user dari backend
    const fetchUserData = async () => {
      try {
        // Mengirim request GET ke endpoint untuk mendapatkan data user berdasarkan id
        const response = await axios.get(
          `http://localhost:3500/admin/users/${id}`,
          { headers: { Authorization: `Bearer ${aToken}` } }
        );
        // Menyimpan data yang diterima ke state formData
        const user = response.data;
        setFormData({
          nama: user.nama || "",
          email: user.email || "",
          password: "", // Password tidak ditampilkan, kosongkan untuk pengisian ulang
          confirmPassword: "", // Konfirmasi password juga dikosongkan
        });
      } catch (error) {
        // Tampilkan notifikasi error jika terjadi masalah dalam pengambilan data
        toast.error("Gagal mengambil data user");
      }
    };

    // Panggil fungsi fetchUserData jika aToken tersedia (untuk memastikan request diotorisasi)
    if (aToken) {
      fetchUserData();
    }
  }, [id, aToken]); // Dependency: jalankan kembali jika id atau aToken berubah

  // Fungsi handleChange untuk menangani perubahan pada input form
  // Menggunakan spread operator untuk meng-copy nilai formData yang lama dan memperbarui properti yang sesuai
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fungsi handleSubmit untuk menangani pengiriman (submit) form edit user
  const handleSubmit = async e => {
    e.preventDefault(); // Mencegah refresh halaman secara default ketika form disubmit

    // Validasi: Pastikan semua bidang telah diisi
    if (
      !formData.nama ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Semua bidang harus diisi!");
      return;
    }

    // Validasi: Pastikan nilai password dan konfirmasi password sama
    if (formData.password !== formData.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok!");
      return;
    }

    // Set loading true agar tombol submit dinonaktifkan dan menunjukkan proses sedang berjalan
    setLoading(true);
    try {
      // Mengirim PUT request ke backend untuk memperbarui data user
      // Template literal digunakan untuk menyisipkan id ke dalam URL
      const response = await axios.put(
        `http://localhost:3500/admin/pic/${id}`,
        {
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
        },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      // Mencetak data response ke console (opsional, untuk debugging)
      console.log("Data:", response.data);
      // Tampilkan notifikasi sukses kepada pengguna
      toast.success("User berhasil diperbarui!");
      // Navigasi ke halaman user-lists setelah update berhasil
      navigate("/user-lists");
    } catch (error) {
      // Tampilkan notifikasi error berdasarkan response atau pesan default
      toast.error(error.response?.data?.message || "Gagal memperbarui user");
    }
    // Set loading kembali ke false setelah proses selesai
    setLoading(false);
  };

  return (
    // Container Material UI dengan lebar maksimum "sm"
    // Margin kiri diatur dinamis berdasarkan status sidebar (isSidebarOpen)
    <Container
      maxWidth="sm"
      sx={{
        ml: isSidebarOpen ? "220px" : "64px", // Misal: jika sidebar terbuka, beri margin kiri 220px; jika tidak, 64px
        transition: "margin-left 0.3s ease", // Transisi smooth untuk perubahan margin
      }}>
      {/* StyledPaper merupakan komponen kustom yang kita buat untuk membungkus form */}
      <StyledPaper elevation={4}>
        {/* Typography untuk judul halaman */}
        <Typography variant="h4" align="center" gutterBottom>
          Edit User (PIC)
        </Typography>
        {/* Box dengan properti component="form" menjadikannya elemen form HTML */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          {/* Input Nama */}
          <TextField
            fullWidth
            variant="outlined"
            label="Nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            margin="normal"
            // InputProps untuk menambahkan ikon di dalam input
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img
                    src={userIcon} // Ikon untuk input nama
                    alt="User Icon"
                    style={{ width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
          {/* Input Email */}
          <TextField
            fullWidth
            variant="outlined"
            label="Email"
            name="email"
            type="email" // Tipe email untuk validasi HTML
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img
                    src={emailIcon} // Ikon untuk input email
                    alt="Email Icon"
                    style={{ width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
          {/* Input Password Baru */}
          <TextField
            fullWidth
            variant="outlined"
            label="Password Baru"
            name="password"
            // Tipe input menggunakan ternary operator: "text" jika showPassword true, jika tidak "password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img
                    src={passIcon} // Ikon untuk input password
                    alt="Password Icon"
                    style={{ width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
              // endAdornment menambahkan tombol ikon untuk toggle tampilan password
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(prev => !prev)} // Toggle nilai boolean showPassword
                    edge="end">
                    <img
                      src={showPassword ? EyeOpenIcon : EyeCloseIcon} // Menampilkan ikon berdasarkan kondisi showPassword
                      alt="Toggle Password"
                      style={{ width: 20, height: 20 }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Input Konfirmasi Password */}
          <TextField
            fullWidth
            variant="outlined"
            label="Konfirmasi Password"
            name="confirmPassword"
            // Menggunakan ternary operator untuk menentukan tipe input password
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img
                    src={passIcon} // Ikon untuk konfirmasi password
                    alt="Confirm Password Icon"
                    style={{ width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
              // endAdornment untuk tombol toggle konfirmasi password
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    edge="end">
                    <img
                      src={showConfirmPassword ? EyeOpenIcon : EyeCloseIcon}
                      alt="Toggle Confirm Password"
                      style={{ width: 20, height: 20 }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Tombol Submit untuk mengirim form */}
          <Button
            type="submit" // Menetapkan jenis tombol sebagai submit
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }} // Margin atas untuk jarak dari input terakhir
            disabled={loading} // Nonaktifkan tombol jika proses loading sedang berlangsung
          >
            {loading ? "Memperbarui..." : "Perbarui User"}
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  );
};

// Mengekspor komponen EditUser agar dapat digunakan di bagian lain aplikasi
export default EditUser;
