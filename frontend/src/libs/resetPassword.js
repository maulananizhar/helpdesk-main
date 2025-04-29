import axios from "axios"; // Import axios untuk melakukan permintaan HTTP

// // Mendapatkan URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk mengatur ulang kata sandi
const resetPassword = async (
  e,
  token,
  password,
  confirmPassword,
  navigate,
  toast
) => {
  e.preventDefault();
  try {
    // Validasi token dan kata sandi
    if (!token) {
      toast.error("Token tidak valid!");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Kata sandi tidak boleh kosong!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Kata sandi tidak cocok!");
      return;
    }

    // Mengirim permintaan untuk mengatur ulang kata sandi
    let response = await axios.post(`${backendUrl}/user/auth/reset-password`, {
      token,
      password,
    });

    // Menangani respons dari server
    if (response.data.success) {
      toast.success("Kata sandi berhasil diatur ulang!");
      await navigate("/user/login");
    }
  } catch (error) {
    // Menangani kesalahan jika ada
    toast.error(
      `Pengaturan ulang kata sandi gagal! ${error.response.data.message}`
    );
  }
};

export default resetPassword;
