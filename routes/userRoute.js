"use strict";

const Joi = require("@hapi/joi");
const userController = require("../controllers").user;
const DATABASE = require("../config/appConstants").DATABASE;

let login = {
  method: "POST",
  path: "/admin/login",
  options: {
    handler: async (request, h) => {
      console.log("***");

      const result = await userController.login(request.payload);
      console.log("result:::", result);

      return h.response(result).code(result.statusCode);
    },
    description: "Login admin",
    notes: "Returns admin information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      payload: Joi.object({
        emailId: Joi.string().required(),
        password: Joi.string().required(),
      }),
    },
  },
};

// let register = {
//   method: "POST",
//   path: "/menmber/register",
//   options: {
//     handler: async (request, h) => {
//       const result = await userController.register(request.payload);
//       return h.response(result).code(result.statusCode);
//     },
//     description: "Login Admin",
//     notes: "Returns admin information",
//     tags: ["api"], // ADD THIS TAG
//     validate: {
//       payload: Joi.object({
//         emailId: Joi.string().required(),
//         password: Joi.string().required(),
//         firstName: Joi.string().required(),
//         lastName: Joi.string().optional().allow(""),
//         emailId: Joi.string().optional().allow(""),
//         mobileNumber: Joi.string().required(),
//         dateOfBirth: Joi.string().optional().allow(""),
//       }),
//     },
//   },
// };

// let register = {
//   method: "POST",
//   path: "/user/register",
//   options: {
//     handler: async (request, h) => {
//       const result = await userController.register(request.payload);
//       return h.response(result).code(result.statusCode);
//     },
//     description: "Register user",
//     notes: "Returns user information",
//     tags: ["api"], // ADD THIS TAG
//     validate: {
//       payload: Joi.object({
//         firstName: Joi.string().required(),
//         lastName: Joi.string().optional().allow(""),
//         emailId: Joi.string().optional().allow(""),
//         mobileNumber: Joi.string().required(),
//         dateOfBirth: Joi.string().optional().allow(""),
//       }),
//     },
//   },
// };

let getUserProfile = {
  method: "GET",
  path: "/user/getUserProfile",
  options: {
    handler: async (request, h) => {
      const result = await userController.getUserProfile(
        request.headers.authorization
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Get user profile details with access token",
    notes: "Returns user details",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
    },
  },
};

let editUser = {
  method: "PUT",
  path: "/user/editUser",
  options: {
    handler: async (request, h) => {
      const result = await userController.editUser(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Edit User",
    notes: "Returns User information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        userId: Joi.string().required(),
        name: Joi.string().optional().allow(""),
        emailId: Joi.string().optional().allow(""),
        gender: Joi.string()
          .optional()
          .valid(
            DATABASE.GENDER.MALE,
            DATABASE.GENDER.FEMALE,
            DATABASE.GENDER.OTHERS
          )
          .allow(""),
        roleId: Joi.string()
          .optional()
          .allow("")
          .description("Object Id allowed"),
        locationId: Joi.string()
          .optional()
          .allow("")
          .description("Object Id allowed"),
        password: Joi.string().optional().allow(""),
        confirmPassword: Joi.string().optional().allow(""),
        boardArea: Joi.string().optional().allow(""),
        managerName: Joi.string().optional().allow(""),
        managerEmail: Joi.string().optional().allow(""),
        managerId: Joi.string()
          .optional()
          .allow("")
          .description("Object Id allowed"),
        mobileNumber: Joi.string().optional().allow(""),
        alternateName: Joi.string().optional().allow(""),
        isExternal: Joi.boolean().default(false),
        companyName: Joi.string().optional().allow(""),
        designation: Joi.string().optional().allow(""),
      }),
    },
  },
};

let logout = {
  method: "PUT",
  path: "/user/logout",
  options: {
    handler: async (request, h) => {
      const result = await userController.logout(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Logout user",
    notes: "Returns success message",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
    },
  },
};

let getUserList = {
  method: "GET",
  path: "/user/getUserList",
  options: {
    handler: async (request, h) => {
      const result = await userController.getUserList(
        request.headers.authorization
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Get list of user",
    notes: "Returns user list",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
    },
  },
};

let markDeleteOrObsolete = {
  method: "PUT",
  path: "/user/markDeleteOrObsolete",
  options: {
    handler: async (request, h) => {
      const result = await userController.markDeleteOrObsolete(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Mark as Obsolete or deleted",
    notes: "Returns success information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        userIds: Joi.array().items(),
        markAs: Joi.string().required().valid("Delete", "Obsolete"),
        status: Joi.boolean().required(),
      }),
    },
  },
};

let getUserListByRole = {
  method: "GET",
  path: "/user/getUserListByRole",
  options: {
    handler: async (request, h) => {
      const result = await userController.getUserListByRole(
        request.headers.authorization,
        request.query
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Get list of user by role",
    notes: "Returns user list by role",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      query: Joi.object({
        roleId: Joi.string().required().description("Object Id allowed"),
      }),
    },
  },
};

let changePassword = {
  method: "PUT",
  path: "/user/changePassword",
  options: {
    handler: async (request, h) => {
      const result = await userController.changePassword(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Change Password",
    notes: "Returns success information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
        confirmNewPassword: Joi.string().required(),
      }),
    },
  },
};

let getUserListOfManager = {
  method: "GET",
  path: "/user/getUserListOfManager",
  options: {
    handler: async (request, h) => {
      const result = await userController.getUserListOfManager(request.query);
      return h.response(result).code(result.statusCode);
    },
    description: "Get list of user of manager",
    notes: "Returns user list by role",
    tags: ["api"], // ADD THIS TAG
    validate: {
      query: Joi.object({
        managerId: Joi.string().required().description("Object Id allowed"),
      }),
    },
  },
};

let getUserProfileById = {
  method: "GET",
  path: "/user/getUserProfileById",
  options: {
    handler: async (request, h) => {
      const result = await userController.getUserProfileById(request.query);
      return h.response(result).code(result.statusCode);
    },
    description: "Get user profile details with id",
    notes: "Returns user details",
    tags: ["api"], // ADD THIS TAG
    validate: {
      query: Joi.object({
        userId: Joi.string().required(),
      }),
    },
  },
};

const getUserProfileByName = {
  method: "GET",
  path: "/user/getUserProfileByName",
  options: {
    handler: async (request, h) => {
      const result = await userController.getUserProfileByName(
        request.headers.authorization,
        request.query
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Get user profile details by Name",
    notes: "Returns user details",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().optional().allow(""),
      }).options({ allowUnknown: true }),
      query: Joi.object({
        name: Joi.string().required(),
        managerId: Joi.string().optional().allow(""),
      }),
    },
  },
};

let user = [
  // register,
  login,
  // editUser,
  // logout,
  // getUserList,
  // getUserProfile,
  // markDeleteOrObsolete,
  // getUserListByRole,
  // changePassword,
  // getUserListOfManager,
  // getUserProfileById,
  // getUserProfileByName,
];

module.exports = user;
