// Mengimpor library dan modul yang dibutuhkan
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Mengimpor fungsi dan data dari AdminContext untuk mendapatkan data jenis layanan, sub jenis layanan, dan fungsi hapus
import { AdminContext } from "../../context/AdminContext";

// Mengimpor context Sidebar dan DarkMode untuk mengatur tata letak dan tema (light/dark mode)
import { SidebarContext } from "../../context/SidebarContext";
import { DarkModeContext } from "../../context/DarkModeContext";

// Mengimpor komponen Material UI yang akan digunakan untuk membuat tampilan antarmuka
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

// Mengimpor fungsi styled dari Material UI untuk membuat komponen kustom
import { styled } from "@mui/material/styles";

// Mendefinisikan warna tema untuk light mode
const headerGreen = "#4CAF50"; // Digunakan untuk tabel jenis layanan (sub jenis layanan)
const headerBlue = "#2196F3";  // Digunakan untuk tabel sub jenis layanan (jenis layanan)
const softRed = "#F44336";     // Warna tombol hapus pada light mode

// Mendefinisikan warna header untuk dark mode
const headerGreenDark = "#388E3C";
const headerBlueDark = "#1976D2";

// Komponen kustom untuk tombol tab yang mendukung dark mode
const TabButton = styled(Button)(({ theme, active, darkmode, bgcolor }) => ({
  backgroundColor: active
    ? bgcolor
    : darkmode
    ? "#424242"
    : "#E0E0E0",
  color: active ? "#fff" : darkmode ? "#fff" : "#424242",
  marginRight: theme.spacing(1),
  "&:hover": {
    backgroundColor: active
      ? bgcolor
      : darkmode
      ? "#616161"
      : "#BDBDBD",
  },
}));

// Komponen kustom untuk membungkus konten utama dengan padding dan margin yang sesuai
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

// Komponen utama JenisLayanan
const JenisLayanan = () => {
  // Mengambil fungsi dan data dari AdminContext:
  // - getJenisLayanan: untuk mengambil data jenis layanan
  // - jenisLayanan: array data jenis layanan
  // - deleteJenisLayanan: fungsi untuk menghapus jenis layanan
  // - aToken: token otorisasi
  // - getSubJenisLayanan, subJenisLayanan, deleteSubJenisLayanan: untuk data dan aksi pada sub jenis layanan
  const {
    getJenisLayanan,
    jenisLayanan,
    deleteJenisLayanan,
    aToken,
    getSubJenisLayanan,
    subJenisLayanan,
    deleteSubJenisLayanan,
  } = useContext(AdminContext);

  // Mengambil status sidebar (untuk penyesuaian margin) dan dark mode untuk tema tampilan
  const { isSidebarOpen } = useContext(SidebarContext);
  const { darkMode } = useContext(DarkModeContext);

  // Menentukan warna latar dan teks berdasarkan dark mode/light mode
  const containerBg = darkMode ? "#1E1E1E" : "#ffffff";
  const containerText = darkMode ? "#fff" : "#000000";
  // Warna untuk tab dan header tabel
  // Komentar di bawah menjelaskan bahwa pada light mode, tab "Jenis Layanan" memakai headerBlue dan "Sub Jenis Layanan" memakai headerGreen,
  // sedangkan pada dark mode nilainya dibalik.
  const paperBg = darkMode ? "#272727" : "#ffffff";
  const tableRowOddBg = darkMode ? "#232323" : "#f5f5f5";

  // State untuk input form dan modal:
  // tipelayanan untuk menyimpan input ketika menambahkan jenis layanan,
  // subtipelayanan untuk input ketika menambahkan sub jenis layanan.
  const [tipelayanan, setTipePelayanan] = useState("");
  const [subtipelayanan, setSubTipeLayanan] = useState("");
  // State activeTab untuk menentukan tab mana yang aktif ("jenis" atau "sub").
  const [activeTab, setActiveTab] = useState("jenis");
  // State untuk mengatur tampilan modal dialog
  const [openJenisModal, setOpenJenisModal] = useState(false);
  const [openSubModal, setOpenSubModal] = useState(false);

  // useEffect untuk mengambil data jenis layanan dan sub jenis layanan saat komponen pertama kali dimount.
  useEffect(() => {
    getJenisLayanan();
    getSubJenisLayanan();
  }, []);

  // Fungsi untuk menambahkan jenis layanan (berkaitan dengan modal "Tambah Sub Jenis Layanan")
  const handleAddJenis = async (e) => {
    e.preventDefault();
    try {
      // Melakukan POST request untuk menambahkan jenis layanan dengan data tipelayanan
      await axios.post(
        "http://localhost:3500/admin/jenislayanan",
        { tipelayanan },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      toast.success("Jenis layanan berhasil ditambahkan!");
      // Reset input dan tutup modal
      setTipePelayanan("");
      setOpenJenisModal(false);
      // Refresh data jenis dan sub jenis layanan
      getJenisLayanan();
      getSubJenisLayanan();
    } catch (error) {
      toast.error("Gagal menambahkan jenis layanan!");
      console.error("Error:", error.response?.data);
    }
  };

  // Fungsi untuk menambahkan sub jenis layanan (berkaitan dengan modal "Tambah Jenis Layanan")
  const handleAddSub = async (e) => {
    e.preventDefault();
    try {
      // POST request untuk menambahkan sub jenis layanan dengan data subtipelayanan
      await axios.post(
        "http://localhost:3500/admin/subjenislayanan",
        { subtipelayanan },
        { headers: { Authorization: `Bearer ${aToken}` } }
      );
      toast.success("Sub jenis layanan berhasil ditambahkan!");
      // Reset input dan tutup modal
      setSubTipeLayanan("");
      setOpenSubModal(false);
      // Refresh data sub jenis layanan
      getSubJenisLayanan();
    } catch (error) {
      toast.error("Gagal menambahkan sub jenis layanan!");
      console.error("Error:", error.response?.data);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
        ml: isSidebarOpen ? "-70px" : "-170px",
        transition: "margin-left 0.3s ease",
        backgroundColor: containerBg,
        color: containerText,
      }}
    >
      {/* Tampilan tombol tab untuk memilih antara "Sub Jenis Layanan" dan "Jenis Layanan".
          Catatan: Label tombol dan urutan warnanya sudah disesuaikan agar sesuai dengan tema.
          - Jika activeTab === "jenis": maka yang ditampilkan adalah daftar Sub Jenis Layanan.
          - Jika activeTab === "sub": maka yang ditampilkan adalah daftar Jenis Layanan. */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <TabButton
          darkmode={darkMode}
          active={activeTab === "jenis"}
          bgcolor={darkMode ? headerGreenDark : headerGreen}
          onClick={() => setActiveTab("jenis")}
        >
          Sub Jenis Layanan
        </TabButton>
        <TabButton
          darkmode={darkMode}
          active={activeTab === "sub"}
          bgcolor={darkMode ? headerBlueDark : headerBlue}
          onClick={() => setActiveTab("sub")}
        >
          Jenis Layanan
        </TabButton>
      </Box>

      {/* Kontainer utama untuk menampilkan daftar data sesuai dengan tab aktif */}
      <StyledPaper sx={{ backgroundColor: paperBg, color: containerText }}>
        {activeTab === "jenis" && (
          <>
            {/* Header untuk daftar Sub Jenis Layanan */}
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Daftar Sub Jenis Layanan
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={() => setOpenJenisModal(true)}
              >
                Tambah Sub Jenis Layanan
              </Button>
            </Box>
            {/* Tabel untuk menampilkan data jenis layanan (dipakai untuk Sub Jenis Layanan) */}
            <TableContainer component={Paper} sx={{ boxShadow: 2, backgroundColor: paperBg }}>
              <Table>
                <TableHead sx={{ bgcolor: darkMode ? headerGreenDark : headerGreen }}>
                  <TableRow>
                    <TableCell sx={{ color: containerText, fontWeight: "bold" }}>No</TableCell>
                    <TableCell sx={{ color: containerText, fontWeight: "bold" }}>Jenis Layanan</TableCell>
                    <TableCell sx={{ color: containerText, fontWeight: "bold" }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jenisLayanan.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    jenisLayanan.map((layanan, index) => (
                      <TableRow key={layanan.id} hover>
                        <TableCell sx={{ color: containerText }}>{index + 1}</TableCell>
                        <TableCell sx={{ color: containerText }}>{layanan.tipelayanan}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: darkMode ? "#c62828" : softRed,
                              "&:hover": {
                                backgroundColor: darkMode ? "#d32f2f" : "#e57373",
                              },
                            }}
                            onClick={() => deleteJenisLayanan(layanan.id)}
                          >
                            Hapus
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {activeTab === "sub" && (
          <>
            {/* Header untuk daftar Jenis Layanan */}
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Daftar Jenis Layanan
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenSubModal(true)}
              >
                Tambah Jenis Layanan
              </Button>
            </Box>
            {/* Tabel untuk menampilkan data sub jenis layanan */}
            <TableContainer component={Paper} sx={{ boxShadow: 2, backgroundColor: paperBg }}>
              <Table>
                <TableHead sx={{ bgcolor: darkMode ? headerBlueDark : headerBlue }}>
                  <TableRow>
                    <TableCell sx={{ color: containerText, fontWeight: "bold" }}>No</TableCell>
                    <TableCell sx={{ color: containerText, fontWeight: "bold" }}>Sub Jenis Layanan</TableCell>
                    <TableCell sx={{ color: containerText, fontWeight: "bold" }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subJenisLayanan && subJenisLayanan.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    subJenisLayanan.map((sub, index) => (
                      <TableRow key={sub.id} hover>
                        <TableCell sx={{ color: containerText }}>{index + 1}</TableCell>
                        <TableCell sx={{ color: containerText }}>{sub.subtipelayanan}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: darkMode ? "#c62828" : softRed,
                              "&:hover": {
                                backgroundColor: darkMode ? "#d32f2f" : "#e57373",
                              },
                            }}
                            onClick={() => deleteSubJenisLayanan(sub.id)}
                          >
                            Hapus
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </StyledPaper>

      {/* Dialog Modal untuk menambahkan Sub Jenis Layanan (berkaitan dengan activeTab "jenis") */}
      <Dialog
        open={openJenisModal}
        onClose={() => setOpenJenisModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { backgroundColor: paperBg, color: containerText } }}
      >
        <DialogTitle>Tambah Sub Jenis Layanan</DialogTitle>
        <form onSubmit={handleAddJenis}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Sub Jenis Layanan"
              type="text"
              fullWidth
              variant="outlined"
              value={tipelayanan}
              onChange={(e) => setTipePelayanan(e.target.value)}
              InputLabelProps={{ style: { color: containerText } }}
              inputProps={{ style: { color: containerText } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenJenisModal(false)} color="inherit">
              Batal
            </Button>
            <Button type="submit" variant="contained" color="success">
              Simpan
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Modal untuk menambahkan Jenis Layanan (berkaitan dengan activeTab "sub") */}
      <Dialog
        open={openSubModal}
        onClose={() => setOpenSubModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { backgroundColor: paperBg, color: containerText } }}
      >
        <DialogTitle>Tambah Jenis Layanan</DialogTitle>
        <form onSubmit={handleAddSub}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Jenis Layanan"
              type="text"
              fullWidth
              variant="outlined"
              value={subtipelayanan}
              onChange={(e) => setSubTipeLayanan(e.target.value)}
              InputLabelProps={{ style: { color: containerText } }}
              inputProps={{ style: { color: containerText } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSubModal(false)} color="inherit">
              Batal
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Simpan
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default JenisLayanan;
