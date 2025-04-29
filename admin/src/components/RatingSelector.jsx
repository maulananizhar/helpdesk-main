// import PropTypes untuk memeriksa tipe data
import PropTypes from "prop-types";

function RatingSelector(props) {
  // Object untuk query rating
  const query = [
    { rating: null, label: "Semua" },
    { rating: 1, label: "Bintang 1" },
    { rating: 2, label: "Bintang 2" },
    { rating: 3, label: "Bintang 3" },
    { rating: 4, label: "Bintang 4" },
    { rating: 5, label: "Bintang 5" },
  ];

  return (
    <div className="flex space-x-2">
      {query.map(rate => (
        <p
          key={rate.rating}
          className={`px-4 py-2 h-fit border cursor-pointer ${
            props.darkMode
              ? props.rating === rate.rating
                ? "bg-gray-800 border-yellow-400"
                : "bg-gray-800 border-gray-950"
              : props.rating === rate.rating
              ? "bg-gray-100 border-yellow-400"
              : "bg-gray-100 border-gray-300"
          }`}
          onClick={() => props.setRating(rate.rating)}>
          {rate.label}
        </p>
      ))}
    </div>
  );
}

// PropTypes untuk memeriksa tipe data
RatingSelector.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  rating: PropTypes.number,
  setRating: PropTypes.func.isRequired,
};

export default RatingSelector;
