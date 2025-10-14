const config = require("./utils/config");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const router = require("./router");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const Users = require("./modules/users/users.model");
const Chats = require("./modules/chats/chats.model");
const { sendMessageToChat } = require("./modules/chats/chats.controller");
const fileUpload = require("express-fileupload");

const app = express();
const server = require("http").createServer(app);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(fileUpload());
app.use(express.json({ limit: "50mb" }));

app.use("/img", express.static("img"));
app.use("/api", router);

const path = require("path");
app.use("/client", express.static(path.join(__dirname, "client")));

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      throw new Error("Authorization token is missing");
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log(decoded);
    const user = await Users.findById(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error(error);
    next(new Error("Authentication error"));
  }
});

const socketConnections = {};

io.on("connection", (socket) => {
  socketConnections[socket.user._id] = socket.id;

  socket.on("message", (data) => {
    const { chatId, targetId, message } = data;
    console.log(data);
    try {
      if (
        !Chats.findOne({
          _id: chatId,
          users: { $all: [targetId, socket.user._id] },
        })
      ) {
        throw Error("Chat doesnt exist");
      }
      const targetSocket = socketConnections[targetId];
      if (targetSocket) {
        io.to(targetSocket).emit("new-message", { chatId, message });
      }
      sendMessageToChat(socket.user._id, chatId, message);
    } catch (error) {}
  });
});

module.exports = server;
