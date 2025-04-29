import PropTypes from "prop-types"; // Import PropTypes untuk mengecek tipe data

const NavigationDesktop = props => {
  return (
    <a
      href={`${props.href}`}
      className="group relative inline-block text-gray-800 hover:text-primary transition-all duration-300">
      {props.text}
      <span className="absolute left-1/2 bottom-0 w-0 h-[1px] bg-primary transition-all duration-300 origin-center group-hover:w-full group-hover:left-0"></span>
    </a>
  );
};

// Menentukan tipe data untuk props
NavigationDesktop.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default NavigationDesktop;
