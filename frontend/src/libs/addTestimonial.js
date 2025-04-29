import axios from "axios"; // Import axios untuk melakukan HTTP request
import { toast } from "react-toastify"; // // Import toastify untuk menampilkan notifikasi

// Mendapatkan URL backend dari env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Fungsi untuk menambahkan testimonial
const addTestimonial = async (
  ticket,
  idUser,
  testimonialHelpdesk,
  ratingHelpdesk,
  testimonialPIC,
  ratingPIC
) => {
  try {
    // Melakukan POST request ke endpoint untuk menambahkan testimonial
    const response = await axios.post(
      `${backendUrl}/user/add-testimonial`,
      {
        ticket: ticket,
        id_user: idUser,
        testimonial_helpdesk: testimonialHelpdesk,
        rating_helpdesk: ratingHelpdesk,
        testimonial_pic: testimonialPIC,
        rating_pic: ratingPIC,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("uToken")}`,
        },
      }
    );
    toast.success(response.data.message);
  } catch (error) {
    toast.error(error.response.data.message);
  }
};

export default addTestimonial;
