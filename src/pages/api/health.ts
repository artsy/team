import { NowRequest, NowResponse } from "@now/node";

export default function health(req: NowRequest, res: NowResponse) {
  res.writeHead(200, "pong");
  res.end();
}
