import { useEffect, useState } from "react";
import axios from "axios";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { toast } from "react-toastify";
import Logo from "../assets/logo_ori.png";

// Import komponen Material UI (MUI)
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import verifyToken from "../libs/VerifyToken";
import { jwtDecode } from "jwt-decode";

// Tipe file yang diizinkan
const allowedTypes = ["application/pdf", "video/mp4"];

const FormulirContent = () => {
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
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #2563eb, #d97706)",
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Box sx={{ width: "100%", maxWidth: 1100 }}>
        <Grid container spacing={0} sx={{ boxShadow: 3 }}>
          {/* Kotak Informasi */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                backgroundColor: "#bfdbfe", // mirip bg-blue-200
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                height: "100%",
              }}>
              <CardContent sx={{ p: 6, textAlign: "center" }}>
                <Box
                  component="img"
                  src={Logo}
                  alt="Logo"
                  sx={{ width: "60%", mb: 3 }}
                />
                <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                  HelpDesk HMTI
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  NotiALaHuTi adalah aplikasi untuk pengelolaan permintaan
                  layanan pada Biro Hubungan Masyarakat dan Teknologi Informasi.
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2, lineHeight: 1.7 }}>
                  Pengguna akan mendapatkan notifikasi melalui email mengenai
                  proses formulir yang diajukan.
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 3 }}>
                  Biro Humas dan TI @ 2021
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Kotak Formulir */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                backgroundColor: "#fff",
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                height: "100%",
              }}>
              <CardContent sx={{ p: 6 }}>
                <Typography variant="h5" align="center" gutterBottom>
                  Formulir Pelayanan
                </Typography>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  noValidate
                  sx={{ mt: 2 }}>
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
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}>
                    Submit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

const Formulir = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_KEY}>
      <FormulirContent />
    </GoogleReCaptchaProvider>
  );
};

export default Formulir;
