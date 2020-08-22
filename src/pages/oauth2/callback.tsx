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
  log.debug("token request params", {
    client_id: process.env.APP_ID,
    client_secret: process.env.APP_SECRET,
    code: query.code,
    grant_type: "authorization_code",
  });
  const tokenResults = await fetch(
    "https://stagingapi.artsy.net/oauth2/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.APP_ID,
        client_secret: process.env.APP_SECRET,
        code: query.code,
        grant_type: "authorization_code",
      }),
    }
  ).then((res) => res.json());

  log.debug("tokenResults", tokenResults);

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
