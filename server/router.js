const express = require("express");

const router = express.Router();

const usersRoutes = require("./modules/users/users.routes.js");
const swipeRoutes = require("./modules/swipe/swipe.routes.js");
const chatsRoutes = require("./modules/chats/chats.routes.js");

router.use("/users", usersRoutes);
router.use("/swipe", swipeRoutes);
router.use("/chats", chatsRoutes);
router.get("/", (req, res) => {
  res.send("API");
});
module.exports = router;
