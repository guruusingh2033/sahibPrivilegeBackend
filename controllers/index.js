const user = require("./userController");
const member = require("./memberController");
const vehicle = require("./vehicleController");
const transaction = require("./transactionController");

module.exports = {
  user,
  member,
  vehicle,
  transaction
};
