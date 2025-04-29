import axios from "axios"; // Import axios untuk melakukan HTTP request

// Mengambil URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk mengambil timeline berdasarkan tiket
const getTimeline = async ticket => {
  // Melakukan request POST ke endpoint untuk mendapatkan timeline berdasarkan tiket
  const response = await axios.post(
    `${backendUrl}/form/get-timeline-by-ticket`,
    {
      ticket,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("uToken")}`,
      },
    }
  );
  return response.data;
};

export default getTimeline;
