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
        memberId: Joi.string().required(),
      }),
    },
  },
};

const deleteTransaction = {
  method: "PUT",
  path: "/transaction/delete",
  options: {
    handler: async (request, h) => {
      const result = await transactionController.deleteTransaction(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Delete Transaction",
    notes: "Returns transaction information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        transactionIds: Joi.array().items(),
      }),
    },
  },
};

const getAllTransactions = {
  method: "GET",
  path: "/transaction/list",
  options: {
    handler: async (request, h) => {
      const result = await transactionController.getAllTransactions(
        request.headers.authorization,
        request.query
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Get list of all transactions",
    notes: "Returns transaction information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      query: Joi.object({
        memberId: Joi.string().optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
      }),
    },
  },
};

let member = [
  addTransaction,
  editTransaction,
  getTransactionList,
  deleteTransaction,
  getAllTransactions,
];

module.exports = member;
