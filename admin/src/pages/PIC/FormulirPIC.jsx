// Import library dan hook yang diperlukan dari React dan library terkait lainnya
import React, { useEffect, useState, useContext } from "react";
// Import Link untuk navigasi internal dan useNavigate untuk programmatic navigation
import { Link, useNavigate } from "react-router-dom";
// Import fungsi jwtDecode untuk mendekode token JWT
import { jwtDecode } from "jwt-decode";
// Import toast dari react-toastify untuk menampilkan notifikasi
import { toast } from "react-toastify";
// Import axios untuk melakukan request HTTP
import axios from "axios";
// Import Select dari react-select (meskipun tidak digunakan dalam kode ini)
import Select from "react-select";
// Import context untuk mendapatkan data dan fungsi yang berkaitan dengan PIC (Person In Charge)
import { PICContext } from "../../context/PICContext";
// Import context untuk mengatur dark mode
import { DarkModeContext } from "../../context/DarkModeContext";
// Import context untuk mengatur tampilan sidebar
import { SidebarContext } from "../../context/SidebarContext";
// Import komponen Material UI yang digunakan untuk membangun antarmuka
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

// Definisikan warna biru untuk digunakan sebagai background tabel saat dark mode tidak aktif
const blueColor = "#2196F3";

// Komponen utama FormulirPIC yang menampilkan data formulir PIC dan fitur pencarian/filter
const FormulirPIC = () => {
  // State untuk menyimpan kata kunci pencarian yang dimasukkan pengguna
  const [searchTerm, setSearchTerm] = useState("");
  // State untuk menyimpan filter status, defaultnya "Proses"
  const [filterStatus, setFilterStatus] = useState("Proses");
  // State untuk menghitung jumlah notifikasi form baru yang masuk
  const [notificationCount, setNotificationCount] = useState(0);
  // Mengambil fungsi dan data dari PICContext, termasuk fungsi untuk mengambil data dan menghapus formulir
  const { getAllFormulirPIC, formulirPIC, pToken, deleteFormulir } = useContext(PICContext);
  // Mengambil nilai darkMode dari DarkModeContext untuk menentukan tema
  const { darkMode } = useContext(DarkModeContext);
  // Mengambil status sidebar dari SidebarContext untuk mengatur margin container
  const { isSidebarOpen } = useContext(SidebarContext);
  // Hook useNavigate untuk melakukan navigasi programatik (misalnya, ke halaman login)
  const navigate = useNavigate();

  // Variabel untuk mengatur warna background dan teks container berdasarkan mode (dark/light)
  const containerBg = darkMode ? "#121212" : "#ffffff";
  const containerText = darkMode ? "#e0e0e0" : "#000000";
  // Untuk header tabel, jika dark mode aktif maka gunakan warna gelap, jika tidak gunakan warna biru
  const tableHeadBg = darkMode ? "#333333" : blueColor;
  // Warna teks pada sel tabel disesuaikan dengan mode
  const cellTextColor = darkMode ? "#fff" : containerText;

  // useEffect untuk melakukan inisialisasi data dan pengaturan awal
  useEffect(() => {
    // Memanggil fungsi untuk mengambil seluruh data formulir PIC
    getAllFormulirPIC();

    // Jika token tersedia, decode token untuk mendapatkan informasi PIC
    if (pToken) {
      const decodedToken = jwtDecode(pToken);
      const picId = decodedToken.id;
      // Contoh: bergabung dengan room atau melakukan aksi lain menggunakan picId
      // Pastikan server menangani joinRoom jika diperlukan
    }

    // Logika untuk notifikasi form baru bisa ditambahkan di sini, misalnya melalui socket
    // Contoh: jika ada form baru, tingkatkan nilai notificationCount
    // Pastikan juga untuk menghapus listener socket jika diperlukan agar tidak terjadi memory leak

  }, [pToken, getAllFormulirPIC]); // Dependency array memastikan useEffect dipanggil kembali jika pToken atau getAllFormulirPIC berubah

  /* 
    Implementasi fungsi multisearch:
    - Ubah input pencarian menjadi lowercase, pisahkan berdasarkan spasi, dan filter kata kosong.
  */
  const keywords = searchTerm
    .toLowerCase()
    .split(" ")
    .filter((kw) => kw.trim() !== "");

  /* 
    Filter data formulirPIC berdasarkan:
    - Pencocokan kata kunci pada beberapa field: ticket, nama, email, unit, layanan, status, jenis layanan, sub jenis layanan, tindak lanjut, dan eskalasi.
    - Filter status: jika filterStatus tidak "All", tampilkan hanya data dengan status yang sama.
  */
  const filteredData = formulirPIC.filter((item) => {
    const matchesKeywords =
      keywords.length === 0 ||
      keywords.some((keyword) =>
        (item.ticket && item.ticket.toLowerCase().includes(keyword)) ||
        (item.nama && item.nama.toLowerCase().includes(keyword)) ||
        (item.email && item.email.toLowerCase().includes(keyword)) ||
        (item.unit && item.unit.toLowerCase().includes(keyword)) ||
        (item.layanan && item.layanan.toLowerCase().includes(keyword)) ||
        (item.status && item.status.toLowerCase().includes(keyword)) ||
        (item.jenis_layanan && item.jenis_layanan.toLowerCase().includes(keyword)) ||
        (item.sub_jenis_layanan && item.sub_jenis_layanan.toLowerCase().includes(keyword)) ||
        (item.tindak_lanjut && item.tindak_lanjut.toLowerCase().includes(keyword)) ||
        // Penanganan khusus untuk field boolean "eskalasi"
        (typeof item.eskalasi === "boolean" &&
          (item.eskalasi ? "ya" : "tidak").includes(keyword))
      );

    // Jika filterStatus adalah "All", maka lewati filter status, jika tidak cocokkan dengan item.status
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    return matchesKeywords && matchesStatus;
  });

  /* 
    Urutkan data berdasarkan status dengan urutan khusus:
    - "Baru" -> 1, "Proses" -> 2, "Selesai" -> 3.
    - Jika status tidak dikenali, diberi nilai default 99 agar muncul di akhir.
  */
  const statusOrder = { Baru: 1, Proses: 2, Selesai: 3 };
  const sortedData = filteredData.slice().sort((a, b) => {
    const orderA = statusOrder[a.status] || 99;
    const orderB = statusOrder[b.status] || 99;
    return orderA - orderB;
  });

  /* 
    Fungsi downloadFile untuk mengunduh file dokumen dari server:
    - Menerima parameter filename, membersihkan string filename jika mengandung "uploads/".
    - Menggunakan axios untuk melakukan request GET dengan responseType "blob".
    - Jika respons berhasil, membuat Blob dan membuka file di tab baru.
    - Menangani error dan notifikasi jika gagal.
  */
  const downloadFile = async (filename) => {
    // Bersihkan nama file jika mengandung "uploads/"
    const name = filename.includes("uploads/") ? filename.replace("uploads/", "") : filename;
    try {
      // Melakukan request GET ke endpoint download dengan otorisasi token dan tipe respons blob
      const response = await axios.get(`http://localhost:3500/admin/download/${name}`, {
        headers: { Authorization: `Bearer ${pToken}` },
        responseType: "blob",
      });
      // Periksa apakah status respons tidak sama dengan 200
      if (response.status !== 200) {
        // Jika token tidak valid, tampilkan error dan navigasikan ke halaman login
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi Anda habis, silahkan login kembali.");
          navigate("/login");
        }
        throw new Error("Error saat mengambil dokumen");
      }
      // Membuat Blob dari data respons
      const blob = new Blob([response.data]);
      // Membuat URL objek dari Blob
      const blobUrl = window.URL.createObjectURL(blob);
      // Buka dokumen di tab baru
      window.open(blobUrl, "_blank");
      // Setelah beberapa waktu, revoke URL objek untuk mencegah memory leak
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0.2 * 60 * 1000);
    } catch (error) {
      // Tangani error dengan menampilkan pesan error di console dan notifikasi ke pengguna
      console.error("Error membuka dokumen:", error);
      toast.error("Gagal membuka dokumen");
    }
  };

  return (
    // Container utama yang membungkus keseluruhan tampilan data formulir PIC
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        mt: 4, // Margin atas
        mb: 4, // Margin bawah
        ml: isSidebarOpen ? "-10px" : "-150px", // Margin kiri disesuaikan dengan status sidebar
        mr: 2, // Margin kanan
        p: 3, // Padding keseluruhan container
        backgroundColor: containerBg, // Background container sesuai tema
        color: containerText, // Warna teks sesuai tema
        minHeight: "100vh", // Minimum tinggi agar mengisi layar
        borderRadius: 2, // Border radius untuk tampilan yang lebih lembut
        transition: "margin-left 0.3s ease, background-color 0.5s ease, color 0.5s ease", // Efek transisi untuk perubahan tampilan
      }}
    >
      {/* Jika ada notifikasi baru, tampilkan pesan notifikasi */}
      {notificationCount > 0 && (
        <Paper
          sx={{
            // Warna background notifikasi disesuaikan dengan tema; gunakan warna hijau
            bgcolor: darkMode ? "#2e7d32" : "success.main",
            color: "#fff",
            p: 1,
            mb: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" fontWeight="bold">
            {notificationCount} formulir baru masuk!
          </Typography>
        </Paper>
      )}

      {/* Bagian header: tombol refresh dan judul halaman */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        {/* Tombol refresh untuk mengambil data formulir terbaru */}
        <Button variant="contained" color="primary" onClick={getAllFormulirPIC}>
          Refresh Data
        </Button>
        {/* Judul halaman */}
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: containerText }}>
          Data Formulir Saya
        </Typography>
      </Box>

      {/* Bagian input pencarian dan filter status menggunakan Grid untuk responsivitas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          {/* Input teks untuk pencarian dengan styling yang disesuaikan dengan tema */}
          <TextField
            fullWidth
            label="Cari berdasarkan Ticket, Nama, Email, Unit, Layanan, dll..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputLabelProps={{
              style: { color: containerText },
            }}
            inputProps={{
              style: { color: containerText },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: darkMode ? "#e0e0e0" : undefined,
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
        <Grid item xs={12} sm={6} md={4}>
          {/* Dropdown untuk memilih filter status */}
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
                color: containerText,
                "& .MuiSvgIcon-root": { color: containerText },
                "& fieldset": {
                  borderColor: darkMode ? "#e0e0e0" : undefined,
                },
              }}
            >
              {/* Opsi filter status */}
              <MenuItem value="All">Semua Status</MenuItem>
              <MenuItem value="Baru">Baru</MenuItem>
              <MenuItem value="Proses">Dalam Proses</MenuItem>
              <MenuItem value="Selesai">Selesai</MenuItem>
            </MuiSelect>
          </FormControl>
        </Grid>
      </Grid>

      {/* Tabel untuk menampilkan data formulir PIC */}
      <TableContainer component={Paper}>
        <Table>
          {/* Header tabel dengan warna background yang disesuaikan; pada light mode menggunakan warna biru */}
          <TableHead>
            <TableRow sx={{ bgcolor: tableHeadBg }}>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>No</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Ticket</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Nama</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Layanan</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Jenis Layanan</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Sub Jenis Layanan</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Tindak Lanjut</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Eskalasi</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          {/* Body tabel yang menampilkan data dinamis */}
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => {
                // Menentukan warna background baris secara bergantian (efek zebra)
                const rowBg = darkMode
                  ? index % 2 === 0
                    ? containerBg
                    : "#232323"
                  : index % 2 === 0
                  ? containerBg
                  : "grey.100";
                return (
                  <TableRow
                    key={item.id}
                    sx={{
                      bgcolor: rowBg,
                      "&:hover": { bgcolor: rowBg + " !important", cursor: "default" },
                    }}
                  >
                    <TableCell sx={{ color: cellTextColor }}>{index + 1}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.ticket || "-"}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.nama}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.email}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.unit}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.layanan}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.status}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.jenis_layanan || "-"}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.sub_jenis_layanan || "-"}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.tindak_lanjut || "-"}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>{item.eskalasi ? "Ya" : "Tidak"}</TableCell>
                    <TableCell sx={{ color: cellTextColor }}>
                      {/* Link untuk navigasi ke halaman edit formulir PIC */}
                      <Link to={`/edit-form-pic/${item.id}`} style={{ textDecoration: "none" }}>
                        <Button variant="contained" color="secondary" size="small">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              // Jika tidak ada data yang sesuai, tampilkan pesan bahwa tidak ada data
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ color: cellTextColor }}>
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

export default FormulirPIC;
