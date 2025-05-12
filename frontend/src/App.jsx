import { Routes, Route } from "react-router-dom"; // Import Routes dan Route untuk routing
import { ToastContainer } from "react-toastify"; // Import ToastContainer untuk notifikasi
import "react-toastify/dist/ReactToastify.css"; // Import css untuk notifikasi

// Import halaman yang akan dirender
import FormInformationPage from "./pages/FormInformationPage";
import Beranda from "./pages/Beranda";
import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AccountVerify from "./pages/AccountVerify";
import NotFound from "./pages/NotFound";
import PermintaanSaya from "./pages/PermintaanSaya";
import DetailPermintaan from "./pages/DetailPermintaan";
import AturSandi from "./pages/AturSandi";
import LupaSandi from "./pages/LupaSandi";
import BuatPermintaanWrapper from "./pages/BuatPermintaan";

const App = () => {
  return (
    <div className="">
      <ToastContainer />
      <Routes>
        {/* Membuat route untuk halaman utama */}
        <Route exact path="/" element={<Beranda />} />
        {/* Membuat route untuk halaman login */}
        <Route exact path="/user/login" element={<LoginPage />} />
        {/* Membuat route untuk halaman register */}
        {/* <Route exact path="/user/register" element={<RegisterPage />} /> */}
        {/* Membuat route untuk halaman verifikasi */}
        <Route exact path="/user/verify/:token" element={<AccountVerify />} />
        {/* Membuat route untuk halaman lupa kata sandi */}
        <Route exact path="/user/lupa-sandi/" element={<LupaSandi />} />
        {/* Membuat route untuk halaman atur sandi */}
        <Route exact path="/user/atur-sandi/:token" element={<AturSandi />} />
        {/* Membuat route untuk halaman dashboard */}
        <Route exact path="/user/dashboard" element={<Dashboard />} />
        {/* Membuat route untuk halaman permintaan saya */}
        <Route
          exact
          path="/user/dashboard/permintaan-saya"
          element={<PermintaanSaya />}
        />
        {/* Membuat route untuk halaman detail permintaan */}
        <Route
          exact
          path="/user/dashboard/permintaan-saya/:ticket"
          element={<DetailPermintaan />}
        />
        {/* Membuat route untuk halaman formulir */}
        <Route
          exact
          path="/user/dashboard/buat-permintaan"
          element={<BuatPermintaanWrapper />}
        />
        {/* Membuat route untuk halaman informasi formulir */}
        <Route
          exact
          path="/formInformation/:id"
          element={<FormInformationPage />}
        />
        <Route exact path="/*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
