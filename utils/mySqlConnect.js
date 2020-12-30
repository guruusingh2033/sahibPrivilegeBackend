"use strict";
const mysql = require("mysql2");

/* dev server mysql connection */
const pool = mysql.createPool({
  host: "172.105.43.57",
  port: "3306",
  user: "b201224s_sahib",
  password: "MlhTBUMelS9PQA",
  database: "b201224s_sahibprivilege",
  connectionLimit: 100,
});
module.exports.connection = pool.promise();

/// class based library

class MySqlClient {
  constructor() {
    this.pool = this.connect();
  }

  testConnection() {
    return this.query("select 1");
  }

  // this function will support multiquery
  query(sql) {
    /** Intentionally using promise here instead of asyn/await as we have to use callbacks**/
    let me = this;
    return new Promise((resolve, reject) => {
      try {
        this.pool.getConnection((err, connection) => {
          if (err) {
            console.error(err);
            throw new Error("Unable to execute query");
          }
          me.db = connection;
          connection.config.dateStrings = true;
          connection.query(sql, (error, rows) => {
            if (error) {
              // debug
              console.log("SQL WITH ERROR ==>");
              console.log(sql);
              console.log(error);

              connection.release();
              reject(error);
            } else {
              connection.release();
              resolve(rows);
            }
          });
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  }

  preparedQuery(sql, params) {
    /** Intentionally using promise here instead of asyn/await as we have to use callbacks**/
    let me = this;
    return new Promise((resolve, reject) => {
      try {
        this.pool.getConnection((err, connection) => {
          if (err) {
            console.error(err);
            throw new Error("Unable to execute query");
          }
          me.db = connection;
          connection.config.namedPlaceholders = true;
          connection.execute(sql, params || [], (error, rows) => {
            if (error) {
              console.log(error); // debug
              connection.release();
              reject(error);
            } else {
              connection.release();
              resolve(rows);
            }
          });
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  }

  formatQuery(sql, params) {
    /** Intentionally using promise here instead of asyn/await as we have to use callbacks**/
    let me = this;
    return new Promise((resolve, reject) => {
      try {
        this.pool.getConnection((err, connection) => {
          if (err) {
            console.error(err);
            throw new Error("Unable to execute query");
          }
          resolve(connection.format(sql, params));
        });
      } catch (error) {
        console.log(error);
        throw new Error("Unable to execute query");
      }
    });
  }

  connect() {
    return mysql.createPool({
      host: "172.105.43.57",
      port: "3306",
      user: "b201224s_sahib",
      password: "MlhTBUMelS9PQA",
      database: "b201224s_sahibprivilege",
      multipleStatements: true,
      charset: "utf8_unicode_ci",
      connectionLimit: 10,
      timezone: "UTC+0",
      dateStrings: true,
    });
  }

  disconnect() {
    try {
      this.pool.destroy();
      this.status = 0;
      console.log("DB:", "DB Connection Closed");
    } catch (e) {
      console.log("DB:", "ERR: DB Connection Close ", e);
    }
  }
}

module.exports.mysql = new MySqlClient();
