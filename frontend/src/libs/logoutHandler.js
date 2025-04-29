// Fungsi untuk logout pengguna dan mengarahkan ke halaman login
const logoutHandler = navigate => {
  // Menghapus token dari localStorage
  localStorage.removeItem("uToken");
  navigate("/user/login");
};

export default logoutHandler;
