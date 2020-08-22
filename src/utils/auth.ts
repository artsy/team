import to from "await-to-js";
import cookie from "node-cookie";
import fetch from "isomorphic-unfetch";
import { IncomingMessage, ServerResponse } from "http";
import decode from "jwt-decode";

const COOKIE_NAME = "artsy-studio-user-token";

export const verifyCookie = (req: IncomingMessage, res: ServerResponse) => {
  const { user } =
    cookie.get(req, COOKIE_NAME, process.env.COOKIE_SECRET, true) ?? {};
  if (user?.roles?.includes("team")) {
    return user;
  }
  res.writeHead(401, "Not authorized");
  res.end();
  return false;
};

export const setUserCookie = async (res: ServerResponse, token: string) => {
  const user = decode<{ roles: string[] }>(token);
  if (user?.roles?.includes("team")) {
    cookie.create(
      res,
      COOKIE_NAME,
      {
        token,
        user: {
          roles: user.roles,
        },
      },
      {
        secure: process.env.NODE_ENV === "development" ? false : true,
        sameSite: "lax",
        httpOnly: true,
        path: "/",
      },
      process.env.COOKIE_SECRET,
      true
    );
    return;
  }

  throw new Error("Not Authorized");
};

export const redirectAuthorizedUsersWithCookie = async (
  res: ServerResponse,
  token: string,
  redirectUrl: string
) => {
  const [error] = await to(setUserCookie(res, token));
  console.log("error setting user cookie?", error);
  if (!error) {
    res.writeHead(302, {
      Location: redirectUrl,
      "Set-Cookie": res.getHeader("set-cookie"),
    });
    res.end();
  }
};
