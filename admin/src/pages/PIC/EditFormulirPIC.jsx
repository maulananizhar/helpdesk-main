// Import library dan hook yang diperlukan dari React dan library terkait
import { useState, useEffect, useContext, useRef } from "react";
// Import axios untuk melakukan request HTTP
import axios from "axios";
// Import hook untuk navigasi dan mengambil parameter dari URL
import { useNavigate, useParams } from "react-router-dom";
// Import toast untuk menampilkan notifikasi
import { toast } from "react-toastify";
// Import komponen Select dari react-select untuk dropdown dengan pencarian
import Select from "react-select";
// Import context PIC untuk mendapatkan token dan fungsi terkait formulir PIC
import { PICContext } from "../../context/PICContext";
// Import context DarkMode untuk mengetahui apakah mode gelap aktif
import { DarkModeContext } from "../../context/DarkModeContext";
import { io } from "socket.io-client";
import BubbleChat from "../../components/BubbleChat"; // Import komponen BubbleChat
import { jwtDecode } from "jwt-decode"; // Import library jwt-decode untuk mendekode token JWT
import { TextField } from "@mui/material"; // Import TextField dari Material UI untuk input teks
import convertTimezone from "../../libs/convertTimezone"; // untuk mengkonversi zona waktu

// socket.io untuk komunikasi real-time
const socket = io(import.meta.env.VITE_BACKEND_URL);

const EditFormulirPIC = () => {
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [timeline, setTimeline] = useState([]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
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

  // Mengambil id dari parameter URL
  const { id } = useParams();
  // Hook untuk navigasi programatik antar halaman
  const navigate = useNavigate();
  // Mengambil pToken dan fungsi deleteFormulir dari PICContext
  const { pToken, deleteFormulir } = useContext(PICContext);
  // Mengambil nilai darkMode dari DarkModeContext
  const { darkMode } = useContext(DarkModeContext);

  // State untuk menyimpan data formulir yang akan diedit
  const [formData, setFormData] = useState({
    layanan: "",
    tindak_lanjut: "",
    id_jenislayanan: null,
    id_subjenislayanan: null,
    eskalasi: false,
    pic_nama: "",
    proses_at: null,
    selesai_at: null,
    dokumen: null,
    ticket: "",
  });
  // State untuk menyimpan status formulir (misalnya: Baru, Proses, Selesai)
  const [status, setStatus] = useState("Baru");
  // State untuk menyimpan data jenis layanan
  const [jenisLayanan, setJenisLayanan] = useState([]);
  // State untuk menyimpan data sub jenis layanan
  const [subJenisLayanan, setSubJenisLayanan] = useState([]);

  const [user, setUser] = useState(null);

  /* 
    Definisi customSelectStyles untuk react-select.
    - Ketika dark mode aktif, warna teks pada dropdown akan diubah menjadi hitam.
    - properti 'control' mengatur tampilan container dropdown,
    - 'singleValue' mengatur tampilan nilai terpilih,
    - 'option' mengatur tampilan tiap opsi dalam dropdown.
  */
  // Definisi customSelectStyles untuk react-select.
  // Ubah properti 'control' sehingga background dropdown selalu berwarna putih,
  // sementara properti 'singleValue' dan 'option' mengatur warna teks menjadi hitam ketika dark mode aktif.
  const customSelectStyles = {
    control: provided => ({
      ...provided,
      backgroundColor: "#fff", // Background dropdown selalu putih
    }),
    singleValue: provided => ({
      ...provided,
      color: darkMode ? "black" : provided.color, // Teks berwarna hitam jika dark mode aktif
    }),
    option: provided => ({
      ...provided,
      color: darkMode ? "black" : provided.color, // Teks berwarna hitam jika dark mode aktif
    }),
  };

  // useEffect untuk mengambil data saat token tersedia
  useEffect(() => {
    if (pToken) {
      // Memanggil fungsi untuk mengambil data formulir berdasarkan id
      fetchFormData();
      // Memanggil fungsi untuk mengambil data jenis layanan
      fetchJenisLayanan();
      // Memanggil fungsi untuk mengambil data sub jenis layanan
      fetchSubJenisLayanan();
      setUser(jwtDecode(pToken));
    }
  }, [pToken]);

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

  // Fungsi untuk mengambil data formulir dari server berdasarkan id
  const fetchFormData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/formulir/${id}`,
        {
          headers: { Authorization: `Bearer ${pToken}` },
        }
      );
      // Mengupdate state formData dengan data yang diterima, dengan default jika data tidak ada
      setFormData({
        email: response.data.email || "",
        layanan: response.data.layanan || "",
        tindak_lanjut: response.data.tindak_lanjut || "",
        id_jenislayanan: response.data.id_jenislayanan || null,
        id_subjenislayanan: response.data.id_subjenislayanan || null,
        // Mengkonversi nilai eskalasi menjadi boolean
        eskalasi:
          response.data.eskalasi === true || response.data.eskalasi === "true",
        pic_nama: response.data.pic_nama || "Belum Ditugaskan",
        proses_at: response.data.proses_at || null,
        selesai_at: response.data.selesai_at || null,
        dokumen: response.data.dokumen || null,
        ticket: response.data.ticket || "",
      });
      // Mengupdate state status dengan data yang diterima
      setStatus(response.data.status || "Baru");
    } catch (error) {
      // Menampilkan notifikasi error jika gagal mengambil data formulir
      toast.error("Gagal mengambil data formulir!");
      console.error(error);
    }
  };

  // Fungsi untuk mengambil data jenis layanan dari server
  const fetchJenisLayanan = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/jenislayanan`,
        {
          headers: { Authorization: `Bearer ${pToken}` },
        }
      );
      setJenisLayanan(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data jenis layanan!");
      console.error(error);
    }
  };

  // Fungsi untuk mengambil data sub jenis layanan dari server
  const fetchSubJenisLayanan = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/subjenislayanan`,
        {
          headers: { Authorization: `Bearer ${pToken}` },
        }
      );
      setSubJenisLayanan(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data sub jenis layanan!");
      console.error(error);
    }
  };

  // Fungsi untuk mengunduh dokumen dari server
  const downloadFile = async filename => {
    // Bersihkan nama file jika mengandung "uploads/"
    const name = filename.includes("uploads/")
      ? filename.replace("uploads/", "")
      : filename;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/download/${name}`,
        {
          headers: { Authorization: `Bearer ${pToken}` },
          responseType: "blob",
        }
      );
      // Cek status response; jika bukan 200, periksa error otorisasi
      if (!response.status === 200) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Sesi Anda habis, silahkan login kembali.");
          navigate("/login");
        }
        throw new Error("Error saat mengambil dokumen");
      }
      // Membuat Blob dari data yang diterima dan membuat URL untuk membuka dokumen
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      // Revoke URL objek setelah periode tertentu untuk mencegah memory leak
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0.2 * 60 * 1000);
    } catch (error) {
      console.error("Error membuka dokumen:", error);
      toast.error("Gagal membuka dokumen");
    }
  };

  // Fungsi untuk menyimpan perubahan formulir ke server
  const handleSave = async () => {
    try {
      // Menyiapkan data yang akan dikirim untuk memperbarui formulir
      const requestData = {
        tindak_lanjut: formData.tindak_lanjut,
        status: status,
        eskalasi: formData.eskalasi,
        id_jenislayanan: formData.id_jenislayanan,
        id_subjenislayanan: formData.id_subjenislayanan,
      };
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/admin/formulir/${id}`,
        requestData,
        {
          headers: { Authorization: `Bearer ${pToken}` },
        }
      );
      toast.success("Formulir berhasil diperbarui!");
      // Navigasi kembali ke halaman formulir PIC setelah berhasil menyimpan
      navigate("/formulir-pic");
    } catch (error) {
      console.error("Error saat menyimpan formulir:", error.response?.data);
      toast.error("Gagal menyimpan perubahan!");
    }
  };

  // Fungsi untuk menghapus formulir setelah konfirmasi dari pengguna
  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus formulir ini?")) {
      try {
        await deleteFormulir(id);
        navigate("/formulir-pic");
      } catch (error) {
        console.error("Error saat menghapus formulir:", error);
      }
    }
  };

  // Fungsi untuk memformat timestamp menjadi string yang dapat dibaca
  const formatTimestamp = timestamp => {
    return timestamp ? new Date(timestamp).toLocaleString() : "-";
  };

  return (
    <>
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
          darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-50 text-gray-700"
        }`}>
        <div
          className={`${
            darkMode ? "bg-gray-700" : "bg-white"
          } w-full max-w-3xl shadow-xl rounded-lg p-8`}>
          {/* Judul halaman */}
          <h1 className="text-3xl font-bold mb-6 text-center">Edit Formulir</h1>

          {/* Bagian Ticket */}
          <div className="mb-4">
            <label
              className={`block ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } font-medium mb-1`}>
              Ticket:
            </label>
            <p
              className={`${
                darkMode ? "bg-gray-600" : "bg-gray-100"
              } p-3 rounded`}>
              {formData.ticket || "Tidak ada ticket"}
            </p>
          </div>

          {/* Bagian Status */}
          <div className="mb-4">
            <label
              className={`block ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } font-medium mb-1`}>
              Status:
            </label>
            <p
              className={`${
                darkMode ? "bg-gray-600" : "bg-gray-100"
              } p-3 rounded`}>
              {status}
            </p>
          </div>

          {/* Bagian Layanan */}
          <div className="mb-4">
            <label
              className={`block ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } font-medium mb-1`}>
              Layanan:
            </label>
            <p
              className={`${
                darkMode ? "bg-gray-600" : "bg-gray-100"
              } p-3 rounded mb-4`}>
              {formData.layanan || "Tidak ada layanan"}
            </p>
          </div>

          {/* Bagian PIC */}
          <div className="mb-4">
            <label
              className={`block ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } font-medium mb-1`}>
              PIC:
            </label>
            <p
              className={`${
                darkMode ? "bg-gray-600" : "bg-gray-100"
              } p-3 rounded mb-4`}>
              {formData.pic_nama}
            </p>
          </div>

          {/* Bagian Waktu Proses & Selesai */}
          <div className="flex flex-col md:flex-row md:justify-between mb-4">
            <div className="mb-4 md:mb-0 md:mr-4">
              <label
                className={`block ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } font-medium mb-1`}>
                Waktu Proses:
              </label>
              <p
                className={`${
                  darkMode ? "bg-gray-600" : "bg-gray-100"
                } p-2 rounded`}>
                {formatTimestamp(formData.proses_at)}
              </p>
            </div>
            <div>
              <label
                className={`block ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } font-medium mb-1`}>
                Waktu Selesai:
              </label>
              <p
                className={`${
                  darkMode ? "bg-gray-600" : "bg-gray-100"
                } p-2 rounded`}>
                {formatTimestamp(formData.selesai_at)}
              </p>
            </div>
          </div>

          {/* Bagian Tindak Lanjut */}
          <div className="mb-4">
            <label
              className={`block ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } font-medium mb-1`}>
              Tindak Lanjut:
            </label>
            <textarea
              className={`w-full p-2 border rounded mb-4 ${
                darkMode
                  ? "bg-gray-600 text-gray-200 border-gray-500"
                  : "bg-white text-gray-700"
              }`}
              value={formData.tindak_lanjut}
              onChange={e =>
                setFormData({ ...formData, tindak_lanjut: e.target.value })
              }
            />
          </div>

          {/* Dropdown untuk memilih Status Formulir */}
          <div className="mb-4">
            <label
              className={`block ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } font-medium mb-1`}>
              Status Formulir:
            </label>
            <select
              className={`w-full p-2 border rounded mb-4 ${
                darkMode
                  ? "bg-gray-600 text-gray-200 border-gray-500"
                  : "bg-white text-gray-700"
              }`}
              value={status}
              onChange={e => setStatus(e.target.value)}>
              <option value="Baru">Baru</option>
              <option value="Proses">Proses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Dropdown untuk memilih Jenis Layanan */}
          <div className="mb-4">
            <label
              className={`block ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } font-medium mb-1`}>
              Jenis Layanan:
            </label>
            <Select
              // Menggunakan data subJenisLayanan untuk opsi dropdown
              options={subJenisLayanan.map(sub => ({
                value: sub.id,
                label: sub.subtipelayanan,
              }))}
              // Menentukan nilai yang terpilih berdasarkan formData
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
              // Mengupdate state ketika opsi dipilih
              onChange={selectedOption =>
                setFormData({
                  ...formData,
                  id_subjenislayanan: selectedOption
                    ? selectedOption.value
                    : null,
                })
              }
              className="mb-4"
              // Menambahkan custom styles agar teks dropdown berwarna hitam saat dark mode aktif
              styles={customSelectStyles}
              isClearable
            />
          </div>

          {/* Dropdown untuk memilih Sub Jenis Layanan */}
          <div className="mb-4">
            <label
              className={`block ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } font-medium mb-1`}>
              Sub Jenis Layanan:
            </label>
            <Select
              // Menggunakan data jenisLayanan untuk opsi dropdown
              options={jenisLayanan.map(jl => ({
                value: jl.id,
                label: jl.tipelayanan,
              }))}
              // Menentukan nilai yang terpilih berdasarkan formData
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
              // Mengupdate state ketika opsi dipilih
              onChange={selectedOption =>
                setFormData({
                  ...formData,
                  id_jenislayanan: selectedOption ? selectedOption.value : null,
                })
              }
              className="mb-4"
              // Menambahkan custom styles agar teks dropdown berwarna hitam saat dark mode aktif
              styles={customSelectStyles}
              isClearable
            />
          </div>

          {/* Bagian Dokumen */}
          <div className="mb-8">
            <label
              className={`block ${
                darkMode ? "text-gray-200" : "text-gray-700"
              } font-medium mb-1`}>
              Dokumen:
            </label>
            {formData.dokumen ? (
              <button
                onClick={() => downloadFile(formData.dokumen)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded">
                Download Dokumen
              </button>
            ) : (
              <p className="text-gray-500">Tidak ada dokumen</p>
            )}
          </div>

          <div className="w-full mb-8">
            <p className={`block text-gray-700 font-medium mb-1`}>Timeline</p>
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

          {/* Checkbox untuk mengatur eskalasi */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={formData.eskalasi}
              onChange={e =>
                setFormData({ ...formData, eskalasi: e.target.checked })
              }
              className="mr-2"
            />
            <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
              Eskalasi
            </span>
          </div>

          {/* Tombol aksi untuk menyimpan perubahan atau menghapus formulir */}
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

export default EditFormulirPIC;
