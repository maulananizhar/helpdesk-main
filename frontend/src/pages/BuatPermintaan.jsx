import Navbar from "../components/dashboard/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { toast } from "react-toastify";

// Import komponen Material UI (MUI)
import { Typography, TextField, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import verifyToken from "../libs/VerifyToken";
import { jwtDecode } from "jwt-decode";

// Tipe file yang diizinkan
const allowedTypes = [
  "application/pdf",
  "video/mp4",
  "image/jpeg",
  "image/png",
];

const BuatPermintaan = () => {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [unit, setUnit] = useState(null);
  const [layanan, setLayanan] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("uToken")) {
      setUser(jwtDecode(localStorage.getItem("uToken")));
    }

    verifyToken(
      navigate,
      toast,
      setLoading,
      "/user/dashboard/buat-permintaan",
      "/user/login"
    );
  }, []);

  useEffect(() => {
    if (user) {
      setNama(user.name);
      setEmail(user.email);
      setUnit(user.unit);
    }
  }, [user]);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Tipe file tidak diizinkan!");
        e.target.value = null;
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!nama || !email || !unit || !layanan) {
      toast.error("Silakan lengkapi semua bidang!");
      return;
    }
    if (!executeRecaptcha) {
      toast.error("Recaptcha belum siap, silakan coba lagi!");
      return;
    }

    const token = await executeRecaptcha("submit");

    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("email", email);
    formData.append("unit", unit); // Mengirim value dari unit yang dipilih
    formData.append("layanan", layanan);
    formData.append("token", token);
    formData.append("document", file);

    try {
      const { data } = await axios.post(
        "http://localhost:3500/user/formulir",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Berhasil Mengirim!");
      setNama("");
      setEmail("");
      setUnit("");
      setLayanan("");
      setFile(null);
      console.log(data.message);
      await navigate("/user/dashboard/permintaan-saya");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan, silakan coba lagi!";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <></>;
  }
  return (
    <Navbar>
      <div className="grow bg-white h-screen flex flex-col justify-start p-6 overflow-y-auto md:mt-0 mt-16">
        <div className="flex justify-between items-center mb-8">
          <p className="text-2xl font-bold">Buat Permintaan</p>
          <Link to="#" className="flex items-center">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-12 h-12 rounded-full border-2 border-primary"
            />
          </Link>
        </div>
        <form className="flex flex-col lg:w-2/3" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            disabled
            value={user?.email}
            onChange={e => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Nama"
            type="text"
            disabled
            value={user?.name}
            onChange={e => setNama(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Unit"
            type="text"
            disabled
            value={user?.unit}
            onChange={e => setUnit(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Permintaan Layanan"
            multiline
            rows={4}
            value={layanan}
            onChange={e => setLayanan(e.target.value)}
            margin="normal"
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2, mb: 1 }}>
            Upload Dokumen (opsional)
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {/* Tampilkan nama file jika ada */}
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              File terpilih: {file.name}
            </Typography>
          )}
          <button
            onClick={handleSubmit}
            type="submit"
            className="text-lg font-medium bg-primary text-white rounded-lg px-4 py-2 mt-4 mb-16 hover:bg-primary-hover transition duration-300 ease-in-out w-full cursor-pointer">
            Submit
          </button>
        </form>
      </div>
    </Navbar>
  );
};

const BuatPermintaanWrapper = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_KEY}>
      <BuatPermintaan />
    </GoogleReCaptchaProvider>
  );
};

export default BuatPermintaanWrapper;
