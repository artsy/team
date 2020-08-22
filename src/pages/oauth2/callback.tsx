import React from "react";
import { GetServerSideProps } from "next";
import { H1 } from "components/Typography";
import fetch from "isomorphic-unfetch";
import { Flex } from "@artsy/palette";
import { redirectAuthorizedUsersWithCookie } from "utils/auth";

import Logger from "pino";
import RequestLogger from "pino-http";

const requestLog = RequestLogger();
const Log = Logger({
  level: process.env.LOG_LEVEL || "info",
});

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  requestLog(req, res);
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

  Log.debug("tokenResults", tokenResults);

  await redirectAuthorizedUsersWithCookie(
    res,
    tokenResults.access_token,
    decodeURI(query.rd as string)
  );

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
