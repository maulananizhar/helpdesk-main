import { TextField } from "@mui/material"; // Mengimpor TextField dari MUI
import { useState } from "react"; // // Mengimpor useState dari React
import { toast } from "react-toastify"; // Mengimpor toast dari react-toastify
import { useNavigate } from "react-router-dom"; // Mengimpor useNavigate dari react-router-dom

import LogoOriVertical from "../assets/logo_ori_vertical.webp"; // Mengimpor logo dari direktori aset
import sendResetPasswordEmail from "../libs/sendResetPasswordEmail"; // Mengimpor fungsi untuk mengirim email reset kata sandi

const LupaSandi = () => {
  //  Menggunakan useNavigate untuk navigasi antar halaman
  const navigate = useNavigate();

  // Menggunakan useState untuk mengelola state email
  const [authData, setAuthData] = useState({
    email: "",
  });

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
            Lupa Kata Sandi
          </p>
          <p className="lg:text-left text-center">
            Silakan masukkan email Anda untuk mengatur ulang kata sandi Anda.
          </p>
          <form
            onSubmit={e =>
              sendResetPasswordEmail(e, authData.email, navigate, toast)
            }
            className="w-full my-4">
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
            <button
              type="submit"
              className="uppercase font-medium text-lg w-full bg-primary text-white rounded-lg py-4 mt-2 hover:cursor-pointer">
              Kirim Email
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

export default LupaSandi;
