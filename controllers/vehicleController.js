const Utilities = require("../utils/utilities");
const APP_CONSTANTS = require("../config/appConstants");
const dbHandle = require("../utils/mySqlConnect").mysql;

module.exports = {
  add: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      const sql =
        "INSERT INTO `vehicles` (`memberId`,`vehicleNumber`,`vehicleType`) values(?,?,?)";
      const params = [req.memberId, req.vehicleNumber, req.vehicleType];
      await dbHandle.preparedQuery(sql, params);

      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.VEHICLE_ADDED,
        {}
      );
    } catch (e) {
      console.log("ERROR:", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  edit: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }

      let sql = `UPDATE vehicles SET vehicleNumber = '${req.vehicleNumber}', vehicleType = '${req.vehicleType}' WHERE id = ${req.vehicleId} AND memberId = ${req.memberId}`;
      await dbHandle.preparedQuery(sql);
      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.VEHICLE_UPDATED,
        {}
      );
    } catch (e) {
      console.log("ERROR", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  getVehicleList: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      const sql = `SELECT * FROM vehicles WHERE memberId = ?`;
      const params = [req.memberId];
      const data = await dbHandle.preparedQuery(sql, params);
      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
        data
      );
    } catch (e) {
      console.log("ERROR", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  deleteVehicle: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      req.vehicleIds.join(",");
      let sql = `
      DELETE FROM vehicles WHERE id IN (${req.vehicleIds});
      `;
      await dbHandle.preparedQuery(sql);

      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.RECORDS_DELETED,
        {}
      );
    } catch (e) {
      console.log("ERROR", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },
};
