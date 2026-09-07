const rateLimit = require("express-rate-limit");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");
const Group = require("./models/Group");
const questionRoutes = require("./routes/questionRoutes");

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/groups", messageRoutes);
app.use("/api/questions", questionRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Student Collaboration API is running" });
});

// Socket.IO: authenticate the connection using the same JWT as the REST API
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_group", (groupId) => {
    socket.join(groupId);
  });
    // ---- WebRTC call signaling ----
socket.on("join_call", (groupId) => {
  const room = `call-${groupId}`;
  const currentSize = io.sockets.adapter.rooms.get(room)?.size || 0;

  if (currentSize >= 6) {
    socket.emit("call_full");
    return;
  }

  socket.join(room);

  const otherSockets = Array.from(
    io.sockets.adapter.rooms.get(room) || []
  ).filter((id) => id !== socket.id);

  socket.emit("existing_call_users", otherSockets);

  socket.to(room).emit("user_joined_call", socket.id);
});

  socket.on("webrtc_offer", ({ to, offer }) => {
    io.to(to).emit("webrtc_offer", { from: socket.id, offer });
  });

  socket.on("webrtc_answer", ({ to, answer }) => {
    io.to(to).emit("webrtc_answer", { from: socket.id, answer });
  });

  socket.on("webrtc_ice_candidate", ({ to, candidate }) => {
    io.to(to).emit("webrtc_ice_candidate", { from: socket.id, candidate });
  });

  socket.on("leave_call", (groupId) => {
    const room = `call-${groupId}`;
    socket.leave(room);
    socket.to(room).emit("user_left_call", socket.id);
  });

 socket.on("send_message", async ({ groupId, text }) => {
  try {
    if (!text || text.length > 2000) return; // silently ignore invalid messages

    const group = await Group.findById(groupId);
    if (!group) return;
    // ...rest stays the same

      const isMember = group.members.some(
        (id) => id.toString() === socket.userId
      );
      if (!isMember) return;

      const message = await Message.create({
        group: groupId,
        sender: socket.userId,
        text,
      });

      const populated = await message.populate("sender", "name");

      io.to(groupId).emit("receive_message", populated);
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
    }
  });

    socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    socket.rooms.forEach((room) => {
      if (room.startsWith("call-")) {
        socket.to(room).emit("user_left_call", socket.id);
      }
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});