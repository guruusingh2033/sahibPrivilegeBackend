"use strict";

const user = require("./userRoute");
const member = require("./memberRoute");
const vehicle = require("./vehicleRoute");
const transaction = require("./transactionRoute");
const redemption = require("./redemptionRoute");

let APIs = [].concat(user, member, vehicle, transaction, redemption);

module.exports = APIs;
