import db from "../config/db.js";

const getChatsByRoom = async room => {
  try {
    // Validasi input
    if (!room) {
      console.error("Room is required!");
      return;
    }

    // Ambil pesan dari database berdasarkan room
    const result = await db.query(
      "SELECT * FROM chat WHERE room = $1 ORDER BY id",
      [room]
    );

    return result.rows;
  } catch (error) {
    console.error("Error retrieving chats:", error);
  }
};

export default getChatsByRoom;
