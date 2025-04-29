// import axios untuk melakukan request HTTP
import axios from "axios";

// Mendapatkan URL backend dari variabel lingkungan
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const addTimeline = async (ticket, title, subtitle) => {
  // Melakukan request POST untuk menambahkan timeline
  await axios.post(
    `${backendUrl}/form/add-timeline`,
    {
      ticket,
      title,
      subtitle,
    },
    {
      headers: {
        Authorization: `Bearer ${
          localStorage.getItem("pToken") || localStorage.getItem("aToken")
        }`,
      },
    }
  );
};

export default addTimeline;
