import { useState, useEffect } from "react";

import {
  MdAppRegistration,
  MdMarkunread,
  MdLogin,
  MdOutlineArticle,
  MdOutlineSettings,
  MdFeed,
  MdCall,
} from "react-icons/md";
import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import LogoOri from "../assets/logo_ori.png";
import Consultant from "../assets/consultant.webp";
import NavigationDesktop from "../components/beranda/NavigationDesktop";
import CaraKerjaCard from "../components/beranda/CaraKerjaCard";
import AccordionItem from "../components/beranda/AccordionItem";
import countForm from "../libs/countForm";

const Beranda = () => {
  // Membuat state `isScrolled` untuk mengatur status scroll
  const [isScrolled, setIsScrolled] = useState(false);
  // Membuat state `open` untuk mengatur status menu hamburger
  const [open, setOpen] = useState(false);

  // Membuat state `count` untuk menyimpan jumlah formulir
  const [count, setCount] = useState(0);

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

    // Mengambil jumlah formulir dari API
    countForm().then(data => {
      setCount(data.count);
    });

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
            {/* <a href="/user/register" className="flex">
              <div className="bg-primary text-white px-4 py-2 rounded-lg">
                Daftar
              </div>
            </a> */}
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
        <div className="container mx-auto flex justify-between items-center py-4 xl:px-14 px-4 text-base">
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
          <div className="lg:w-1/3 w-fit">
            <img
              src={LogoOri}
              alt="Logo Ombudsman Republik Indonesia"
              className="sm:w-64 w-32"
            />
          </div>
          <div className="sm:hidden w-8 h-8"></div>
          <div className="lg:flex lg:w-1/3 w-fit hidden space-x-16 font-medium justify-center">
            <NavigationDesktop href="#beranda" text="Beranda" />
            <NavigationDesktop href="#cara-kerja" text="Cara Kerja" />
            <NavigationDesktop href="#faq" text="FAQ" />
          </div>
          <div className="sm:flex lg:w-1/3 w-fit hidden space-x-4 justify-end">
            <a
              href="/user/login"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors duration-300">
              Masuk
            </a>
            {/* <a
              href="/user/register"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors duration-300">
              Daftar
            </a> */}
          </div>
        </div>
      </nav>
      <div id="beranda" className="bg-secondary scroll-m-96">
        <div className="container mx-auto px-14 py-8 sm:mt-20 mt-16 flex md:flex-row flex-col-reverse items-center md:justify-between justify-center font-medium">
          <div className="flex flex-col items-start justify-between">
            <p className="text-4xl font-bold">
              Helpdesk Ombudsman <br /> Republik Indonesia
            </p>
            <p className="text-2xl mb-4">Layanan Cepat & Transparan</p>
            <p className="text-base opacity-40 mb-10 max-w-lg">
              Helpdesk Ombudsman merupakan aplikasi untuk pengelolaan permintaan
              layanan pada Biro Hubungan Masyarakat dan Teknologi Informasi.
              Pengguna akan mendapatkan notifikasi melalui email mengenai proses
              formulir yang diajukan.
            </p>
            <a href="/user/dashboard">
              <div className="bg-primary text-white px-4 py-2 rounded-lg">
                Ajukan Permintaan
              </div>
            </a>
          </div>
          <div>
            <img src={Consultant} alt="Consultant" className="w-96" />
          </div>
        </div>
      </div>
      <div id="cara-kerja" className="bg-white scroll-m-32">
        <div className="container lg:px-14 px-4 my-8 flex flex-col justify-center font-medium">
          <p className="text-2xl text-center">Bagaimana Cara Kerjanya?</p>
          <div className="flex flex-wrap justify-center items-stretch mt-6 text-center space-y-8">
            <CaraKerjaCard
              title="Registrasi"
              desc="Jika belum memiliki akun registrasi terlebih dahulu"
              icon={<MdAppRegistration className="w-16 h-16 text-primary" />}
            />
            <CaraKerjaCard
              title="Verifikasi Email"
              desc="Dapatkan notifikasi via email"
              icon={<MdMarkunread className="w-16 h-16 text-primary" />}
            />
            <CaraKerjaCard
              title="Autentikasi"
              desc="Melakukan autentikasi untuk masuk ke halaman formulir"
              icon={<MdLogin className="w-16 h-16 text-primary" />}
            />
            <CaraKerjaCard
              title="Isi Formulir"
              desc="Lengkapi data & pemintaan"
              icon={<MdOutlineArticle className="w-16 h-16 text-primary" />}
            />
            <CaraKerjaCard
              title="Proses Layanan"
              desc="Permintaan diproses oleh Tim HMTI"
              icon={<MdOutlineSettings className="w-16 h-16 text-primary" />}
            />
            <CaraKerjaCard
              title="Tindak Lanjut"
              desc="Hasil disampaikan kepada pemohon"
              icon={<MdFeed className="w-16 h-16 text-primary" />}
            />
          </div>
        </div>
      </div>
      <div className="bg-secondary scroll-m-32 py-6">
        <div className="container lg:px-14 px-4 my-8 flex flex-col justify-center font-medium">
          <p className="text-3xl font-extrabold text-center uppercase">
            Jumlah Laporan Yang Masuk
          </p>
          <p className="text-8xl font-extrabold text-center uppercase mt-6">
            {count.toLocaleString("en-US")}
          </p>
        </div>
      </div>
      <div id="faq" className="bg-white scroll-m-32">
        <div className="container lg:px-14 px-4 my-8 flex flex-col justify-center font-medium md:w-2/3 w-full">
          <p className="text-2xl text-center mb-6">Pertanyaan Umum</p>
          <AccordionItem
            title="Apa itu Helpdesk Ombudsman Republik Indonesia?"
            content="Helpdesk Ombudsman Republik Indonesia adalah layanan yang disediakan oleh Ombudsman Republik Indonesia untuk membantu masyarakat dalam mengajukan permintaan layanan dan mendapatkan informasi terkait pelayanan publik."
          />
          <AccordionItem
            title="Bagaimana cara mendaftar?"
            content="Anda dapat mendaftar dengan mengisi formulir pendaftaran yang tersedia di situs web kami. Pastikan untuk mengisi semua informasi yang diperlukan."
          />
          <AccordionItem
            title="Apa yang harus saya lakukan jika lupa kata sandi?"
            content="Jika Anda lupa kata sandi, Anda dapat mengklik tautan 'Lupa Kata Sandi' di halaman masuk dan mengikuti petunjuk untuk mengatur ulang kata sandi Anda."
          />
          <AccordionItem
            title="Bagaimana cara mengajukan permintaan layanan?"
            content="Setelah mendaftar dan masuk, Anda dapat mengisi formulir permintaan layanan yang tersedia di dashboard Anda. Pastikan untuk memberikan informasi yang akurat dan lengkap."
          />
        </div>
      </div>
      <footer className="bg-secondary py-8 px-14">
        <div className="container lg:px-14 px-4 flex md:flex-row flex-col justify-evenly mx-auto">
          <div className="flex flex-col gap-2 md:text-left text-center">
            <p className="font-medium">Link Terkait</p>
            <a
              href="https://ombudsman.go.id/"
              target="_blank"
              className="text-sm hover:text-primary transition-colors duration-300">
              Ombudsman Republik Indonesia
            </a>
            <a
              href="https://jdih.ombudsman.go.id/"
              target="_blank"
              className="text-sm hover:text-primary transition-colors duration-300">
              JDIH Ombudsman RI
            </a>
            <a
              href="https://data.ombudsman.go.id/"
              target="_blank"
              className="text-sm hover:text-primary transition-colors duration-300">
              Portal Data Ombudsman RI
            </a>
          </div>
          <div className="flex flex-col gap-2 md:text-left text-center md:mt-0 mt-6 md:items-baseline items-center">
            <p className="font-medium">Kontak</p>
            <p className="text-sm font-medium">Kantor Pusat</p>
            <a
              href="https://maps.app.goo.gl/qPPPxdSs5hCSWkVc9"
              className="text-sm hover:text-primary transition-colors duration-300 w-64"
              target="_blank">
              Jl. HR. Rasuna Said Kav. C-19 Kuningan, Jakarta Selatan 12920
            </a>
            <div className="flex gap-2 items-center hover:text-primary transition-colors duration-300">
              <MdCall className="w-4 h-4" />
              <a href="tel:+622122513737" target="_blank" className="text-sm">
                (021) 2251 3737
              </a>
            </div>
            <div className="flex gap-2 items-center hover:text-primary transition-colors duration-300">
              <MdMarkunread className="w-4 h-4" />
              <a
                href="mailto:persuratan[at]ombudsman.go.id"
                target="_blank"
                className="text-sm">
                persuratan[at]ombudsman.go.id
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center md:mt-0 mt-6">
            <div>
              <img
                src={LogoOri}
                alt="Logo Ombudsman Republik Indonesia"
                className="w-56"
              />
            </div>
            <div className="flex gap-6 mt-8">
              <a href="https://www.facebook.com/OmbudsmanRI137" target="_blank">
                <FaFacebook className="w-7 h-7 hover:text-primary transition-colors duration-300" />
              </a>
              <a href="https://x.com/OmbudsmanRI137" target="_blank">
                <FaXTwitter className="w-7 h-7 hover:text-primary transition-colors duration-300" />
              </a>
              <a
                href="https://www.instagram.com/ombudsmanri137/"
                target="_blank">
                <FaInstagram className="w-7 h-7 hover:text-primary transition-colors duration-300" />
              </a>
              <a href="https://www.youtube.com/@OmbudsmanRI137" target="_blank">
                <FaYoutube className="w-7 h-7 hover:text-primary transition-colors duration-300" />
              </a>
            </div>
          </div>
        </div>
        <div className="container lg:px-14 mt-12 px-4 flex justify-evenly mx-auto">
          <p>
            &copy; 2025. Biro HMTI Ombudsman Republik Indonesia. All rights
            reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Beranda;
