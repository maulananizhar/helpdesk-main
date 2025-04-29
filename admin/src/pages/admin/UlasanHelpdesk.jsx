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
                {ulasan.average} <span className="text-xl">dari 5</span>
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
          <div className="flex flex-col w-full py-4 px-2">
            {ulasan.data.length > 0 ? (
              ulasan.data.map((item, index) => {
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
        </div>
      </div>
    </>
  );
};

export default UlasanHelpdesk;
