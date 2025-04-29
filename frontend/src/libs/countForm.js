import axios from "axios"; // import axios untuk melakukan HTTP request

// Mengambil URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk menghitung jumlah form yang sudah masuk
const countForm = async () => {
  const response = await axios.get(`${backendUrl}/user/count-form`);
  return response.data;
};

export default countForm;
