import PropTypes from "prop-types"; // Import PropTypes untuk untuk validasi props
import TimelineItem from "./TimeLineItem"; // Import TimelineItem untuk menampilkan setiap item dalam timeline
import convertTimezone from "../../../libs/convertTimezone"; // Import convertTimezone untuk mengonversi zona waktu

const Timeline = ({ timeline }) => {
  return (
    <div className="max-w-2xl mx-auto sm:p-6 p-0">
      {timeline.map((item, index) => (
        <TimelineItem
          key={index}
          tanggal={convertTimezone(item.created_at, false)}
          title={item.title}
          subtitle={item.subtitle}
          isLast={index === timeline.length - 1}
        />
      ))}
    </div>
  );
};

// PropTypes untuk validasi props
Timeline.propTypes = {
  timeline: PropTypes.arrayOf(
    PropTypes.shape({
      created_at: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Timeline;
