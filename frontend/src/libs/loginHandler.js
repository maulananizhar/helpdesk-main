import axios from "axios"; // Import axios untuk melakukan permintaan HTTP

// Mendapatkan URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk menangani login
const loginHandler = async (e, email, password, navigate, toast) => {
  e.preventDefault();

  try {
    // Mengirim permintaan POST ke endpoint login
    let response = await axios.post(`${backendUrl}/user/auth/login`, {
      email,
      password,
    });

    // Jika login berhasil, simpan token dan arahkan ke dashboard
    if (response.data.success) {
      toast.success("Berhasil Login!");
      localStorage.setItem("uToken", response.data.token);
      navigate("/user/dashboard");
    }
  } catch (error) {
    // Jika terjadi kesalahan, tampilkan pesan kesalahan
    toast.error(`Login gagal! ${error.response.data.message}`);
  }
};

export default loginHandler;
