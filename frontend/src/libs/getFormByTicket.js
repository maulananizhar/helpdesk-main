import axios from "axios"; // Import axios untuk melakukan HTTP request

// Mendapatkan URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// FUngsi untuk mendapatkan form berdasarkan tiket
const getFormByTicket = async ticket => {
  // Melakukan request POST ke endpoint untuk mendapatkan form berdasarkan tiket
  const response = await axios.post(
    `${backendUrl}/user/get-form`,
    { ticket },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("uToken")}`,
      },
    }
  );
  return response.data;
};

export default getFormByTicket;
