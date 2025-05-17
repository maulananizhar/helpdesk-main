import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { PICContext } from "../context/PICContext";
import { toast } from "react-toastify";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
} from "@mui/material";
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha,
} from "react-google-recaptcha-v3"; // Mengimpor GoogleReCaptchaProvider dan GoogleReCaptcha dari react-google-recaptcha-v3

const Login = () => {
  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { setAToken } = useContext(AdminContext);
  const { setPToken } = useContext(PICContext);

  const navigate = useNavigate();

  // Menggunakan useState untuk mengelola state captcha
  const [captcha, setCaptcha] = useState(false);

  // Fungsi untuk menangani perubahan pada captcha
  const handleCaptchaChange = () => {
    setCaptcha(true);
  };

  const onSubmitHandler = async event => {
    event.preventDefault();
    setLoading(true);

    try {
      let response;
      if (role === "Admin") {
        response = await axios.post(`${backendUrl}/admin/login`, {
          email,
          password,
        });
      } else {
        response = await axios.post(`${backendUrl}/admin/pic/login`, {
          email,
          password,
        });
      }

      if (response.data.success) {
        toast.success("Berhasil Login!");
        if (role === "Admin") {
          setAToken(response.data.token);
          localStorage.setItem("aToken", response.data.token);
          navigate("/dashboard");
        } else {
          setPToken(response.data.token);
          localStorage.setItem("pToken", response.data.token);
          navigate("/formulir-pic");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(`Login gagal! ${error.response.data.message}`);
    }
    setLoading(false);
  };

  return (
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_KEY}>
      <Container
        maxWidth="sm"
        sx={{ minHeight: "80vh", display: "flex", alignItems: "center" }}>
        <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            {role} Login
          </Typography>
          <Box
            component="form"
            onSubmit={onSubmitHandler}
            noValidate
            sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <GoogleReCaptcha onVerify={handleCaptchaChange} />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading || !captcha}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            {role === "Admin" ? "Login sebagai PIC?" : "Login sebagai Admin?"}{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => setRole(role === "Admin" ? "PIC" : "Admin")}
              sx={{ textDecoration: "underline", cursor: "pointer" }}>
              Klik di sini
            </Link>
          </Typography>
        </Paper>
      </Container>
    </GoogleReCaptchaProvider>
  );
};

export default Login;
