// import icons star untuk rating
import { MdStar } from "react-icons/md";
// import PropTypes untuk memeriksa tipe data
import PropTypes from "prop-types";

// import convertTimezone untuk mengubah format waktu
import convertTimezone from "../libs/convertTimezone";

const UlasanCard = props => {
  // Fungsi untuk memformat nama
  const formatNama = arr => {
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(", ") + " dan " + arr[arr.length - 1];
  };

  return (
    <>
      <div className="flex my-8">
        <div className="shrink-0">
          <img
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${props.nama}`}
            alt={props.nama}
            className="w-10 h-10 rounded-full border-2 border-primary"
          />
        </div>
        <div className="flex flex-col ml-4 space-y-1">
          <p className="text-sm font-medium">{props.email}</p>
          <p className="text-xs">{props.nama}</p>
          <div className="flex items-center space-x-1">
            {props.rate >= 1 ? (
              <MdStar className="w-4 h-4 text-yellow-400" />
            ) : (
              <MdStar className="w-4 h-4 text-gray-300" />
            )}
            {props.rate >= 2 ? (
              <MdStar className="w-4 h-4 text-yellow-400" />
            ) : (
              <MdStar className="w-4 h-4 text-gray-300" />
            )}
            {props.rate >= 3 ? (
              <MdStar className="w-4 h-4 text-yellow-400" />
            ) : (
              <MdStar className="w-4 h-4 text-gray-300" />
            )}
            {props.rate >= 4 ? (
              <MdStar className="w-4 h-4 text-yellow-400" />
            ) : (
              <MdStar className="w-4 h-4 text-gray-300" />
            )}
            {props.rate >= 5 ? (
              <MdStar className="w-4 h-4 text-yellow-400" />
            ) : (
              <MdStar className="w-4 h-4 text-gray-300" />
            )}
          </div>
          <p className="text-sm">
            {convertTimezone(props.tanggal)} | {props.jenisLayanan}
            {props.pics.length > 0 ? " | " : ""}
            {formatNama(props.pics)}
          </p>
          <p>{props.testimonial}</p>
        </div>
      </div>
      <hr className="border-gray-300" />
    </>
  );
};

// PropTypes untuk memeriksa tipe data
UlasanCard.propTypes = {
  email: PropTypes.string.isRequired,
  nama: PropTypes.string.isRequired,
  pics: PropTypes.arrayOf(PropTypes.string),
  tanggal: PropTypes.string.isRequired,
  jenisLayanan: PropTypes.string.isRequired,
  testimonial: PropTypes.string.isRequired,
  rate: PropTypes.number.isRequired,
};

export default UlasanCard;
