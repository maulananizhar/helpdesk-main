// import axios untuk melakukan request HTTP
import axios from "axios";

// Mendapatkan URL backend dari variabel lingkungan
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const deleteTimeline = async id => {
  // Melakukan request DELETE untuk menghapus timeline
  await axios.delete(`${backendUrl}/form/delete-timeline`, {
    data: { id },
    headers: {
      Authorization: `Bearer ${
        localStorage.getItem("pToken") || localStorage.getItem("aToken")
      }`,
    },
  });
};

export default deleteTimeline;
