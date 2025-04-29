import PropTypes from "prop-types"; // Import PropTypes untuk untuk validasi props

const BubbleChat = props => {
  return (
    <div
      className={`w-max lg:max-w-[600px] max-w-[80%] rounded-lg px-4 py-3 my-2 shadow ${
        props.role !== props.myRole
          ? "bg-primary text-white mr-auto"
          : "bg-gray-200 text-black ml-auto"
      } `}>
      <p>
        {props.role}: {props.sender}
      </p>
      <p>{props.message}</p>
    </div>
  );
};

// PropTypes untuk validasi props
BubbleChat.propTypes = {
  sender: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  myRole: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default BubbleChat;
