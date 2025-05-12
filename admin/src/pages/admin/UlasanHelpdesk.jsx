// Import hook react js
import { useContext, useEffect, useState } from "react";
// import icons bintang
import { MdStar } from "react-icons/md";
// import context dark mode
import { DarkModeContext } from "../../context/DarkModeContext";
// import component UlasanCard
import UlasanCard from "../../components/UlasanCard";
// import component RatingSelector
import RatingSelector from "../../components/RatingSelector";
// import function getUlasanHelpdesk
import getUlasanHelpdesk from "../../libs/getUlasanHelpdesk";

const UlasanHelpdesk = () => {
  // Mengambil konteks dark mode
  const { darkMode } = useContext(DarkModeContext);

  // Sate untuk rating dan ulasan
  const [rating, setRating] = useState(null);
  const [ulasan, setUlasan] = useState({
    average: 0,
    data: [],
  });

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(5); // Jumlah item per halaman
  const [currentPage, setCurrentPage] = useState(1); // Halaman saat ini
  const totalPages = Math.ceil(ulasan.data.length / itemsPerPage); // Total halaman berdasarkan
  const indexOfLastItem = currentPage * itemsPerPage; // Indeks item terakhir pada halaman saat ini
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Indeks item pertama pada halaman saat ini
  const currentItems = ulasan.data.slice(indexOfFirstItem, indexOfLastItem); // Mengambil item saat ini berdasarkan halaman

  useEffect(() => {
    // Mengambil data ulasan PIC berdasarkan rating
    getUlasanHelpdesk(rating).then(data => {
      if (data) {
        setUlasan(data);
      }
    });
  }, [rating]);

  return (
    <>
      <div
        className={`container rounded-lg px-8 py-12 mb-4 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}>
        <p className="text-3xl font-bold mb-4 text-center">Ulasan Pengguna</p>
        <div className="w-full">
          <p className="text-xl font-medium mb-4">Ulasan terhadap helpdesk</p>
          <div
            className={`flex w-full border py-4 px-2 ${
              darkMode
                ? "border-gray-950 bg-gray-900"
                : "border-gray-200 bg-gray-100"
            }`}>
            <div className="flex flex-col justify-center items-center px-4 py-6">
              <p className="text-4xl font-medium">
                {ulasan.average.toFixed(1)}{" "}
                <span className="text-xl">dari 5</span>
              </p>
              <div className="flex items-center space-x-1 mt-2">
                {ulasan.average >= 1 ? (
                  <MdStar className="w-5 h-5 text-yellow-400" />
                ) : (
                  <MdStar className="w-5 h-5 text-gray-300" />
                )}
                {ulasan.average >= 2 ? (
                  <MdStar className="w-5 h-5 text-yellow-400" />
                ) : (
                  <MdStar className="w-5 h-5 text-gray-300" />
                )}
                {ulasan.average >= 3 ? (
                  <MdStar className="w-5 h-5 text-yellow-400" />
                ) : (
                  <MdStar className="w-5 h-5 text-gray-300" />
                )}
                {ulasan.average >= 4 ? (
                  <MdStar className="w-5 h-5 text-yellow-400" />
                ) : (
                  <MdStar className="w-5 h-5 text-gray-300" />
                )}
                {ulasan.average >= 5 ? (
                  <MdStar className="w-5 h-5 text-yellow-400" />
                ) : (
                  <MdStar className="w-5 h-5 text-gray-300" />
                )}
              </div>
            </div>
            <div className="flex flex-wrap px-5 py-6 gap-4">
              <RatingSelector
                darkMode={darkMode}
                rating={rating}
                setRating={setRating}
              />
            </div>
          </div>
          {/* Set items per page */}
          <div className="flex items-center mt-4">
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
              <option value={1}>1</option>
              <option value={2}>2</option>
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
          <div className="flex flex-col w-full py-4 px-2">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => {
                return (
                  <UlasanCard
                    key={index}
                    email={item.email}
                    nama={item.nama}
                    pics={[]}
                    rate={item.ratinghelpdesk}
                    tanggal={item.createdat}
                    jenisLayanan={item.jenislayanan}
                    testimonial={item.testimonialhelpdesk}
                  />
                );
              })
            ) : (
              <p className="text-center">Tidak ada ulasan</p>
            )}
          </div>
          <div className="flex flex-col items-center justify-center mt-4 w-full">
            <div className="flex justify-center items-center mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={`px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-all duration-200 ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}>
                Sebelumnya
              </button>
              <span className="mx-4 text-lg font-semibold">
                Halaman {totalPages === 0 ? 0 : currentPage} dari {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                className={`px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-all duration-200 ${
                  currentPage === totalPages || totalPages === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}>
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UlasanHelpdesk;
