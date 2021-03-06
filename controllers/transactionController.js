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
      let currentTime = moment(new Date())
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");

      const sql =
        "INSERT INTO `transactions` (`memberId`,`billNumber`,`quantity`,`createdAt`) values(?,?,?,?)";
      const params = [req.memberId, req.billNumber, req.quantity, currentTime];
      await dbHandle.preparedQuery(sql, params);

      const transaction = await getMemberTransactionByBillNumber(
        req.billNumber,
        req.memberId
      );

      if (transaction && transaction.length) {
        const transactionId = transaction[0].id;
        const rewardPoints = await calculateRewardPoints(req.quantity);
        const sqlRewardsEarned =
          "INSERT INTO `rewardsEarning` (`memberId`,`rewardPoints`,`transactionId`) values(?,?,?)";
        const paramsRewardsEarned = [req.memberId, rewardPoints, transactionId];
        await dbHandle.preparedQuery(sqlRewardsEarned, paramsRewardsEarned);

        await updateMemberRewards(
          transaction[0].mobile,
          transaction[0].rewards,
          rewardPoints,
          req.memberId,
          false
        );

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

      const transaction = await getMemberTransactionByTransactionId(
        req.transactionId,
        req.memberId
      );
      const currentRewards = transaction[0].rewards,
        earlierQuantity = transaction[0].quantity;

      if (transaction && transaction.length) {
        let sql = `UPDATE transactions SET billNumber = '${req.billNumber}', quantity = '${req.quantity}' WHERE id = ${req.transactionId} AND memberId = ${req.memberId}`;
        await dbHandle.preparedQuery(sql);

        const transactionId = transaction[0].id;
        const rewardPoints = await calculateRewardPoints(req.quantity);
        const sqlRewardsEarned = `UPDATE rewardsEarning SET rewardPoints = ? WHERE transactionId = ? AND memberId = ?`;
        const paramsRewardsEarned = [rewardPoints, transactionId, req.memberId];
        await dbHandle.preparedQuery(sqlRewardsEarned, paramsRewardsEarned);

        await updateMemberRewards(
          transaction[0].mobile,
          currentRewards,
          rewardPoints,
          req.memberId,
          true,
          earlierQuantity
        );

        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.SUCCESS.TRANSACTION_UPDATED,
          {}
        );
      }
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
      let transactionId = req.transactionIds[0];
      req.transactionIds.join(",");
      const transaction = await getTransactionDetails(transactionId);
      if (transaction && transaction.length) {
        let updatedRewards =
          transaction[0].rewards - transaction[0].rewardPoints;
        const sqlRewardsUpdate = `UPDATE members SET rewards = ? WHERE id = ${transaction[0].memberId}`;
        await dbHandle.preparedQuery(sqlRewardsUpdate, [updatedRewards]);

        let sql = `
        DELETE FROM transactions WHERE id IN (${req.transactionIds});
        `;
        await dbHandle.preparedQuery(sql);

        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.SUCCESS.RECORDS_DELETED,
          {}
        );
      }
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
        const startDate = moment(req.startDate).format("YYYY-MM-DD HH:mm:ss");
        const endDate = moment(req.endDate).format("YYYY-MM-DD HH:mm:ss");
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

const getMemberTransactionByBillNumber = async (billNumber, memberId) => {
  const sqlGetTransaction = `SELECT mem.rewards, mem.mobile, mem.firstName, mem.lastName, trs.id, trs.quantity FROM members mem 
  LEFT JOIN transactions trs 
  ON
  mem.id = trs.memberId
  WHERE 
  trs.billNumber = ? AND mem.id = ?`;
  const paramsGetTransaction = [billNumber, memberId];
  const transaction = await dbHandle.preparedQuery(
    sqlGetTransaction,
    paramsGetTransaction
  );
  return transaction;
};

const getMemberTransactionByTransactionId = async (transactionId, memberId) => {
  const sqlGetTransaction = `SELECT mem.rewards, mem.mobile, mem.firstName, mem.lastName, trs.id, trs.quantity FROM members mem 
  LEFT JOIN transactions trs 
  ON
  mem.id = trs.memberId
  WHERE 
  trs.id = ? AND mem.id = ?`;
  const paramsGetTransaction = [transactionId, memberId];
  const transaction = await dbHandle.preparedQuery(
    sqlGetTransaction,
    paramsGetTransaction
  );
  return transaction;
};

const updateMemberRewards = async (
  mobile,
  currentRewards,
  newRewards,
  memberId,
  isUpdating,
  earlierQuantity
) => {
  let updatedRewards;
  if (isUpdating) {
    const existingRewards = await calculateRewardPoints(earlierQuantity);
    updatedRewards = currentRewards - existingRewards + newRewards;
  } else {
    updatedRewards = currentRewards + newRewards;
  }

  const sqlRewardsUpdate = `UPDATE members SET rewards = ? WHERE id = ${memberId}`;
  await dbHandle.preparedQuery(sqlRewardsUpdate, [updatedRewards]);
  if (!isUpdating)
    Utilities.send2FactorSMS(
      mobile,
      smsTemplate.templates.rewards_added,
      newRewards
    );
  return;
};

const getTransactionDetails = async (transactionId) => {
  const sqlGetTransaction = `SELECT mem.rewards, mem.id AS memberId, trs.id AS transactionId, rse.rewardPoints, rse.id AS rewardsEarnedId FROM members mem 
  LEFT JOIN transactions trs 
  ON
  mem.id = trs.memberId
  LEFT JOIN rewardsEarning rse
  ON
  trs.id = rse.transactionId
  WHERE 
  trs.id = ?`;
  const paramsGetTransaction = [transactionId];
  const transaction = await dbHandle.preparedQuery(
    sqlGetTransaction,
    paramsGetTransaction
  );
  return transaction;
};
