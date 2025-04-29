import axios from "axios"; // Import axios untuk melakukan HTTP request

// Mengambil URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk memverifikasi token
const verifyToken = async (navigate, toast, setLoading, target, failed) => {
  try {
    // Melakukan request untuk memverifikasi token
    let response = await axios.post(`${backendUrl}/user/auth/token`, {
      token: localStorage.getItem("uToken"),
    });

    // Jika token valid, simpan token baru dan navigasi ke target
    if (response.data.success) {
      localStorage.setItem("uToken", response.data.token);
      await navigate(target);
      await setLoading(false);
    }
  } catch (error) {
    // Jika terjadi error, hapus token dari localStorage dan navigasi ke halaman gagal
    localStorage.setItem("uToken", "");

    // kirim notifikasi error jika token tidak ditemukan
    if (error.response.data.message !== "Token not found") {
      toast.error(`Error! ${error.response.data.message}`);
    }
    // navigasi ke halaman gagal
    await navigate(failed);
    await setLoading(false);
  }
};

export default verifyToken;
