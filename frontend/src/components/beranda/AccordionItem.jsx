import PropTypes from "prop-types"; // Import PropTypes untuk mengecek tipe data
import { useState } from "react"; // Import useState untuk mengelola state komponen
import { FaChevronDown } from "react-icons/fa"; // Import FaChevronDown dari react-icons untuk ikon panah

const AccordionItem = props => {
  // Inisialisasi state untuk mengelola apakah accordion terbuka atau tertutup
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg mb-2 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-secondary transition-all hover:underline">
        <span className="text-left font-medium">{props.title}</span>
        <FaChevronDown
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-max-height duration-300 ease-in-out ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}>
        <div className="px-4 py-3 font-normal bg-white text-sm text-gray-700">
          {props.content}
        </div>
      </div>
    </div>
  );
};

// Menentukan tipe data untuk props
AccordionItem.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default AccordionItem;
