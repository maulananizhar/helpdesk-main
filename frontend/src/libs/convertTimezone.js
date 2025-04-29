// Fungsi untuk mengonversi waktu UTC ke Waktu Indonesia Barat (WIB) dan mengembalikan format tanggal dan waktu dalam bahasa Indonesia.
const convertTimezone = (utcString, day = true) => {
  const wibDate = new Date(utcString); // Mengonversi UTC ke Waktu Indonesia Barat (WIB)

  // Nama hari dalam bahasa Indonesia
  const hari = wibDate.toLocaleDateString("id-ID", { weekday: "long" });

  // Format tanggal
  const tanggal = wibDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Format waktu
  const waktu = wibDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Mengembalikan format waktu sesuai dengan parameter day
  if (day) {
    return `${hari}, ${tanggal} ${waktu} WIB`;
  }

  return `${tanggal} ${waktu} WIB`;
};

export default convertTimezone;
