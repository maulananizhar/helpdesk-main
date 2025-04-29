// Import React dan hooks yang diperlukan dari library React
import React, { useState, useContext } from "react";
// Import axios untuk melakukan HTTP request (misalnya POST)
import axios from "axios";
// Import useNavigate dari react-router-dom untuk navigasi antar halaman
import { useNavigate } from "react-router-dom";
// Import toast dari react-toastify untuk menampilkan notifikasi kepada pengguna
import { toast } from "react-toastify";

// Import komponen-komponen Material UI yang akan digunakan untuk membuat tampilan form
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
} from "@mui/material";

// Import fungsi styled dari Material UI untuk membuat komponen dengan styling kustom
import { styled } from "@mui/material/styles";
// Import AdminContext untuk mengakses token otorisasi (aToken) dan fungsi-fungsi lain yang berkaitan dengan administrasi
import { AdminContext } from "../../context/AdminContext";

// Import ikon-ikon yang akan digunakan di dalam form
import userIcon from "../../assets/user.png";
import roleIcon from "../../assets/role.png";
import emailIcon from "../../assets/email.png";
import passIcon from "../../assets/pass2.png";
import EyeCloseIcon from "../../assets/EyeClose.png";
import EyeOpenIcon from "../../assets/EyeOpen.png";

// Membuat komponen kustom StyledPaper menggunakan fungsi styled dari Material UI
// Komponen ini digunakan untuk membungkus form dengan padding, bayangan, dan lebar maksimal
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),              // Padding berdasarkan spacing dari tema Material UI
  maxWidth: 500,                          // Lebar maksimal 500px
  margin: "auto",                         // Mengatur margin agar form terpusat secara horizontal
  marginTop: theme.spacing(8),            // Margin atas berdasarkan tema
  [theme.breakpoints.down("sm")]: {       // Responsif: jika layar kecil, atur lebar dan padding
    maxWidth: "90%",
    padding: theme.spacing(3),
  },
}));

// Komponen RegistUser: digunakan untuk menambahkan user (PIC / Admin)
const RegistUser = () => {
  // Menggunakan useState untuk membuat state formData yang menyimpan data input form
  const [formData, setFormData] = useState({
    nama: "",
    role: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  // State loading untuk mengatur status proses pengiriman data (disabled ketika loading)
  const [loading, setLoading] = useState(false);
  // State untuk mengatur tampilan password (apakah terlihat atau disembunyikan)
  const [showPassword, setShowPassword] = useState(false);
  // State untuk mengatur tampilan konfirmasi password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Menggunakan useContext untuk mengakses AdminContext, khususnya token otorisasi (aToken)
  const { aToken } = useContext(AdminContext);
  // Menggunakan useNavigate untuk mendapatkan fungsi navigate guna berpindah halaman setelah aksi tertentu
  const navigate = useNavigate();

  // handleChange: fungsi untuk menangani perubahan input form
  // Menggunakan spread operator untuk meng-copy nilai formData yang lama dan memperbarui properti yang sesuai
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handleSubmit: fungsi untuk menangani pengiriman (submit) form
  // Fungsi ini bersifat asynchronous (async) untuk menangani operasi HTTP request dengan axios
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah perilaku default form (refresh halaman)

    // Validasi input: pastikan semua bidang terisi
    if (
      !formData.nama ||
      !formData.role ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Semua bidang harus diisi!");
      return;
    }
    // Validasi password: pastikan password dan konfirmasi sama
    if (formData.password !== formData.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true); // Set loading true agar tombol submit dinonaktifkan

    try {
      // Mengirim POST request ke endpoint untuk menambahkan user
      await axios.post(
        "http://localhost:3500/admin/users",
        {
          nama: formData.nama,
          role: formData.role,
          email: formData.email,
          password: formData.password,
        },
        { headers: { Authorization: `Bearer ${aToken}` } } // Menyertakan header Authorization
      );
      toast.success("User berhasil ditambahkan!");
      // Reset formData setelah berhasil mengirim data
      setFormData({
        nama: "",
        role: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      // Jika diperlukan, navigasikan ke halaman user lists
      // navigate("/user-lists");
    } catch (error) {
      // Jika terjadi error, tampilkan pesan error dari response atau pesan default
      toast.error(error.response?.data?.message || "Gagal menambahkan user");
    }
    setLoading(false); // Set loading kembali ke false
  };

  return (
    // Container dari Material UI yang mengatur lebar maksimal form
    <Container maxWidth="sm">
      {/* StyledPaper adalah komponen kustom yang sudah kita buat untuk membungkus form */}
      <StyledPaper elevation={4}>
        {/* Typography digunakan untuk menampilkan judul */}
        <Typography variant="h4" align="center" gutterBottom>
          Tambah User (PIC / Admin)
        </Typography>
        {/* Box digunakan untuk membungkus form, atribut component="form" menjadikannya elemen form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Input Nama */}
          <TextField
            fullWidth                // Mengisi lebar penuh
            variant="outlined"        // Menggunakan style outlined
            label="Nama"              // Label input
            name="nama"               // Name digunakan sebagai key di formData
            value={formData.nama}     // Nilai input sesuai state formData.nama
            onChange={handleChange}   // Fungsi handleChange untuk menangani perubahan input
            margin="normal"           // Margin standar antar input
            InputProps={{
              startAdornment: (     // Menggunakan InputAdornment untuk menambahkan ikon di awal input
                <InputAdornment position="start">
                  <img
                    src={userIcon}  // Sumber ikon user
                    alt="User Icon"
                    style={{ width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
          {/* Dropdown Role */}
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>Pilih Role</em>
              </MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="PIC">PIC</MenuItem>
            </Select>
          </FormControl>
          {/* Input Email */}
          <TextField
            fullWidth
            variant="outlined"
            label="Email"
            name="email"
            type="email"              // Tipe input email
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img
                    src={emailIcon}    // Ikon email
                    alt="Email Icon"
                    style={{ width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
            }}
          />
          {/* Input Password */}
          <TextField
            fullWidth
            variant="outlined"
            label="Password"
            name="password"
            // Tipe input ditentukan secara dinamis: "text" jika showPassword true, atau "password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img
                    src={passIcon}     // Ikon password
                    alt="Password Icon"
                    style={{ width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {/* IconButton untuk toggle tampilan password */}
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)} // Menggunakan arrow function untuk toggle boolean
                    edge="end"
                  >
                    <img
                      src={showPassword ? EyeOpenIcon : EyeCloseIcon} // Tampilkan ikon berbeda berdasarkan showPassword
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
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img
                    src={passIcon}     // Ikon password untuk konfirmasi
                    alt="Confirm Password Icon"
                    style={{ width: 20, height: 20 }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                  >
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
          {/* Tombol Submit */}
          <Button
            type="submit"               // Jenis tombol submit untuk form
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}              // Margin atas untuk memberikan jarak dari input terakhir
            disabled={loading}          // Nonaktifkan tombol jika loading true
          >
            {loading ? "Menambahkan..." : "Tambah User"}
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  );
};

// Mengekspor komponen RegistUser agar dapat digunakan di bagian lain aplikasi
export default RegistUser;
