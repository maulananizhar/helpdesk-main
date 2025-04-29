import PropTypes from "prop-types"; // Import PropTypes untuk mengecek tipe data
import { MdStar } from "react-icons/md"; // Import MdStar dari react-icons untuk ikon bintang

const TestimonialCard = props => {
  return (
    <div className="lg:w-1/3 w-1/2 min-w-96 flex flex-col justify-center bg-secondary max-w-96 px-4 py-6 rounded-lg shadow-md">
      <div className="flex">
        <div className="flex">
          {props.rate >= 1 ? (
            <MdStar className="w-5 h-5 text-yellow-400" />
          ) : (
            <MdStar className="w-5 h-5 text-gray-300" />
          )}
          {props.rate >= 2 ? (
            <MdStar className="w-5 h-5 text-yellow-400" />
          ) : (
            <MdStar className="w-5 h-5 text-gray-300" />
          )}
          {props.rate >= 3 ? (
            <MdStar className="w-5 h-5 text-yellow-400" />
          ) : (
            <MdStar className="w-5 h-5 text-gray-300" />
          )}
          {props.rate >= 4 ? (
            <MdStar className="w-5 h-5 text-yellow-400" />
          ) : (
            <MdStar className="w-5 h-5 text-gray-300" />
          )}
          {props.rate >= 5 ? (
            <MdStar className="w-5 h-5 text-yellow-400" />
          ) : (
            <MdStar className="w-5 h-5 text-gray-300" />
          )}
        </div>
        <p className="ml-auto font-normal">{props.jenisLayanan}</p>
      </div>
      <p className="font-normal mt-2 mb-auto line-clamp-3">
        {props.testimonial}
      </p>
      <div className="flex items-center mt-4 gap-2">
        <img
          src={`https://api.dicebear.com/9.x/initials/svg?seed=${props.nama}`}
          alt={props.nama}
          className="w-8 h-8 rounded-full border-2 border-primary"
        />
        <p>{props.nama}</p>
      </div>
    </div>
  );
};

// Menentukan tipe data untuk props
TestimonialCard.propTypes = {
  nama: PropTypes.string.isRequired,
  jenisLayanan: PropTypes.string.isRequired,
  testimonial: PropTypes.string.isRequired,
  rate: PropTypes.number.isRequired,
};

export default TestimonialCard;
