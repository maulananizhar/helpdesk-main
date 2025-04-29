// Impor modul axios untuk melakukan request HTTP ke backend
import axios from "axios";
// Impor createContext dan useState dari React untuk membuat context dan mengelola state
import { createContext, useState } from "react";
// Impor toast dan ToastContainer dari react-toastify untuk menampilkan notifikasi
import { toast, ToastContainer } from "react-toastify";

// Membuat context Admin yang akan digunakan untuk berbagi state dan fungsi antar komponen
export const AdminContext = createContext();

// Membuat komponen provider untuk AdminContext yang membungkus komponen anak (children)
const AdminContextProvider = (props) => {
  // Mendapatkan URL backend dari environment variable
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Inisialisasi state aToken dengan nilai token yang tersimpan di localStorage (jika ada)
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  // State untuk menyimpan data users (array)
  const [users, setUsers] = useState([]);
  // State untuk menyimpan data formulir (array)
  const [formulir, setFormulir] = useState([]);
  // State untuk menyimpan data PIC (Person In Charge) sebagai array
  const [PICsData, setPICsData] = useState([]);
  // State untuk menyimpan data jenis layanan (array)
  const [jenisLayanan, setJenisLayanan] = useState([]);
  // State untuk menyimpan data sub jenis layanan (array)
  const [subJenisLayanan, setSubJenisLayanan] = useState([]);

  // Fungsi untuk menghapus data sub jenis layanan
  const deleteSubJenisLayanan = async () => {
    // Konfirmasi penghapusan dengan jendela konfirmasi browser
    if (!window.confirm("Apakah anda yakin menghapus Sub Jenis Layanan?")) return;
    try {
      // Kirim request DELETE ke endpoint sub jenis layanan (perhatikan: variabel id belum didefinisikan)
      const response = await axios.delete(
        `http://localhost:3500/admin/subjenislayanan/${id}`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      // Setelah penghapusan, ambil data sub jenis layanan terbaru
      getSubJenisLayanan();
      // Tampilkan notifikasi sukses
      toast.success("Sub Jenis Layanan berhasil dihapus");
    } catch (error) {
      // Tampilkan notifikasi error jika terjadi kesalahan
      toast.error("Gagal menghapus Sub Jenis Layanan!");
    }
  };

  // Fungsi untuk mengambil data sub jenis layanan dari backend
  const getSubJenisLayanan = async () => {
    try {
      // Kirim request GET ke endpoint sub jenis layanan dengan header otorisasi
      const response = await axios.get(backendUrl + "/admin/subjenislayanan", {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      // Simpan data yang diterima ke state subJenisLayanan
      setSubJenisLayanan(response.data);
    } catch (error) {
      // Tampilkan notifikasi error jika gagal mengambil data
      toast.error("Gagal mengambil data SubJenisLayanan!");
      console.log("Error Mengambil SubJenisLayanan", error);
    }
  };

  // Fungsi untuk mengambil data jenis layanan dari backend
  const getJenisLayanan = async () => {
    try {
      // Kirim request GET ke endpoint jenis layanan dengan header otorisasi
      const response = await axios.get(backendUrl + "/admin/jenislayanan", {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      // Simpan data yang diterima ke state jenisLayanan
      setJenisLayanan(response.data);
    } catch (error) {
      // Tampilkan notifikasi error jika gagal mengambil data
      toast.error("Gagal mengambil data JenisLayanan!");
    }
  };

  // Fungsi untuk mengambil data PIC dari backend
  const getPICsData = async () => {
    try {
      // Kirim request GET ke endpoint users-pic dengan header otorisasi
      const response = await axios.get(backendUrl + "/admin/users-pic", {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      // Simpan data yang diterima ke state PICsData
      setPICsData(response.data);
    } catch (error) {
      // Tampilkan notifikasi error jika gagal mengambil data
      toast.error("Gagal mengambil data PIC!");
    }
  };

  // Fungsi untuk menambahkan eskalasi pada sebuah formulir berdasarkan id
  const handleEscalate = async (id) => {
    try {
      // Kirim request PUT ke endpoint eskalasi formulir (id formulir diberikan sebagai parameter)
      await axios.put(`http://localhost:3500/admin/formulir/eskalasi/${id}`);
      // Tampilkan notifikasi sukses
      toast.success("Formulir berhasil dieskalasi!");
      // Perbarui data formulir dengan mengambil data terbaru
      getAllFormulir();
    } catch (error) {
      // Tampilkan notifikasi error jika gagal menambahkan eskalasi
      toast.error("Gagal menambahkan eskalasi!");
    }
  };

  // Fungsi untuk mengambil semua data formulir dari backend
  const getAllFormulir = async () => {
    try {
      // Kirim request GET ke endpoint formulir dengan header otorisasi
      const response = await axios.get(backendUrl + "/admin/form", {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      // Simpan data yang diterima ke state formulir
      setFormulir(response.data);
    } catch (error) {
      // Jika error karena otorisasi (401), tampilkan notifikasi dan hapus token
      if (error.response && error.response.status === 401) {
        toast.error("Sesi login berakhir, silakan login kembali!");
        localStorage.removeItem("aToken");
        setAToken("");
        // NOTE: Fungsi navigate tidak didefinisikan di sini. Pastikan untuk mengimpor dan mendefinisikannya jika ingin digunakan.
        navigate("/login");
      } else {
        // Jika error lain, tampilkan notifikasi error umum
        toast.error("Gagal mengambil data formulir!");
      }
    }
  };

  // Fungsi untuk mengambil data users dari backend
  const getUsersData = async () => {
    try {
      // Kirim request GET ke endpoint users dengan header otorisasi
      const response = await axios.get(backendUrl + "/admin/users", {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      // Simpan data yang diterima ke state users
      setUsers(response.data);
    } catch (error) {
      // Tampilkan notifikasi error jika gagal mengambil data
      toast.error("Gagal mengambil data users!");
    }
  };

  // Fungsi untuk menghapus user berdasarkan id
  const deleteUser = async (id) => {
    // Tampilkan konfirmasi penghapusan menggunakan window.confirm
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    try {
      // Kirim request DELETE ke endpoint users dengan id user dan header otorisasi
      const response = await axios.delete(
        `http://localhost:3500/admin/users/${id}`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      // Setelah penghapusan, perbarui data users dengan memanggil getUsersData
      getUsersData();
      // Tampilkan notifikasi sukses
      toast.success("User berhasil dihapus!");
    } catch (error) {
      // Tampilkan notifikasi error jika terjadi masalah
      toast.error("Gagal mengambil data users!");
    }
  };

  // Fungsi untuk menghapus formulir berdasarkan id
  const deleteFormulir = async (id) => {
    try {
      // Kirim request DELETE ke endpoint formulir dengan id formulir dan header otorisasi
      const response = await axios.delete(
        `http://localhost:3500/admin/formulir/${id}`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      // Perbarui data formulir setelah penghapusan
      getAllFormulir();
      // Tampilkan notifikasi sukses
      toast.success("Formulir berhasil dihapus!");
    } catch (error) {
      // Tampilkan notifikasi error jika terjadi masalah
      toast.error("Gagal menghapus formulir!");
    }
  };

  // Fungsi untuk menghapus jenis layanan berdasarkan id
  const deleteJenisLayanan = async (id) => {
    // Tampilkan konfirmasi penghapusan
    if (!window.confirm("Apakah Anda yakin ingin menghapus jenis layanan ini?"))
      return;
    try {
      // Kirim request DELETE ke endpoint jenis layanan dengan id dan header otorisasi
      const response = await axios.delete(
        `http://localhost:3500/admin/jenislayanan/${id}`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      // Perbarui data jenis layanan setelah penghapusan
      getJenisLayanan();
      // Tampilkan notifikasi sukses
      toast.success("Jenis layanan berhasil dihapus!");
    } catch (error) {
      // Tampilkan notifikasi error jika terjadi masalah
      toast.error("Gagal menghapus jenis layanan!");
    }
  };

  // Objek value yang akan diberikan melalui AdminContext.Provider
  const value = {
    aToken, // Token otentikasi untuk admin
    setAToken, // Fungsi untuk mengubah token admin
    users, // Data users
    setUsers, // Fungsi untuk mengubah data users
    formulir, // Data formulir
    setFormulir, // Fungsi untuk mengubah data formulir
    getAllFormulir, // Fungsi untuk mengambil semua data formulir
    getUsersData, // Fungsi untuk mengambil data users
    deleteUser, // Fungsi untuk menghapus user
    handleEscalate, // Fungsi untuk menambahkan eskalasi pada formulir
    getPICsData, // Fungsi untuk mengambil data PIC
    PICsData, // Data PIC
    setPICsData, // Fungsi untuk mengubah data PIC
    jenisLayanan, // Data jenis layanan
    setJenisLayanan, // Fungsi untuk mengubah data jenis layanan
    getJenisLayanan, // Fungsi untuk mengambil data jenis layanan
    deleteJenisLayanan, // Fungsi untuk menghapus jenis layanan
    deleteFormulir, // Fungsi untuk menghapus formulir
    subJenisLayanan, // Data sub jenis layanan
    getSubJenisLayanan, // Fungsi untuk mengambil data sub jenis layanan
    setSubJenisLayanan, // Fungsi untuk mengubah data sub jenis layanan
    deleteSubJenisLayanan, // Fungsi untuk menghapus sub jenis layanan
  };

  // Mengembalikan AdminContext.Provider yang membungkus komponen anak dengan value context
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

// Ekspor AdminContextProvider sebagai default agar dapat digunakan di bagian lain aplikasi
export default AdminContextProvider;
