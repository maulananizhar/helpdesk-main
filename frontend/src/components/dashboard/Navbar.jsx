import PropTypes from "prop-types"; // Import PropTypes untuk validasi props
import { useState } from "react"; // Import useState untuk mengelola state
import { Link, useNavigate } from "react-router-dom"; // Import Link dan useNavigate untuk navigasi

import LogoOri from "../../assets/logo_ori.png"; // Import logo Ombudsman
import logoutHandler from "../../libs/logoutHandler"; // Import logoutHandler untuk menangani logout

const Navbar = props => {
  // Menggunakan useNavigate untuk navigasi
  const navigate = useNavigate();

  // Menggunakan useState untuk mengelola state open
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col bg-white h-screen overflow-y-clip">
        <div className="bg-white items-center justify-start px-4 py-4 md:px-6 lg:px-8 sticky top-0 shadow-md z-50 md:flex hidden">
          <img
            src={LogoOri}
            alt="Logo Ombudsman Republik Indonesia"
            className="h-10"
          />
          <p className="ml-4 text-xl font-bold">Dashboard Pengguna</p>
          <Link
            to="/user/login"
            className="ml-auto bg-red-600 px-3 py-2 rounded-lg font-medium text-white"
            onClick={() => logoutHandler(navigate)}>
            Keluar
          </Link>
        </div>
        <div className="flex sticky z-30">
          {/* Hamburger menu */}
          <div
            className={`fixed top-0 left-0 w-full h-screen bg-black opacity-40 z-[999] ${
              open ? "block" : "hidden"
            }`}
            onClick={() => setOpen(false)}></div>
          {/* Hamburger menu */}
          <div
            className={`fixed top-0 left-0 w-max p-6 h-screen bg-primary text-white z-[999] transition-transform duration-300 ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}>
            <div className="flex flex-col space-y-8 mt-20 font-medium">
              <hr />
              <Link to="/user/dashboard" onClick={() => setOpen(false)}>
                Beranda
              </Link>
              <Link
                to="/user/dashboard/permintaan-saya"
                onClick={() => setOpen(false)}>
                Permintaan Saya
              </Link>
              <Link
                to="/user/dashboard/buat-permintaan"
                onClick={() => setOpen(false)}>
                Buat Permintaan
              </Link>
              <hr />
              <Link
                to="/user/login"
                className="mt-auto"
                onClick={() => logoutHandler(navigate)}>
                Keluar
              </Link>
              <hr />
            </div>
          </div>
          <nav className="w-max bg-primary md:flex hidden flex-col z-50">
            <div className="p-6 text-white font-normal h-max flex flex-col gap-6">
              <Link to="/user/dashboard" className="hover:underline">
                Beranda
              </Link>
              <Link
                to="/user/dashboard/permintaan-saya"
                className="hover:underline flex items-center">
                Permintaan Saya
              </Link>
              <Link
                to="/user/dashboard/buat-permintaan"
                className="hover:underline flex items-center">
                Buat Permintaan
              </Link>
            </div>
          </nav>
          <nav className="w-screen bg-white md:hidden flex justify-between items-center px-2 py-2 fixed top-0 left-0 z-[1000] shadow-lg">
            <button
              onClick={() => setOpen(!open)}
              className="relative w-8 h-8 md:hidden flex items-center justify-center">
              {/* Garis wrapper */}
              <div className="relative w-6 h-6">
                {/* Garis 1 */}
                <span
                  className={`absolute top-1/2 left-0 w-full h-[2px] bg-black transform transition-all duration-300 ease-in-out 
          ${open ? "rotate-45 translate-y-0" : "-translate-y-2"}`}
                />
                {/* Garis 2 */}
                <span
                  className={`absolute top-1/2 left-0 w-full h-[2px] bg-black transform transition-all duration-300 ease-in-out 
          ${open ? "opacity-0" : "translate-y-0"}`}
                />
                {/* Garis 3 */}
                <span
                  className={`absolute top-1/2 left-0 w-full h-[2px] bg-black transform transition-all duration-300 ease-in-out 
          ${open ? "-rotate-45 translate-y-0" : "translate-y-2"}`}
                />
              </div>
            </button>
            <div className="text-white uppercase font-medium text-center py-2">
              <img
                src={LogoOri}
                alt="Logo Ombudsman Republik Indonesia"
                className="h-10"
              />
            </div>
            <div className="h-8 w-8"></div>
          </nav>
          {props.children}
        </div>
      </div>
    </>
  );
};

// PropTypes untuk validasi props
Navbar.propTypes = {
  children: PropTypes.element.isRequired,
};

export default Navbar;
