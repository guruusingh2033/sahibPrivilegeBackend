const Joi = require("@hapi/joi");
const transactionController = require("../controllers").transaction;
const DATABASE = require("../config/appConstants").DATABASE;

const addTransaction = {
  method: "POST",
  path: "/transaction/add",
  options: {
    handler: async (request, h) => {
      console.log("***");

      const result = await transactionController.add(
        request.headers.authorization,
        request.payload
      );
      console.log("result:::", result);

      return h.response(result).code(result.statusCode);
    },
    description: "Add transaction",
    notes: "Returns transaction information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        memberId: Joi.string().required(),
          billNumber: Joi.string().required(),
          quantity: Joi.string().required(),
      }),
    },
  },
};

const editTransaction = {
  method: "PUT",
  path: "/transaction/edit",
  options: {
    handler: async (request, h) => {
      const result = await transactionController.edit(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Edit transaction",
    notes: "Returns transaction information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        memberId: Joi.string().required(),
          transactionId: Joi.string().required(),
          billNumber: Joi.string().optional().allow(""),
          quantity: Joi.string().optional().allow(""),
      }),
    },
  },
};


const getTransactionList = {
  method: "GET",
  path: "/transaction/{memberId}",
  options: {
    handler: async (request, h) => {
      const result = await transactionController.getTransactionList(
        request.headers.authorization,
        request.params
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Get transaction list of member",
    notes: "Returns transaction information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      params: Joi.object({
        memberId: Joi.string().required()
      }),
    },
  },
};

let member = [addTransaction, editTransaction, getTransactionList];

module.exports = member;
