// filepath: c:\Users\Chathrapathi nikhil\Desktop\h1b-web-extension\web-extension-project\backend\db.js
const sql = require("mssql");
// const dotenv = require("dotenv");

// // Load environment variables
// dotenv.config();

// Database configuration
require("dotenv").config();

// const PORT = process.env.PORT || 8085;

var config = {
  user: process.env.user,
  password: process.env.password,
  server: process.env.server,
  database: process.env.database,
  driver: process.env.driver,
  options: {
    encrypt: false,
    trustedconnection: true,
    enableArithAbort: true,
    instancename: "SQLEXPRESS",
  },
  port: 49994,
};

// Function to connect to the database
const connectToDatabase = async () => {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to the database successfully!");
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
};

module.exports = connectToDatabase;
