import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FileText,
  Users,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminContext } from "../context/AdminContext";
import { PICContext } from "../context/PICContext";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { SidebarContext } from "../context/SidebarContext";
import { DarkModeContext } from "../context/DarkModeContext";

const socket = io("http://localhost:3500");

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { pToken } = useContext(PICContext);
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const { darkMode } = useContext(DarkModeContext);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [adminBubbleCount, setAdminBubbleCount] = useState(0);
  const [picBubbleCount, setPicBubbleCount] = useState(0);

  // Gunakan warna yang netral untuk dark mode
  const sidebarBg = darkMode
    ? "bg-slate-800 border-r border-slate-700"
    : "bg-blue-800";
  const sidebarText = darkMode ? "text-gray-100" : "text-white";
  // activeLinkClass tetap untuk latar belakang link aktif
  const activeLinkClass = darkMode ? "bg-gray-800" : "bg-blue-500";
  // Tambahkan left border pada link aktif agar highlight tetap muncul meskipun sidebar di-collapse
  const persistentHighlight = "border-l-4 border-amber-500";
  const hoverLinkClass = "hover:bg-gray-700";
  const activePressClass = darkMode
    ? "active:bg-slate-700 focus:bg-slate-700"
    : "active:bg-blue-600 focus:bg-blue-600";

  useEffect(() => {
    if (aToken) {
      socket.on("newForm", () => {
        setAdminBubbleCount(prev => prev + 1);
      });
      return () => {
        socket.off("newForm");
      };
    }
  }, [aToken]);

  useEffect(() => {
    if (pToken) {
      const decodedToken = jwtDecode(pToken);
      const picId = decodedToken.id;
      socket.emit("joinRoom", `pic_${picId}`);
      socket.on("formUpdated", () => {
        setPicBubbleCount(prev => prev + 1);
      });
      return () => {
        socket.off("formUpdated");
      };
    }
  }, [pToken]);

  const resetAdminBubble = () => {
    setAdminBubbleCount(0);
  };

  const resetPicBubble = () => {
    setPicBubbleCount(0);
  };

  // Fungsi helper untuk menghasilkan kelas NavLink
  const navLinkClasses = ({ isActive }) =>
    `flex items-center p-3 rounded-md text-left w-full transition-colors duration-200 ${
      isActive ? `${activeLinkClass} ${persistentHighlight}` : hoverLinkClass
    } ${activePressClass}`;

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] ${sidebarBg} ${sidebarText} flex flex-col py-5 z-10 shadow-lg overflow-y-auto transition-colors duration-500 ${
        isSidebarOpen ? "sm:w-48" : "sm:w-16"
      }`}>
      {/* Tombol toggle */}
      <div className="flex justify-end px-2">
        <button onClick={toggleSidebar} className="focus:outline-none">
          {isSidebarOpen ? (
            <ChevronLeft size={24} className={sidebarText} />
          ) : (
            <ChevronRight size={24} className={sidebarText} />
          )}
        </button>
      </div>
      <nav className="flex flex-col space-y-4 pt-4 px-2">
        {aToken ? (
          <>
            <NavLink
              to="/dashboard"
              onClick={resetAdminBubble}
              className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <Home size={24} />
                  {isSidebarOpen && (
                    <>
                      <span className="ml-3">Dashboard</span>
                      {!isActive && adminBubbleCount > 0 && (
                        <span className="ml-auto bg-red-500 rounded-full px-2 py-1 text-xs">
                          {adminBubbleCount}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/form"
              onClick={resetAdminBubble}
              className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <FileText size={24} />
                  {isSidebarOpen && (
                    <>
                      <span className="ml-3">All Formulir</span>
                      {!isActive && adminBubbleCount > 0 && (
                        <span className="ml-auto bg-red-500 rounded-full px-2 py-1 text-xs">
                          {adminBubbleCount}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>

            <div>
              <button
                onClick={() => setIsManagementOpen(!isManagementOpen)}
                className={`flex items-center p-3 rounded-md w-full text-left transition-colors duration-200 ${hoverLinkClass} ${activePressClass}`}>
                <Users size={24} />
                {isSidebarOpen && (
                  <>
                    <span className="hidden md:block ml-3">Manajemen</span>
                    {isManagementOpen ? (
                      <ChevronUp className="ml-auto" />
                    ) : (
                      <ChevronDown className="ml-auto" />
                    )}
                  </>
                )}
              </button>
              {isManagementOpen && isSidebarOpen && (
                <div className="ml-6 flex flex-col space-y-2">
                  <NavLink
                    to="/user-lists"
                    onClick={resetAdminBubble}
                    className={navLinkClasses}>
                    <span className="ml-3">User Lists</span>
                  </NavLink>
                  <NavLink
                    to="/layanan"
                    onClick={resetAdminBubble}
                    className={navLinkClasses}>
                    <span className="ml-3">Layanan</span>
                  </NavLink>
                  <NavLink
                    to="/data-formulir"
                    onClick={resetAdminBubble}
                    className={navLinkClasses}>
                    <span className="ml-3">Data Statistik</span>
                  </NavLink>
                  <NavLink
                    to="/ulasan-pengguna"
                    onClick={resetAdminBubble}
                    className={navLinkClasses}>
                    <span className="ml-3">Ulasan Pengguna</span>
                  </NavLink>
                  <NavLink
                    to="/ulasan-pic"
                    onClick={resetAdminBubble}
                    className={navLinkClasses}>
                    <span className="ml-3">Ulasan PIC</span>
                  </NavLink>
                </div>
              )}
            </div>
          </>
        ) : pToken ? (
          <>
            <NavLink
              to="/dashboard-pic"
              onClick={resetPicBubble}
              className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <Home size={24} />
                  {isSidebarOpen && (
                    <>
                      <span className="ml-3">Dashboard PIC</span>
                      {!isActive && picBubbleCount > 0 && (
                        <span className="ml-auto bg-red-500 rounded-full px-2 py-1 text-xs">
                          {picBubbleCount}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/formulir-pic"
              onClick={resetPicBubble}
              className={navLinkClasses}>
              {({ isActive }) => (
                <>
                  <FileText size={24} />
                  {isSidebarOpen && (
                    <>
                      <span className="ml-3">Formulir PIC</span>
                      {!isActive && picBubbleCount > 0 && (
                        <span className="ml-auto bg-red-500 rounded-full px-2 py-1 text-xs">
                          {picBubbleCount}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          </>
        ) : null}
      </nav>
    </div>
  );
};

export default Sidebar;
