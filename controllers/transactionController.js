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
      console.log("vehicle");

      const sql =
        "INSERT INTO `transactions` (`memberId`,`billNumber`,`quantity`) values(?,?,?)";
      const params = [req.memberId, req.billNumber, req.quantity];
      await dbHandle.preparedQuery(sql, params);

      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.TRANSACTION_ADDED,
        {}
      );
    } catch (e) {
      console.log("error ****", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      console.log("error object:", errorObject);

      return errorObject.output.payload;
    }
  },

  edit: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }

      let sql = `UPDATE transactions SET billNumber = '${req.billNumber}', quantity = '${req.quantity}' WHERE id = ${req.transactionId} AND memberId = ${req.memberId}`;
      await dbHandle.preparedQuery(sql);
      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.TRANSACTION_UPDATED,
        {}
      );
    } catch (e) {
      console.log("ERROR", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  getTransactionList: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      const sql = `SELECT * FROM transactions WHERE memberId = ?`;
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

  deleteTransaction: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      req.transactionIds.join(",");
      let sql = `
      DELETE FROM transactions WHERE id IN (${req.transactionIds});
      `;
      console.log(sql);
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
