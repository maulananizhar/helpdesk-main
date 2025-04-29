import axios from "axios"; // Import axios untuk melakukan HTTP request

// Mendapatkan URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk mendapatkan formulir
const getAllForms = async (limit = 100) => {
  // Melakukan request ke endpoint untuk mendapatkan semua formulir
  const response = await axios.post(
    `${backendUrl}/user/get-forms`,
    { limit },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("uToken")}`,
      },
    }
  );
  return response.data;
};

export default getAllForms;
