import { useEffect, useState } from "react"; // Mengimpor useEffect dan useState dari React
import { useNavigate } from "react-router-dom"; // // Mengimpor Link dan useNavigate dari react-router-dom
import { jwtDecode } from "jwt-decode"; // Mengimpor jwtDecode dari jwt-decode
import { toast } from "react-toastify"; // Mengimpor toast dari react-toastify

import Navbar from "../components/dashboard/Navbar"; // Mengimpor komponen Navbar dari komponen dashboard
import PermintaanCard from "../components/dashboard/PermintaanCard"; // // Mengimpor komponen PermintaanCard dari komponen dashboard
import getAllForms from "../libs/getAllForms"; // Mengimpor fungsi getAllForms dari libs untuk mengambil semua formulir
import verifyToken from "../libs/VerifyToken"; // // Mengimpor fungsi verifyToken dari libs untuk memverifikasi token
import convertTimezone from "../libs/convertTimezone"; // // Mengimpor fungsi convertTimezone dari libs untuk mengonversi zona waktu

const PermintaanSaya = () => {
  // Mendapatkan instance useNavigate untuk navigasi
  const navigate = useNavigate();

  // Membuat state untuk menyimpan data pengguna, status loading, dan daftar formulir
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [forms, setForms] = useState([]);

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(5); // Jumlah item per halaman
  const [currentPage, setCurrentPage] = useState(1); // Halaman saat ini
  const totalPages = Math.ceil(forms.length / itemsPerPage); // Total halaman berdasarkan
  const indexOfLastItem = currentPage * itemsPerPage; // Indeks item terakhir pada halaman saat ini
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Indeks item pertama pada halaman saat ini
  const currentItems = forms.slice(indexOfFirstItem, indexOfLastItem); // Mengambil item saat ini berdasarkan halaman

  // Fungsi useEffect untuk mengambil data formulir saat komponen dimuat
  useEffect(() => {
    const fetchForms = async () => {
      const result = await getAllForms();
      setForms(result);
    };

    // Memeriksa apakah token pengguna ada di localStorage
    if (localStorage.getItem("uToken")) {
      setUser(jwtDecode(localStorage.getItem("uToken")));
    }

    fetchForms();

    verifyToken(
      navigate,
      toast,
      setLoading,
      "/user/dashboard/permintaan-saya",
      "/user/login"
    );
  }, []);

  if (loading) {
    return <></>;
  }

  return (
    <Navbar>
      <div className="grow bg-white h-screen flex flex-col justify-start p-6 overflow-y-auto md:mt-0 mt-16 relative">
        <div className="flex justify-between items-center mb-16">
          <p className="text-2xl font-bold">Permintaan Saya</p>
          <a href="#" className="flex items-center">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-12 h-12 rounded-full border-2 border-primary"
            />
          </a>
        </div>
        {/* Set items per page */}
        <div className="flex items-center mb-4">
          <label className="text-sm font-semibold text-gray-700 mr-2">
            Tampilkan:
          </label>
          <select
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm mr-4"
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset halaman saat mengubah jumlah item per halaman
            }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <label className="text-sm font-semibold text-gray-700 mr-2">
            item per halaman
          </label>
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
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr className="border-b">
                  <td colSpan="8" className="px-3 py-2 text-gray-500">
                    Tidak ada permintaan
                  </td>
                </tr>
              ) : (
                currentItems.map((form, index) => (
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
                    <td className="px-4 py-2">
                      <a
                        href={`/user/dashboard/permintaan-saya/${encodeURIComponent(
                          form.ticket
                        )}`}
                        className="bg-primary text-white hover:bg-primary-hover px-3 py-1 rounded-lg transition-all duration-200">
                        Detail
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex flex-wrap lg:hidden w-full text-center">
            <div className="w-full">
              {currentItems.length === 0 ? (
                <div className="flex justify-center items-center w-full h-32 bg-gray-100 rounded-lg shadow-md">
                  <p className="text-gray-500">Tidak ada permintaan</p>
                </div>
              ) : (
                <>
                  {currentItems.map((form, index) => (
                    <PermintaanCard
                      key={index}
                      ticket={form.ticket}
                      pics={form.pics}
                      tanggal={form.tanggaldibuat}
                      unit={form.unit}
                      jenisLayanan={form.subjenislayanan}
                      subJenisLayanan={form.jenislayanan}
                      status={form.status}
                      detail={true}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mt-4 w-full">
          <div className="flex justify-center items-center mt-4 mb-16">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={`px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-all duration-200 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}>
              Sebelumnya
            </button>
            <span className="mx-4 text-lg font-semibold">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
              className={`px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-all duration-200 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}>
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default PermintaanSaya;
