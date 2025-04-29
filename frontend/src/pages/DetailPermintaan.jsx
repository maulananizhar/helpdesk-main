import { useEffect, useRef, useState } from "react"; // Mengimpor beberapa react hooks
import { Link, useNavigate, useParams } from "react-router-dom"; // Mengimpor beberapa hook dari react-router-dom
import { toast } from "react-toastify"; // Mengimpor toastify untuk menampilkan notifikasi
import { jwtDecode } from "jwt-decode"; // Mengimpor jwtDecode untuk mendekode token JWT
import { MdStar } from "react-icons/md"; // Mengimpor MdStar dari react-icons

import Navbar from "../components/dashboard/Navbar"; // Mengimpor komponen Navbar
import Timeline from "../components/dashboard/timeline/Timeline"; // Mengimpor komponen Timeline untuk menampilkan riwayat timeline
import BubbleChat from "../components/dashboard/BubbleChat"; // Mengimpor komponen BubbleChat untuk menampilkan pesan
import verifyToken from "../libs/VerifyToken"; //  Mengimpor fungsi untuk memverifikasi token
import getFormByTicket from "../libs/getFormByTicket"; // Mengimpor getFormByTicket untuk mendapatkan data form berdasarkan tiket
import convertTimezone from "../libs/convertTimezone"; // Mengimpor convertTimezone untuk mengonversi zona waktu
import socket from "../libs/socketConnection"; // Mengimpor socket untuk koneksi WebSocket
import addTestimonial from "../libs/addTestimonial"; // Mengimpor fungsi untuk menambahkan testimonial

const DetailPermintaan = () => {
  // Mendapatkan parameter dari URL
  const params = useParams();
  const ticket = params.ticket;

  // Mendapatkan navigasi dari react-router-dom
  const navigate = useNavigate();

  // Menggunakan useRef untuk referensi elemen DOM
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [user, setUser] = useState(null); // state untuk menyimpan data pengguna
  const [message, setMessage] = useState(""); // state untuk menyimpan pesan yang akan dikirim
  const [messages, setMessages] = useState([]); // state untuk menyimpan riwayat pesan
  const [loading, setLoading] = useState(true); // state untuk menandakan loading
  const [data, setData] = useState({
    // state untuk menyimpan data form
    id: null,
    ticket: ticket,
    email: "",
    tanggaldibuat: "",
    unit: "",
    jenislayanan: "",
    subjenislayanan: "",
    deskripsi: "",
    status: "",
    pics: [],
    tindaklanjut: "",
    eskalasi: "",
    tanggalproses: "",
    tanggalselesai: "",
  });
  const [timeline, setTimeline] = useState([]); // state untuk menyimpan riwayat timeline
  const [modalIsOpen, setModalIsOpen] = useState(false); // state untuk menandakan apakah modal terbuka
  const [modalData, setModalData] = useState({
    // state untuk menyimpan data modal
    testimonialHelpdesk: "",
    ratingHelpdesk: 1,
    testimonialPIC: "",
    ratingPIC: 1,
  });

  // Menggunakan useEffect untuk melakukan fetch data form berdasarkan tiket
  useEffect(() => {
    // Fungsi untuk mengambil data form berdasarkan tiket
    const fetchForms = async () => {
      const result = await getFormByTicket(ticket);
      setData(result);
    };

    fetchForms();

    // Memverifikasi token dan mengatur loading state
    verifyToken(
      navigate,
      toast,
      setLoading,
      `/user/dashboard/permintaan-saya/${encodeURIComponent(ticket)}`,
      "/user/login"
    );

    if (localStorage.getItem("uToken")) {
      setUser(jwtDecode(localStorage.getItem("uToken")));
    }
  }, []);

  // Menggunakan useEffect untuk mengatur scroll ke bawah saat pesan baru diterima
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Menggunakan useEffect untuk mengatur socket dan mendengarkan event dari server
  useEffect(() => {
    // Jika ticket ada
    if (ticket) {
      // User melakukan emit join room dan notif
      if (user) {
        socket.emit("join-room", ticket);
        socket.emit("join-notification", user.email);
      }

      socket.on("chat-history", messages => {
        setMessages(messages); // Atur riwayat pesan
      });

      socket.on("receive-message", data => {
        setMessages(prevMessages => [...prevMessages, data]); // Menerima pesan
      });

      socket.on("timeline-history", timeline => {
        setTimeline(timeline); // Atur riwayat timeline
      });

      socket.on("receive-timeline", data => {
        setTimeline(prevTimeline => [...prevTimeline, data]); // Menerima timeline
      });

      socket.on("receive-notification", data => {
        toast.info(data.message); // Menerima notifikasi
      });
    }

    // Menghapus event listener saat komponen di-unmount
    return () => {
      socket.off("chat-history");
      socket.off("receive-message");
      socket.off("timeline-history");
      socket.off("receive-timeline");
      socket.off("receive-notification");
    };
  }, [ticket, user]);

  // Fungsi untuk mengirim pesan
  const handleSend = () => {
    if (message.trim() === "") return;
    // Jika status permintaan adalah "Selesai", tampilkan pesan error
    if (data.status === "Selesai") {
      toast.error("Permintaan sudah selesai! anda tidak dapat mengirim pesan!");
      return;
    }
    // Mengirim pesan ke server melalui socket
    socket.emit("send-message", {
      room: ticket,
      message: message,
      sender: user.email,
      name: user.name,
      role: user.role,
    });
    setMessage("");
  };

  // Fungsi untuk mengatur tinggi textarea agar sesuai dengan konten
  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height dulu
      const maxHeight = 24 * 5; // 5 baris * 24px (line height)
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
    }
  };

  // Fungsi untuk membuka modal
  const handleModalOpen = () => {
    setModalIsOpen(true);
  };

  // Fungsi untuk menutup modal
  const handleModalClose = () => {
    setModalIsOpen(false);
  };

  // Fungsi untuk membuka file dokumen
  const openFileUrl = async filename => {
    const name = filename.includes("uploads/")
      ? filename.replace("uploads/", "")
      : filename;
    try {
      // Mengirim fetch request ke endpoint download dengan header Authorization
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/download/${name}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("uToken")}`,
          },
        }
      );
      // Jika response tidak OK, periksa status dan navigasikan ke login jika perlu
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi Anda habis, silahkan login kembali.");
          navigate("/user/login");
        }
        throw new Error("Error saat mengambil dokumen");
      }
      // Mengubah response menjadi blob, kemudian membuat URL sementara untuk membuka dokumen
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      // Menghapus URL blob setelah 12 detik (0.2 * 60 * 1000 ms)
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0.2 * 60 * 1000);
    } catch (error) {
      console.error("Error membuka dokumen:", error);
      toast.error("Gagal membuka dokumen");
    }
  };

  if (loading) {
    return <></>;
  }

  return (
    <>
      {/* Membuat modal box untuk tambah timeline*/}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-primary text-gray-900 w-full max-w-lg p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-center text-white mb-6">
              Penilaian terhadap helpdesk
            </h2>
            <div className="mb-6">
              <div className="flex gap-1 justify-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <label
                    htmlFor={`rating-helpdesk-${i + 1}`}
                    onClick={() =>
                      setModalData({ ...modalData, ratingHelpdesk: i + 1 })
                    }
                    key={i}>
                    <input
                      type="radio"
                      name="rating-helpdesk"
                      id={`rating-helpdesk-${i + 1}`}
                      className="hidden"
                    />
                    <MdStar
                      className={`${
                        modalData.ratingHelpdesk >= i + 1
                          ? "text-yellow-300"
                          : "text-white"
                      } cursor-pointer text-3xl`}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Ketik ulasan..."
                required
                value={modalData.testimonialHelpdesk}
                onChange={e => {
                  setModalData({
                    ...modalData,
                    testimonialHelpdesk: e.target.value,
                  });
                }}
                className="bg-white text-sm p-1 w-full border-b-2 bg-opacity-75 mt-2 outline-none"
              />
            </div>
            <h2 className="text-xl font-bold text-center text-white mb-6">
              Penilaian terhadap PIC
            </h2>
            <div className="mb-6">
              <div className="flex gap-1 justify-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <label
                    htmlFor={`rating-PIC-${i + 1}`}
                    onClick={() =>
                      setModalData({ ...modalData, ratingPIC: i + 1 })
                    }
                    key={i}>
                    <input
                      type="radio"
                      name="rating-PIC"
                      id={`rating-PIC-${i + 1}`}
                      className="hidden"
                    />
                    <MdStar
                      className={`${
                        modalData.ratingPIC >= i + 1
                          ? "text-yellow-300"
                          : "text-white"
                      } cursor-pointer text-3xl`}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Ketik ulasan..."
                required
                value={modalData.testimonialPIC}
                onChange={e => {
                  setModalData({
                    ...modalData,
                    testimonialPIC: e.target.value,
                  });
                }}
                className="bg-white text-sm p-1 w-full border-b-2 bg-opacity-75 mt-2 outline-none"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleModalClose}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-300">
                Batal
              </button>
              <button
                onClick={() => {
                  addTestimonial(
                    ticket,
                    user.id,
                    modalData.testimonialHelpdesk,
                    modalData.ratingHelpdesk,
                    modalData.testimonialPIC,
                    modalData.ratingPIC
                  )
                    .then(res => {
                      toast.success(res);
                    })
                    .catch(error => {
                      toast.error(error);
                    });
                  handleModalClose();
                }}
                className="bg-white hover:bg-gray-300 px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors duration-300">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      <Navbar>
        <div className="grow bg-white h-screen flex flex-col justify-start p-6 overflow-y-auto md:mt-0 mt-16">
          <div className="flex justify-between items-center mb-8">
            <p className="text-2xl font-bold">Detail Permintaan</p>
            <Link to="#" className="flex items-center">
              <img
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.name}`}
                alt={user?.name}
                className="w-12 h-12 rounded-full border-2 border-primary"
              />
            </Link>
          </div>
          <div className="flex flex-wrap justify-between">
            <div className="lg:w-1/2 w-full lg:pr-8 pr-0">
              <p className="font-bold">Permintaan Saya</p>
              <div className="w-full flex flex-col bg-white border-primary border rounded-lg shadow items-start px-6 py-4 my-4">
                <p className="font-medium text-gray-600 text-sm">
                  {data.ticket}
                </p>
                {data.pics.length === 0 || data.pics[0] == null ? (
                  <div className="w-full flex text-left">
                    <p className="w-1/2 font-medium">PIC</p>
                    <p className="w-1/2 truncate">: Belum ditugaskan</p>
                  </div>
                ) : (
                  data.pics.map((pic, index) => (
                    <div
                      className="w-full flex text-left items-center gap-4"
                      key={index}>
                      <img
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${pic}`}
                        alt={pic}
                        className="w-10 h-10 rounded-full border-2 border-primary my-2"
                      />
                      <p className="font-bold text-xl">{pic}</p>
                    </div>
                  ))
                )}
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Email</p>
                  <p className="w-1/2 truncate">: {data.email}</p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Tanggal</p>
                  <p className="w-1/2">
                    : {convertTimezone(data.tanggaldibuat)}
                  </p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Unit</p>
                  <p className="w-1/2">: {data.unit}</p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Jenis Layanan</p>
                  <p className="w-1/2">
                    :{" "}
                    {data.subjenislayanan == null ? "-" : data.subjenislayanan}
                  </p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Sub Jenis Layanan</p>
                  <p className="w-1/2">
                    : {data.jenislayanan == null ? "-" : data.jenislayanan}
                  </p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Deskripsi</p>
                  <p className="w-1/2">: {data.deskripsi}</p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Status</p>
                  <p className="w-1/2">: {data.status}</p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Tindak Lanjut</p>
                  <p className="w-1/2">
                    : {data.tindaklanjut == null ? "-" : data.tindaklanjut}
                  </p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Eskalasi</p>
                  <p className="w-1/2">
                    :{" "}
                    {data.eskalasi == null
                      ? "-"
                      : data.eskalasi == true
                      ? "Ya"
                      : "Tidak"}
                  </p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Tanggal Proses</p>
                  <p className="w-1/2">
                    :{" "}
                    {data.tanggalproses == null
                      ? "-"
                      : convertTimezone(data.tanggalproses)}
                  </p>
                </div>
                <div className="w-full flex text-left">
                  <p className="w-1/2 font-medium">Tanggal Selesai</p>
                  <p className="w-1/2">
                    :{" "}
                    {data.tanggalselesai == null
                      ? "-"
                      : convertTimezone(data.tanggalselesai)}
                  </p>
                </div>
                <div className="w-full text-center flex gap-2">
                  {data.dokumen ? (
                    <button
                      onClick={() => openFileUrl(data.dokumen)}
                      className="w-full font-medium text-white bg-primary hover:bg-primary-hover cursor-pointer rounded py-2 mt-4 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                      Download Dokumen
                    </button>
                  ) : (
                    <></>
                  )}
                  <button
                    onClick={handleModalOpen}
                    disabled={data.status === "Selesai" ? false : true}
                    className={`w-full font-medium text-white bg-primary hover:bg-primary-hover cursor-pointer rounded py-2 mt-4 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed ${
                      data.status == "Selesai" ? "" : "hidden"
                    }`}>
                    Nilai Helpdesk
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <p className="font-bold">Lacak Permintaan</p>
              {timeline.length > 0 ? (
                <Timeline timeline={timeline} />
              ) : (
                <p className="text-center text-gray-500">
                  Timeline tidak tersedia
                </p>
              )}
            </div>
          </div>
          <div className="w-full">
            <p className="font-bold">Pesan dengan PIC</p>
            <div
              ref={chatContainerRef}
              className="w-full h-[400px] max-h-[400px] overflow-y-auto no-scrollbar flex flex-col bg-white border-primary border-t border-x rounded-t-lg shadow items-start mt-4 px-4 pt-4">
              <div className="w-full border border-primary bg-white rounded-lg px-4 py-2 sticky top-0">
                <p className="font-medium">Tiket Pesan : {data.ticket}</p>
              </div>
              {messages.map((message, index) =>
                message.sender === user.email ? (
                  <BubbleChat
                    key={index}
                    sender={message.name}
                    role="Me"
                    myRole="Me"
                    message={message.message}
                  />
                ) : (
                  <BubbleChat
                    key={index}
                    sender={message.name}
                    role={message.role}
                    myRole={user.role}
                    message={message.message}
                  />
                )
              )}
            </div>
            <div className="flex w-full border rounded-b-lg border-primary bg-gray-200 px-4 py-2 gap-2">
              <textarea
                ref={textareaRef}
                rows="1"
                placeholder="Ketik pesan..."
                className="w-full px-4 py-2 border border-primary bg-white rounded-lg focus:outline-none focus:border-primary-hover resize-none overflow-auto no-scrollbar"
                onInput={handleInput}
                onChange={e => setMessage(e.target.value)}
                value={message}
                style={{ lineHeight: "1.5rem", maxHeight: "120px" }} // 5 x 24px
              />
              <button
                className="bg-primary text-white px-4 py-2 rounded-lg max-h-max my-auto hover:bg-primary-hover transition-all duration-200"
                onClick={handleSend}>
                Kirim
              </button>
            </div>
          </div>
        </div>
      </Navbar>
    </>
  );
};

export default DetailPermintaan;
