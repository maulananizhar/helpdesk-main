// Import library dan hook yang diperlukan dari React dan library terkait lainnya
import React, { useEffect, useState, useContext } from "react"; // Menggunakan React dan hook untuk state, efek samping, dan context
import { useNavigate } from "react-router-dom"; // Hook untuk navigasi antar halaman
import { io } from "socket.io-client"; // Library untuk membuat koneksi real-time menggunakan Socket.IO
import { toast } from "react-toastify"; // Library untuk menampilkan notifikasi/toast
import { PICContext } from "../../context/PICContext"; // Context untuk data dan fungsi yang berkaitan dengan PIC (Person In Charge)
import { DarkModeContext } from "../../context/DarkModeContext"; // Context untuk mengatur tema gelap/terang
import { SidebarContext } from "../../context/SidebarContext"; // Context untuk status tampilan sidebar

// Import komponen-komponen Material UI yang digunakan untuk tampilan antarmuka
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
import { styled } from "@mui/material/styles"; // Untuk membuat komponen dengan styling kustom

// Mendefinisikan warna tema yang digunakan untuk tampilan (sesuai kebutuhan)
const blueColor = "#2196F3";
const greenColor = "#4CAF50";
const redColor = "#F44336";

// Komponen kustom StatsCard: membungkus data statistik dengan padding, border-radius, dan shadow
// Fungsi styled di sini meng-custom komponen Paper dari Material UI berdasarkan props dan theme
const StatsCard = styled(Paper)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor, // Warna background yang dinamis berdasarkan props
  padding: theme.spacing(1), // Padding sesuai spacing pada theme
  borderRadius: theme.shape.borderRadius, // Menggunakan border-radius bawaan dari theme
  textAlign: "center", // Mengatur teks agar rata tengah
  color: "#fff", // Warna teks putih
  boxShadow: theme.shadows[2], // Efek bayangan dari theme
}));

// Membuat koneksi socket ke server menggunakan Socket.IO
// URL "http://localhost:3500" merupakan alamat server yang menyediakan real-time updates
const socket = io("http://localhost:3500");

// Komponen utama DashboardPIC yang menampilkan data formulir PIC dan statistik terkait
const DashboardPIC = () => {
  // Mengambil nilai darkMode dari DarkModeContext untuk menentukan tampilan tema
  const { darkMode } = useContext(DarkModeContext);
  // Mengambil status sidebar dari SidebarContext untuk mengatur margin container
  const { isSidebarOpen } = useContext(SidebarContext);
  // State untuk menyimpan kata kunci pencarian pada input pencarian
  const [searchTerm, setSearchTerm] = useState("");
  // State untuk menyimpan filter berdasarkan status, dengan nilai default "All" (semua status)
  const [filterStatus, setFilterStatus] = useState("All");
  // Mengambil fungsi dan data dari PICContext:
  // - getAllFormulirPIC: fungsi untuk mengambil semua data formulir PIC dari API
  // - formulirPIC: array data formulir yang sudah diambil
  // - pToken: token autentikasi untuk keperluan request API
  const { getAllFormulirPIC, formulirPIC, pToken } = useContext(PICContext);
  // State untuk menampilkan notifikasi saat ada form baru yang masuk
  const [notification, setNotification] = useState(null);
  // Hook untuk navigasi antar halaman (misalnya pindah ke halaman login)
  const navigate = useNavigate();

  // Variabel untuk mengatur warna background dan teks container berdasarkan mode (gelap/terang)
  const containerBg = darkMode ? "#121212" : "#ffffff";
  const containerText = darkMode ? "#e0e0e0" : "#000000";
  // Warna header tabel dan baris tabel yang disesuaikan dengan tema
  const tableHeadBg = darkMode ? "#333333" : blueColor;
  const tableRowEvenBg = darkMode ? "#1e1e1e" : "grey.100";
  const cellTextColor = darkMode ? "#fff" : containerText;

  // useEffect dijalankan saat komponen mount, digunakan untuk:
  // 1. Mengambil data formulir PIC dengan memanggil fungsi getAllFormulirPIC.
  // 2. Menyiapkan listener untuk event "formUpdated" dari server via socket, yang akan meng-update data dan menampilkan notifikasi.
  useEffect(() => {
    // Mengambil data formulir PIC
    getAllFormulirPIC();

    // Menambahkan listener pada event "formUpdated" untuk menangani update data secara real-time
    socket.on("formUpdated", () => {
      // Mengatur notifikasi bahwa ada form baru yang masuk
      setNotification("Form baru telah masuk!");
      // Mengambil kembali data formulir PIC yang terbaru
      getAllFormulirPIC();
      // Menghapus notifikasi setelah 5 detik
      setTimeout(() => setNotification(null), 5000);
    });

    // Membersihkan listener saat komponen unmount untuk menghindari memory leak
    return () => {
      socket.off("formUpdated");
    };
  }, [getAllFormulirPIC]);

  // Fungsi downloadFile digunakan untuk mengunduh dokumen dari server
  // Parameter "filename" adalah nama file dokumen yang akan diunduh
  const downloadFile = async (filename) => {
    // Jika filename mengandung string "uploads/", maka hapus bagian tersebut untuk mendapatkan nama file yang bersih
    const name = filename.includes("uploads/") ? filename.replace("uploads/", "") : filename;
    try {
      // Melakukan request fetch ke endpoint download dengan menyertakan token autentikasi
      const response = await fetch(`http://localhost:3500/admin/download/${name}`, {
        headers: { Authorization: `Bearer ${pToken}` },
      });
      // Jika response tidak OK, periksa status error dan lakukan penanganan khusus
      if (!response.ok) {
        // Jika error terkait otorisasi (401/403), tampilkan pesan error dan arahkan pengguna ke halaman login
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi Anda habis, silahkan login kembali.");
          navigate("/login");
        }
        // Lempar error jika response gagal
        throw new Error("Error saat mengambil dokumen");
      }
      // Mengubah response menjadi blob (data file)
      const blob = await response.blob();
      // Membuat URL objek dari blob untuk membuka file di tab baru
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      // Menghapus URL objek setelah periode tertentu untuk mencegah memory leak
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0.2 * 60 * 1000);
    } catch (error) {
      // Menampilkan error di console dan notifikasi kepada pengguna jika gagal membuka dokumen
      console.error("Error membuka dokumen:", error);
      toast.error("Gagal membuka dokumen");
    }
  };

  /* 
    Implementasi fungsi pencarian (multisearch):
    - Kata kunci pencarian diubah ke lowercase dan dipecah menjadi array kata.
    - Kata kosong dihilangkan menggunakan filter.
  */
  const keywords = searchTerm
    .toLowerCase()
    .split(" ")
    .filter((kw) => kw.trim() !== "");

  /* 
    Filter data formulirPIC berdasarkan:
    1. Pencocokan kata kunci dengan beberapa field (ticket, nama, email, unit, layanan, status, jenis_layanan, sub_jenis_layanan, tindak_lanjut, dan eskalasi).
    2. Filter status, jika filterStatus tidak "All" maka hanya tampilkan item dengan status yang sama.
  */
  const filteredData = formulirPIC.filter((item) => {
    // Mengecek apakah setidaknya salah satu kata kunci cocok dengan salah satu field data
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
    // Mengecek kecocokan status jika filterStatus bukan "All"
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    return matchesKeywords && matchesStatus;
  });

  /* 
    Mengurutkan data yang sudah difilter berdasarkan status.
    - Menggunakan objek statusOrder untuk menentukan prioritas: "Proses" memiliki urutan 1 dan "Selesai" urutan 2.
    - Jika status tidak ada dalam statusOrder, diberikan nilai default 99 agar ditempatkan di urutan terakhir.
  */
  const statusOrder = { Proses: 1, Selesai: 2 };
  const sortedData = filteredData.slice().sort((a, b) => {
    const orderA = statusOrder[a.status] || 99;
    const orderB = statusOrder[b.status] || 99;
    return orderA - orderB;
  });

  /* 
    Menghitung statistik ringkasan dari data formulirPIC:
    - totalForms: jumlah keseluruhan formulir.
    - completedForms: jumlah formulir dengan status "Selesai".
    - processedForms: jumlah formulir dengan status "Proses".
    - escalations: jumlah formulir dengan eskalasi (true).
  */
  const totalForms = formulirPIC.length;
  const completedForms = formulirPIC.filter((item) => item.status === "Selesai").length;
  const processedForms = formulirPIC.filter((item) => item.status === "Proses").length;
  const escalations = formulirPIC.filter((item) => item.eskalasi).length;

  // Array statistik yang akan ditampilkan pada dashboard, setiap objek memuat label, nilai, dan warna
  const stats = [
    { label: "Total Formulir", value: totalForms, color: blueColor },
    { label: "Formulir Selesai", value: completedForms, color: greenColor },
    { label: "Formulir Diproses", value: processedForms, color: greenColor },
    { label: "Eskalasi", value: escalations, color: redColor },
  ];

  return (
    // Container utama yang membungkus keseluruhan dashboard
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        mt: 4,
        mb: 4,
        ml: isSidebarOpen ? "-10px" : "-150px", // Mengatur margin kiri berdasarkan status sidebar
        mr: 2,
        p: 3,
        backgroundColor: containerBg, // Background disesuaikan dengan tema
        color: containerText, // Warna teks disesuaikan dengan tema
        minHeight: "100vh", // Tinggi minimum agar mengisi seluruh viewport
        borderRadius: 2,
        transition: "margin-left 0.3s ease, background-color 0.5s ease, color 0.5s ease", // Efek transisi untuk perubahan tampilan
      }}
    >
      {/* Menampilkan notifikasi ketika ada form baru masuk */}
      {notification && (
        <Paper
          sx={{
            bgcolor: "success.main",
            color: "#fff",
            p: 2,
            mb: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" fontWeight="bold">
            {notification}
          </Typography>
        </Paper>
      )}

      {/* Header dashboard: tombol refresh dan judul */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        {/* Tombol untuk refresh data dengan memanggil fungsi getAllFormulirPIC */}
        <Button variant="contained" color="primary" onClick={getAllFormulirPIC}>
          Refresh Data
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: containerText }}>
          Dashboard PIC
        </Typography>
      </Box>

      {/* Bagian statistik ringkasan, ditampilkan dalam layout box dan grid */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        {stats.map((stat, index) => (
          <Box key={index} sx={{ flex: "0 0 24%", mx: 0.5 }}>
            {/* Menggunakan komponen StatsCard dengan warna latar dinamis */}
            <StatsCard bgcolor={stat.color}>
              <Typography variant="subtitle2">{stat.label}</Typography>
              <Typography variant="h6" fontWeight="bold">
                {stat.value}
              </Typography>
            </StatsCard>
          </Box>
        ))}
      </Box>

      {/* Bagian pencarian dan filter status, ditampilkan menggunakan Grid untuk responsivitas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          {/* Input teks untuk pencarian, dengan placeholder dan styling sesuai tema */}
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
        <Grid item xs={12} md={4}>
          {/* Select dropdown untuk filter berdasarkan status */}
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
              <MenuItem value="All">Semua Status</MenuItem>
              <MenuItem value="Proses">Dalam Proses</MenuItem>
              <MenuItem value="Selesai">Selesai</MenuItem>
            </MuiSelect>
          </FormControl>
        </Grid>
      </Grid>

      {/* Tabel untuk menampilkan data formulirPIC */}
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table sx={{ minWidth: 1000 }}>
          {/* Header tabel dengan kolom-kolom data */}
          <TableHead>
            <TableRow sx={{ bgcolor: tableHeadBg }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>No</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Ticket</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Nama</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Email</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Unit</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Layanan</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Status</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Jenis Layanan</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Sub Jenis Layanan</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>PIC</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Tindak Lanjut</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Eskalasi</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", p: 1 }}>Dokumen</TableCell>
            </TableRow>
          </TableHead>
          {/* Body tabel yang menampilkan data dinamis */}
          <TableBody>
            {sortedData.length > 0 ? (
              // Melakukan mapping pada data yang sudah diurutkan dan difilter
              sortedData.map((item, index) => {
                // Menentukan warna background baris berdasarkan tema dan indeks (untuk efek zebra)
                const rowBg = darkMode
                  ? index % 2 === 0
                    ? containerBg
                    : tableRowEvenBg
                  : index % 2 === 0
                  ? containerBg
                  : tableRowEvenBg;
                return (
                  <TableRow
                    key={item.id}
                    sx={{
                      bgcolor: rowBg,
                      "&:hover": {
                        bgcolor: rowBg + " !important", // Memastikan warna baris tetap sama saat hover
                        cursor: "default",
                      },
                    }}
                  >
                    {/* Menampilkan nomor urut */}
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{index + 1}</TableCell>
                    {/* Menampilkan data ticket atau tanda "-" jika tidak ada */}
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.ticket || "-"}</TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.nama}</TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.email}</TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.unit}</TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.layanan}</TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.status}</TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.jenis_layanan || "-"}</TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.sub_jenis_layanan || "-"}</TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>
                      {item.pic_nama || "Belum Ditugaskan"}
                    </TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.tindak_lanjut || "-"}</TableCell>
                    <TableCell sx={{ p: 1, color: cellTextColor }}>{item.eskalasi ? "Ya" : "Tidak"}</TableCell>
                    {/* Kolom dokumen: jika ada dokumen, tampilkan tombol download */}
                    <TableCell sx={{ p: 1, color: cellTextColor }}>
                      {item.dokumen ? (
                        <Button
                          onClick={() => downloadFile(item.dokumen)}
                          variant="contained"
                          color="primary"
                          size="small"
                        >
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
              // Jika tidak ada data yang ditemukan, tampilkan pesan "Tidak ada data."
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ p: 1, color: cellTextColor }}>
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

export default DashboardPIC;

/*
Penjelasan Fungsi dan Keterkaitan Antar Kode:

1. DashboardPIC Component:
   Komponen utama yang menggabungkan tampilan statistik, tabel data formulir PIC, serta fitur pencarian dan filter.
   - Menggunakan useContext untuk mengambil data dari berbagai Context (DarkMode, Sidebar, dan PIC).
   - Mengatur state lokal seperti searchTerm, filterStatus, dan notification.
   - Menggunakan useEffect untuk memanggil fungsi getAllFormulirPIC dan mendengarkan event socket "formUpdated" agar data selalu up-to-date.
   - Memanfaatkan Material UI untuk membangun tampilan yang responsif dan konsisten dengan tema.

2. useEffect:
   Fungsi ini dijalankan saat komponen pertama kali di-mount dan setiap kali fungsi getAllFormulirPIC berubah.
   - Tujuannya adalah untuk mengambil data awal dari server dan menyiapkan listener pada socket sehingga saat ada pembaruan data, komponen akan menampilkan notifikasi dan mengambil data terbaru.
   - Keterkaitan: useEffect menghubungkan logika real-time (socket) dengan pengambilan data dari PICContext.

3. downloadFile Function:
   Fungsi asinkron untuk mengunduh file dokumen yang terkait dengan masing-masing formulir.
   - Melakukan fetch ke endpoint download, memeriksa error otorisasi, mengubah response ke blob, dan membuka dokumen di tab baru.
   - Keterkaitan: Fungsi ini dipanggil ketika pengguna mengklik tombol "Download" pada baris tabel dokumen.

4. Filtering dan Sorting Data:
   - Proses pencarian (multisearch) memecah input pencarian menjadi kata kunci yang kemudian dicocokkan dengan berbagai field pada setiap item data.
   - Filter status memastikan hanya data dengan status tertentu yang ditampilkan jika filter diatur bukan "All".
   - Data yang telah difilter kemudian diurutkan berdasarkan status menggunakan urutan yang ditentukan (Proses sebelum Selesai).
   - Keterkaitan: Logika filtering dan sorting memastikan bahwa data yang ditampilkan di tabel sesuai dengan kriteria pencarian dan urutan yang diinginkan oleh pengguna.

5. Rendering Tabel dan Statistik:
   - Statistik ringkasan dihitung berdasarkan data formulir (total, selesai, dalam proses, dan eskalasi) dan ditampilkan menggunakan komponen StatsCard.
   - Tabel data menampilkan setiap record dengan kolom-kolom yang relevan, serta tombol untuk mengunduh dokumen jika tersedia.
   - Keterkaitan: Statistik memberikan gambaran keseluruhan sedangkan tabel menampilkan detail data, sehingga kedua bagian saling melengkapi untuk memberikan informasi yang komprehensif.

Setiap bagian kode saling terkait dalam membangun dashboard yang interaktif dan responsif, menggabungkan data real-time, pencarian, filtering, dan tampilan yang konsisten dengan tema aplikasi. */
