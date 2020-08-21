import { useRouter } from "next/router";
import TeamNav, { ServerProps } from "../index";
import { Spinner } from "@artsy/palette";
import { normalizeParam } from "utils";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import Error from "next/error";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembers, getMemberProperty } from "../../data/team";

export const getStaticPaths: GetStaticPaths = async () => {
  const teams = await getMemberProperty("team");
  return {
    paths: teams.map((team) => ({
      params: {
        team: normalizeParam(team),
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

const Team: FC<ServerProps> = (props) => {
  const router = useRouter();

  if (!props.data) {
    return <Error statusCode={500} />;
  }

  const team = router.query.team;
  let formattedTeam = "";

  const data = props.data.filter((member) => {
    if (member.team && normalizeParam(member.team) === team) {
      formattedTeam = member.team;
      return true;
    }
    return false;
  });

  return (
    <TeamNav
      {...props}
      title={formattedTeam}
      data={data}
      NoResults={() => <NoResults page={formattedTeam} />}
    />
  );
};

export default Team;
