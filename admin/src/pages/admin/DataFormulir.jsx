// Import React dan hooks yang diperlukan dari library React
import { useEffect, useState, useContext } from "react"; // Mengimpor React serta hooks useEffect, useState, dan useContext

// Mengimpor context AdminContext dari direktori context untuk mendapatkan data dan fungsi terkait formulir
import { AdminContext } from "../../context/AdminContext"; // Context untuk data dan fungsi admin

// Mengimpor context SidebarContext untuk mengetahui status sidebar (terbuka atau tidak)
import { SidebarContext } from "../../context/SidebarContext"; // Context untuk status sidebar

// Mengimpor context DarkModeContext untuk mengetahui apakah mode gelap aktif atau tidak
import { DarkModeContext } from "../../context/DarkModeContext"; // Context untuk mode gelap

// Mengimpor komponen Dialog, DialogTitle, DialogContent, DialogActions, dan TextField dari Material UI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material"; // Komponen dialog dan input teks dari Material UI

// Mengimpor komponen Bar dan Pie dari react-chartjs-2 untuk menampilkan chart berbentuk bar dan pie
import { Bar, Pie } from "react-chartjs-2"; // Komponen chart dari react-chartjs-2

// Mengimpor axios untuk melakukan HTTP request
import axios from "axios"; // Library untuk HTTP request

// Mengimpor modul Chart.js dan komponen-komponen pendukungnya seperti skala, elemen bar, tooltip, dll.
import {
  Chart as ChartJS, // Mengimpor ChartJS untuk inisialisasi chart
  CategoryScale, // Skala kategori (untuk sumbu X)
  LinearScale, // Skala linear (untuk sumbu Y)
  BarElement, // Elemen grafik bar
  Title, // Komponen judul chart
  Tooltip, // Komponen tooltip pada chart
  Legend, // Komponen legend chart
  ArcElement, // Elemen busur, diperlukan untuk pie chart
} from "chart.js"; // Komponen-komponen Chart.js

// Mengimpor plugin chartjs-plugin-datalabels untuk menampilkan label data pada chart
import ChartDataLabels from "chartjs-plugin-datalabels"; // Plugin untuk menampilkan data label pada chart

// Mengimpor styled dan Button dari Material UI untuk membuat komponen kustom dan tombol dengan styling khusus
import { styled, Button } from "@mui/material"; // Digunakan untuk custom styling tombol

// Registrasi modul Chart.js dan plugin datalabels yang digunakan untuk merender chart
ChartJS.register(
  CategoryScale, // Mendaftarkan skala kategori
  LinearScale, // Mendaftarkan skala linear
  BarElement, // Mendaftarkan elemen bar
  Title, // Mendaftarkan komponen judul
  Tooltip, // Mendaftarkan tooltip
  Legend, // Mendaftarkan legend
  ArcElement, // Mendaftarkan elemen busur (untuk pie chart)
  ChartDataLabels // Mendaftarkan plugin data labels
);

// Mendefinisikan array palet warna yang digunakan pada chart
const palette = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#4CAF50",
  "#2196F3",
  "#FF3737",
]; // Daftar warna untuk chart

// Membuat custom button menggunakan styled dari Material UI dengan tambahan style cursor pointer
const CustomButton = styled(Button)(({ theme }) => ({
  cursor: "pointer", // Menetapkan pointer saat hover di tombol
}));

// Deklarasi komponen fungsional DataFormulir
const DataFormulir = () => {
  // Mengambil fungsi dan data dari AdminContext
  const { getAllFormulir, formulir, aToken } = useContext(AdminContext); // Mendapatkan fungsi getAllFormulir, data formulir, dan token otorisasi

  // Mengambil status sidebar (apakah terbuka atau tidak) dari SidebarContext
  const { isSidebarOpen } = useContext(SidebarContext); // Status sidebar

  // Mengambil status dark mode dari DarkModeContext
  const { darkMode } = useContext(DarkModeContext); // Status dark mode

  // Menentukan warna background container dan teks berdasarkan status dark mode
  const containerBg = darkMode ? "#1E1E1E" : "#ffffff"; // Background container: gelap atau terang
  const containerText = darkMode ? "#fff" : "#000000"; // Warna teks container: putih atau hitam
  // Menentukan warna latar (paper) agar terlihat jelas pada kedua mode
  const paperBg = darkMode ? "#272727" : "#ffffff"; // Warna background untuk paper

  // Menginisialisasi state untuk data formulir yang sudah difilter
  const [filteredFormulir, setFilteredFormulir] = useState([]); // State untuk menyimpan data formulir hasil filter

  // Menginisialisasi state untuk menyimpan statistik yang dihitung dari data formulir
  const [statistics, setStatistics] = useState(null); // State untuk menyimpan statistik formulir

  // Menginisialisasi state untuk menyimpan nilai pencarian jenis layanan
  const [searchTerm, setSearchTerm] = useState(""); // State untuk kata pencarian

  // Menginisialisasi state untuk menyimpan layanan yang dipilih untuk ditampilkan detailnya
  const [selectedService, setSelectedService] = useState(null); // State untuk layanan yang dipilih

  // Menginisialisasi state untuk mengatur buka/tutup modal detail layanan
  const [modalOpen, setModalOpen] = useState(false); // State untuk mengatur modal detail terbuka atau tidak

  // State untuk mengatur tampil/tutup modal statistik status, jenis layanan, dan sub jenis layanan
  const [showStatusModal, setShowStatusModal] = useState(false); // Modal statistik status
  const [showJenisModal, setShowJenisModal] = useState(false); // Modal statistik jenis layanan
  const [showSubJenisModal, setShowSubJenisModal] = useState(false); // Modal statistik sub jenis layanan

  // State untuk menyimpan nilai tanggal mulai dan tanggal selesai sebagai filter
  const [startDate, setStartDate] = useState(""); // State untuk tanggal mulai filter
  const [endDate, setEndDate] = useState(""); // State untuk tanggal selesai filter

  // useEffect untuk memanggil fungsi getAllFormulir ketika token tersedia
  useEffect(() => {
    if (aToken) {
      // Jika token tersedia
      getAllFormulir(); // Panggil fungsi untuk mengambil semua data formulir
    }
  }, [aToken]); // Dependency: aToken dan getAllFormulir

  // useEffect untuk memfilter data formulir berdasarkan tanggal jika token dan filter tanggal tersedia
  useEffect(() => {
    if (aToken) {
      // Jika token tersedia
      if (startDate && endDate) {
        // Jika kedua tanggal filter diisi
        axios
          .post(
            "http://localhost:3500/admin/form/sort", // Endpoint API untuk menyortir data formulir berdasarkan tanggal
            { startDate, endDate }, // Mengirim data tanggal mulai dan selesai
            { headers: { Authorization: `Bearer ${aToken}` } } // Menyertakan header otorisasi dengan token
          )
          .then(res => {
            // Jika request berhasil
            setFilteredFormulir(res.data.data); // Set state filteredFormulir dengan data yang diterima
          })
          .catch(err => {
            // Jika terjadi error
            console.error(err); // Menampilkan error pada console
          });
      } else {
        setFilteredFormulir(formulir); // Jika tidak ada filter tanggal, gunakan data formulir dari context
      }
    }
  }, [aToken, startDate, endDate, formulir]); // Dependency: aToken, startDate, endDate, dan formulir

  // useEffect untuk menghitung statistik berdasarkan data formulir yang sudah difilter
  useEffect(() => {
    const data = filteredFormulir; // Menyimpan data formulir yang difilter ke variabel data
    if (data.length > 0) {
      // Jika ada data formulir
      const total = data.length; // Menghitung total formulir
      // Menghitung jumlah formulir berdasarkan status (Baru, Proses, Selesai)
      const statusCounts = {
        Baru: data.filter(item => item.status === "Baru").length, // Jumlah formulir dengan status "Baru"
        Proses: data.filter(item => item.status === "Proses").length, // Jumlah formulir dengan status "Proses"
        Selesai: data.filter(item => item.status === "Selesai").length, // Jumlah formulir dengan status "Selesai"
      };

      // Menghitung jumlah formulir yang mengalami eskalasi
      const escalations = data.filter(item => item.eskalasi).length; // Jumlah formulir dengan eskalasi

      // Menghitung persentase tiap status formulir
      const statusPercentages = {
        Baru:
          total > 0 ? ((statusCounts.Baru / total) * 100).toFixed(2) : "0.00", // Persentase formulir "Baru"
        Proses:
          total > 0 ? ((statusCounts.Proses / total) * 100).toFixed(2) : "0.00", // Persentase formulir "Proses"
        Selesai:
          total > 0
            ? ((statusCounts.Selesai / total) * 100).toFixed(2)
            : "0.00", // Persentase formulir "Selesai"
        Eskalasi: total > 0 ? ((escalations / total) * 100).toFixed(2) : "0.00", // Persentase formulir dengan eskalasi
      };

      // Mendefinisikan jenis layanan yang valid
      const layananTypes = [
        "SIKD",
        "SIMPeL 4",
        "Humanusia",
        "WBS-2",
        "AoRA",
        "SIPANDA",
        "JDIH",
        "Data",
      ]; // Array jenis layanan yang diharapkan

      // Menghitung jumlah formulir per jenis layanan
      const layananCounts = {}; // Objek untuk menyimpan jumlah tiap jenis layanan
      layananTypes.forEach(type => {
        layananCounts[type] = data.filter(
          item => item.sub_jenis_layanan === type
        ).length; // Menghitung jumlah formulir dengan sub_jenis_layanan yang sesuai
      });
      // Menghitung jumlah formulir yang belum dikategorikan (tidak ada atau tidak sesuai dengan layananTypes)
      const uncategorized = data.filter(
        item =>
          !item.sub_jenis_layanan ||
          !layananTypes.includes(item.sub_jenis_layanan)
      ).length; // Jumlah formulir belum dikategorikan
      layananCounts["Belum Dikategorikan"] = uncategorized; // Menambahkan kategori "Belum Dikategorikan" ke layananCounts

      // Menghitung detail jumlah formulir berdasarkan jenis layanan dan sub jenis layanan
      const layananDetails = {}; // Objek untuk menyimpan detail tiap layanan
      layananTypes.forEach(type => {
        layananDetails[type] = {}; // Inisialisasi objek untuk tiap jenis layanan
        data.forEach(item => {
          // Iterasi tiap formulir
          if (item.sub_jenis_layanan === type) {
            // Jika sub jenis layanan sesuai dengan type yang sedang diproses
            const key = item.jenis_layanan || "Tidak Diketahui"; // Menentukan key berdasarkan jenis_layanan atau default "Tidak Diketahui"
            layananDetails[type][key] = (layananDetails[type][key] || 0) + 1; // Menghitung jumlah formulir untuk detail tersebut
          }
        });
      });
      layananDetails["Belum Dikategorikan"] = {}; // Inisialisasi detail untuk formulir yang belum dikategorikan

      // Menghitung persentase tiap jenis layanan
      const layananPercentages = {}; // Objek untuk menyimpan persentase tiap jenis layanan
      layananTypes.forEach(type => {
        layananPercentages[type] =
          total > 0 ? ((layananCounts[type] / total) * 100).toFixed(2) : "0.00"; // Menghitung persentase tiap jenis layanan
      });
      layananPercentages["Belum Dikategorikan"] =
        total > 0 ? ((uncategorized / total) * 100).toFixed(2) : "0.00"; // Persentase untuk kategori belum dikategorikan

      // Set state statistik dengan data yang telah dihitung
      setStatistics({
        total, // Total formulir
        statusCounts, // Jumlah tiap status
        escalations, // Jumlah eskalasi
        statusPercentages, // Persentase tiap status
        layananCounts, // Jumlah tiap jenis layanan
        layananPercentages, // Persentase tiap jenis layanan
        layananDetails, // Detail jumlah tiap sub jenis layanan
      });
    } else {
      setStatistics(null); // Jika tidak ada data, set statistik menjadi null
    }
  }, [filteredFormulir]); // Dependency: data formulir yang sudah difilter

  // Fungsi untuk membuka modal detail dan menyimpan jenis layanan yang dipilih
  const openModal = service => {
    setSelectedService(service); // Menyimpan layanan yang dipilih
    setModalOpen(true); // Membuka modal detail
  };

  // Fungsi untuk menutup modal detail dan mereset layanan yang dipilih
  const closeModal = () => {
    setModalOpen(false); // Menutup modal detail
    setSelectedService(null); // Mereset layanan yang dipilih
  };

  // Opsi konfigurasi untuk chart bar
  const barOptions = {
    responsive: true, // Chart akan responsif terhadap ukuran layar
    plugins: {
      legend: { position: "top" }, // Menampilkan legenda di atas chart
      datalabels: { color: darkMode ? "#fff" : "#000" }, // Warna label disesuaikan dengan dark mode
    },
  };

  // Opsi konfigurasi untuk chart pie
  const pieOptions = {
    responsive: true, // Chart responsif
    plugins: {
      legend: { position: "bottom" }, // Menampilkan legenda di bawah chart
      tooltip: {
        callbacks: {
          label: context => {
            // Fungsi untuk mengatur format label tooltip
            const label = context.label || ""; // Mendapatkan label data
            const dataArr = context.chart.data.datasets[0].data; // Mengambil array data dari chart
            const total = dataArr.reduce((a, b) => a + b, 0); // Menghitung total nilai
            const value = context.parsed; // Nilai yang ditampilkan
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0; // Menghitung persentase
            return `${label}: ${percentage}%`; // Mengembalikan string label dengan persentase
          },
        },
      },
      datalabels: {
        color: "#fff", // Warna label data pada chart
        formatter: (value, context) => {
          // Formatter untuk menampilkan label data
          const dataArr = context.chart.data.datasets[0].data; // Mengambil array data
          const total = dataArr.reduce((a, b) => a + b, 0); // Menghitung total nilai
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0; // Menghitung persentase nilai
          return percentage + "%"; // Mengembalikan nilai dengan format persentase
        },
      },
    },
  };

  // Menyiapkan data untuk chart bar status formulir
  const statusBarChartData = {
    labels: ["Baru", "Proses", "Selesai"], // Label sumbu X
    datasets: [
      {
        label: "Jumlah Formulir", // Label dataset
        data: statistics
          ? [
              statistics.statusCounts.Baru,
              statistics.statusCounts.Proses,
              statistics.statusCounts.Selesai,
            ]
          : [0, 0, 0], // Data jumlah formulir berdasarkan status
        backgroundColor: [palette[0], palette[1], palette[2]], // Warna tiap bar
      },
    ],
  };

  // Menyiapkan data untuk chart pie status formulir
  const statusPieChartData = {
    labels: ["Baru", "Proses", "Selesai"], // Label kategori pie
    datasets: [
      {
        label: "Jumlah Formulir", // Label dataset
        data: statistics
          ? [
              statistics.statusCounts.Baru,
              statistics.statusCounts.Proses,
              statistics.statusCounts.Selesai,
            ]
          : [0, 0, 0], // Data jumlah formulir berdasarkan status
        backgroundColor: [palette[0], palette[1], palette[2]], // Warna tiap potongan pie
      },
    ],
  };

  // Menyiapkan data untuk chart jenis layanan
  const jenisChartData = {
    labels: statistics ? Object.keys(statistics.layananCounts) : [], // Label berdasarkan jenis layanan
    datasets: [
      {
        label: "Jumlah Formulir per Jenis Layanan", // Label dataset
        data: statistics ? Object.values(statistics.layananCounts) : [], // Data jumlah formulir per jenis layanan
        backgroundColor: statistics
          ? Object.keys(statistics.layananCounts).map(
              (_, idx) => palette[idx % palette.length]
            )
          : [], // Menetapkan warna tiap bar berdasarkan palet
      },
    ],
  };

  // Mengagregasi jumlah sub jenis layanan dari detail layanan untuk chart sub jenis
  let aggregatedSubCounts = {}; // Objek untuk menyimpan jumlah agregat tiap sub jenis layanan
  if (statistics) {
    // Jika statistik tersedia
    Object.values(statistics.layananDetails).forEach(details => {
      Object.entries(details).forEach(([sub, count]) => {
        aggregatedSubCounts[sub] = (aggregatedSubCounts[sub] || 0) + count; // Menambahkan jumlah untuk setiap sub jenis layanan
      });
    });
  }
  // Menyiapkan data untuk chart sub jenis layanan
  const subJenisChartData = {
    labels: aggregatedSubCounts ? Object.keys(aggregatedSubCounts) : [], // Label berdasarkan sub jenis layanan
    datasets: [
      {
        label: "Jumlah Formulir per Sub Jenis Layanan", // Label dataset
        data: aggregatedSubCounts ? Object.values(aggregatedSubCounts) : [], // Data jumlah formulir per sub jenis layanan
        backgroundColor: aggregatedSubCounts
          ? Object.keys(aggregatedSubCounts).map(
              (_, idx) => palette[idx % palette.length]
            )
          : [], // Warna tiap bar di chart
      },
    ],
  };

  // Menyiapkan data untuk chart detail layanan (ditampilkan di modal detail)
  const detailChartData = {
    labels:
      selectedService &&
      statistics &&
      statistics.layananDetails[selectedService]
        ? Object.keys(statistics.layananDetails[selectedService])
        : [], // Label detail layanan berdasarkan layanan yang dipilih
    datasets: [
      {
        label: "Jumlah Formulir", // Label dataset
        data:
          selectedService &&
          statistics &&
          statistics.layananDetails[selectedService]
            ? Object.values(statistics.layananDetails[selectedService])
            : [], // Data jumlah formulir untuk detail layanan
        backgroundColor:
          selectedService &&
          statistics &&
          statistics.layananDetails[selectedService]
            ? Object.keys(statistics.layananDetails[selectedService]).map(
                (_, idx) => palette[idx % palette.length]
              )
            : [], // Warna tiap bar di chart detail
      },
    ],
  };

  // Mengfilter data layanan berdasarkan input pencarian (searchTerm)
  const filteredLayanan = statistics
    ? Object.entries(statistics.layananCounts).filter(([key]) =>
        key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []; // Hasil filter layanan berdasarkan pencarian

  // Render komponen utama DataFormulir
  return (
    <div
      style={{
        marginLeft: isSidebarOpen ? "-10px" : "-150px", // Menyesuaikan margin kiri berdasarkan status sidebar
        transition:
          "margin-left 0.3s ease, background-color 0.5s ease, color 0.5s ease", // Transisi animasi untuk margin, background, dan warna teks
        backgroundColor: containerBg, // Background container sesuai dark/light mode
        color: containerText, // Warna teks sesuai dark/light mode
        padding: "2rem", // Padding container
        minHeight: "100vh", // Tinggi minimal 100% viewport
      }}>
      <div
        style={{
          backgroundColor: paperBg, // Background paper
          borderRadius: "0.5rem", // Sudut membulat
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Efek bayangan
          padding: "1.5rem", // Padding internal
          width: "100%", // Lebar 100%
        }}>
        <h2
          style={{
            fontSize: "1.75rem", // Ukuran font judul
            fontWeight: "bold", // Berat font tebal
            textAlign: "center", // Teks di tengah
            marginBottom: "1.5rem", // Margin bawah judul
            color: containerText, // Warna teks judul
          }}>
          Data Statistik Formulir
        </h2>
        {/* Rentang Tanggal */}
        <div
          style={{
            marginBottom: "1.5rem", // Margin bawah untuk rentang tanggal
            display: "grid", // Menggunakan grid layout
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", // Grid dengan kolom minimal 200px
            gap: "1rem", // Jarak antar elemen grid
          }}>
          <TextField
            fullWidth // Lebar penuh
            label="Tanggal Mulai" // Label input
            type="date" // Tipe input date
            value={startDate} // Nilai input sesuai state startDate
            onChange={e => setStartDate(e.target.value)} // Update state saat nilai berubah
            InputLabelProps={{
              shrink: true, // Label mengecil ketika input terisi
              style: { color: containerText }, // Warna label sesuai tema
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: darkMode ? "#fff" : "#000" }, // Border input sesuai dark mode
                "&:hover fieldset": { borderColor: darkMode ? "#fff" : "#000" }, // Border saat hover
                "&.Mui-focused fieldset": {
                  borderColor: darkMode ? "#fff" : "#000",
                }, // Border saat fokus
              },
              input: { color: containerText }, // Warna teks input
            }}
          />
          <TextField
            fullWidth // Lebar penuh
            label="Tanggal Selesai" // Label input
            type="date" // Tipe input date
            value={endDate} // Nilai input sesuai state endDate
            onChange={e => setEndDate(e.target.value)} // Update state saat nilai berubah
            InputLabelProps={{
              shrink: true, // Label mengecil ketika input terisi
              style: { color: containerText }, // Warna label sesuai tema
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: darkMode ? "#fff" : "#000" }, // Border input sesuai dark mode
                "&:hover fieldset": { borderColor: darkMode ? "#fff" : "#000" }, // Border saat hover
                "&.Mui-focused fieldset": {
                  borderColor: darkMode ? "#fff" : "#000",
                }, // Border saat fokus
              },
              input: { color: containerText }, // Warna teks input
            }}
          />
        </div>
        {/* Tombol Reset Filter, hanya muncul jika salah satu tanggal diisi */}
        {(startDate || endDate) && (
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <CustomButton
              onClick={() => {
                setStartDate(""); // Mereset nilai tanggal mulai
                setEndDate(""); // Mereset nilai tanggal selesai
              }}
              variant="contained" // Tipe tombol contained
              color="secondary" // Warna tombol sekunder
            >
              Reset Filter
            </CustomButton>
          </div>
        )}
        {statistics ? ( // Jika statistik tersedia, tampilkan data dan chart
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "1.125rem", color: containerText }}>
                Total Formulir:{" "}
                <span style={{ fontWeight: "600" }}>{statistics.total}</span>
              </p>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.25rem", // Ukuran font judul bagian status
                  fontWeight: "600", // Berat font tebal
                  marginBottom: "0.5rem", // Margin bawah judul
                  color: containerText, // Warna teks
                }}>
                Status Formulir
              </h3>
              <div
                style={{
                  display: "grid", // Grid layout untuk status
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", // Kolom grid minimal 150px
                  gap: "1rem", // Jarak antar elemen grid
                }}>
                <div
                  style={{
                    backgroundColor: darkMode ? "#2E7D32" : "#A5D6A7", // Warna background status "Baru"
                    padding: "1rem", // Padding internal
                    borderRadius: "0.5rem", // Sudut membulat
                    textAlign: "center", // Teks di tengah
                  }}>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: containerText,
                    }}>
                    Baru
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: containerText,
                    }}>
                    {statistics.statusCounts.Baru}
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: darkMode ? "#ccc" : "#4a4a4a",
                    }}>
                    {statistics.statusPercentages.Baru}%
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: darkMode ? "#2E7D32" : "#A5D6A7", // Warna background status "Proses"
                    padding: "1rem", // Padding internal
                    borderRadius: "0.5rem", // Sudut membulat
                    textAlign: "center", // Teks di tengah
                  }}>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: containerText,
                    }}>
                    Proses
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: containerText,
                    }}>
                    {statistics.statusCounts.Proses}
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: darkMode ? "#ccc" : "#4a4a4a",
                    }}>
                    {statistics.statusPercentages.Proses}%
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: darkMode ? "#2E7D32" : "#A5D6A7", // Warna background status "Selesai"
                    padding: "1rem", // Padding internal
                    borderRadius: "0.5rem", // Sudut membulat
                    textAlign: "center", // Teks di tengah
                  }}>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: containerText,
                    }}>
                    Selesai
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: containerText,
                    }}>
                    {statistics.statusCounts.Selesai}
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: darkMode ? "#ccc" : "#4a4a4a",
                    }}>
                    {statistics.statusPercentages.Selesai}%
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: darkMode ? "#C62828" : "#EF9A9A", // Warna background untuk status eskalasi
                    padding: "1rem", // Padding internal
                    borderRadius: "0.5rem", // Sudut membulat
                    textAlign: "center", // Teks di tengah
                  }}>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: containerText,
                    }}>
                    Eskalasi
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: containerText,
                    }}>
                    {statistics.escalations}
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: darkMode ? "#ccc" : "#4a4a4a",
                    }}>
                    {statistics.statusPercentages.Eskalasi}%
                  </p>
                </div>
              </div>
            </div>
            {/* Tombol untuk membuka modal chart */}
            <div
              style={{
                display: "flex", // Menggunakan flexbox untuk tata letak tombol
                flexWrap: "wrap", // Membungkus tombol jika ruang tidak cukup
                justifyContent: "center", // Menempatkan tombol di tengah
                gap: "1rem", // Jarak antar tombol
                marginBottom: "1.5rem", // Margin bawah
              }}>
              <button
                onClick={() => setShowStatusModal(true)} // Membuka modal statistik status ketika diklik
                style={{
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#4F46E5",
                  color: "#fff",
                  borderRadius: "0.375rem",
                  border: "none",
                }}>
                Statistik Status
              </button>
              <button
                onClick={() => setShowJenisModal(true)} // Membuka modal statistik jenis layanan ketika diklik
                style={{
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#4F46E5",
                  color: "#fff",
                  borderRadius: "0.375rem",
                  border: "none",
                }}>
                Statistik Jenis Layanan
              </button>
              <button
                onClick={() => setShowSubJenisModal(true)} // Membuka modal statistik sub jenis layanan ketika diklik
                style={{
                  cursor: "pointer",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#4F46E5",
                  color: "#fff",
                  borderRadius: "0.375rem",
                  border: "none",
                }}>
                Statistik Sub Jenis Layanan
              </button>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <input
                type="text" // Tipe input berupa teks
                placeholder="Cari jenis layanan..." // Placeholder untuk pencarian jenis layanan
                style={{
                  width: "100%", // Lebar penuh
                  padding: "0.75rem", // Padding internal
                  border: `1px solid ${darkMode ? "#fff" : "#000"}`, // Border sesuai dark/light mode
                  borderRadius: "0.5rem", // Sudut membulat
                  backgroundColor: paperBg, // Background sesuai paper
                  color: containerText, // Warna teks sesuai tema
                }}
                value={searchTerm} // Nilai input sesuai state searchTerm
                onChange={e => setSearchTerm(e.target.value)} // Update state saat nilai input berubah
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.25rem", // Ukuran font judul bagian jenis layanan
                  fontWeight: "600", // Berat font tebal
                  marginBottom: "1rem", // Margin bawah judul
                  color: containerText, // Warna teks
                }}>
                Jenis Layanan
              </h3>
              <div style={{ overflowX: "auto" }}>
                {" "}
                {/* Membungkus tabel agar dapat di-scroll secara horizontal */}
                <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: darkMode ? "#444" : "#e5e7eb",
                      }}>
                      <th
                        style={{
                          padding: "0.75rem",
                          border: "1px solid",
                          textAlign: "center",
                          color: containerText,
                        }}>
                        Jenis Layanan
                      </th>
                      <th
                        style={{
                          padding: "0.75rem",
                          border: "1px solid",
                          textAlign: "center",
                          color: containerText,
                        }}>
                        Jumlah
                      </th>
                      <th
                        style={{
                          padding: "0.75rem",
                          border: "1px solid",
                          textAlign: "center",
                          color: containerText,
                        }}>
                        Persentase (%)
                      </th>
                      <th
                        style={{
                          padding: "0.75rem",
                          border: "1px solid",
                          textAlign: "center",
                          color: containerText,
                        }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLayanan.map(
                      (
                        [key, value] // Melakukan iterasi data layanan yang sudah difilter
                      ) => (
                        <tr
                          key={key}
                          style={{
                            textAlign: "center",
                            backgroundColor: darkMode ? "#333" : "inherit",
                          }}>
                          <td
                            style={{
                              padding: "0.75rem",
                              border: "1px solid",
                              color: containerText,
                            }}>
                            {key}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              border: "1px solid",
                              color: containerText,
                            }}>
                            {value}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              border: "1px solid",
                              color: containerText,
                            }}>
                            {statistics.layananPercentages[key]}%
                          </td>
                          <td
                            style={{ padding: "0.75rem", border: "1px solid" }}>
                            <CustomButton
                              onClick={() => openModal(key)}
                              variant="contained"
                              color="primary">
                              Detail
                            </CustomButton>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Jika data statistik belum tersedia
          <p style={{ textAlign: "center", color: darkMode ? "#aaa" : "#666" }}>
            Memuat data...
          </p>
        )}
      </div>

      {/* Modal untuk Statistik Status */}
      <Dialog
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        fullWidth
        maxWidth="md">
        <DialogTitle
          style={{
            backgroundColor: darkMode ? "#333" : "#4F46E5",
            color: containerText,
          }}>
          Statistik Status Formulir
        </DialogTitle>
        <DialogContent dividers>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
            }}>
            <div>
              <Bar
                data={statusBarChartData} // Data chart bar status
                options={{
                  ...barOptions, // Opsi dasar chart bar
                  plugins: {
                    ...barOptions.plugins,
                    title: { display: true, text: "Bar Chart - Status" }, // Judul chart
                  },
                }}
              />
            </div>
            <div>
              <Pie
                data={statusPieChartData} // Data chart pie status
                options={{
                  ...pieOptions, // Opsi dasar chart pie
                  plugins: {
                    ...pieOptions.plugins,
                    title: { display: true, text: "Pie Chart - Status" }, // Judul chart
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <CustomButton
            onClick={() => setShowStatusModal(false)}
            variant="contained"
            color="primary">
            Tutup
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Modal untuk Statistik Jenis Layanan */}
      <Dialog
        open={showJenisModal}
        onClose={() => setShowJenisModal(false)}
        fullWidth
        maxWidth="md">
        <DialogTitle
          style={{
            backgroundColor: darkMode ? "#333" : "#4F46E5",
            color: containerText,
          }}>
          Statistik Jenis Layanan
        </DialogTitle>
        <DialogContent dividers>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
            }}>
            <div>
              <Bar
                data={jenisChartData} // Data chart bar jenis layanan
                options={{
                  ...barOptions,
                  plugins: {
                    ...barOptions.plugins,
                    title: { display: true, text: "Bar Chart - Jenis Layanan" },
                  },
                }}
              />
            </div>
            <div>
              <Pie
                data={jenisChartData} // Data chart pie jenis layanan
                options={{
                  ...pieOptions,
                  plugins: {
                    ...pieOptions.plugins,
                    title: { display: true, text: "Pie Chart - Jenis Layanan" },
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <CustomButton
            onClick={() => setShowJenisModal(false)}
            variant="contained"
            color="primary">
            Tutup
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Modal untuk Statistik Sub Jenis Layanan */}
      <Dialog
        open={showSubJenisModal}
        onClose={() => setShowSubJenisModal(false)}
        fullWidth
        maxWidth="md">
        <DialogTitle
          style={{
            backgroundColor: darkMode ? "#333" : "#4F46E5",
            color: containerText,
          }}>
          Statistik Sub Jenis Layanan
        </DialogTitle>
        <DialogContent dividers>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
            }}>
            <div>
              <Bar
                data={subJenisChartData} // Data chart bar sub jenis layanan
                options={{
                  ...barOptions,
                  plugins: {
                    ...barOptions.plugins,
                    title: {
                      display: true,
                      text: "Bar Chart - Sub Jenis Layanan",
                    },
                  },
                }}
              />
            </div>
            <div>
              <Pie
                data={subJenisChartData} // Data chart pie sub jenis layanan
                options={{
                  ...pieOptions,
                  plugins: {
                    ...pieOptions.plugins,
                    title: {
                      display: true,
                      text: "Pie Chart - Sub Jenis Layanan",
                    },
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <CustomButton
            onClick={() => setShowSubJenisModal(false)}
            variant="contained"
            color="primary">
            Tutup
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Modal untuk Detail Layanan */}
      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="md">
        <DialogTitle
          style={{
            backgroundColor: darkMode ? "#333" : "#3B82F6",
            color: containerText,
          }}>
          Detail Layanan: {selectedService}
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ marginBottom: "1rem", overflowX: "auto" }}>
            {" "}
            {/* Tabel dapat di-scroll secara horizontal */}
            <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: darkMode ? "#555" : "#e5e7eb" }}>
                  <th
                    style={{
                      padding: "0.75rem",
                      border: "1px solid",
                      textAlign: "center",
                      color: containerText,
                    }}>
                    Sub Jenis Layanan
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      border: "1px solid",
                      textAlign: "center",
                      color: containerText,
                    }}>
                    Jumlah
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      border: "1px solid",
                      textAlign: "center",
                      color: containerText,
                    }}>
                    Persentase (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedService &&
                  Object.entries(
                    statistics.layananDetails[selectedService] || {}
                  ).map(
                    (
                      [subtype, count] // Iterasi tiap detail layanan
                    ) => (
                      <tr
                        key={subtype}
                        style={{
                          textAlign: "center",
                          backgroundColor: darkMode ? "#444" : "inherit",
                        }}>
                        <td
                          style={{
                            padding: "0.75rem",
                            border: "1px solid",
                            color: containerText,
                          }}>
                          {subtype}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            border: "1px solid",
                            color: containerText,
                          }}>
                          {count}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            border: "1px solid",
                            color: containerText,
                          }}>
                          {count > 0
                            ? (
                                (count /
                                  statistics.layananCounts[selectedService]) *
                                100
                              ).toFixed(2)
                            : "0.00"}
                          %
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
            }}>
            <div>
              <Bar
                data={detailChartData} // Data chart bar detail layanan
                options={{
                  ...barOptions,
                  plugins: {
                    ...barOptions.plugins,
                    title: { display: true, text: "Bar Chart - Detail" },
                  },
                }}
              />
            </div>
            <div>
              <Pie
                data={detailChartData} // Data chart pie detail layanan
                options={{
                  ...pieOptions,
                  plugins: {
                    ...pieOptions.plugins,
                    title: { display: true, text: "Pie Chart - Detail" },
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions style={{ padding: "0.5rem" }}>
          <CustomButton
            onClick={closeModal}
            variant="contained"
            color="primary">
            Tutup
          </CustomButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Mengekspor komponen DataFormulir sebagai default export
export default DataFormulir;
