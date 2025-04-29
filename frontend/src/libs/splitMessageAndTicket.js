// Fungsi untuk memisahkan pesan dan tiket dari string
const splitMessageAndTicket = text => {
  const match = text.match(/^(.*?)\s*(-\s*)?(#\d+\/\d+)$/);
  if (!match) {
    return null;
  }

  return {
    message: match[1].trim(), // ambil pesan sebelum "-"
    ticket: match[3], // ambil ticket dengan #
  };
};

export default splitMessageAndTicket;
