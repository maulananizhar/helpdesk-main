import PropTypes from "prop-types"; // Import PropTypes untuk mengecek tipe data

const CaraKerjaCard = props => {
  return (
    <div className="lg:w-1/3 w-1/2 flex flex-col items-center justify-center">
      <div className="bg-secondary rounded-sm p-1 mb-1">{props.icon}</div>
      <p>{props.title}</p>
      <p className="font-light max-w-44 mb-auto">{props.desc}</p>
    </div>
  );
};

// Menentukan tipe data untuk props
CaraKerjaCard.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

export default CaraKerjaCard;
