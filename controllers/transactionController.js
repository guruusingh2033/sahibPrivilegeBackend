const Utilities = require("../utils/utilities");
const APP_CONSTANTS = require("../config/appConstants");
const dbHandle = require("../utils/mySqlConnect").mysql;
const moment = require("moment");
const smsTemplate = require("../config/smsConfig").twoFactor;
module.exports = {
  add: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }

      const sql =
        "INSERT INTO `transactions` (`memberId`,`billNumber`,`quantity`) values(?,?,?)";
      const params = [req.memberId, req.billNumber, req.quantity];
      await dbHandle.preparedQuery(sql, params);

      const sqlGetTransaction = `SELECT mem.rewards, mem.mobile, mem.firstName, mem.lastName, trs.id FROM members mem 
        LEFT JOIN transactions trs 
        ON
        mem.id = trs.memberId
        WHERE 
        trs.billNumber = ? AND mem.id = ?`;
      const paramsGetTransaction = [req.billNumber, req.memberId];
      const transaction = await dbHandle.preparedQuery(
        sqlGetTransaction,
        paramsGetTransaction
      );

      if (transaction && transaction.length) {
        const transactionId = transaction[0].id;
        const rewardPoints = await calculateRewardPoints(req.quantity);
        const sqlRewardsEarned =
          "INSERT INTO `rewardsEarning` (`memberId`,`rewardPoints`,`transactionId`) values(?,?,?)";
        const paramsRewardsEarned = [req.memberId, rewardPoints, transactionId];
        await dbHandle.preparedQuery(sqlRewardsEarned, paramsRewardsEarned);

        let updatedRewards = transaction[0].rewards + rewardPoints;
        const sqlRewardsUpdate = `UPDATE members SET rewards = ? WHERE id = ${req.memberId}`;
        await dbHandle.preparedQuery(sqlRewardsUpdate, [updatedRewards]);
        // Utilities.send2FactorSMS(
        //   transaction[0].mobile,
        //   smsTemplate.templates.rewards_added,
        //   rewardPoints
        // );
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.SUCCESS.TRANSACTION_ADDED,
          {}
        );
      }
    } catch (e) {
      console.log("ERROR: ", e);
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

  getAllTransactions: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      let sql = `SELECT trs.id, trs.memberId, trs.billNumber, trs.quantity, trs.createdAt, mem.firstName, mem.lastName FROM transactions trs
      JOIN members mem ON mem.id = trs.memberId`;
      let params;
      if (req.memberId) {
        sql += ` WHERE trs.memberId = ?`;
        params = [req.memberId];
      }
      if (req.startDate && req.endDate) {
        const startDate = moment(req.startDate).format("YYYY-MM-DD");
        const endDate = moment(req.endDate).format("YYYY-MM-DD");
        if (req.memberId) {
          sql += ` AND`;
        } else {
          sql += ` WHERE`;
        }
        sql += ` cast(trs.createdAt as date) BETWEEN '${startDate}' AND '${endDate}'`;
      }

      sql += ` ORDER BY trs.createdAt DESC LIMIT 50`;

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
};

const calculateRewardPoints = async (quantity) => {
  const sql = `SELECT * FROM settings WHERE id = ?`;
  const params = ["1"];
  const data = await dbHandle.preparedQuery(sql, params);
  if (data && data.length) {
    return (data[0].rewardPoints * quantity) / data[0].quantityPerLitre;
  }
};
