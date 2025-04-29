const validateFields = (fields, res) => {
  // Melakukan perulanganan pada setiap field
  for (const [key, value] of Object.entries(fields)) {
    // Jika field tidak ada isinya
    if (!value) {
      // Mengubah key menjadi format yang lebih baik
      const formattedKey = key
        // replace camelCase dan snake_case menjadi spasi
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        // replace underscore menjadi spasi
        .replace(/_/g, " ")
        // replace dash menjadi spasi
        .replace(/\b\w/g, char => char.toUpperCase());
      // mengembalikan response error
      res.status(400).json({
        success: false,
        message: `${formattedKey} wajib diisi!`,
      });
      return false;
    }
  }
  return true;
};

export default validateFields;
