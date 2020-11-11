import { useRouter } from "next/router";
import TeamNav, { ServerProps } from "../index";
import { Spinner } from "@artsy/palette";
import { normalizeParam } from "utils";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import Error from "next/error";
import { getMembers, getMemberProperty } from "../../data/team";
import { GetStaticProps, GetStaticPaths } from "next";

export const getStaticPaths: GetStaticPaths = async () => {
  const orgs = await getMemberProperty("orgs");
  return {
    paths: orgs.flat().map((org) => ({
      params: {
        org: normalizeParam(org),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async () => {
  const members = await getMembers();
  return {
    props: {
      data: members,
    },
  };
};
const Organization: FC<ServerProps> = (props) => {
  const router = useRouter();

  if (router.isFallback) {
    return <Spinner />;
  }

  if (!props.data) {
    return <Error statusCode={500} />;
  }

  const org = Array.isArray(router.query.org)
    ? router.query.org[0]
    : router.query.org;
  let formattedOrg = "";

  if (!org) {
    return <Error statusCode={404} />;
  }

  const data = props.data.filter((member) => {
    const possibleOrg = member.orgs.find((t) => normalizeParam(t) === org);
    if (!possibleOrg) return false;
    formattedOrg = possibleOrg;
    return true;
  });

  return (
    <>
      <TeamNav
        {...props}
        data={data}
        title={formattedOrg}
        NoResults={() => <NoResults page={formattedOrg} />}
      />
    </>
  );
};

export default Organization;
