const Utilities = require("../utils/utilities");
const APP_CONSTANTS = require("../config/appConstants");
const dbHandle = require("../utils/mySqlConnect").mysql;

module.exports = {
  register: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      const checkIfMemberExists = await ifMemberExists(req.mobile);
      console.log(
        "!ifMemberExists(req.mobile):",
        req.mobile,
        checkIfMemberExists
      );

      if (!checkIfMemberExists) {
        const sql =
          "INSERT INTO `members` (`firstName`,`lastName`,`mobile`,`emailId`,`dateOfBirth`) values(?,?,?,?,?)";
        const params = [
          req.firstName,
          req.lastName,
          req.mobile,
          req.emailId,
          req.dateOfBirth,
        ];
        await dbHandle.preparedQuery(sql, params);
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.SUCCESS.MEMBER_REGISTER,
          {}
        );
      } else {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.MEMBER_ALREADY_REGISTERED,
          {}
        );
      }
    } catch (e) {
      console.log("ERROR", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  editMember: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      if (req.mobile) {
        const checkIfMobileNumberExists = await ifMobileNumberExists(
          req.mobile,
          req.memberId
        );
        if (!checkIfMobileNumberExists) {
          let sql = `UPDATE members SET firstName='${req.firstName}',lastName='${req.lastName}',mobile='${req.mobile}',emailId='${req.emailId}',dateOfBirth='${req.dateOfBirth}' WHERE id=${req.memberId}`;
          console.log("sql:", sql);

          await dbHandle.preparedQuery(sql);
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.SUCCESS.PROFILE_UPDATED,
            {}
          );
        } else {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.MEMBER_ALREADY_REGISTERED,
            {}
          );
        }
      }
    } catch (e) {
      console.log("ERROR", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  getMemberList: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      const sql = `SELECT * FROM members WHERE isActive = ?`;
      const params = [1];
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

  login: async (req) => {
    try {
      // let getUserInformation;
      let sql = `SELECT * FROM admin WHERE emailId = ?`;
      let params = [req.emailId];
      let data = await dbHandle.preparedQuery(sql, params);
      if (data.length > 0) {
        /*Check the encrypted password with the user password(send by api as string like 123)*/
        console.log(
          "pass:",
          req.password,
          data[0].password,
          Utilities.compareHash(req.password, data[0].password)
        );

        if (Utilities.compareHash(req.password, data[0].password)) {
          const accessToken = Utilities.cryptData(
            data[0].id + data[0].emailId + Date.now()
          );
          await dbHandle.query(
            `UPDATE admin SET accessToken = '${accessToken}' WHERE emailId = '${req.emailId}'`
          );
          data[0].accessToken = accessToken;

          delete data[0].password;
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
            data[0]
          );
        } else {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.WRONG_PASSWORD,
            {}
          );
        }
      } else {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.WRONG_EMAIL,
          {}
        );
      }
    } catch (e) {
      console.log("ERROR", e);
      console.log("returning from catch");

      return Utilities.sendError(e);
    }
  },

  deleteMember: async (auth, req) => {
    try {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
      req.memberIds.join(",");
      let sql = `
      DELETE FROM members WHERE id IN (${req.memberIds});
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

const ifMemberExists = async (mobile) => {
  const sql = `SELECT * FROM members WHERE mobile = ?`;
  const params = [mobile];
  const data = await dbHandle.preparedQuery(sql, params);
  return data.length > 0 ? true : false;
};

const ifMobileNumberExists = async (mobile, memberId) => {
  const sql = `SELECT * FROM members WHERE mobile = ?`;
  const params = [mobile];
  const data = await dbHandle.preparedQuery(sql, params);
  return data.length ? (data[0].id == memberId ? false : true) : false;
};
