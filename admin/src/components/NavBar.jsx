import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { PICContext } from "../context/PICContext";
import { DarkModeContext } from "../context/DarkModeContext";
import { toast } from "react-toastify";
import Logo from "../assets/logo_ori.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { aToken, setAToken } = useContext(AdminContext);
  const { pToken, setPToken } = useContext(PICContext);
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  const logout = () => {
    if (!window.confirm("Apakah Anda yakin ingin logout?")) return;
    localStorage.removeItem("aToken");
    setAToken("");
    localStorage.removeItem("pToken");
    setPToken("");
    toast.success("Berhasil logout!");
    navigate("/");
  };

  return (
    <div className="fixed top-0 left-0 min-w-screen h-16 bg-white dark:bg-gray-800 shadow-md flex items-center px-5 z-20 justify-between">
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="h-8 w-auto mr-2" />
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
          {aToken ? "Admin Panel" : "PIC Panel"}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Dark Mode Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* Logout Button */}
        {(aToken || pToken) && (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-red-700 transition cursor-pointer text-sm sm:text-base">
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
