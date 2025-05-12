import deleteTimelineById from "../libs/deleteTimelineById.js"; // Fungsi untuk menghapus timeline
import getChatsByRoom from "../libs/getChatsByRoom.js"; // Fungsi untuk mendapatkan chat
import getNotifications from "../libs/getNotifications.js"; // Fungsi untuk mendapatkan notifikasi
import getTimeline from "../libs/getTimeline.js"; // Fungsi untuk mendapatkan timeline
import saveMessageToDatabase from "../libs/saveMessageToDatabase.js"; // Fungsi untuk menyimpan pesan ke database
import saveNotificationsToDatabase from "../libs/saveNotificationsToDatabase.js"; // Fungsi untuk menyimpan notifikasi ke database
import saveTimelineToDatabase from "../libs/saveTimelineToDatabase.js"; // Fungsi untuk menyimpan timeline ke database

const joinRoom = async (io, socket) => {
  // Mendengar untuk event join-room
  socket.on("join-room", async room => {
    // Bergabung dengan room
    socket.join(room);

    // Mengambil pesan dari database berdasarkan room
    const messages = await getChatsByRoom(room);
    socket.emit("chat-history", messages);

    /// Mengambil timeline dari database berdasarkan ticket
    const timeline = await getTimeline(room);
    socket.emit("timeline-history", timeline);
  });
};

const sendMessage = async (io, socket) => {
  // Mendengar untuk event send-message
  socket.on("send-message", async data => {
    // Bergabung dengan room
    socket.join(data.room);

    // Mengirim pesan ke database
    const message = await saveMessageToDatabase(
      data.room,
      data.name,
      data.sender,
      data.role,
      data.message
    );

    // Mengirim pesan ke room
    io.to(data.room).emit("receive-message", {
      id: message.id,
      room: message.room,
      name: message.name,
      sender: message.sender,
      role: message.role,
      message: message.message,
      created_at: message.created_at,
    });
  });
};

const sendTimeline = async (io, socket) => {
  // Mendengar untuk event send-timeline
  socket.on("send-timeline", async data => {
    // Bergabung dengan room
    socket.join(data.ticket);

    // Mengirim timeline ke database
    const timeline = await saveTimelineToDatabase(
      data.ticket,
      data.title,
      data.subtitle
    );
    // Mengirim timeline ke room
    io.to(data.ticket).emit("receive-timeline", {
      id: timeline.id,
      ticket: timeline.ticket,
      title: timeline.title,
      subtitle: timeline.subtitle,
      created_at: timeline.created_at,
    });
  });
};

const deleteTimeline = async (io, socket) => {
  // Mendengar untuk event delete-timeline
  socket.on("delete-timeline", async data => {
    // Bergabung dengan room
    socket.join(data.ticket);

    // Menghapus timeline dari database berdasarkan id
    await deleteTimelineById(data.id);

    // Mengambil timeline dari database berdasarkan ticket
    const timeline = await getTimeline(data.ticket);
    // Mengirim timeline ke room
    io.to(data.ticket).emit("timeline-history", timeline);
  });
};

const notification = async (io, socket) => {
  // Mendengar untuk event join-notification
  socket.on("join-notification", async receiver => {
    // Bergabung dengan room
    socket.join(receiver);

    // Mengambil notifikasi dari database berdasarkan receiver
    const notifications = await getNotifications(receiver);
    // Mengirim notifikasi ke room
    socket.emit("notification-history", notifications);
  });

  // Mendengar untuk event send-notification
  socket.on("send-notification", async data => {
    // Bergabung dengan room
    await socket.join(data.receiver);

    // Mengirim notifikasi ke database
    const notification = await saveNotificationsToDatabase(
      data.receiver,
      data.message
    );

    // Mengirim notifikasi ke room
    io.to(data.receiver).emit("receive-notification", {
      id: notification.id,
      receiver: notification.receiver,
      message: notification.message,
      created_at: notification.created_at,
    });
  });
};

export { joinRoom, sendMessage, sendTimeline, deleteTimeline, notification };
