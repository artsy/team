import { IncomingMessage } from "http";
import crypto from "crypto";

export const hash = (source: string) =>
  crypto.createHash("md5").update(source).digest("hex");

export const firstIfMany = <T>(arg: T | T[]): T => {
  if (Array.isArray(arg)) {
    return arg[0];
  }
  return arg;
};

export const normalizeParam = (param: string) =>
  param.replace(/[\W_]+/g, "_").toLowerCase();

export const urlFromReq = (req: IncomingMessage) => {
  const host = req.headers.host ?? "localhost:3000";
  const protocol = host.split(":")[0] === "localhost" ? "http" : "https";
  return `${protocol}://${host}${process.env.ASSET_PREFIX ?? ""}`;
};
