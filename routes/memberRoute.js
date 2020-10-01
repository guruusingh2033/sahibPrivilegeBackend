const Joi = require("@hapi/joi");
const memberController = require("../controllers").member;
const DATABASE = require("../config/appConstants").DATABASE;

const register = {
  method: "POST",
  path: "/member/register",
  options: {
    handler: async (request, h) => {
      console.log("***");

      const result = await memberController.register(
        request.headers.authorization,
        request.payload
      );
      console.log("result:::", result);

      return h.response(result).code(result.statusCode);
    },
    description: "Register Member",
    notes: "Returns member information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().optional().allow(""),
        mobile: Joi.string().required(),
        emailId: Joi.string().optional().allow(""),
        dateOfBirth: Joi.string().optional().allow(""),
        referralCode: Joi.string().optional().allow(""),
      }),
    },
  },
};

const editMember = {
  method: "PUT",
  path: "/member/edit",
  options: {
    handler: async (request, h) => {
      const result = await memberController.editMember(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Edit Member",
    notes: "Returns member information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        memberId: Joi.string().required(),
        firstName: Joi.string().optional().allow(""),
        lastName: Joi.string().optional().allow(""),
        mobile: Joi.string().optional().allow(""),
        emailId: Joi.string().optional().allow(""),
        dateOfBirth: Joi.string().optional().allow(""),
      }),
    },
  },
};

const getMemberList = {
  method: "GET",
  path: "/member/geMembertList",
  options: {
    handler: async (request, h) => {
      const result = await memberController.getMemberList(
        request.headers.authorization
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Get Member List",
    notes: "Returns member information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
    },
  },
};

const deleteMember = {
  method: "PUT",
  path: "/member/delete",
  options: {
    handler: async (request, h) => {
      const result = await memberController.deleteMember(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Delete Member",
    notes: "Returns member information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        memberIds: Joi.array().items(),
      }),
    },
  },
};

let member = [register, editMember, getMemberList, deleteMember];

module.exports = member;
