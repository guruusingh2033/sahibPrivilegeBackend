// "use strict";
const Boom = require("boom");
const bcrypt = require("bcrypt");
const moment = require("moment");
const fs = require("fs");
const fs1 = require("fs").promises;
const path1 = require("path");
// const nodemailer = require("nodemailer");
const Handlebars = require("handlebars");
const AWS = require("aws-sdk");
const saltRounds = 10;
const APP_CONSTANTS = require("../config/appConstants");
const dbHandle = require("./mySqlConnect").mysql;
const s3Config = require("../config/s3Config").s3BucketCredentials;
const emailCredentials = require("../config/emailConfig").emailCredentails;
const s3 = new AWS.S3({
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey,
  region: s3Config.region,
});
const cryptoRandomString = require("crypto-random-string");

/**
 *
 * @param {Object} successMsg success message with status code
 * @param {Object} data data to be returned
 * @description method for generic success response formation
 */
let sendSuccess = (successMsg, data) => {
  successMsg =
    successMsg || APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT.customMessage;
  if (
    typeof successMsg == "object" &&
    successMsg.hasOwnProperty("statusCode") &&
    successMsg.hasOwnProperty("customMessage")
  ) {
    return {
      statusCode: successMsg.statusCode,
      message: successMsg.customMessage,
      data: data || {},
    };
  } else {
    return { statusCode: 200, message: successMsg, data: data || {} };
  }
};

/**
 *
 * @param {Object} data error object
 * @description method for generic error response formation
 */
let sendError = (data) => {
  console.log("data:", data);

  if (
    typeof data == "object" &&
    data.hasOwnProperty("statusCode") &&
    data.hasOwnProperty("customMessage")
  ) {
    return Boom.create(data.statusCode, data.customMessage);
  } else {
    
    let message = "Record already exists";
    let errorToSend = "";
    if (typeof data == "object") {
      if (data.sqlState == "23000") {
          if(data.sqlMessage.includes("vehicleNumber")) {
              errorToSend = APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + " vehicle number"
          }
          if(data.sqlMessage.includes("billNumber")) {
            errorToSend = APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + " bill number"
        }
        // if ((data.code = 11000)) {
          // if (data.message.includes("emailId")) {
          //   errorToSend =
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
          //     "emailId";
          // } else if (data.message.includes("name")) {
          //   errorToSend =
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + "name";
          // } else if (data.message.includes("abr")) {
          //   errorToSend =
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + "abr";
          // } else if (data.message.includes("code")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + "code";
          // } else if (data.message.includes("location")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
          //     "location";
          // } else if (data.message.includes("title")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + "title";
          // } else if (data.message.includes("scheduleName")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
          //     "scheduleName";
          // } else if (data.message.includes("templateName")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
          //     "templateName";
          // } else if (data.message.includes("roomName")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
          //     "roomName";
          // } else if (data.message.includes("taskName")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
          //     "taskName";
          // } else if (data.message.includes("role")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + "role";
          // } else if (data.errmsg.includes("holidayLocationIndex")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
          //     "name,locationId";
          // } else if (data.errmsg.includes("participantSurveyIndex")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
          //     "participantId,surveyId,cohortId";
          // } else if (data.errmsg.includes("participantFeedbackIndex")) {
          //   errorToSend +=
          //     APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage +
          //     "participantId,feedbackId,cohortId";
          // }
          return JSON.stringify(Boom.conflict(errorToSend));
        // }
      } else {
        if (data.name == "ApplicationError") {
          errorToSend += APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage;
        } else if (data.name == "ValidationError") {
          errorToSend +=
            APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage +
            data.message;
        } else if (data.name == "CastError") {
          errorToSend +=
            APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage +
            APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_OBJECT_ID.customMessage;
        } else if (data.name == "BulkWriteError") {
          if (
            data.errmsg.includes("scheduleName") ||
            data.errmsg.includes("userCohortIndex")
          ) {
            errorToSend = message;
          }
        }
        return JSON.stringify(Boom.conflict(errorToSend));
      }
    } else {
      return JSON.stringify(Boom.conflict(data));
    }
  }
};

/**
 *
 * @param {String} stringToCrypt string to encrypt
 * @description method encrypts incoming string
 */
let cryptData = (stringToCrypt) => {
  let salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(stringToCrypt, salt);
};

/**
 *
 * @param {String} myPlaintextPassword plain password
 * @param {String} hash stored hash
 * @description method compares hash of strings
 */
let compareHash = (myPlaintextPassword, hash) => {
  return bcrypt.compareSync(myPlaintextPassword, hash);
};

/**
 *
 * @param {String} auth access token
 * @description method authenticates user with access token
 */
let authenticateUser = async (auth) => {
  const sql = `SELECT * FROM admin WHERE accessToken = ?`;
  const params = [auth];
  const data = await dbHandle.preparedQuery(sql, params);
  if (data.length) {
    return data[0].id;
  } else {
    return sendSuccess(APP_CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED, {});
  }
};

/**
 *
 * @param {Number} length length of string to be generated
 * @description method returns random string with given length
 */
let generateRandomString = (length) => {
  return cryptoRandomString({ length: length });
};

/**
 *
 * @param {Time} time time in 12 hours format
 * @description method converts time format from 12 hours to 24 hours
 */
let get24HourFormat = (time) => {
  let formattedTime = moment(time, ["hh:mm a"]).format("HHmm");
  return formattedTime;
};

/**
 *
 * @param {Time} time time in 24 hours format
 * @description method converts time format from 24 hours to 12 hours
 */
let get12HourFormat = (time) => {
  if (time < 1000) {
    time = "0" + time;
  }
  let formattedTime = moment(time, ["hhm"]).format("hh:mm A");
  if (time == 15) {
    formattedTime = "12:15 AM";
  } else if (time == 30) {
    formattedTime = "12:30 AM";
  } else if (time == 45) {
    formattedTime = "12: 45 AM";
  }
  return formattedTime;
};

/**
 *
 * @param {Time} time time in 24 hours format
 * @description method converts 24 hours time format in specific format
 */
let get24HourFormatWithColon = (time) => {
  if (time < 1000) {
    time = "0" + time;
  }
  let formattedTime = moment(time, ["HHmm"]).format("HH:mm");
  return formattedTime;
};

/**
 *
 * @param {File} fileStream content of csv file
 * @description method reads csv file and returns data in json format
 */
let getJsonFromCsv = async (fileStream) => {
  const name = fileStream.hapi.filename;
  let attachmentLinkName = "temp_" + name;
  const path = `${__dirname}/../public/images/${attachmentLinkName}`;
  const file = fs.createWriteStream(path);
  fileStream.pipe(file);
  let extensionType = path1.extname(attachmentLinkName);
  if (extensionType !== ".csv") {
    return false;
  }
  let csv = await fs1.readFile(path, "utf-8");
  csv = csv.trim();
  let lines = CSVToArray(csv, ";");
  let result = [];
  let headers = lines[0][0].split(",");
  for (let i = 1; i < lines.length; i++) {
    let obj = {};
    let currentline = lines[i][0].split(",");
    if (i == lines.length - 1) {
      if (currentline[0] != "") {
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        result.push(obj);
      }
    } else {
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
  }
  fs.unlink(path, (error) => {});
  result = {
    data: result,
    headers: headers,
  };
  return result;
};

/**
 * @param {String} CSV_string - the CSV string you need to parse
 * @param {String} delimiter - the delimeter used to separate fields of data
 * @description method parses any String of Data including '\r' '\n' characters,
 * and returns an array with the rows of data
 */
const CSVToArray = (CSV_string, delimiter) => {
  let pattern = new RegExp( // regular expression to parse the CSV values. // Delimiters:
    "(\\" +
      delimiter +
      "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      delimiter +
      "\\r\\n]*))",
    "gi"
  );

  let rows = [[]]; // array to hold our data. First row is column headers.
  // array to hold our individual pattern matching groups:
  let matches = false; // false if we don't find any matches
  // Loop until we no longer find a regular expression match
  while ((matches = pattern.exec(CSV_string))) {
    let matched_delimiter = matches[1]; // Get the matched delimiter
    // Check if the delimiter has a length (and is not the start of string)
    // and if it matches field delimiter. If not, it is a row delimiter.
    if (matched_delimiter.length && matched_delimiter !== delimiter) {
      // Since this is a new row of data, add an empty row to the array.
      rows.push([]);
    }
    let matched_value;
    // Once we have eliminated the delimiter, check to see
    // what kind of value was captured (quoted or unquoted):
    if (matches[2]) {
      // found quoted value. unescape any double quotes.
      matched_value = matches[2].replace(new RegExp('""', "g"), '"');
    } else {
      // found a non-quoted value
      matched_value = matches[3];
    }
    // Now that we have our value string, let's add
    // it to the data array.
    rows[rows.length - 1].push(matched_value);
  }
  return rows; // Return the parsed data Array
};

/**
 *
 * @param {Array} itemArray array of elements
 * @param {String} key key on which sorting is performed
 * @description method sort array by key
 */
let sortByKey = (itemArray, key) => {
  itemArray.sort((a, b) => {
    if (a[key] < b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
  });
  return itemArray;
};

/**
 *
 * @param {Number} data time in number format
 * @description method returns minutes in terms of 100s
 */
let mapMinutesToHours = (data) => {
  /**
   * Assumption: 1 hr = 100
   */
  if (data === 15 || data === 55) {
    //8:00-8:15, 8:45-9:00
    // if remainder minutes are 15, add 25
    return 25;
  }
  if (data === 30 || data === 70) {
    //8:00-8:30, 8:30-9:00
    //if remainder minutes are 30, add 50
    return 50;
  }
  if (data === 45 || data === 85) {
    //8:00-8:45, 8:45-9:30
    //if remainder minutes are 45, add 75
    return 75;
  }
  if (data === 0) {
    //when durationin minutes = 0
    return 0;
  }
};

/**
 *
 * @param {Number} data time in number format
 * @description method returns hours
 */
let mapHoursToMinutes = (data) => {
  if (data === 25) {
    return 15;
  }
  if (data === 50) {
    return 30;
  }
  if (data === 75) {
    return 45;
  }
  if (data === 0) {
    return 0;
  }
};

/**
 *
 * @param {String} auth access token
 * @description method authenticates user by Object Id
 */
let authenticateUserById = async (auth) => {
  let createdBy = await userService.getData({ _id: auth }, { _id: 1 });
  if (!createdBy) {
    return sendSuccess(APP_CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED, {});
  } else {
    return createdBy._id;
  }
};

/**
 *
 * @param {Object} data variables pairs of keys and values
 * @param {String} template linking data variables with template
 * @description method links variables with template and generates dynamic template
 */
let dynamicLinkingTemplate = (data, template) => {
  let source = template;
  let compiledTemplate = Handlebars.compile(source);
  return compiledTemplate(data);
};

/**
 *
 * @param {Object} mailDetails mail details to be sent
 * @description method sends mail
 */
let sendMail = (mailDetails) => {
  let mailTransporter = nodemailer.createTransport(emailCredentials);
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs");
    } else {
      console.log("Email sent successfully");
    }
  });
  return;
};

/**
 *
 * @param {Object} file file to be uploaded
 * @param {String} folder folder in which file has to be uploaded
 * @description method uploads file to s3 bucket in a specific folder
 */
let uploadFile = async (file, folder) => {
  let filepath = await initFileUpload(file);
  let attachmentLink = await uploadToS3Bucket(filepath, folder);
  return attachmentLink;
};

/**
 * @description method reads file from temporary folder in streams
 */
const initFileUpload = (file) => {
  const fileName = file.hapi.filename;
  const attachmentLinkName = moment().unix() + "_" + fileName;
  const filepath = `${__dirname}/../public/images/${attachmentLinkName}`;
  const savedFile = fs.createWriteStream(filepath);
  savedFile.on("error", (err) =>
    Utilities.sendSuccess(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ACTION, {})
  );
  file.pipe(savedFile);
  return { filepath: filepath, attachmentLinkName: attachmentLinkName };
};

/**
 * @description method uploads file in s3
 */
const uploadToS3Bucket = async (file, folder) => {
  const params = {
    Bucket: s3Config.bucket,
    Key: `${folder}/${file.attachmentLinkName}`,
    Body: fs.createReadStream(file.filepath),
    ACL: "public-read",
  };

  let s3FileUrl = await s3
    .upload(params)
    .promise()
    .then((response) => {
      fs.unlink(file.filepath, function (err) {
        console.log("unlink");
      });
      return response.Location;
    })
    .catch((err) => {
      console.log("S3 unlinking error: ", err);
    });

  return s3FileUrl;
};

/**
 *
 * @param {Arry} arrayItems array of elements
 * @description method sorts array on basis of multiple keys
 */
let sortedRoommates = (arrayItems) => {
  let sortBy = APP_CONSTANTS.SELECTION_PARAMETER;
  arrayItems.sort(function (a, b) {
    let result = 0;
    for (let i = 0; i < sortBy.length && result === 0; i++) {
      result =
        sortBy[i].direction *
        (a[sortBy[i].prop].toString() < b[sortBy[i].prop].toString()
          ? -1
          : a[sortBy[i].prop].toString() > b[sortBy[i].prop].toString()
          ? 1
          : 0);
    }
    return result;
  });
};

/**
 * @description method generates random string consisting of alphabets, numbers and special characters
 */
let generatePassword = () => {
  return cryptoRandomString({ length: 10, type: "base64" });
};

/**
 * @description nomination link to be shared via mail
 */
let nominationLink =
  "http://sapreact-lb-1249997658.us-east-2.elb.amazonaws.com/#/";

module.exports = {
  sendSuccess: sendSuccess,
  sendError: sendError,
  compareHash: compareHash,
  cryptData: cryptData,
  authenticateUser: authenticateUser,
  generateRandomString: generateRandomString,
  get24HourFormat: get24HourFormat,
  get12HourFormat: get12HourFormat,
  get24HourFormatWithColon: get24HourFormatWithColon,
  getJsonFromCsv: getJsonFromCsv,
  sortByKey: sortByKey,
  mapMinutesToHours: mapMinutesToHours,
  authenticateUserById: authenticateUserById,
  sendMail: sendMail,
  uploadFile: uploadFile,
  dynamicLinkingTemplate: dynamicLinkingTemplate,
  sortedRoommates: sortedRoommates,
  nominationLink: nominationLink,
  generatePassword: generatePassword,
  mapHoursToMinutes: mapHoursToMinutes,
};
