const Utilities = require("../utils/utilities");
const APP_CONSTANTS = require("../config/appConstants");
const dbHandle = require("../utils/mySqlConnect").mysql;
const moment = require("moment");

module.exports = {
  init: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      const sqlRewards = "SELECT rewards FROM `members` WHERE id = ?";
      const params = [req.memberId];
      const data = await dbHandle.preparedQuery(sqlRewards, params);

      if (data && data.length) {
        if (data[0].rewards > 0) {
          if (parseFloat(data[0].rewards) - parseFloat(req.rewards) >= 0) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpSentAt = moment.utc().format("YYYY-MM-DD HH:mm");
            let sql = `UPDATE members SET redemptionOTP = ?, redemptionOTPSentAt = ? WHERE id = ${req.memberId}`;
            await dbHandle.preparedQuery(sql, [otp, otpSentAt]);
            //code to send OTP
            return Utilities.sendSuccess(
              APP_CONSTANTS.STATUS_MSG.SUCCESS.OTP_SENT,
              { OTP: otp }
            );
          } else {
            return Utilities.sendSuccess(
              APP_CONSTANTS.STATUS_MSG.ERROR.NOT_ENOUGH_REWARD,
              {}
            );
          }
        } else {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.NO_REWARD,
            {}
          );
        }
      } else {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.RECORD_NOT_FOUND,
          {}
        );
      }
    } catch (e) {
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  confirm: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      const sql =
        "SELECT rewards, redemptionOTP, redemptionOTPSentAt FROM `members` WHERE id = ?";
      const params = [req.memberId, req.OTP];
      const data = await dbHandle.preparedQuery(sql, params);

      if (data && data.length) {
        if (data[0].redemptionOTP == req.OTP) {
          const now = moment.utc().format("YYYY-MM-DD HH:mm");
          const then = data[0].redemptionOTPSentAt;

          const timeDifference = moment
            .utc(
              moment(now, "YYYY-MM-DD HH:mm").diff(
                moment(then, "YYYY-MM-DD HH:mm")
              )
            )
            .format("HH:mm");
          let hours = timeDifference.split(":")[0];
          let minutes = timeDifference.split(":")[1];

          if (hours > 0 || minutes > 10) {
            return Utilities.sendSuccess(
              APP_CONSTANTS.STATUS_MSG.ERROR.OTP_EXPIRED,
              {}
            );
          } else {
            let updatedRewards = data[0].rewards - req.rewards;
            const sqlUpdateRewards = `UPDATE members SET rewards = ? WHERE id = ${req.memberId}`;

            await dbHandle.preparedQuery(sqlUpdateRewards, [updatedRewards]);

            const sqlRewardsRedeem =
              "INSERT INTO `rewardsRedeem` (`memberId`,`rewards`) values(?,?)";
            const paramsRewardsRedeem = [req.memberId, req.rewards];
            await dbHandle.preparedQuery(sqlRewardsRedeem, paramsRewardsRedeem);
            return Utilities.sendSuccess(
              APP_CONSTANTS.STATUS_MSG.SUCCESS.REWARDS_REDEEMED,
              {}
            );
          }
        } else {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.OTP_MISMATCH,
            {}
          );
        }
      } else {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.RECORD_NOT_FOUND,
          {}
        );
      }
    } catch (e) {
      console.log("ERROR", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },
};
