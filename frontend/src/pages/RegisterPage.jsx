import { Autocomplete, TextField } from "@mui/material"; // Mengimpor TextField dari MUI
import { useEffect, useState } from "react"; // // Mengimpor useEffect dan useState dari React
import { useNavigate } from "react-router-dom"; // // Mengimpor useNavigate dari React Router DOM
import { toast } from "react-toastify"; // Mengimport toast dari react-toastify

import LogoOriVertical from "../assets/logo_ori_vertical.webp"; // // Mengimpor logo dari direktori aset
import registerHandler from "../libs/registerHandler"; // Mengimpor fungsi registerHandler dari libs/registerHandler
import verifyToken from "../libs/VerifyToken"; // Mengimpor fungsi verifyToken dari libs/VerifyToken

// Option untuk Autocomplete unit
const unitOptions = [
  "HMTI",
  "HKO",
  "KU1",
  "KU2",
  "KU3",
  "KU4",
  "KU5",
  "KU6",
  "KU7",
];

const RegisterPage = () => {
  // Mendapatkan instance dari useNavigate untuk navigasi
  const navigate = useNavigate();

  // Mendefinisikan state untuk menyimpan data autentikasi
  const [loading, setLoading] = useState(true);
  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    unit: "",
    password: "",
    confirmPassword: "",
  });

  // Memverifikasi token saat komponen pertama kali dimuat
  useEffect(() => {
    verifyToken(
      navigate,
      toast,
      setLoading,
      "/user/dashboard",
      "/user/register"
    );
  }, []);

  // Jika loading true, tampilkan komponen kosong
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
            Buat Akun
          </p>
          <p className="lg:text-left text-center">
            Silahkan isi formulir untuk membuat akun baru.
          </p>
          <form
            className="flex flex-col w-full"
            onSubmit={e =>
              registerHandler(
                e,
                authData.name,
                authData.email,
                authData.unit,
                authData.password,
                authData.confirmPassword,
                navigate,
                toast
              )
            }>
            <TextField
              fullWidth
              label="Nama"
              type="text"
              value={authData.name}
              onChange={e => setAuthData({ ...authData, name: e.target.value })}
              margin="normal"
            />
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
            <Autocomplete
              disablePortal
              fullWidth
              options={unitOptions}
              renderInput={params => <TextField {...params} label="Unit" />}
              onChange={(event, newValue) => {
                setAuthData({ ...authData, unit: newValue });
              }}
              value={authData.unit}
              margin="normal"
              className="mt-3 mb-1"
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
              Daftar
            </button>
          </form>
          <div className="flex justify-center mt-4 mx-auto">
            <a href="/user/login" className="text-center hover:underline">
              Sudah punya akun? Silakan masuk di sini.
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
