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
    RECORDS_DELETED: {
      statusCode: 200,
      customMessage: "Record(s) deleted successfully!",
      type: "RECORDS_DELETED",
    },
    OTP_SENT: {
      statusCode: 200,
      customMessage: "OTP sent successfully!",
      type: "OTP_SENT",
    },
    REWARDS_REDEEMED: {
      statusCode: 200,
      customMessage: "Rewards redeemed successfully!",
      type: "REWARDS_REDEEMED",
    },
    PASSWORD_UPDATED: {
      statusCode: 200,
      customMessage:
        "Password updated successfully, please login again to continue",
      type: "PASSWORD_UPDATED",
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
    RECORD_NOT_FOUND: {
      statusCode: 400,
      customMessage: "Could not find member",
      type: "RECORD_NOT_FOUND",
    },
    OTP_MISMATCH: {
      statusCode: 400,
      customMessage: "OTP doesn't match",
      type: "OTP_MISMATCH",
    },
    NO_REWARD: {
      statusCode: 400,
      customMessage: "No reward point available",
      type: "NO_REWARD",
    },
    NOT_ENOUGH_REWARD: {
      statusCode: 400,
      customMessage: "Not enough reward points available",
      type: "NOT_ENOUGH_REWARD",
    },
    OTP_EXPIRED: {
      statusCode: 400,
      customMessage: "OTP is valid for 10 minutes, please try again",
      type: "OTP_EXPIRED",
    },
    OTP_NOT_SENT: {
      statusCode: 400,
      customMessage: "OTP could not be sent, please try again",
      type: "OTP_NOT_SENT",
    },
    SAME_PASSWORDS: {
      statusCode: 400,
      customMessage: "New password must be different from old password",
      type: "SAME_PASSWORDS",
    },
    WRONG_OLD_PASSWORD: {
      statusCode: 401,
      customMessage: "Incorrect old password",
      type: "WRONG_OLD_PASSWORD",
    },
  },
};

let APP_CONSTANTS = {
  DATABASE: DATABASE,
  STATUS_MSG: STATUS_MSG,
  SERVER: SERVER,
};

module.exports = APP_CONSTANTS;
