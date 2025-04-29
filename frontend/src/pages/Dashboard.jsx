import { useEffect, useState } from "react"; // Mengimpor useEffect dan useState dari react
import { Link, useNavigate } from "react-router-dom"; // Mengimpor Link dan useNavigate dari react-router-dom
import { toast } from "react-toastify"; // Mengimpor toast dari react-toastify
import { jwtDecode } from "jwt-decode"; // Mengimpor jwtDecode dari jwt-decode
import { MdChatBubble, MdCheckCircle, MdHourglassFull } from "react-icons/md"; // Mengimpor ikon dari react-icons

import PermintaanCard from "../components/dashboard/PermintaanCard"; // Mengimpor PermintaanCard dari komponen PermintaanCard
import Navbar from "../components/dashboard/Navbar"; // Mengimpor Navbar dari komponen Navbar
import verifyToken from "../libs/VerifyToken"; // Mengimpor verifyToken untuk memverifikasi token
import getAllForms from "../libs/getAllForms"; // Mengimpor getAllForms untuk mengambil semua formulir
import convertTimezone from "../libs/convertTimezone"; // Mengimpor convertTimezone untuk mengonversi zona waktu
import socket from "../libs/socketConnection"; // Mengimpor socket untuk menghubungkan soket
import getStats from "../libs/getStats"; // Mengimpor getStats untuk mengambil statistik
import splitMessageAndTicket from "../libs/splitMessageAndTicket"; // // Mengimpor splitMessageAndTicket untuk memisahkan pesan dan tiket

const Dashboard = () => {
  // Menggunakan useNavigate untuk untuk navigasi
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true); // Membuat state loading untuk menandakan apakah data sedang dimuat
  const [user, setUser] = useState(null); // Membuat state user untuk menyimpan data pengguna
  const [forms, setForms] = useState([]); // Membuat state forms untuk menyimpan data formulir
  const [notifications, setNotifications] = useState([]); // Membuat state notifications untuk menyimpan notifikasi
  const [stats, setStats] = useState({
    // Membuat state stats untuk menyimpan statistik
    baru: 0,
    proses: 0,
    selesai: 0,
  });

  // Menggunakan useEffect untuk memuat data saat komponen pertama kali dirender
  useEffect(() => {
    // Fungsi untuk mengambil semua formulir dan menyimpannya ke dalam state forms
    const fetchForms = async () => {
      const result = await getAllForms(5);
      setForms(result);
    };

    // Jika token tersedia, ambil data pengguna dari token dan simpan ke dalam state user
    if (localStorage.getItem("uToken")) {
      setUser(jwtDecode(localStorage.getItem("uToken")));
    }

    fetchForms();

    // Memverifikasi token
    verifyToken(navigate, toast, setLoading, "/user/dashboard", "/user/login");
  }, []);

  // Menggunakan useEffect untuk mengatur koneksi soket dan mengambil statistik
  useEffect(() => {
    // Jika user tersedia
    if (user) {
      // Join room notifications
      socket.emit("join-notification", user.email);

      // Ambil statistik pengguna
      getStats().then(data => {
        setStats(data.stats);
      });
    }

    socket.on("notification-history", data => {
      setNotifications(data); // Atur riwayat norifikasi
    });

    socket.on("receive-notification", data => {
      setNotifications(prev => [data, ...prev]); // Menerima notifikasi
      toast.info(data.message);
    });

    // Menghape listener saat komponen di-unmount
    return () => {
      socket.off("receive-notification");
      socket.off("notification-history");
    };
  }, [user]);

  if (loading) {
    return <></>;
  }

  return (
    <>
      <Navbar>
        <div className="grow bg-white h-screen flex flex-col justify-start p-6 overflow-y-auto md:mt-0 mt-16">
          <div className="flex justify-between items-center mb-8">
            <p className="text-2xl font-bold">Dashboard Pengguna</p>
            <a href="/user/dashboard/settings" className="flex items-center">
              <img
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.name}`}
                alt={user?.name}
                className="w-12 h-12 rounded-full border-2 border-primary"
              />
            </a>
          </div>
          <div className="flex flex-wrap mb-8">
            <div className="lg:w-1/3 w-full">
              <div className="bg-secondary rounded-lg lg:my-0 my-4 mx-4 px-8 py-6">
                <MdChatBubble className="text-5xl mb-2 text-primary" />
                <p className="text-sm font-medium mb-1">Baru</p>
                <p className="text-xl font-bold">{stats.baru}</p>
              </div>
            </div>
            <div className="lg:w-1/3 w-full">
              <div className="bg-[#FFF3E8] rounded-lg lg:my-0 my-4 mx-4 px-8 py-6">
                <MdHourglassFull className="text-5xl mb-2 text-[#FFA247]" />
                <p className="text-sm font-medium mb-1">Dalam Proses</p>
                <p className="text-xl font-bold">{stats.proses}</p>
              </div>
            </div>
            <div className="lg:w-1/3 w-full">
              <div className="bg-[#E2FFF8] rounded-lg lg:my-0 my-4 mx-4 px-8 py-6">
                <MdCheckCircle className="text-5xl mb-2 text-[#3DD598]" />
                <p className="text-sm font-medium mb-1">Selesai</p>
                <p className="text-xl font-bold">{stats.selesai}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-8">
            <p className="text-lg font-bold">Status permintaan terbaru</p>
          </div>
          <div className="flex">
            <table className="w-full text-center lg:table hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-3 py-2">No Tiket</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Unit</th>
                  <th className="px-4 py-2">PIC</th>
                  <th className="px-4 py-2">Jenis Layanan</th>
                  <th className="px-4 py-2">Sub Jenis Layanan</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {forms.length === 0 ? (
                  <tr className="border-b">
                    <td colSpan="7" className="px-4 py-2 text-gray-500">
                      Tidak ada permintaan
                    </td>
                  </tr>
                ) : (
                  forms.map((form, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-3 py-2">{form.ticket}</td>
                      <td className="px-4 py-2">
                        {convertTimezone(form.tanggaldibuat)}
                      </td>
                      <td className="px-4 py-2">{form.unit}</td>
                      <td className="px-4 py-2">
                        {form.pics[0] == null
                          ? "Belum ditugaskan"
                          : form.pics.join(" | ")}
                      </td>
                      <td className="px-4 py-2">
                        {form.subjenislayanan == null
                          ? "-"
                          : form.subjenislayanan}
                      </td>
                      <td className="px-4 py-2">
                        {form.jenislayanan == null ? "-" : form.jenislayanan}
                      </td>
                      <td className="px-4 py-2">{form.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex flex-wrap lg:hidden w-full text-center">
              <div className="w-full">
                {forms.length === 0 ? (
                  <div className="flex justify-center items-center w-full h-32 bg-gray-100 rounded-lg shadow-md">
                    <p className="text-gray-500">Tidak ada permintaan</p>
                  </div>
                ) : (
                  <>
                    {forms.map((form, index) => (
                      <PermintaanCard
                        key={index}
                        ticket={form.ticket}
                        pics={form.pics}
                        tanggal={form.tanggaldibuat}
                        unit={form.unit}
                        jenisLayanan={form.subjenislayanan}
                        subJenisLayanan={form.jenislayanan}
                        status={form.status}
                        detail={false}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-8 mb-8">
            <p className="text-lg font-bold">Notifikasi sistem</p>
          </div>
          <div className="flex">
            <table className="w-full text-left">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-3 py-2">Notifikasi</th>
                  <th className="px-4 py-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr className="border-b">
                    <td colSpan="2" className="px-4 py-2 text-gray-500">
                      Tidak ada notifikasi
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-3 py-2">
                        {splitMessageAndTicket(notification.message).message}
                        {" - "}
                        <Link
                          to={`/user/dashboard/permintaan-saya/${encodeURIComponent(
                            splitMessageAndTicket(notification.message).ticket
                          )}`}
                          className="hover:underline">
                          {splitMessageAndTicket(notification.message).ticket}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        {convertTimezone(notification.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Navbar>
    </>
  );
};

export default Dashboard;
