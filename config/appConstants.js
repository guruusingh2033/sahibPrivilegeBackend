"use strict";
let SERVER = {
  APP_NAME: "Sahib Previlege",
  PORT: 4000,
};
let DATABASE = {
  GENDER: {
    MALE: "Male",
    FEMALE: "Female",
    OTHERS: "Others",
  },
};

let STATUS_MSG = {
  SUCCESS: {
    DEFAULT: {
      statusCode: 200,
      customMessage: "Success",
      type: "DEFAULT",
    },
    MEMBER_REGISTER: {
      statusCode: 200,
      customMessage: "Member added successfully!",
      type: "MEMBER_REGISTER",
    },
    PROFILE_UPDATED: {
      statusCode: 200,
      customMessage: "Profile updated successfully!",
      type: "PROFILE_UPDATED",
    },
    VEHICLE_ADDED: {
      statusCode: 200,
      customMessage: "Vehicle added successfully!",
      type: "VEHICLE_ADDED",
    },
    VEHICLE_UPDATED: {
      statusCode: 200,
      customMessage: "Vehicle updated successfully!",
      type: "VEHICLE_UPDATED",
    },
    TRANSACTION_ADDED: {
      statusCode: 200,
      customMessage: "Transaction added successfully!",
      type: "TRANSACTION_ADDED",
    },
    TRANSACTION_UPDATED: {
      statusCode: 200,
      customMessage: "Transaction updated successfully!",
      type: "TRANSACTION_UPDATED",
    },
  },
  ERROR: {
    UNAUTHORIZED: {
      statusCode: 401,
      customMessage: "Session Expired",
      type: "UNAUTHORIZED",
    },
    WRONG_EMAIL: {
      statusCode: 401,
      customMessage: "Incorrect Email Id",
      type: "WRONG_EMAIL",
    },
    WRONG_PASSWORD: {
      statusCode: 401,
      customMessage: "Incorrect Password",
      type: "WRONG_PASSWORD",
    },
    MEMBER_ALREADY_REGISTERED: {
      statusCode: 400,
      customMessage: "Mobile number already registered",
      type: "MEMBER_ALREADY_REGISTERED",
    },
    DUPLICATE: {
      statusCode: 400,
      customMessage: "Duplicate",
      type: "DUPLICATE",
    },
  },
};

let APP_CONSTANTS = {
  DATABASE: DATABASE,
  STATUS_MSG: STATUS_MSG,
  SERVER: SERVER,
};

module.exports = APP_CONSTANTS;
