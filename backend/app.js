const express = require("express");
const cors = require("cors");
const sql = require("mssql");
require("dotenv").config();
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const config = {
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

sql.connect(config, (err) => {
  if (err) console.log("Database connection error:", err);
  else console.log("Connected to the database");
});

// Use routes
app.use("/", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
