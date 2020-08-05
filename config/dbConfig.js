"use strict";
const MySQL = require("mysql");

const connection = MySQL.createConnection({
  host: "208.91.198.197",
  user: "sahib",
  password: "Sahib@123#",
  database: "sahibPrivilege",
});

module.exports = {
  connection: connection,
};
