import axios from "axios"; // Import axios untuk melakukan HTTP request

// Mendapatkan URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk memverifikasi token pengguna
const verifyUser = async token => {
  try {
    // Melakukan request ke endpoint verifikasi token
    await axios.get(`${backendUrl}/user/auth/verify/${token}`);
  } catch (error) {
    console.error("Error verifying token:", error);
  }
};

export default verifyUser;
