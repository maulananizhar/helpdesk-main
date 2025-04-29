import { useEffect } from "react"; // Mengimpor useEffect dari react
import { useNavigate, useParams } from "react-router-dom"; // Mengimpor useNavigate dan useParams dari react-router-dom

import LogoOriVertical from "../assets/logo_ori_vertical.webp"; // Mengimpor LogoOriVertical dari assets
import verifyUser from "../libs/verifyUser"; // Mengimpor verifyUser dari libs

const AccountVerify = () => {
  // // Mendapatkan token dari URL
  const params = useParams();
  const token = params.token;

  // Mendapatkan navigate dari react-router-dom
  const navigate = useNavigate();

  // Menggunakan useEffect untuk mengarahkan pengguna setelah 3 detik
  setTimeout(() => {
    navigate("/user/login");
  }, 3000);

  // Menggunakan useEffect untuk memverifikasi token saat komponen dimuat
  useEffect(() => {
    verifyUser(token);
  }, []);

  return (
    <>
      <div className="container">
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <img
            src={LogoOriVertical}
            alt="Logo Ombudsman Republik Indonesia"
            className="w-60 mb-8 mt-auto"
          />
          <p className="text-lg font-medium mb-2">Mohon tunggu</p>
          <p className="">Akun anda sedang dalam proses verifikasi</p>
          <p className="">Halaman akan segera diarahkan ke halaman login...</p>
          <p className="text-xs text-gray-500 mt-auto mb-2">
            {" "}
            &copy; 2025. Biro HMTI Ombudsman Republik Indonesia. All rights
            reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default AccountVerify;
