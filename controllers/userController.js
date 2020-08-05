const Utilities = require("../utils/utilities");
const APP_CONSTANTS = require("../config/appConstants");
const dbHandle = require("../utils/mySqlConnect").mysql;

module.exports = {
  register: async (req) => {
    //firstName, lastName, mobile, emailId, dateOfBirth,

    // INSERT INTO users (username,email,passcode) VALUES
    // ("' + username + '","' + email + '","' + encryptedPassword + '")
    // "INSERT INTO posts SET ?", post;
    // const data = { name: "kuljeet" };
    req.emailId = req.emailId.trim().toLowerCase();
    const query = await db.query("INSERT INTO users SET ?", req);
    // const rows = await db.query("SELECT * FROM settings WHERE id = 1");
    console.log("rows:", rows);

    const accessToken = Utilities.cryptData(req.emailId + Date.now());
    const pseudoName = Utilities.generateRandomString(5);
    const pseudoEmail = pseudoName + "@pseudo.com";
    const plainPassword = Utilities.generatePassword();
    const password = Utilities.cryptData(plainPassword);
    const managerId =
      req.managerId && req.managerId !== "" ? req.managerId : null;
    const createdAt = moment().toISOString();
    const updatedAt = moment().toISOString();
    const isDeleted = false;
    const isObsolete = false;
    try {
      const dataToSend = {
        name,
        emailId,
        gender,
        boardArea,
        mobileNumber,
        managerName,
        managerEmail,
        managerId,
        username,
        password,
        accessToken,
        pseudoName,
        pseudoEmail,
        createdAt,
        updatedAt,
        isDeleted,
        isObsolete,
        alternateName,
      };

      if (Mongoose.Types.ObjectId.isValid(req.locationId)) {
        dataToSend.locationId = req.locationId;
      }
      if (Mongoose.Types.ObjectId.isValid(req.roleId)) {
        dataToSend.roleId = req.roleId;
      }

      // If user is External
      if (req.isExternal) {
        dataToSend.isExternal = req.isExternal;
        dataToSend.companyName = req.companyName;
        dataToSend.designation = req.designation;
      }

      const result = await userService.createData(dataToSend);
      const resultToSend = JSON.parse(JSON.stringify(result));
      delete resultToSend.password;
      const template = await emailTemplateService.findOneData(
        {
          templateKey: APP_CONSTANTS.DATABASE.EMAIL_TEMPLATES.LOGIN_CREDENTIALS,
          isObsolete: false,
        },
        { isDeleted: 0, isObsolete: 0, createdAt: 0, updatedAt: 0 }
      );
      if (!result.code && template) {
        let managerDetails;
        if (req.managerId && req.managerId !== "") {
          managerDetails = await userService.getData(
            { _id: req.managerId },
            { name: 1 }
          );
        }

        const handlerData = {
          eName: name,
          password: plainPassword,
          emailId: emailId,
          date: moment.utc().format("MM-DD-YYYY"),
          mName: managerDetails ? managerDetails.name : "",
        };
        const htmlContent = Utilities.dynamicLinkingTemplate(
          handlerData,
          template.content
        );

        const mailDetails = {
          from: "sapdevlearning@gmail.com",
          to: emailId,
          subject: template.subject,
          html: htmlContent,
        };
        Utilities.sendMail(mailDetails);
      }
      // Handling error
      if (!result.code) {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.SUCCESS.USER_CREATED,
          resultToSend
        );
      } else {
        throw result;
      }
    } catch (e) {
      console.log("ERROR", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  login: async (req) => {
    try {
      // let getUserInformation;
      const sql = `SELECT * FROM admin WHERE emailId = ?`;
      const params = [req.emailId];
      const data = await dbHandle.preparedQuery(sql, params);
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

      // const getUserInformation = await db.query(
      //   `SELECT * FROM admin WHERE emailId = ?`,
      //   `sahibAdmin@gmail.com`
      // );
      // console.log("result:", getUserInformation);

      // db.query(
      //   "SELECT * FROM admin WHERE emailId = ?",
      //   req.emailId,
      //   (err, rows, fields) => {
      //     console.log("rows::", err, rows, fields);
      //     if (err)
      //       return Utilities.sendSuccess(
      //         APP_CONSTANTS.STATUS_MSG.ERROR.WRONG_CREDENTIALS_EMAIL,
      //         {}
      //       );
      //     else {
      //       getUserInformation = rows[0];
      //       if (
      //         Utilities.compareHash(req.password, getUserInformation.password)
      //       ) {
      //         console.log("password matches");

      //         let accessToken = Utilities.cryptData(
      //           getUserInformation._id +
      //             getUserInformation.username +
      //             Date.now()
      //         );

      //         // await userService.updateData(
      //         //   { _id: getUserInformation._id },
      //         //   {
      //         //     $push: { accessToken: accessToken },
      //         //     updatedAt: moment().toISOString(),
      //         //   }
      //         // );
      //         // getUserInformation.accessToken = accessToken;
      //         delete getUserInformation.password;
      //         return Utilities.sendSuccess(
      //           APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
      //           getUserInformation
      //         );
      //       } else {
      //         return Utilities.sendSuccess(
      //           APP_CONSTANTS.STATUS_MSG.ERROR.WRONG_CREDENTIALS_PASSWORD,
      //           {}
      //         );
      //       }
      //     }
      //     // console.log(err);
      //   }
      // );
      // const getUserInformation = await userService.getData(
      //   { emailId: req.emailId.trim().toLowerCase() },
      //   { __v: 0 },
      //   { lean: true, limit: 1 }
      // );
    } catch (e) {
      console.log("ERROR", e);
      console.log("returning from catch");

      return Utilities.sendError(e);
    }
  },

  editUser: async (auth, req) => {
    const authenticatedUser = await Utilities.authenticateUser(auth);
    if (authenticatedUser.hasOwnProperty("statusCode")) {
      return authenticatedUser;
    }

    if (
      req.password &&
      req.confirmPassword &&
      req.password !== req.confirmPassword
    ) {
      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.ERROR.WRONG_CREDENTIALS_PASSWORD,
        {}
      );
    }
    const objectToUpdate = {};
    try {
      if (req.name && req.name !== "") objectToUpdate.name = req.name;
      if (req.emailId && req.emailId !== "")
        objectToUpdate.emailId = req.emailId.trim().toLowerCase();
      if (req.gender && req.gender !== "") objectToUpdate.gender = req.gender;
      if (req.boardArea && req.boardArea !== "")
        objectToUpdate.boardArea = req.boardArea;
      if (req.managerName && req.managerName !== "")
        objectToUpdate.managerName = req.managerName;
      if (req.managerEmail && req.managerEmail !== "")
        objectToUpdate.managerEmail = req.managerEmail;
      if (req.username && req.username !== "")
        objectToUpdate.username = req.username;
      if (req.locationId && Mongoose.Types.ObjectId.isValid(req.locationId)) {
        objectToUpdate.locationId = req.locationId;
      }
      if (req.managerId && Mongoose.Types.ObjectId.isValid(req.managerId)) {
        objectToUpdate.managerId = req.managerId;
      }
      if (req.mobileNumber && req.mobileNumber !== "")
        objectToUpdate.mobileNumber = req.mobileNumber;
      if (req.roleId && Mongoose.Types.ObjectId.isValid(req.roleId)) {
        const getRoleInformation = await roleService.findOneData(
          {
            _id: req.roleId,
          },
          { _id: 1, role: 1 },
          { lean: true, limit: 1 }
        );
        if (getRoleInformation.role !== "Participant") {
          objectToUpdate.managerName = "";
          objectToUpdate.managerEmail = "";
        }
        objectToUpdate.roleId = req.roleId;
      }
      objectToUpdate.updatedAt = moment().toISOString();

      // If user is External
      if (req.isExternal) {
        objectToUpdate.isExternal = req.isExternal;
        if (req.companyName && req.companyName !== "")
          objectToUpdate.companyName = req.companyName;
        if (req.designation && req.designation !== "")
          objectToUpdate.designation = req.designation;
      } else if (!req.isExternal) {
        objectToUpdate.isExternal = req.isExternal;
        objectToUpdate.companyName = "";
        objectToUpdate.designation = "";
      }

      if (req.alternateName && req.alternateName !== "")
        objectToUpdate.alternateName = req.alternateName;

      await userService.updateData(
        {
          _id: req.userId,
        },
        objectToUpdate
      );
      const getUserInformation = await userService.getData(
        { _id: req.userId },
        { __v: 0, password: 0, accessToken: 0 },
        { lean: true, limit: 1 }
      );

      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.USER_UPDATED,
        getUserInformation
      );
    } catch (e) {
      const errorObject = JSON.parse(Utilities.sendError(e));
      console.log("ERROR", e);
      return errorObject.output.payload;
    }
  },

  logout: async (auth, req) => {
    const authenticatedUser = await Utilities.authenticateUser(auth);
    if (authenticatedUser.hasOwnProperty("statusCode")) {
      return authenticatedUser;
    }
    try {
      const result = await userService.updateData(
        { accessToken: { $in: [auth] } },
        { $pull: { accessToken: { $in: [auth] } } }
      );

      if (result) {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
          {}
        );
      } else {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ACTION,
          {}
        );
      }
    } catch (e) {
      console.log("Catch Error: ", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  getUserList: async (auth, req) => {
    const authenticatedUser = await Utilities.authenticateUser(auth);
    if (authenticatedUser.hasOwnProperty("statusCode")) {
      return authenticatedUser;
    }

    try {
      const getInformation = await userService.populateUserList(
        {},
        {
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
          password: 0,
          accessToken: 0,
          deviceDetails: 0,
        },
        { lean: true }
      );

      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
        getInformation
      );
    } catch (e) {
      console.log("Catch Error: ", e);
      return Utilities.sendError(e);
    }
  },

  getUserProfile: async (auth) => {
    const authenticatedUser = await Utilities.authenticateUser(auth);
    if (authenticatedUser.hasOwnProperty("statusCode")) {
      return authenticatedUser;
    }

    try {
      const getUserInformation = await userService.populateUserList(
        { accessToken: auth },
        {
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
          password: 0,
          accessToken: 0,
          deviceDetails: 0,
        },
        { lean: true, limit: 1 }
      );

      if (getUserInformation) {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
          getUserInformation
        );
      } else {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ACTION,
          {}
        );
      }
    } catch (e) {
      console.log("Catch Error: ", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  markDeleteOrObsolete: async (auth, req) => {
    const authenticatedUser = await Utilities.authenticateUser(auth);
    if (authenticatedUser.hasOwnProperty("statusCode")) {
      return authenticatedUser;
    }
    const userIds = req.userIds;
    const markAs = req.markAs === "Obsolete" ? "isObsolete" : "isDeleted";
    try {
      const objectToUpdate = {};
      objectToUpdate[markAs] = req.status;
      objectToUpdate.updatedAt = moment().toISOString();
      let result;
      /*-----------------update as obsolete---------------*/
      if (markAs === "isObsolete") {
        result = await userService.updateManyRecords(
          { _id: { $in: userIds } },
          objectToUpdate
        );
      }
      /*-----------------delete permanently---------------*/
      if (markAs === "isDeleted") {
        //check cohort invited mgr and participants, cohort participants, cohort team
        const isUserInInvitedManager = await checkIfUserInInvitedManager(
          userIds
        );
        if (isUserInInvitedManager) {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.INVITED_MANAGER_IN_COHORT,
            {}
          );
        }
        const isUserInInvitedParticipant = await checkIfUserInInvitedParticipant(
          userIds
        );
        if (isUserInInvitedParticipant) {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.INVITED_PARTICIPANT_IN_COHORT,
            {}
          );
        }
        const isUserInCohortParticipant = await checkIfUserInCohortParticipant(
          userIds
        );
        if (isUserInCohortParticipant) {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.PARTICIPANT_IN_COHORT,
            {}
          );
        }
        const isUserInCohortTeam = await checkIfUserInCohortTeam(userIds);
        if (isUserInCohortTeam) {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.PARTICIPANT_IN_COHORT_TEAM,
            {}
          );
        }

        result = await userService.deleteManyRecords({ _id: { $in: userIds } });
      }
      if (result.n > 0) {
        if (markAs === "isDeleted") {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.SUCCESS.RECORD_DELETED,
            {}
          );
        } else {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.SUCCESS.RECORD_UPDATED,
            {}
          );
        }
      } else {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ACTION,
          {}
        );
      }
    } catch (e) {
      console.log("Catch Error: ", e);
      return Utilities.sendError(e);
    }
  },

  getUserListByRole: async (auth, req) => {
    const authenticatedUser = await Utilities.authenticateUser(auth);
    if (authenticatedUser.hasOwnProperty("statusCode")) {
      return authenticatedUser;
    }
    try {
      const getInformation = await userService.populateUserList(
        {
          roleId: req.roleId,
        },
        {
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
          password: 0,
          accessToken: 0,
          deviceDetails: 0,
        },
        { lean: true }
      );

      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
        getInformation
      );
    } catch (e) {
      console.log("Catch Error: ", e);
      return Utilities.sendError(e);
    }
  },

  changePassword: async (auth, req) => {
    const authenticatedUser = await Utilities.authenticateUser(auth);
    if (authenticatedUser.hasOwnProperty("statusCode")) {
      return authenticatedUser;
    }
    try {
      const currentPassword = req.currentPassword;
      const newPassword = req.newPassword;
      const confirmNewPassword = req.confirmNewPassword;

      const getUserInformation = await userService.getData(
        {
          _id: authenticatedUser,
        },
        { __v: 0 },
        { lean: true, limit: 1 }
      );
      if (!getUserInformation) {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED,
          {}
        );
      } else if (
        Utilities.compareHash(currentPassword, getUserInformation.password)
      ) {
        if (
          newPassword &&
          confirmNewPassword &&
          newPassword !== confirmNewPassword
        ) {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.PASSWORDS_NOT_MATCH,
            {}
          );
        } else if (
          Utilities.compareHash(newPassword, getUserInformation.password)
        ) {
          return Utilities.sendSuccess(
            APP_CONSTANTS.STATUS_MSG.ERROR.SAME_PASSWORDS,
            {}
          );
        }
        const setNewPassword = Utilities.cryptData(newPassword);
        await userService.updateData(
          {
            _id: authenticatedUser,
          },
          {
            password: setNewPassword,
            isPasswordReset: true,
          }
        );
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.SUCCESS.PASSWORD_UPDATED,
          {}
        );
      } else {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.WRONG_CREDENTIALS_PASSWORD,
          {}
        );
      }
    } catch (e) {
      console.log("Catch Error: ", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  getUserListOfManager: async (req) => {
    let getInformation = [];
    try {
      const participantRoleId = await roleService.findOneData(
        {
          role: APP_CONSTANTS.DATABASE.ROLE.PARTICIPANT,
        },
        { _id: 1, role: 1 },
        { lean: true, limit: 1 }
      );
      getInformation = await userService.populateUserList(
        {
          managerId: req.managerId,
          roleId: participantRoleId,
        },
        {
          _id: 1,
          emailId: 1,
          name: 1,
        },
        { lean: true }
      );

      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
        getInformation
      );
    } catch (e) {
      console.log("Catch Error: ", e);
      return Utilities.sendError(e);
    }
  },

  getUserProfileById: async (auth) => {
    const authenticatedUser = await Utilities.authenticateUserById(auth.userId);
    if (authenticatedUser.hasOwnProperty("statusCode")) {
      return authenticatedUser;
    }
    try {
      const getUserInformation = await userService.populateUserList(
        { _id: auth.userId, isDeleted: false },
        {
          name: 1,
          emailId: 1,
          boardArea: 1,
          gender: 1,
          locationId: 1,
        },
        { lean: true, limit: 1 }
      );
      if (getUserInformation.length) {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
          getUserInformation[0]
        );
      } else {
        return Utilities.sendSuccess(
          APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ACTION,
          {}
        );
      }
    } catch (e) {
      console.log("Catch Error: ", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },

  getUserProfileByName: async (auth, req) => {
    // skiping default auth and check by managerId
    if (req.managerId && req.managerId !== "") {
      const authenticatedUser = await Utilities.authenticateUserById(
        req.managerId
      );
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
    } else {
      const authenticatedUser = await Utilities.authenticateUser(auth);
      if (authenticatedUser.hasOwnProperty("statusCode")) {
        return authenticatedUser;
      }
    }
    try {
      const getUserInformation = await userService.getUserByName(
        { name: req.name },
        {
          name: 1,
          emailId: 1,
          boardArea: 1,
          gender: 1,
          locationId: 1,
          alternateName: 1,
          isExternal: 1,
          companyName: 1,
          designation: 1,
          managerId: 1,
          managerEmail: 1,
          managerName: 1,
        },
        {}
      );

      return Utilities.sendSuccess(
        APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
        getUserInformation
      );
    } catch (e) {
      console.log("Catch Error: ", e);
      const errorObject = JSON.parse(Utilities.sendError(e));
      return errorObject.output.payload;
    }
  },
};

const checkIfUserInInvitedManager = async (userIds) => {
  const detail = await cohortService.getData({
    "invitedManagers.managerId": { $in: userIds },
  });
  return detail !== null ? true : false;
};

const checkIfUserInInvitedParticipant = async (userIds) => {
  const detail = await cohortService.getData({
    "invitedParticipants.participantId": { $in: userIds },
  });
  return detail !== null ? true : false;
};

const checkIfUserInCohortParticipant = async (userIds) => {
  const detail = await cohortParticipantService.getData({
    userId: { $in: userIds },
  });
  return detail.length ? true : false;
};

const checkIfUserInCohortTeam = async (userIds) => {
  const detail = await cohortTeamService.getData({
    coachId: { $in: userIds },
  });
  return detail.length ? true : false;
};
