import React from "react";
import { GetServerSideProps } from "next";
import { H1 } from "components/Typography";
import fetch from "isomorphic-unfetch";
import { Flex } from "@artsy/palette";
import { redirectAuthorizedUsersWithCookie } from "utils/auth";
import { log, requestLog } from "utils/logger";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  requestLog(req, res);
  const tokenResults = await fetch(
    process.env.STAGING_APP_ID
      ? "https://stagingapi.artsy.net/oauth2/access_token"
      : "https://api.artsy.net/oauth2/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.STAGING_APP_ID || process.env.PRODUCTION_APP_ID,
        client_secret:
          process.env.STAGING_APP_SECRET || process.env.PRODUCTION_APP_SECRET,
        code: query.code,
        grant_type: "authorization_code",
      }),
    }
  ).then((res) => res.json());

  const success = await redirectAuthorizedUsersWithCookie(
    res,
    tokenResults.access_token,
    decodeURI(query.rd as string)
  );
  if (success) return { props: {} };
  res.writeHead(401, "Not Authorized");
  res.write(`
    <html>
    <head>
    </head>
    <body>
    <div style="height: 100%; display: flex; justify-content: center; align-items: center;">
      <h1 style="font-size: 44px; font-family: helvetica, sans-serif; font-weight: 500;">You don't have permission to view this page.</h1>
    </div>
    </body>
    </html>
  `);
  res.end();
  return { props: {} };
};

const AuthFallback = () => {
  return (
    <Flex height="100%" justifyContent="center" alignItems="center">
      <H1>You're not authorized to view this page.</H1>
    </Flex>
  );
};

// @ts-ignore
AuthFallback.Layout = null;

export default AuthFallback;
