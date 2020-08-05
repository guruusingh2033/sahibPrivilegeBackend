"use strict";

const user = require("./userRoute");
const member = require("./memberRoute");
const vehicle = require("./vehicleRoute");
const transaction = require("./transactionRoute");

let APIs = [].concat(user, member, vehicle, transaction);

module.exports = APIs;
