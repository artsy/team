/**
 * This file writes out the google credentials required to access the google drive api to read our team images.
 */
import { writeFileSync } from "fs";

import dotenv from "dotenv";
import { join } from "path";

dotenv.config({
  path: join(__dirname, "..", ".env"),
});

writeFileSync(
  ".google-api-creds.json",
  Buffer.from(process.env.G_CREDS as string, "base64").toString("ascii")
);
