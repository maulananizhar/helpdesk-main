import axios from "axios"; // Import axios untuk melakukan permintaan HTTP

// Mendapatkan URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const registerHandler = async (
  e,
  nama,
  email,
  unit,
  password,
  confirmPassword,
  navigate,
  toast
) => {
  e.preventDefault();

  try {
    // Validasi input
    if (password !== confirmPassword) {
      toast.error("Kata sandi tidak cocok!");
      return;
    }
    if (password.length < 8) {
      toast.error("Kata sandi minimal 8 karakter!");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Email tidak valid!");
      return;
    }

    // Mengirim permintaan POST ke backend untuk registrasi
    let response = await axios.post(`${backendUrl}/user/auth/register`, {
      nama,
      email,
      unit,
      password,
    });

    // Jika registrasi berhasil, tampilkan pesan sukses dan arahkan pengguna ke halaman login
    if (response.data.success) {
      toast.success("Berhasil Registrasi!");
      await navigate("/user/login");
    }
  } catch (error) {
    // Jika terjadi kesalahan, tampilkan pesan kesalahan
    toast.error(`Registrasi gagal! ${error.response.data.message}`);
  }
};

export default registerHandler;
