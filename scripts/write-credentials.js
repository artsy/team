/**
 * This file writes out the google credentials required to access the google drive api to read our team images.
 */
const fs = require("fs");

fs.writeFileSync(
  ".google-api-creds.json",
  Buffer.from(process.env.G_CREDS, "base64").toString("ascii")
);
