// import axios untuk melakukan request HTTP
import axios from "axios";

// Mendapatkan URL backend dari variabel lingkungan
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const getUlasanHelpdesk = async rating => {
  try {
    // Melakukan request POST untuk mendapatkan ulasan helpdesk berdasarkan rating
    const response = await axios.post(
      `${backendUrl}/admin/testimonial-helpdesk`,
      {
        rating,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("aToken")}`,
        },
      }
    );
    if (response.data.success) {
      return response.data;
    } else {
      console.error("Failed to fetch ulasan helpdesk:", response.data.message);
    }
  } catch (error) {
    console.error("Error fetching ulasan helpdesk:", error);
  }
};

export default getUlasanHelpdesk;
