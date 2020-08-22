import React from "react";
import { GetServerSideProps } from "next";
import { H1 } from "components/Typography";
import fetch from "isomorphic-unfetch";
import { Flex } from "@artsy/palette";
import { redirectAuthorizedUsersWithCookie } from "utils/auth";
import Logger from "pino-http";

const log = Logger();

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  log(req, res);
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
