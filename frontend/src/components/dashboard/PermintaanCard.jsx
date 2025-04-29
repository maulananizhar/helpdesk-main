import PropTypes from "prop-types"; // Import PropTypes untuk untuk validasi props
import convertTimezone from "../../libs/convertTimezone"; // Import convertTimezone untuk mengonversi zona waktu

const PermintaanCard = props => {
  return (
    <>
      <div className="w-full flex flex-col bg-white border-primary border rounded-lg shadow items-start px-6 py-4 my-4">
        <p className="font-medium text-gray-600 text-sm">{props.ticket}</p>
        {props.pics[0] == null ? (
          <div className="w-full flex text-left">
            <p className="w-1/2 font-medium">PIC</p>
            <p className="w-1/2">: Belum ditugaskan</p>
          </div>
        ) : (
          props.pics.map((pic, index) => (
            <>
              <div
                className="w-full flex text-left items-center gap-4"
                key={index}>
                <img
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${pic}`}
                  alt={pic}
                  className="w-10 h-10 rounded-full border-2 border-primary my-2"
                />
                <p className="font-bold text-xl">{pic}</p>
              </div>
            </>
          ))
        )}
        <div className="w-full flex text-left">
          <p className="w-1/2 font-medium">Tanggal</p>
          <p className="w-1/2">: {convertTimezone(props.tanggal)}</p>
        </div>
        <div className="w-full flex text-left">
          <p className="w-1/2 font-medium">Unit</p>
          <p className="w-1/2">: {props.unit}</p>
        </div>
        <div className="w-full flex text-left">
          <p className="w-1/2 font-medium">Jenis Layanan</p>
          <p className="w-1/2">
            : {props.jenisLayanan == null ? "-" : props.jenisLayanan}
          </p>
        </div>
        <div className="w-full flex text-left">
          <p className="w-1/2 font-medium">Sub Jenis Layanan</p>
          <p className="w-1/2">
            : {props.subJenisLayanan == null ? "-" : props.subJenisLayanan}
          </p>
        </div>
        <div className="w-full flex text-left">
          <p className="w-1/2 font-medium">Status</p>
          <p className="w-1/2">: {props.status}</p>
        </div>
        <div
          className={`w-full justify-center items-center mt-2 ${
            props.detail ? "flex" : "hidden"
          }`}>
          <a
            href={`/user/dashboard/permintaan-saya/${encodeURIComponent(
              props.ticket
            )}`}
            className="w-full text-center bg-primary hover:bg-primary-hover text-white font-medium rounded py-1 transition-all duration-300">
            Detail Permintaan
          </a>
        </div>
      </div>
    </>
  );
};

// PropTypes untuk validasi props
PermintaanCard.propTypes = {
  ticket: PropTypes.string.isRequired,
  pics: PropTypes.arrayOf(PropTypes.string).isRequired,
  tanggal: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  jenisLayanan: PropTypes.string.isRequired,
  subJenisLayanan: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  detail: PropTypes.bool.isRequired,
};

export default PermintaanCard;
