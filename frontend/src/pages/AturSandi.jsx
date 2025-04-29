import { TextField } from "@mui/material"; // Mengimpor TextField dari MUI
import { useState } from "react"; // Mengimpor useState dari react
import { toast } from "react-toastify"; // Mengimpor toast dari react-toastify
import { useNavigate, useParams } from "react-router-dom"; // Mengimpor useNavigate dan useParams dari react-router-dom

import LogoOriVertical from "../assets/logo_ori_vertical.webp"; // Mengimpor gambar logo dari assets
import resetPassword from "../libs/resetPassword"; // Mengimpor fungsi resetPassword dari libs

const AturSandi = () => {
  // Mendapatkan token dari URL
  const params = useParams();
  const token = params.token;

  // Menggunakan useNavigate untuk navigasi
  const navigate = useNavigate();

  // Menggunakan useState untuk mengelola state authData
  const [authData, setAuthData] = useState({
    password: "",
    confirmPassword: "",
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
            Mengatur Ulang Kata Sandi
          </p>
          <p className="lg:text-left text-center">
            Silakan masukkan kata sandi baru Anda untuk melanjutkan.
          </p>
          <form
            onSubmit={e =>
              resetPassword(
                e,
                token,
                authData.password,
                authData.confirmPassword,
                navigate,
                toast
              )
            }>
            <TextField
              fullWidth
              label="Kata Sandi"
              type="password"
              value={authData.password}
              onChange={e =>
                setAuthData({ ...authData, password: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Konfirmasi Kata Sandi"
              type="password"
              value={authData.confirmPassword}
              onChange={e =>
                setAuthData({ ...authData, confirmPassword: e.target.value })
              }
              margin="normal"
            />
            <button
              type="submit"
              className="uppercase font-medium text-lg w-full bg-primary text-white rounded-lg py-4 mt-2 hover:cursor-pointer">
              Perbarui Kata Sandi
            </button>
          </form>
          <div className="flex justify-center mt-2 mx-auto">
            <a href="/user/login" className="text-center hover:underline">
              Ingat kata sandi? Silakan masuk di sini.
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AturSandi;
