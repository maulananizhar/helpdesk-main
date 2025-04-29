import axios from "axios"; // Import axios untuk melakukan HTTP request

// Mendapatkan URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk mendapatkan statistik
const getStats = async () => {
  // Mengambil data statistik dari endpoint /user/get-stats
  const response = await axios.get(`${backendUrl}/user/get-stats`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("uToken")}`,
    },
  });
  return response.data;
};

export default getStats;
