import { useEffect, useState } from "react"; // Mengimpor useEffect dan useState dari React

import NavigationDesktop from "../components/beranda/NavigationDesktop"; // Mengimpor komponen NavigationDesktop dari beranda
import LogoOri from "../assets/logo_ori.png"; // Mengimpor gambar logo dari assets

const NotFound = () => {
  // Membuat state `isScrolled` untuk mengatur status scroll
  const [isScrolled, setIsScrolled] = useState(false);
  // Membuat state `open` untuk mengatur status menu hamburger
  const [open, setOpen] = useState(false);

  // Fungsi untuk menangani scroll
  const handleScroll = () => {
    if (window.scrollY > 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  // Menambahkan event listener untuk scroll saat komponen dimount
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  //  Mengatur status scroll berdasarkan status menu hamburger
  useEffect(() => {
    if (open) {
      setIsScrolled(true);
    } else if (!open && window.scrollY === 0) {
      setIsScrolled(false);
    }
  }, [open]);
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
        className={`fixed top-0 left-0 w-2/3 h-screen bg-white z-50 p-4 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex flex-col space-y-8 mt-20 font-medium">
          <hr />
          <a href="#beranda" onClick={() => setOpen(false)}>
            Beranda
          </a>
          <a href="#cara-kerja" onClick={() => setOpen(false)}>
            Cara Kerja
          </a>
          <a href="#testimonial" onClick={() => setOpen(false)}>
            Testimonial
          </a>
          <a href="#faq" onClick={() => setOpen(false)}>
            FAQ
          </a>
          <hr />
          <div className="flex gap-4">
            <a href="/user/login" className="flex">
              <div className="bg-primary text-white px-4 py-2 rounded-lg">
                Masuk
              </div>
            </a>
            <a href="/user/register" className="flex">
              <div className="bg-primary text-white px-4 py-2 rounded-lg">
                Daftar
              </div>
            </a>
          </div>
          <hr />
        </div>
      </div>
      <nav
        className={`fixed top-0 left-0 w-full z-50
             ${
               isScrolled ? "bg-white shadow-lg" : "bg-white"
             } transition-all duration-300
          `}>
        <div
          className={`container mx-auto flex justify-between items-center py-4 xl:px-14 px-4 text-base`}>
          <button
            onClick={() => setOpen(!open)}
            className="relative w-8 h-8 sm:hidden flex items-center justify-center">
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
          <div className="">
            <img
              src={LogoOri}
              alt="Logo Ombudsman Republik Indonesia"
              className="sm:w-64 w-32"
            />
          </div>
          <div className="sm:hidden w-8 h-8"></div>
          <div className="lg:flex hidden space-x-16 font-medium">
            <NavigationDesktop href="#beranda" text="Beranda" />
            <NavigationDesktop href="#cara-kerja" text="Cara Kerja" />
            <NavigationDesktop href="#testimonial" text="Testimonial" />
            <NavigationDesktop href="#faq" text="FAQ" />
          </div>
          <div className="sm:flex hidden space-x-4">
            <a
              href="/user/login"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors duration-300">
              Masuk
            </a>
            <a
              href="/user/register"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors duration-300">
              Daftar
            </a>
          </div>
        </div>
      </nav>
      <div className="h-screen flex justify-center items-center flex-col">
        <p className="text-2xl font-medium">404 - Page Not Found</p>
        <p className="text-base text-center mt-2">
          Halaman yang Anda cari tidak ditemukan. Silakan kembali ke beranda
          untuk melanjutkan.
        </p>
        <a href="/" className="text-primary text-base hover:underline">
          Kembali ke Beranda
        </a>
      </div>
    </>
  );
};

export default NotFound;
