const dotenv = require("dotenv");

dotenv.config();

exports.PORT = process.env.PORT || 3000;

exports.JWT_SECRET = process.env.JWT_SECRET || "andrea";

exports.DB_URI =
  process.env.NODE_ENV === "dev" ? process.env.DB_URI_DEV : process.env.DB_URI;
