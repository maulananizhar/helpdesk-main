// components/TimelineItem.jsx
import PropTypes from "prop-types"; // Import PropTypes untuk validasi props

const TimelineItem = props => {
  return (
    <div className="flex items-center mb-6 w-full">
      {/* Date Section */}
      <div className="w-1/3 pr-4 text-right">
        <p className="text-sm font-semibold text-primary">{props.tanggal}</p>
      </div>
      {/* Timeline Dot and Line */}
      <div className="relative flex flex-col items-center">
        <div
          className={`w-6 h-6 rounded-full ${
            props.isLast ? "bg-gray-200" : "bg-primary"
          }`}></div>
        {!props.isLast && (
          <div className="w-0.5 h-16 overflow-clip bg-gray-300 absolute top-6"></div>
        )}
      </div>
      {/* Content Section */}
      <div className="w-2/3 pl-4">
        <h3 className="text-lg font-medium text-black break-words">
          {props.title}
        </h3>
        <p className="text-sm text-gray-600 break-words text-wrap">
          {props.subtitle}
        </p>
      </div>
    </div>
  );
};

// PropTypes untuk validasi props
TimelineItem.propTypes = {
  tanggal: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  isLast: PropTypes.bool.isRequired,
};

export default TimelineItem;
