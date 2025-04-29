import axios from "axios"; // Import axios untuk melakukan permintaan HTTP

// Mendapatkan URL backend dari variabel lingkungan
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk mengirim email pengaturan ulang kata sandi
const sendResetPasswordEmail = async (e, email, navigate, toast) => {
  e.preventDefault();
  try {
    // Validasi input email
    if (!email) {
      toast.error("Email tidak boleh kosong!");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Email tidak valid!");
      return;
    }

    // Mengirim permintaan POST ke endpoint pengaturan ulang kata sandi
    let response = await axios.post(`${backendUrl}/user/auth/forgot-password`, {
      email,
    });

    // Jika permintaan berhasil, tampilkan pesan sukses
    if (response.data.success) {
      toast.success("Email pengaturan ulang kata sandi telah dikirim!");
      await navigate("/user/login");
    }
  } catch (error) {
    // Jika terjadi kesalahan, tampilkan pesan kesalahan
    toast.error(`Pengiriman email gagal! ${error.response.data.message}`);
  }
};

export default sendResetPasswordEmail;
