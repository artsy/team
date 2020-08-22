import { NowRequest, NowResponse } from "@now/node";
import { verifyCookie } from "../../utils/auth";
import Logger from "pino-http";

const log = Logger();

/**
 * Verifies if user is allowed to access team nav
 */
export default function auth(req: NowRequest, res: NowResponse) {
  log(req, res);
  if (verifyCookie(req, res)) {
    res.writeHead(200, "OK");
    res.end();
  }
}
