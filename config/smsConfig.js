"use strict";
let twoFactor = {
  apiKey: "c6260fef-2257-11eb-a709-0200cd936042",
  senderId: "SAHIBP", //"WELCOM",
  templates: {
    test: "Welcome",
    rewards_added: "SP-CREDIT", //SAHIBP #VAR1# rewards credited to your account by Sahib Privileges
    rewards_deducted: "SP-REDEEM", //#VAR1# rewards deducted from your account. Balance: #VAR2# rewards
    rewards_otp: "SP-OTP", //#VAR1# is your OTP for redeeming #VAR2# rewards
  },
};

module.exports = {
  twoFactor: twoFactor,
};
