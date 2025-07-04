const convertTimezone = (utcString, day = true, time = false) => {
  // Convert UTC string ke Date object
  const wibDate = new Date(utcString);

  // Nama hari dalam bahasa Indonesia
  const hari = wibDate.toLocaleDateString("id-ID", { weekday: "long" });

  // Format tanggal dan waktu
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

  // Jika hanya waktu yang diminta
  if (time) {
    return `${waktu}`;
  }

  // Format hasil
  if (day) {
    return `${hari}, ${tanggal} ${waktu} WIB`;
  }

  return `${tanggal} ${waktu} WIB`;
};

export default convertTimezone;
