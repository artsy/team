#!/usr/bin/env ts-node-script
import "module-alias/register";
import { sync } from "../src/pages/api/sync";
import dotenv from "dotenv";
import { join } from "path";
import { disconnect } from "data/prisma";

dotenv.config({
  path: join(__dirname, "..", ".env"),
});

(async () => {
  const result = await sync();
  console.log(result);
  await disconnect();
})();
