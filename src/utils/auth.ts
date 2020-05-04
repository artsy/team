import to from "await-to-js";
import cookie from "node-cookie";
import { GetServerSideProps } from "next";
import { NowRequest, NowResponse } from "@now/node";
import fetch from "isomorphic-unfetch";
import { IncomingMessage, ServerResponse } from "http";
import { urlFromReq } from "utils";
import decode from "jwt-decode";
import mem from "mem";

const COOKIE_NAME = "artsy-studio-user-token";
type Context = Parameters<GetServerSideProps>[0];
export type Fetcher = typeof fetch;

export const createAuthenticatedFetcher = (req: IncomingMessage) => (
  input: RequestInfo,
  init: RequestInit = {}
) =>
  fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      ...init.headers,
      cookie: req.headers.cookie as string,
    },
  });

export const authorizedEndpoint = (
  lambda: (rq: NowRequest, rs: NowResponse, fetcher: Fetcher) => void,
  maxAge: number = 0
) => {
  return async (req: NowRequest, res: NowResponse) => {
    if (verifyCookie(req, res)) {
      const fetcher = maxAge
        ? mem(createAuthenticatedFetcher(req), { maxAge: maxAge })
        : createAuthenticatedFetcher(req);
      return lambda(req, res, fetcher);
    }
  };
};

export const authorizedPage = (
  getServerSideProps: (
    context: Context,
    fetcher: Fetcher
  ) => ReturnType<GetServerSideProps>,
  maxAge: number = 0
): GetServerSideProps => {
  return async (context: Context) => {
    if (await verifyServerSideAuthorization(context)) {
      const fetcher = maxAge
        ? mem(createAuthenticatedFetcher(context.req), { maxAge })
        : createAuthenticatedFetcher(context.req);
      return getServerSideProps(context, fetcher);
    }
    return { props: {} };
  };
};

export const verifyServerSideAuthorization = async (context: Context) => {
  const { req, res } = context;

  const { user } =
    cookie.get(req, COOKIE_NAME, process.env.COOKIE_SECRET, true) ?? {};

  if (!user) {
    res.writeHead(302, {
      Location: `https://stagingapi.artsy.net/oauth2/authorize?client_id=${
        process.env.APP_ID
      }&redirect_uri=${urlFromReq(req)}/oauth2/callback?redirect_to=${encodeURI(
        req.url as string
      )}&response_type=code`,
    });
    res.end();
  } else {
    if (user?.roles?.includes("team")) {
      return true;
    }
    res.writeHead(401, "Not authorized");
    res.end();
  }
};

export const checkUserAuthorization = async (token: string) => {
  const user = decode<{ roles: string[] }>(token);
  if (user?.roles?.includes("team")) {
    return true;
  }
  return false;
};

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
