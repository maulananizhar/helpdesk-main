// import axios untuk melakukan request HTTP
import axios from "axios";

// Mendapatkan URL backend dari variabel lingkungan
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const getTimeline = async ticket => {
  // Melakukan request POST untuk mendapatkan timeline berdasarkan tiket
  const response = await axios.post(
    `${backendUrl}/form/get-timeline-by-ticket`,
    {
      ticket,
    },
    {
      headers: {
        Authorization: `Bearer ${
          localStorage.getItem("pToken") || localStorage.getItem("aToken")
        }`,
      },
    }
  );
  return response.data;
};

export default getTimeline;
