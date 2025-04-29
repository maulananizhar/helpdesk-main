import PropTypes from "prop-types"; // Import PropTypes untuk validasi props
import { useState } from "react"; // Import useState untuk mengelola state
import { Link, useNavigate } from "react-router-dom"; // Import Link dan useNavigate untuk navigasi

import logoutHandler from "../../libs/logoutHandler"; // Import logoutHandler untuk menangani logout

const Navbar = props => {
  // Menggunakan useNavigate untuk navigasi
  const navigate = useNavigate();

  // Menggunakan useState untuk mengelola state open
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-black opacity-40 z-40 ${
          open ? "block" : "hidden"
        }`}
        onClick={() => setOpen(false)}></div>
      {/* Hamburger menu */}
      <div
        className={`fixed top-0 left-0 w-max p-6 h-screen bg-primary text-white z-50 transition-transform duration-300 ${
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
          <hr />
          <Link
            to="/user/dashboard/notifikasi"
            className="mt-auto"
            onClick={() => logoutHandler(navigate)}>
            Keluar
          </Link>
          <hr />
        </div>
      </div>
      <div className="bg-white">
        <div className="flex">
          <nav className="w-max bg-primary h-screen md:flex hidden flex-col sticky top-0">
            <div className="bg-[#67a5e1] p-6 text-white uppercase font-medium">
              <p>Helpdesk</p>
              <p>Ombudsman RI</p>
            </div>
            <div className="p-6 text-white font-normal h-full flex flex-col gap-6">
              <Link to="/user/dashboard" className="hover:underline">
                Beranda
              </Link>
              <Link
                to="/user/dashboard/permintaan-saya"
                className="hover:underline flex items-center">
                Permintaan Saya
              </Link>
              <Link
                to="/user/login"
                className="hover:underline mt-auto"
                onClick={() => logoutHandler(navigate)}>
                Keluar
              </Link>
            </div>
          </nav>
          <nav className="w-screen bg-[#67a5e1] md:hidden flex justify-between items-center px-2 py-2 fixed top-0 left-0 z-50 shadow-lg">
            <button
              onClick={() => setOpen(!open)}
              className="relative w-8 h-8 md:hidden flex items-center justify-center">
              {/* Garis wrapper */}
              <div className="relative w-6 h-6">
                {/* Garis 1 */}
                <span
                  className={`absolute top-1/2 left-0 w-full h-[2px] bg-white transform transition-all duration-300 ease-in-out 
          ${open ? "rotate-45 translate-y-0" : "-translate-y-2"}`}
                />
                {/* Garis 2 */}
                <span
                  className={`absolute top-1/2 left-0 w-full h-[2px] bg-white transform transition-all duration-300 ease-in-out 
          ${open ? "opacity-0" : "translate-y-0"}`}
                />
                {/* Garis 3 */}
                <span
                  className={`absolute top-1/2 left-0 w-full h-[2px] bg-white transform transition-all duration-300 ease-in-out 
          ${open ? "-rotate-45 translate-y-0" : "translate-y-2"}`}
                />
              </div>
            </button>
            <div className="text-white uppercase font-medium text-center">
              <p>Helpdesk</p>
              <p>Ombudsman RI</p>
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
