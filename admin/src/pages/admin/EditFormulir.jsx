// Import library utama React dan hooks yang diperlukan
import { useState, useEffect, useContext, useRef } from "react";
// axios digunakan untuk melakukan HTTP request (GET, PUT, dll)
import axios from "axios";
// useNavigate dan useParams dari react-router-dom digunakan untuk navigasi dan mendapatkan parameter URL
import { useNavigate, useParams } from "react-router-dom";
// toast dari react-toastify untuk menampilkan notifikasi kepada pengguna
import { toast } from "react-toastify";
// Import AdminContext untuk mengakses data dan fungsi terkait administrasi (seperti PIC, data formulir, dll)
import { AdminContext } from "../../context/AdminContext";
// Import komponen Select dari react-select, sebuah library dropdown yang mendukung pencarian dan multi-select
import Select from "react-select";
// Import DarkModeContext untuk mengakses status dark mode (apakah aktif atau tidak)
import { DarkModeContext } from "../../context/DarkModeContext";

import { TextField } from "@mui/material"; // Import TextField dari Material UI untuk input teks

import { io } from "socket.io-client"; // Mengimpor socket.io untuk komunikasi real-time
import BubbleChat from "../../components/BubbleChat"; // Import komponen BubbleChat untuk menampilkan pesan chat
import { jwtDecode } from "jwt-decode"; // Import library jwt-decode untuk mendekode token JWT
import convertTimezone from "../../libs/convertTimezone"; // untuk mengonversi zona waktu
import addTimeline from "../../libs/addTimeline"; // import addTimeline untuk menambahkan timeline

// socket.io client untuk komunikasi real-time
const socket = io(import.meta.env.VITE_BACKEND_URL);

// Komponen EditFormulir: komponen untuk mengedit data formulir yang sudah ada
const EditFormulir = () => {
  // Menggunakan useRef untuk mendapatkan referensi DOM elemen textarea dan chat container
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // State untuk menyimpan pesan yang akan dikirim
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  // State untuk menyimpan data timeline
  const [timeline, setTimeline] = useState([]);

  // State untuk menyimpan status modal (apakah terbuka atau tidak)
  const [modalIsOpen, setModalIsOpen] = useState(false);
  //  State untuk menyimpan data modal (judul dan subjudul)
  const [modalData, setModalData] = useState({
    title: "",
    subtitle: "",
  });

  // Handle untuk mengubah status modal (apakah terbuka atau tidak)
  const handleModalOpen = () => {
    setModalIsOpen(true);
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
  };

  // useParams() digunakan untuk mengekstrak parameter URL; di sini, 'id' formulir
  const { id } = useParams();
  // useNavigate() memberikan fungsi untuk mengarahkan pengguna ke halaman lain
  const navigate = useNavigate();
  // Menggunakan useContext untuk mengakses nilai dan fungsi yang disediakan oleh AdminContext
  // getPICsData: fungsi untuk mengambil data PIC
  // PICsData: array data PIC
  // aToken: token otorisasi untuk request ke backend
  // deleteFormulir: fungsi untuk menghapus formulir (digunakan pada tombol hapus)
  const { getPICsData, PICsData, aToken, deleteFormulir } =
    useContext(AdminContext);
  // Menggunakan DarkModeContext untuk mengetahui status dark mode
  const { darkMode } = useContext(DarkModeContext);

  // Deklarasi state menggunakan useState dengan destructuring assignment
  // formData menyimpan data formulir yang akan diedit, dengan nilai default sebagai objek kosong atau default value
  const [formData, setFormData] = useState({
    layanan: "",
    tindak_lanjut: "",
    pics: [],
    id_jenislayanan: null,
    id_subjenislayanan: null,
    dokumen: null,
    ticket: "",
  });
  // State untuk status formulir; default adalah "Pending"
  const [status, setStatus] = useState("Pending");
  // State untuk data jenis layanan dan sub jenis layanan, yang akan diambil dari server
  const [jenisLayanan, setJenisLayanan] = useState([]);
  const [subJenisLayanan, setSubJenisLayanan] = useState([]);

  const [user, setUser] = useState(null);

  // useEffect untuk menjalankan fungsi saat komponen dimount atau saat aToken berubah
  // Di sini, jika aToken tersedia, maka beberapa fungsi data akan dipanggil

  useEffect(() => {
    if (aToken) {
      // Memanggil fungsi untuk mengambil data formulir berdasarkan id
      fetchFormData();
      // Mengambil data PIC
      getPICsData();
      // Mengambil data jenis layanan
      fetchJenisLayanan();
      // Memanggil fungsi untuk mengambil data sub jenis layanan
      fetchSubJenisLayanan();
      setUser(jwtDecode(aToken));
    }
  }, [aToken]); // Dependency: hanya berjalan ulang jika aToken berubah

  useEffect(() => {
    // Pengkondisi untuk memeriksa apakah formData.ticket ada
    if (formData.ticket) {
      socket.emit("join-room", formData.ticket); // join ke room chat berdasarkan ticket

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
    }

    // Membersihkan event listener saat komponen unmount
    return () => {
      socket.off("chat-history");
      socket.off("receive-message");
      socket.off("timeline-history");
    };
  }, [formData.ticket]);

  // Mengatur scroll ke bagian bawah chat container setiap kali ada pesan baru
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message untuk mengirim pesan chat
  const handleSend = () => {
    if (message.trim() === "") return;
    // Jika status bukan "Selesai", maka kirim pesan
    if (status === "Selesai") {
      toast.error("Permintaan sudah selesai! anda tidak dapat mengirim pesan!");
      return;
    }
    // Emit event untuk mengirim pesan ke server
    socket.emit("send-message", {
      room: formData.ticket,
      message: message,
      sender: user.email,
      name: user.name,
      role: user.role,
    });
    // Emit event untuk mengirim notifikasi ke server
    socket.emit("send-notification", {
      sender: user.email,
      receiver: formData.email,
      message: `Anda mendapatkan pesan baru dari ${user.name} (${user.role}) - ${formData.ticket}`,
    });
    setMessage("");
  };

  // Mengatur textarea agar otomatis menyesaikan isi chat
  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height dulu
      const maxHeight = 24 * 5; // 5 baris * 24px (line height)
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
    }
  };

  // Fungsi untuk mengambil data formulir dengan menggunakan axios GET request
  const fetchFormData = async () => {
    try {
      // Mengirim request GET ke endpoint untuk formulir dengan id tertentu
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/formulir/${id}`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      // Mengupdate state formData dengan data yang diterima, menggunakan operator OR (||) untuk nilai default
      setFormData({
        email: response.data.email || "",
        layanan: response.data.layanan || "",
        tindak_lanjut: response.data.tindak_lanjut || "",
        pics: response.data.pics || [],
        id_jenislayanan: response.data.id_jenislayanan || null,
        id_subjenislayanan: response.data.id_subjenislayanan || null,
        dokumen: response.data.dokumen || null,
        ticket: response.data.ticket || "",
      });
      // Mengupdate state status berdasarkan data yang diterima, default ke "Pending"
      setStatus(response.data.status || "Pending");
    } catch (error) {
      // Jika terjadi error, tampilkan notifikasi error menggunakan toast
      toast.error("Gagal mengambil data formulir!");
      console.log(error);
    }
  };

  // Fungsi untuk mengambil data jenis layanan (menggunakan axios GET)
  const fetchJenisLayanan = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/jenislayanan`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      // Update state jenisLayanan dengan data yang diterima
      setJenisLayanan(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data jenis layanan!");
      console.error(error);
    }
  };

  // Fungsi untuk mengambil data sub jenis layanan (menggunakan axios GET)
  const fetchSubJenisLayanan = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/subjenislayanan`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      // Update state subJenisLayanan dengan data yang diterima
      setSubJenisLayanan(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data sub jenis layanan!");
      console.error(error);
    }
  };

  // Fungsi untuk membuka file dokumen dari URL yang diberikan
  // Menggunakan syntax conditional (ternary) untuk memeriksa apakah string "uploads/" ada di filename
  const openFileUrl = async filename => {
    const name = filename.includes("uploads/")
      ? filename.replace("uploads/", "")
      : filename;
    try {
      // Mengirim fetch request ke endpoint download dengan header Authorization
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/download/${name}`,
        {
          headers: { Authorization: `Bearer ${aToken}` },
        }
      );
      // Jika response tidak OK, periksa status dan navigasikan ke login jika perlu
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi Anda habis, silahkan login kembali.");
          navigate("/login");
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

  // Fungsi untuk menyimpan perubahan data formulir (mengirim PUT request)
  const handleSave = async () => {
    try {
      // Membuat objek requestData dengan properti yang akan diperbarui
      const requestData = {
        tindak_lanjut: formData.tindak_lanjut,
        id_pics: Array.isArray(formData.pics) ? formData.pics : [],
        id_jenislayanan: formData.id_jenislayanan,
        id_subjenislayanan: formData.id_subjenislayanan,
      };

      // Mengirim PUT request ke endpoint edit formulir dengan menyertakan data yang diperbarui dan header Authorization
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/admin/formulir/${id}`,
        requestData,
        { headers: { Authorization: `Bearer ${aToken}` } }
      );

      const names =
        formData.pics
          .map(picId => PICsData.find(pic => pic.id === picId)?.nama)
          .filter(name => name)
          .join(", ") || "PIC";

      if (formData.pics.length > 0) {
        await addTimeline(
          formData.ticket,
          "Diserahkan ke PIC",
          `Laporan diberikan kepada PIC atas nama ${names}`
        );
        socket.emit("send-notification", {
          sender: user.email,
          receiver: formData.email,
          message: `Laporan anda telah diserahkan kepada PIC (${names}) - ${formData.ticket}`,
        });
      }

      toast.success("Formulir berhasil diperbarui!");
      // Setelah berhasil, navigasikan pengguna kembali ke halaman formulir
      navigate("/form");
    } catch (error) {
      console.error("Error saat menyimpan formulir:", error.response?.data);
      toast.error("Gagal menyimpan perubahan!");
    }
  };

  // Fungsi untuk menghapus formulir
  const handleDelete = async () => {
    // Menggunakan window.confirm untuk meminta konfirmasi sebelum menghapus
    if (window.confirm("Apakah Anda yakin ingin menghapus formulir ini?")) {
      try {
        await deleteFormulir(id);
        // Setelah penghapusan, navigasikan kembali ke halaman formulir
        navigate("/form");
      } catch (error) {
        console.error("Error saat menghapus formulir:", error);
      }
    }
  };

  // Styling kondisional menggunakan variabel yang ditentukan berdasarkan dark mode
  // labelClass dan bgCard menggunakan Tailwind CSS classes yang disusun secara kondisional
  const labelClass = darkMode ? "text-gray-200" : "text-gray-700";
  const bgCard = darkMode ? "bg-gray-600" : "bg-gray-100";

  // Custom styles untuk react-select, menggunakan arrow functions dan spread operator untuk menggabungkan style default
  const customSelectStyles = {
    control: provided => ({
      ...provided,
      backgroundColor: darkMode ? "#f9f9f9" : provided.backgroundColor,
    }),
    singleValue: provided => ({
      ...provided,
      color: darkMode ? "black" : provided.color,
    }),
    input: provided => ({
      ...provided,
      color: darkMode ? "black" : provided.color,
    }),
    option: (provided, state) => ({
      ...provided,
      color: darkMode ? "black" : provided.color,
      backgroundColor: state.isFocused
        ? darkMode
          ? "#e0e0e0"
          : "#eee"
        : darkMode
        ? "#f9f9f9"
        : provided.backgroundColor,
    }),
    placeholder: provided => ({
      ...provided,
      color: darkMode ? "black" : provided.color,
    }),
  };

  // Return statement: mengembalikan JSX (syntax untuk membuat elemen React)
  // Di sini digunakan juga Tailwind CSS untuk styling kelas (className) yang bersifat utilitas
  return (
    <>
      {/* Membuat modal box untuk tambah timeline*/}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div
            className={`${
              darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-900"
            } w-full max-w-lg p-6 rounded-lg shadow-lg`}>
            <h2 className="text-xl font-bold mb-6">Tambah Timeline</h2>
            <div className="mb-6">
              <TextField
                fullWidth
                label="Judul"
                type="text"
                value={modalData.title}
                onChange={e =>
                  setModalData({ ...modalData, title: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <TextField
                fullWidth
                label="Sub Judul"
                type="text"
                value={modalData.subtitle}
                onChange={e =>
                  setModalData({ ...modalData, subtitle: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleModalClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                Batal
              </button>
              <button
                onClick={async () => {
                  socket.emit("send-timeline", {
                    ticket: formData.ticket,
                    title: modalData.title,
                    subtitle: modalData.subtitle,
                  });
                  socket.emit("send-notification", {
                    sender: user.email,
                    receiver: formData.email,
                    message: `Laporan anda telah diperbarui - ${formData.ticket}`,
                  });
                  handleModalClose();
                }}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`p-8 min-h-screen flex flex-col justify-center items-center ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-50 text-gray-900"
        }`}>
        <div
          className={`${
            darkMode ? "bg-gray-700" : "bg-white"
          } w-full max-w-3xl shadow-xl rounded-lg p-8`}>
          <h1 className="text-3xl font-bold mb-6 text-center">Edit Formulir</h1>

          {/* Bagian Ticket: menampilkan nilai ticket dari formData */}
          <div className="mb-4">
            <label className={`block ${labelClass} font-medium mb-1`}>
              Ticket:
            </label>
            <p className={`${bgCard} p-3 rounded`}>
              {formData.ticket || "Tidak ada ticket"}
            </p>
          </div>

          {/* Bagian Status: menampilkan status formulir */}
          <div className="mb-4">
            <label className={`block ${labelClass} font-medium mb-1`}>
              Status:
            </label>
            <p className={`${bgCard} p-3 rounded`}>{status}</p>
          </div>

          {/* Bagian Layanan: menampilkan nilai layanan */}
          <div className="mb-4">
            <label className={`block ${labelClass} font-medium mb-1`}>
              Layanan:
            </label>
            <p className={`${bgCard} p-3 rounded`}>
              {formData.layanan || "Tidak ada layanan"}
            </p>
          </div>

          {/* Dropdown untuk Jenis Layanan (menggunakan react-select) */}
          <div className="mb-4">
            <label className={`block ${labelClass} font-medium mb-1`}>
              Jenis Layanan:
            </label>
            <Select
              styles={customSelectStyles} // Custom styles untuk menyesuaikan tema dark/light
              options={subJenisLayanan.map(sub => ({
                value: sub.id,
                label: sub.subtipelayanan,
              }))}
              // Menentukan nilai (value) dropdown berdasarkan formData
              value={
                subJenisLayanan.find(
                  sub => sub.id === formData.id_subjenislayanan
                )
                  ? {
                      value: formData.id_subjenislayanan,
                      label: subJenisLayanan.find(
                        sub => sub.id === formData.id_subjenislayanan
                      ).subtipelayanan,
                    }
                  : null
              }
              // onChange mengupdate state formData dengan nilai yang dipilih
              onChange={selectedOption =>
                setFormData({
                  ...formData,
                  id_subjenislayanan: selectedOption
                    ? selectedOption.value
                    : null,
                })
              }
              className="mb-4"
              isClearable // Memungkinkan pengguna untuk menghapus pilihan
            />
          </div>

          {/* Dropdown untuk Sub Jenis Layanan */}
          <div className="mb-4">
            <label className={`block ${labelClass} font-medium mb-1`}>
              Sub Jenis Layanan:
            </label>
            <Select
              styles={customSelectStyles}
              options={jenisLayanan.map(jl => ({
                value: jl.id,
                label: jl.tipelayanan,
              }))}
              value={
                jenisLayanan.find(jl => jl.id === formData.id_jenislayanan)
                  ? {
                      value: formData.id_jenislayanan,
                      label: jenisLayanan.find(
                        jl => jl.id === formData.id_jenislayanan
                      ).tipelayanan,
                    }
                  : null
              }
              onChange={selectedOption =>
                setFormData({
                  ...formData,
                  id_jenislayanan: selectedOption ? selectedOption.value : null,
                })
              }
              className="mb-4"
              isClearable
            />
          </div>

          {/* Dropdown untuk Assign PIC (multi-select) */}
          <div className="mb-4">
            <label className={`block ${labelClass} font-medium mb-1`}>
              Assign PIC:
            </label>
            <Select
              styles={customSelectStyles}
              isMulti // Mengizinkan pemilihan banyak PIC sekaligus
              options={PICsData.map(pic => ({
                value: pic.id,
                label: pic.nama,
              }))}
              // Mengatur nilai (value) dropdown berdasarkan data yang ada di formData.pics
              value={PICsData.filter(pic => formData.pics.includes(pic.id)).map(
                pic => ({
                  value: pic.id,
                  label: pic.nama,
                })
              )}
              onChange={selectedOptions =>
                setFormData({
                  ...formData,
                  pics: selectedOptions.map(option => option.value),
                })
              }
              className="mb-4"
            />
          </div>

          {/* Bagian Dokumen: menampilkan tombol download jika dokumen ada */}
          <div className="mb-4">
            <label className={`block ${labelClass} font-medium mb-1`}>
              Dokumen:
            </label>
            {formData.dokumen ? (
              <button
                onClick={() => openFileUrl(formData.dokumen)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded">
                Download Dokumen
              </button>
            ) : (
              <p className="text-gray-500">Tidak ada dokumen</p>
            )}
          </div>

          <div className="w-full mb-8">
            <p className={`block ${labelClass} font-medium mb-1`}>Timeline</p>
            <table className="w-full text-center">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-2 w-3/12">Tanggal</th>
                  <th className="px-4 py-2">Judul</th>
                  <th className="px-4 py-2">Sub Judul</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {timeline.length === 0 ? (
                  <tr className="border-b">
                    <td colSpan="4" className="px-4 py-2 text-gray-500">
                      Tidak ada timeline
                    </td>
                  </tr>
                ) : (
                  timeline.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 w-3/12">
                        {convertTimezone(item.created_at, false)}
                      </td>
                      <td className="px-4 py-2">{item.title}</td>
                      <td className="px-4 py-2">{item.subtitle}</td>
                      <td className="px-4 py-2">
                        <button
                          className="border-2 border-red-500 text-red-500 font-medium px-3 py-1 rounded-lg hover:bg-red-100 transition-all duration-300 cursor-pointer"
                          onClick={async () => {
                            socket.emit("delete-timeline", {
                              ticket: formData.ticket,
                              id: item.id,
                            });
                          }}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tombol Aksi: Simpan Perubahan dan Hapus Formulir */}
          <div className="flex justify-between">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded transition">
              Simpan Perubahan
            </button>
            <button
              onClick={handleModalOpen}
              className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-2 rounded transition">
              Tambah timeline
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded transition">
              Hapus Formulir
            </button>
          </div>
        </div>
        <div className="w-full">
          <p className="font-bold">Pesan dengan user</p>
          <div
            ref={chatContainerRef}
            className="w-full h-[400px] max-h-[400px] overflow-y-auto no-scrollbar flex flex-col bg-white border-primary border-t border-x rounded-t-lg shadow items-start mt-4 px-4 pt-4">
            <div className="w-full border border-primary bg-white rounded-lg px-4 py-2 sticky top-0">
              <p className="font-medium">Tiket Pesan : {formData.ticket}</p>
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
    </>
  );
};

// Mengekspor komponen EditFormulir agar dapat digunakan di bagian lain aplikasi
export default EditFormulir;
