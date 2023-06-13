"use strict";
/** Database setup for podcast app. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");
const password = require("./db-password")

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri()
  });
}
db.password = password;
db.connect();

module.exports = db;