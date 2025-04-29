// Mengimpor React dan hooks yang diperlukan
import { useEffect, useState, useContext } from "react";
// Mengimpor AdminContext untuk mendapatkan data dan fungsi yang berkaitan dengan formulir
import { AdminContext } from "../../context/AdminContext";
// Mengimpor DarkModeContext untuk mengetahui status dark mode (aktif atau tidak)
import { DarkModeContext } from "../../context/DarkModeContext";
// Mengimpor hook useNavigate dari react-router-dom untuk navigasi antar halaman
import { useNavigate } from "react-router-dom";
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
// Mengimpor fungsi styled dari Material UI untuk membuat komponen dengan styling kustom
import { styled } from "@mui/material/styles";
// Mengimpor SidebarContext untuk mendapatkan status sidebar (terbuka/tidak)
import { SidebarContext } from "../../context/SidebarContext";

// Mendefinisikan warna-warna yang akan digunakan
const blueColor = "#2196F3"; // Warna biru
const greenColor = "#4CAF50"; // Warna hijau
const redColor = "#F44336"; // Warna merah

// Membuat komponen StatsCard dengan styling kustom menggunakan styled dari Material UI
// Komponen ini menggunakan Paper sebagai dasar dan menerima properti bgcolor untuk mengatur background
const StatsCard = styled(Paper)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor, // Mengatur background sesuai properti bgcolor
  padding: theme.spacing(1), // Padding berdasarkan tema Material UI
  borderRadius: theme.shape.borderRadius, // Border radius sesuai tema
  textAlign: "center", // Teks di tengah
  color: "#fff", // Warna teks putih
  boxShadow: theme.shadows[2], // Efek bayangan level 2 dari tema
}));

// Membuat koneksi socket dengan server pada alamat http://localhost:3500
const socket = io("http://localhost:3500");

// Komponen fungsional Dashboard
const Dashboard = () => {
  // Mendefinisikan state untuk kata kunci pencarian
  const [searchTerm, setSearchTerm] = useState("");
  // Mendefinisikan state untuk filter status, default "All"
  const [filterStatus, setFilterStatus] = useState("All");
  // Mendefinisikan state untuk menghitung jumlah formulir baru yang diterima melalui socket
  const [newFormCount, setNewFormCount] = useState(0);
  // Mengambil fungsi dan data formulir dari AdminContext
  const { getAllFormulir, formulir, aToken } = useContext(AdminContext);
  // Mengambil status dark mode dari DarkModeContext
  const { darkMode } = useContext(DarkModeContext);
  // Mengambil status sidebar (apakah terbuka atau tidak) dari SidebarContext
  const { isSidebarOpen } = useContext(SidebarContext);
  // Mendapatkan fungsi navigate untuk berpindah halaman
  const navigate = useNavigate();

  // Menentukan warna background container dan teks berdasarkan status dark mode
  const containerBg = darkMode ? "#1E1E1E" : "#ffffff"; // Background container untuk dark/light mode
  const containerText = darkMode ? "#e0e0e0" : "#000000"; // Warna teks untuk dark/light mode
  // Warna background untuk header tabel; menggunakan biru untuk light mode dan warna gelap untuk dark mode
  const tableHeadBg = darkMode ? "#3A3A3A" : blueColor;
  // Warna background untuk baris genap pada tabel, agar tampilan tidak terlalu kontras
  const tableRowEvenBg = darkMode ? "#232323" : "#f5f5f5";

  // useEffect untuk mengambil data formulir dan mendengarkan event "newForm" dari socket
  useEffect(() => {
    if (aToken) {
      // Jika token otorisasi tersedia
      getAllFormulir(); // Ambil data formulir
      // Menambahkan listener untuk event "newForm" yang dikirim oleh server
      socket.on("newForm", () => {
        setNewFormCount(prev => prev + 1); // Tambah counter formulir baru
        getAllFormulir(); // Perbarui data formulir
        // Set timer untuk mereset newFormCount setelah 5 detik
        setTimeout(() => setNewFormCount(0), 5000);
      });
      // Fungsi cleanup: menghapus listener ketika komponen di-unmount atau dependency berubah
      return () => {
        socket.off("newForm");
      };
    }
  }, [aToken]);

  // useEffect tambahan untuk memastikan newFormCount direset jika nilainya lebih dari 0
  useEffect(() => {
    if (newFormCount > 0) {
      const timer = setTimeout(() => setNewFormCount(0), 4000);
      return () => clearTimeout(timer); // Membersihkan timer jika terjadi re-render
    }
  }, [newFormCount]);

  // Fungsi untuk me-refresh data formulir
  const handleRefresh = () => {
    getAllFormulir(); // Panggil kembali fungsi untuk mengambil data formulir
    setNewFormCount(0); // Reset counter formulir baru
  };

  // Memecah kata kunci pencarian menjadi array, menghilangkan spasi berlebih
  const keywords = searchTerm
    .toLowerCase()
    .split(" ")
    .filter(kw => kw.trim() !== "");

  // Menyaring data formulir berdasarkan kata kunci pencarian dan filter status
  const filteredData = formulir.filter(item => {
    // Cek apakah salah satu field mengandung salah satu kata kunci
    const matchesKeywords =
      keywords.length === 0 ||
      keywords.some(
        keyword =>
          (item.ticket && item.ticket.toLowerCase().includes(keyword)) ||
          (item.nama && item.nama.toLowerCase().includes(keyword)) ||
          (item.email && item.email.toLowerCase().includes(keyword)) ||
          (item.unit && item.unit.toLowerCase().includes(keyword)) ||
          (item.layanan && item.layanan.toLowerCase().includes(keyword)) ||
          (item.jenis_layanan &&
            item.jenis_layanan.toLowerCase().includes(keyword)) ||
          (item.sub_jenis_layanan &&
            item.sub_jenis_layanan.toLowerCase().includes(keyword)) ||
          (item.status && item.status.toLowerCase().includes(keyword)) ||
          (item.pic_nama && item.pic_nama.toLowerCase().includes(keyword)) ||
          (item.tindak_lanjut &&
            item.tindak_lanjut.toLowerCase().includes(keyword)) ||
          (typeof item.eskalasi === "boolean" &&
            (item.eskalasi ? "ya" : "tidak").includes(keyword))
      );

    // Cek apakah status item sesuai dengan filterStatus yang dipilih
    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;
    // Mengembalikan true jika kedua kondisi terpenuhi
    return matchesKeywords && matchesStatus;
  });

  // Menentukan urutan status untuk sorting data
  const statusOrder = { Baru: 1, Proses: 2, Selesai: 3 };
  // Mengurutkan data yang telah difilter berdasarkan status
  const sortedData = filteredData.slice().sort((a, b) => {
    const orderA = statusOrder[a.status] || 99; // Jika status tidak ada, berikan nilai default 99
    const orderB = statusOrder[b.status] || 99;
    return orderA - orderB;
  });

  // Menghitung total formulir dan jumlah berdasarkan status
  const totalForms = formulir.length; // Total semua formulir
  const completedForms = formulir.filter(
    item => item.status === "Selesai"
  ).length; // Jumlah formulir yang selesai
  const processedForms = formulir.filter(
    item => item.status === "Proses"
  ).length; // Jumlah formulir yang sedang diproses
  const newForms = formulir.filter(item => item.status === "Baru").length; // Jumlah formulir baru
  const escalations = formulir.filter(item => item.eskalasi).length; // Jumlah formulir yang mengalami eskalasi

  // Membuat array statistik yang akan ditampilkan dalam dashboard
  const stats = [
    { label: "Formulir Baru", value: newForms, color: greenColor },
    { label: "Formulir Diproses", value: processedForms, color: greenColor },
    { label: "Formulir Selesai", value: completedForms, color: greenColor },
    { label: "Total Formulir", value: totalForms, color: blueColor },
    { label: "Eskalasi", value: escalations, color: redColor },
  ];

  // Fungsi untuk mengunduh file dokumen
  const downloadFile = async filename => {
    // Jika filename mengandung "uploads/", hapus bagian tersebut
    const name = filename.includes("uploads/")
      ? filename.replace("uploads/", "")
      : filename;
    try {
      // Melakukan request fetch ke endpoint download dengan menyertakan header otorisasi
      const response = await fetch(
        `http://localhost:3500/admin/download/${name}`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      // Jika response tidak OK, periksa kode statusnya
      if (!response.ok) {
        // Jika status 401 atau 403, beri notifikasi dan navigasi ke halaman login
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi Anda habis, silahkan login kembali.");
          navigate("/login");
        }
        // Lempar error jika terjadi masalah lain
        throw new Error("Error saat mengambil dokumen");
      }
      // Konversi response ke blob untuk file
      const blob = await response.blob();
      // Membuat URL blob untuk membuka file
      const blobUrl = window.URL.createObjectURL(blob);
      // Membuka file dalam tab baru
      window.open(blobUrl, "_blank");
      // Mengatur timeout untuk mencabut URL blob setelah 0.2 menit (12 detik)
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0.2 * 60 * 1000);
    } catch (error) {
      // Menampilkan error pada console dan notifikasi jika gagal membuka dokumen
      console.error("Error membuka dokumen:", error);
      toast.error("Gagal membuka dokumen");
    }
  };

  // Render tampilan dashboard
  return (
    <Container
      maxWidth={false} // Container memenuhi lebar layar
      disableGutters // Menghilangkan padding default container
      sx={{
        mt: 4, // Margin atas 4
        mb: 4, // Margin bawah 4
        ml: isSidebarOpen ? "-10px" : "-150px", // Margin kiri bergantung pada status sidebar
        mr: 2, // Margin kanan 2
        p: 3, // Padding 3
        backgroundColor: containerBg, // Background container sesuai dark/light mode
        color: containerText, // Warna teks sesuai dark/light mode
        minHeight: "100vh", // Tinggi minimum 100% viewport
        borderRadius: 2, // Border radius
        transition:
          "margin-left 0.3s ease, background-color 0.5s ease, color 0.5s ease", // Transisi untuk perubahan style
      }}>
      {/* Jika ada formulir baru, tampilkan notifikasi */}
      {newFormCount > 0 && (
        <Paper
          sx={{
            bgcolor: darkMode ? "#2e7d32" : "success.main", // Warna background notifikasi
            color: "#fff", // Warna teks putih
            p: 1, // Padding 1
            mb: 2, // Margin bawah 2
            textAlign: "center", // Teks di tengah
            borderRadius: 1, // Border radius 1
          }}>
          <Typography variant="body1" fontWeight="bold">
            {newFormCount} formulir baru telah masuk!
          </Typography>
        </Paper>
      )}
      {/* Box untuk tombol Refresh dan judul Dashboard */}
      <Box
        sx={{
          display: "flex", // Menggunakan flexbox
          alignItems: "center", // Menyelaraskan item secara vertikal di tengah
          mb: 2, // Margin bawah 2
        }}>
        <Button
          variant="contained" // Tipe tombol contained
          color="primary" // Warna tombol primary
          size="small" // Ukuran tombol small
          onClick={handleRefresh} // Memanggil fungsi refresh saat diklik
        >
          Refresh Data
        </Button>
        <Typography
          variant="h4" // Ukuran judul h4
          component="h1" // Elemen HTML h1
          sx={{
            fontWeight: "bold", // Teks tebal
            ml: "auto", // Margin kiri otomatis untuk mendorong ke kanan
            color: containerText, // Warna teks sesuai tema
          }}>
          Dashboard Admin
        </Typography>
      </Box>

      {/* Statistik Ringkasan */}
      <Box
        sx={{
          display: "flex", // Menggunakan flexbox
          flexWrap: "wrap", // Membungkus item jika diperlukan
          justifyContent: "space-between", // Menyebarkan item secara merata
          mb: 2, // Margin bawah 2
          gap: 1, // Jarak antar item 1
        }}>
        {stats.map((stat, index) => (
          <Box key={index} sx={{ flex: { xs: "1 1 45%", sm: "0 0 19%" } }}>
            <StatsCard bgcolor={stat.color}>
              <Typography variant="subtitle2">{stat.label}</Typography>
              <Typography variant="h6" fontWeight="bold">
                {stat.value}
              </Typography>
            </StatsCard>
          </Box>
        ))}
      </Box>

      {/* Filter Pencarian & Status */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Kolom untuk input pencarian */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth // Lebar penuh
            label="Cari (mis. 'HMTI KU2' untuk unit, dsb.)" // Label input pencarian
            variant="outlined" // Variasi input outlined
            value={searchTerm} // Nilai input sesuai state searchTerm
            onChange={e => setSearchTerm(e.target.value)} // Update state saat input berubah
            InputLabelProps={{
              style: { color: containerText }, // Warna label sesuai dark/light mode
            }}
            inputProps={{
              style: { color: containerText }, // Warna teks input
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: darkMode ? "#e0e0e0" : undefined, // Border sesuai dark/light mode
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#ffffff" : undefined,
                },
                "&.Mui-focused fieldset": {
                  borderColor: darkMode ? "#ffffff" : undefined,
                },
              },
            }}
          />
        </Grid>
        {/* Kolom untuk filter status */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel
              id="status-select-label"
              style={{ color: containerText }} // Warna label sesuai tema
            >
              Status
            </InputLabel>
            <MuiSelect
              labelId="status-select-label"
              value={filterStatus} // Nilai filter status sesuai state
              label="Status"
              onChange={e => setFilterStatus(e.target.value)} // Update state saat filter berubah
              sx={{
                color: containerText, // Warna teks sesuai tema
                "& .MuiSvgIcon-root": { color: containerText }, // Warna ikon dropdown
                "& fieldset": {
                  borderColor: darkMode ? "#e0e0e0" : undefined,
                },
              }}>
              <MenuItem value="All">Semua Status</MenuItem>
              <MenuItem value="Baru">Baru</MenuItem>
              <MenuItem value="Proses">Dalam Proses</MenuItem>
              <MenuItem value="Selesai">Selesai</MenuItem>
            </MuiSelect>
          </FormControl>
        </Grid>
      </Grid>

      {/* Tabel Data Formulir */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 2, // Efek bayangan level 2
          overflowX: "visible", // Mengizinkan overflow secara horizontal
          borderRadius: 1, // Border radius 1
          mt: 2, // Margin atas 2
        }}>
        <Table size="small" sx={{ width: "100%", minWidth: "100%" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: tableHeadBg }}>
              {" "}
              {/* Baris header tabel dengan background sesuai tema */}
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                No
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Ticket
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Nama
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Email
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Unit
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Layanan
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Jenis Layanan
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Sub Jenis Layanan
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Status
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                PIC
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Tindak Lanjut
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Eskalasi
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>
                Dokumen
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Jika ada data setelah sorting, iterasi setiap item */}
            {sortedData.length > 0 ? (
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
                    key={item.id} // Menggunakan id item sebagai key
                    // Mengatur style untuk baris, termasuk override efek hover agar warna tetap sama
                    sx={{
                      bgcolor: rowBg,
                      "&:hover": {
                        bgcolor: rowBg + " !important",
                        cursor: "default",
                      },
                    }}>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.ticket || "-"}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.nama}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.email}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.unit}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.layanan}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.jenis_layanan || "-"}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.sub_jenis_layanan || "-"}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.status}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.pic_nama || "Belum Ditugaskan"}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.tindak_lanjut || "-"}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {item.eskalasi ? "Ya" : "Tidak"}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
                      {/* Jika dokumen tersedia, tampilkan tombol Download */}
                      {item.dokumen ? (
                        <Button
                          onClick={() => downloadFile(item.dokumen)}
                          variant="contained"
                          color="primary"
                          size="small">
                          Download
                        </Button>
                      ) : (
                        "Tidak ada"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              // Jika tidak ada data, tampilkan baris dengan pesan "Tidak ada data."
              <TableRow>
                <TableCell
                  colSpan={13}
                  align="center"
                  sx={{ p: 1, color: darkMode ? "#fff" : "#000" }}>
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

// Mengekspor komponen Dashboard sebagai default export
export default Dashboard;
