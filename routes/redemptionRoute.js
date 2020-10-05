const Joi = require("@hapi/joi");
const redemptionController = require("../controllers").redemption;
const DATABASE = require("../config/appConstants").DATABASE;

const redeemPoints = {
  method: "POST",
  path: "/redeem/initRedemption",
  options: {
    handler: async (request, h) => {
      const result = await redemptionController.init(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Redeem Points: Step 1, sending OTP",
    notes: "Returns OTP information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        memberId: Joi.string().required(),
        rewards: Joi.string()
          .required()
          .description(
            "for partial float redemption, like out of 7000, 555.5 has to be used"
          ),
      }),
    },
  },
};

const verifyOTP = {
  method: "POST",
  path: "/redeem/confirmRedemption",
  options: {
    handler: async (request, h) => {
      const result = await redemptionController.confirm(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Redeem Points: Step 2, verify OTP",
    notes: "Returns success information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        memberId: Joi.string().required(),
        OTP: Joi.string().required(),
        rewards: Joi.string()
          .required()
          .description(
            "for partial float redemption, like out of 7000, 555.5 has to be used"
          ),
      }),
    },
  },
};

let redeem = [redeemPoints, verifyOTP];

module.exports = redeem;
