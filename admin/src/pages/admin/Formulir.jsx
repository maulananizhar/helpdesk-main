// Mengimpor React dan hooks yang diperlukan
import React, { useEffect, useState, useContext } from "react";
// Mengimpor AdminContext untuk mengakses data formulir dan fungsi terkait
import { AdminContext } from "../../context/AdminContext";
// Mengimpor Link dari react-router-dom untuk navigasi antar halaman
import { Link } from "react-router-dom";
// Mengimpor fungsi io dari socket.io-client untuk komunikasi real-time dengan server
import { io } from "socket.io-client";
// Mengimpor toast dari react-toastify untuk menampilkan notifikasi
import { toast } from "react-toastify";
// Mengimpor berbagai komponen Material UI untuk membangun antarmuka
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  Grid,
} from "@mui/material";

// Mengimpor SidebarContext untuk mendapatkan status sidebar (apakah terbuka atau tidak)
import { SidebarContext } from "../../context/SidebarContext";
// Mengimpor DarkModeContext untuk mengetahui status dark mode (aktif atau tidak)
import { DarkModeContext } from "../../context/DarkModeContext";

// Membuat koneksi socket ke server di alamat http://localhost:3500
const socket = io("http://localhost:3500");

// Komponen fungsional Formulir
const Formulir = () => {
  // State untuk menyimpan kata kunci pencarian
  const [searchTerm, setSearchTerm] = useState("");
  // State untuk menyimpan filter status, default diatur ke "Baru"
  const [filterStatus, setFilterStatus] = useState("Baru");
  // State untuk menyimpan jumlah notifikasi formulir baru yang masuk
  const [notificationCount, setNotificationCount] = useState(0);

  // Mengambil fungsi getAllFormulir, data formulir, dan getPICsData dari AdminContext
  const { getAllFormulir, formulir, getPICsData } = useContext(AdminContext);
  // Mengambil status sidebar dari SidebarContext
  const { isSidebarOpen } = useContext(SidebarContext);
  // Mengambil status dark mode dari DarkModeContext
  const { darkMode } = useContext(DarkModeContext);

  // Menentukan warna background dan teks berdasarkan dark mode
  const containerBg = darkMode ? "#1E1E1E" : "#ffffff"; // Warna background container
  const containerText = darkMode ? "#e0e0e0" : "#000000";  // Warna teks container
  // Mendefinisikan warna biru dan mengatur background header tabel
  const blueColor = "#2196F3";
  const tableHeadBg = darkMode ? "#3A3A3A" : blueColor; 
  // Mengatur warna background untuk baris tabel genap
  const tableRowEvenBg = darkMode ? "#232323" : "grey.100";

  // useEffect untuk mengambil data PIC dan formulir serta mendengarkan event "newForm" dari socket
  useEffect(() => {
    // Memanggil fungsi untuk mengambil data PIC (PICs terkait)
    getPICsData();
    // Memanggil fungsi untuk mengambil data formulir
    getAllFormulir();
    // Menambahkan listener untuk event "newForm" dari server
    socket.on("newForm", () => {
      // Menambah jumlah notifikasi formulir baru yang masuk
      setNotificationCount((prevCount) => prevCount + 1);
      // Memperbarui data formulir
      getAllFormulir();
    });
    // Fungsi cleanup: menghapus listener ketika komponen di-unmount
    return () => {
      socket.off("newForm");
    };
    // eslint-disable-next-line
  }, []);

  // useEffect untuk mereset notificationCount setelah beberapa detik jika ada notifikasi
  useEffect(() => {
    if (notificationCount > 0) {
      // Set timer untuk mereset notifikasi setelah 4000ms (4 detik)
      const timer = setTimeout(() => setNotificationCount(0), 4000);
      return () => clearTimeout(timer); // Membersihkan timer saat re-render
    }
  }, [notificationCount]);

  // Fungsi untuk melakukan refresh data formulir dan mereset notifikasi
  const handleRefresh = () => {
    getAllFormulir(); // Memanggil fungsi getAllFormulir untuk memperbarui data
    setNotificationCount(0); // Reset jumlah notifikasi formulir baru
  };

  // Menyaring data formulir berdasarkan kata kunci pencarian dan filter status
  const filteredData = formulir.filter((item) => {
    // Mengubah kata kunci pencarian menjadi lowercase untuk pencarian yang tidak case-sensitive
    const term = searchTerm.toLowerCase();
    // Mengecek apakah nama, email, atau unit mengandung kata kunci
    return (
      (item.nama.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.unit.toLowerCase().includes(term)) &&
      // Jika filterStatus adalah "All" atau status item sesuai dengan filterStatus
      (filterStatus === "All" || item.status === filterStatus)
    );
  });

  // Menentukan urutan status untuk mengurutkan data (Baru, Proses, Selesai)
  const statusOrder = { Baru: 1, Proses: 2, Selesai: 3 };
  // Mengurutkan data yang sudah difilter berdasarkan urutan status
  const sortedData = filteredData.slice().sort((a, b) => {
    const orderA = statusOrder[a.status] || 99; // Jika status tidak dikenali, beri nilai default 99
    const orderB = statusOrder[b.status] || 99;
    return orderA - orderB;
  });

  return (
    <Container
      maxWidth={false}        // Container memenuhi lebar layar penuh
      disableGutters          // Menghilangkan gutter/padding default
      sx={{
        mt: 2,               // Margin atas 2
        mb: 2,               // Margin bawah 2
        ml: isSidebarOpen ? "-10px" : "-150px", // Margin kiri disesuaikan dengan status sidebar
        mr: 2,               // Margin kanan 2
        p: 3,                // Padding 3
        backgroundColor: containerBg, // Warna background sesuai dark/light mode
        color: containerText,         // Warna teks sesuai dark/light mode
        minHeight: "100vh",  // Tinggi minimum 100% viewport
        borderRadius: 2,     // Border radius 2
        transition:
          "margin-left 0.3s ease, background-color 0.5s ease, color 0.5s ease", // Transisi untuk perubahan styling
      }}
    >
      {/* Jika ada notifikasi formulir baru, tampilkan pesan notifikasi */}
      {notificationCount > 0 && (
        <Paper
          sx={{
            bgcolor: darkMode ? "#2e7d32" : "success.main", // Warna background notifikasi
            color: "#fff",    // Warna teks putih
            p: 1,             // Padding 1
            mb: 2,            // Margin bawah 2
            textAlign: "center", // Teks di tengah
          }}
        >
          <Typography variant="body1" fontWeight="bold">
            {notificationCount} formulir baru masuk!
          </Typography>
        </Paper>
      )}

      {/* Box header: berisi tombol Refresh Data dan judul halaman */}
      <Box
        sx={{
          display: "flex",                   // Menggunakan flexbox untuk layout
          justifyContent: "space-between",     // Distribusi ruang antara elemen
          alignItems: "center",                // Menyelaraskan elemen secara vertikal di tengah
          mb: 3,                             // Margin bawah 3
        }}
      >
        <Button variant="contained" color="primary" onClick={handleRefresh}>
          Refresh Data
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Data Formulir
        </Typography>
      </Box>

      {/* Filter pencarian dan filter status */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Kolom input pencarian */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Cari berdasarkan Nama, Email, Unit, atau PIC..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputLabelProps={{
              style: { color: containerText }, // Warna label sesuai dark/light mode
            }}
            inputProps={{
              style: { color: containerText },  // Warna teks input
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: darkMode ? "white" : "black", // Warna border sesuai dark/light mode
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "white" : "black",
                },
                "&.Mui-focused fieldset": {
                  borderColor: darkMode ? "white" : "black",
                },
              },
            }}
          />
        </Grid>
        {/* Kolom filter status */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-select-label" style={{ color: containerText }}>
              Status
            </InputLabel>
            <MuiSelect
              labelId="status-select-label"
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{
                color: containerText, // Warna teks sesuai tema
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkMode ? "white" : "black", // Warna border sesuai dark/light mode
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkMode ? "white" : "black",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkMode ? "white" : "black",
                },
                "& .MuiSvgIcon-root": { color: containerText }, // Warna ikon dropdown
              }}
            >
              <MenuItem value="All">Semua Status</MenuItem>
              <MenuItem value="Baru">Baru</MenuItem>
              <MenuItem value="Proses">Dalam Proses</MenuItem>
              <MenuItem value="Selesai">Selesai</MenuItem>
            </MuiSelect>
          </FormControl>
        </Grid>
      </Grid>

      {/* Tabel untuk menampilkan data formulir */}
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table>
          {/* Header tabel */}
          <TableHead>
            <TableRow
              sx={{
                bgcolor: tableHeadBg, // Background header sesuai tema
                "& th": { color: "#fff", fontWeight: "bold" }, // Styling teks header
              }}
            >
              <TableCell>No</TableCell>
              <TableCell>Nama</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Layanan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>PIC</TableCell>
              <TableCell>Sub Jenis Layanan</TableCell>
              <TableCell>Jenis Layanan</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          {/* Body tabel */}
          <TableBody>
            {sortedData.length > 0 ? (
              // Jika ada data, lakukan mapping untuk setiap item
              sortedData.map((item, index) => {
                // Menentukan warna background baris berdasarkan dark mode dan indeks (baris genap/ganjil)
                const rowBg = darkMode
                  ? index % 2 === 0
                    ? containerBg
                    : tableRowEvenBg
                  : index % 2 === 0
                  ? containerBg
                  : tableRowEvenBg;
                return (
                  <TableRow
                    key={item.id} // Menggunakan id item sebagai key unik
                    hover // Mengaktifkan efek hover bawaan
                    sx={{
                      bgcolor: rowBg,
                      // Override efek hover agar background dan warna teks tetap sama
                      "&:hover": {
                        bgcolor: `${rowBg} !important`,
                        "& td": {
                          color: containerText,
                        },
                      },
                    }}
                  >
                    <TableCell sx={{ color: containerText }}>
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{ color: containerText }}>
                      {item.nama}
                    </TableCell>
                    <TableCell sx={{ color: containerText }}>
                      {item.email}
                    </TableCell>
                    <TableCell sx={{ color: containerText }}>
                      {item.unit}
                    </TableCell>
                    <TableCell sx={{ color: containerText }}>
                      {item.layanan}
                    </TableCell>
                    <TableCell sx={{ color: containerText }}>
                      {item.status}
                    </TableCell>
                    <TableCell sx={{ color: containerText }}>
                      {item.pic_nama || "Belum Ditugaskan"}
                    </TableCell>
                    <TableCell sx={{ color: containerText }}>
                      {item.sub_jenis_layanan || "-"}
                    </TableCell>
                    <TableCell sx={{ color: containerText }}>
                      {item.jenis_layanan || "-"}
                    </TableCell>
                    <TableCell>
                      {/* Tombol Edit yang mengarahkan ke halaman edit berdasarkan id item */}
                      <Link to={`/edit-form/${item.id}`} style={{ textDecoration: "none" }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          sx={{
                            "&:hover": {
                              // Mengatur warna background tombol saat hover sesuai dark mode
                              backgroundColor: darkMode
                                ? "#ad1457 !important"
                                : "#d81b60 !important",
                            },
                          }}
                        >
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              // Jika tidak ada data, tampilkan baris dengan pesan "Tidak ada data."
              <TableRow sx={{ bgcolor: containerBg }}>
                <TableCell colSpan={10} align="center" sx={{ color: containerText }}>
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

// Mengekspor komponen Formulir sebagai default export
export default Formulir;
