// Impor modul axios untuk melakukan request HTTP ke backend
import axios from "axios";
// Impor createContext dan useState dari React untuk membuat context dan mengelola state
import { createContext, useState } from "react";
// Impor toast dari react-toastify untuk menampilkan notifikasi kepada pengguna
import { toast } from "react-toastify";

// Membuat context PIC untuk menyimpan dan membagikan state terkait user PIC dan data lainnya
export const PICContext = createContext();

// Komponen Provider untuk PICContext, yang akan membungkus komponen anak dan menyediakan state serta fungsi-fungsinya
const PICContextProvider = (props) => {
  // Mendapatkan URL backend dari variabel lingkungan yang didefinisikan (misalnya di .env)
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Mengambil token PIC dari localStorage jika ada, jika tidak maka inisialisasi dengan string kosong
  const [pToken, setPToken] = useState(localStorage.getItem("pToken") || "");
  // State untuk menyimpan data users (array)
  const [users, setUsers] = useState([]);
  // State untuk menyimpan data formulir (array) secara umum
  const [formulir, setFormulir] = useState([]);
  // State untuk menyimpan data formulir khusus untuk PIC (array)
  const [formulirPIC, setFormulirPIC] = useState([]);
  // State untuk menyimpan data profil Admin (array)
  const [profileAdmin, setProfileAdmin] = useState([]);
  // State untuk menyimpan data PIC (Person In Charge) yang ada (array)
  const [PICsData, setPICsData] = useState([]);
  // State untuk menyimpan data sub jenis layanan (array)
  const [subJenisLayanan, setSubJenisLayanan] = useState([]);

  // Fungsi untuk mengambil data sub jenis layanan dari backend
  const getSubJenisLayanan = async () => {
    try {
      // Mengirim request GET ke endpoint sub jenis layanan dengan header Authorization
      const response = await axios.get(backendUrl + "/admin/subjenislayanan", {
        headers: { Authorization: `Bearer ${pToken}` },
      });
      // Menyimpan data yang diterima ke state subJenisLayanan
      setSubJenisLayanan(response.data);
    } catch (error) {
      // Jika terjadi error, tampilkan notifikasi error dan log error ke konsol
      toast.error("Gagal mengambil data SubJenisLayanan!");
      console.log("Error Mengambil SubJenisLayanan", error);
    }
  };

  // Fungsi untuk mengambil data PIC dari backend
  const getPICsData = async () => {
    try {
      // Mengirim request GET ke endpoint users-pic tanpa header otorisasi (tergantung pada implementasi backend)
      const response = await axios.get(backendUrl + "/admin/users-pic");
      // Menyimpan data PIC yang diterima ke state PICsData
      setPICsData(response.data);
    } catch (error) {
      // Jika terjadi error, tampilkan notifikasi error
      toast.error("Gagal mengambil data PIC!");
    }
  };

  // Fungsi untuk mengambil seluruh data formulir dari backend
  const getAllFormulir = async () => {
    try {
      // Mengirim request GET ke endpoint formulir dengan header otorisasi
      const response = await axios.get(backendUrl + "/admin/form", {
        headers: { Authorization: `Bearer ${pToken}` },
      });
      // Menyimpan data formulir yang diterima ke state formulir
      setFormulir(response.data);
    } catch (error) {
      // Jika terjadi error dan status respons 401 (unauthorized), artinya sesi login berakhir
      if (error.response && error.response.status === 401) {
        toast.error("Sesi login berakhir, silakan login kembali!");
        // Hapus token dari localStorage dan state
        localStorage.removeItem("aToken");
        setPToken("");
        // NOTE: Fungsi navigate tidak didefinisikan di sini, jadi pastikan untuk mengimpornya jika diperlukan
        navigate("/login");
      } else {
        // Tampilkan notifikasi error untuk error lainnya
        toast.error("Gagal mengambil data formulir!");
      }
    }
  };

  // Fungsi untuk mengambil data formulir khusus untuk PIC dari backend
  const getAllFormulirPIC = async () => {
    try {
      // Mengirim request GET ke endpoint formulir PIC dengan header otorisasi
      const response = await axios.get(backendUrl + "/admin/formPIC", {
        headers: { Authorization: `Bearer ${pToken}` },
      });
      // Menyimpan data yang diterima ke state formulirPIC
      setFormulirPIC(response.data);
    } catch (error) {
      // Tampilkan notifikasi error jika gagal mengambil data formulir untuk PIC
      toast.error("Gagal mengambil data formulir untuk PIC!");
    }
  };

  // Fungsi untuk mengambil data profil Admin dari backend
  const getProfileAdmin = async () => {
    try {
      // Mengirim request GET ke endpoint profil admin
      const response = await axios.get(backendUrl + "/user/admin-profile");
      // Menyimpan data yang diterima ke state profileAdmin
      setProfileAdmin(response.data);
    } catch (err) {
      // Tampilkan notifikasi error jika gagal mendapatkan data profil admin
      toast.error("Gagal mendapatkan data Admin!");
    }
  };

  // Fungsi untuk mengambil data users dari backend
  const getUsersData = async () => {
    try {
      // Mengirim request GET ke endpoint users
      const response = await axios.get(backendUrl + "/admin/users");
      // Menyimpan data yang diterima ke state users
      setUsers(response.data);
    } catch (error) {
      // Tampilkan notifikasi error jika terjadi kegagalan
      toast.error("Gagal mengambil data users!");
    }
  };

  // Fungsi untuk menghapus user berdasarkan id
  const deleteUser = async (id) => {
    // Tampilkan konfirmasi penghapusan, jika tidak disetujui, keluar dari fungsi
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    try {
      // Mengirim request DELETE ke endpoint user dengan menyisipkan id pada URL
      await axios.delete(`${backendUrl}/admin/users/${id}`);
      // Memperbarui data users setelah penghapusan
      getUsersData();
      // Tampilkan notifikasi sukses
      toast.success("User berhasil dihapus!");
    } catch (error) {
      // Jika terjadi error, tampilkan notifikasi error
      toast.error("Gagal menghapus user!");
    }
  };

  // Objek value yang berisi state dan fungsi yang akan dibagikan ke komponen anak melalui context
  const value = {
    pToken, // Token otentikasi untuk PIC
    setPToken, // Fungsi untuk mengubah token PIC
    users, // Data users
    setUsers, // Fungsi untuk mengubah data users
    formulir, // Data formulir umum
    setFormulir, // Fungsi untuk mengubah data formulir
    formulirPIC, // Data formulir khusus untuk PIC
    setFormulirPIC, // Fungsi untuk mengubah data formulir PIC
    profileAdmin, // Data profil admin
    setProfileAdmin, // Fungsi untuk mengubah data profil admin
    getAllFormulir, // Fungsi untuk mengambil semua data formulir
    getAllFormulirPIC, // Fungsi untuk mengambil data formulir khusus PIC
    getProfileAdmin, // Fungsi untuk mengambil data profil admin
    getUsersData, // Fungsi untuk mengambil data users
    deleteUser, // Fungsi untuk menghapus user
    getPICsData, // Fungsi untuk mengambil data PIC
    PICsData, // Data PIC yang diambil
    setPICsData, // Fungsi untuk mengubah data PIC
    subJenisLayanan, // Data sub jenis layanan
    getSubJenisLayanan, // Fungsi untuk mengambil data sub jenis layanan
    setSubJenisLayanan, // Fungsi untuk mengubah data sub jenis layanan
  };

  // Provider context yang membungkus komponen anak (props.children) dan menyediakan objek value ke seluruh komponen di dalamnya
  return (
    <PICContext.Provider value={value}>
      {props.children}
    </PICContext.Provider>
  );
};

// Ekspor PICContextProvider sebagai default agar dapat digunakan di bagian lain aplikasi
export default PICContextProvider;
