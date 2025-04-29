import { TextField } from "@mui/material"; // Mengimpor TextField dari MUI
import { useState, useEffect } from "react"; // // Mengimpor useState dan useEffect dari React
import { toast } from "react-toastify"; // Mengimpor toast dari react-toastify
import { useNavigate } from "react-router-dom"; // Mengimpor useNavigate dari react-router-dom

import LogoOriVertical from "../assets/logo_ori_vertical.webp"; // Mengimpor logo dari direktori aset
import verifyToken from "../libs/VerifyToken"; // Mengimpor fungsi untuk memverifikasi token
import loginHandler from "../libs/loginHandler"; // Mengimpor fungsi untuk menangani login

const LoginPage = () => {
  //  Menggunakan useNavigate untuk navigasi antar halaman
  const navigate = useNavigate();
  //  Menggunakan useState untuk mengelola state loading dan authData
  const [loading, setLoading] = useState(true);
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
  });

  // Menggunakan useEffect untuk memverifikasi token saat komponen dimuat
  useEffect(() => {
    verifyToken(navigate, toast, setLoading, "/user/dashboard", "/user/login");
  }, []);

  if (loading) {
    return <></>;
  }

  return (
    <>
      <div className="container flex lg:flex-row flex-col lg:h-screen lg:my-0 my-16 justify-center items-center gap-20 xl:px-40 md:px-20 px-10">
        <div className="lg:w-1/3 w-full flex justify-center">
          <a href="/">
            <img
              src={LogoOriVertical}
              alt="Logo Ombudsman Republik Indonesia"
              className="lg:w-80 md:w-60 w-40"
            />
          </a>
        </div>
        <div className="lg:w-1/2 w-full flex flex-col lg:items-start items-center justify-center">
          <p className="text-2xl font-medium lg:text-left text-center">
            Selamat Datang Kembali
          </p>
          <p className="lg:text-left text-center">
            Masuk ke akun Anda untuk melanjutkan layanan.
          </p>
          <form
            onSubmit={e =>
              loginHandler(
                e,
                authData.email,
                authData.password,
                navigate,
                toast
              )
            }>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={authData.email}
              onChange={e =>
                setAuthData({ ...authData, email: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Kata sandi"
              type="password"
              value={authData.password}
              onChange={e =>
                setAuthData({ ...authData, password: e.target.value })
              }
              margin="normal"
            />
            <a href="/user/lupa-sandi" className="hover:underline">
              Lupa kata sandi?
            </a>
            <button
              type="submit"
              className="uppercase font-medium text-lg w-full bg-primary text-white rounded-lg py-4 mt-2 hover:cursor-pointer">
              Masuk
            </button>
          </form>
          <div className="flex justify-center mt-4 mx-auto">
            <a
              href="/admin/login"
              className="text-center font-medium hover:underline">
              Login sebagai Admin
            </a>
          </div>
          <div className="flex justify-center mt-2 mx-auto">
            <a href="/user/register" className="text-center hover:underline">
              Belum punya akun? Silakan daftar di sini.
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
