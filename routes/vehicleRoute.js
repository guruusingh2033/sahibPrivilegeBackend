const Joi = require("@hapi/joi");
const vehicleController = require("../controllers").vehicle;
const DATABASE = require("../config/appConstants").DATABASE;

const addVehicles = {
  method: "POST",
  path: "/vehicle/add",
  options: {
    handler: async (request, h) => {
      const result = await vehicleController.add(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Add vehicles",
    notes: "Returns vehicles information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        memberId: Joi.string().required(),
        vehicleNumber: Joi.string().required(),
        vehicleType: Joi.string().required(),
      }),
    },
  },
};

const editVehicles = {
  method: "PUT",
  path: "/vehicle/edit",
  options: {
    handler: async (request, h) => {
      const result = await vehicleController.edit(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Edit vehicles",
    notes: "Returns vehicles information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        memberId: Joi.string().required(),
        vehicleId: Joi.string().required(),
        vehicleNumber: Joi.string().optional().allow(""),
        vehicleType: Joi.string().optional().allow(""),
      }),
    },
  },
};

const getVehicleList = {
  method: "GET",
  path: "/vehicle/{memberId}",
  options: {
    handler: async (request, h) => {
      const result = await vehicleController.getVehicleList(
        request.headers.authorization,
        request.params
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Get vehicle list of member",
    notes: "Returns vehicle information",
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

const deleteVehicle = {
  method: "PUT",
  path: "/vehicle/delete",
  options: {
    handler: async (request, h) => {
      const result = await vehicleController.deleteVehicle(
        request.headers.authorization,
        request.payload
      );
      return h.response(result).code(result.statusCode);
    },
    description: "Delete Vehicle",
    notes: "Returns vehicle information",
    tags: ["api"], // ADD THIS TAG
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({
        vehicleIds: Joi.array().items(),
      }),
    },
  },
};

let member = [addVehicles, editVehicles, getVehicleList, deleteVehicle];

module.exports = member;
