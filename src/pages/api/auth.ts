import { NowRequest, NowResponse } from "@now/node";
import { verifyCookie } from "utils/auth";
import { requestLog } from "utils/logger";

/**
 * Verifies if user is allowed to access team nav
 */
export default function auth(req: NowRequest, res: NowResponse) {
  requestLog(req, res);
  if (verifyCookie(req, res)) {
    res.writeHead(200, "OK");
    res.end();
  }
}
