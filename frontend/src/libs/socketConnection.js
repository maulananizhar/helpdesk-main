import { io } from "socket.io-client"; // Import io untuk menghubungkan ke server Socket.IO

// Menghubungkan ke server Socket.IO menggunakan URL dari env
const socket = io(import.meta.env.VITE_BACKEND_URL);

export default socket;
