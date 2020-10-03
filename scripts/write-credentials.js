/**
 * This file writes out the google credentials required to access the google drive api to read our team images.
 */
require("dotenv").config();
const fs = require("fs");

fs.writeFileSync(
  ".google-api-creds.json",
  Buffer.from(process.env.SHEET_CREDS, "base64").toString("ascii")
);
