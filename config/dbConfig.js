"use strict";
const MySQL = require("mysql");

const connection = MySQL.createConnection({
  host: "172.105.43.57",//"208.91.198.197",
  user: "b201224s_sahib",//"sahib",
  password: "MlhTBUMelS9PQA",//"Sahib@123#",
  database: "b201224s_sahibprivilege",//"sahibPrivilege",
});

module.exports = {
  connection: connection,
};
