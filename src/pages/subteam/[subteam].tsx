import { useRouter } from "next/router";
import TeamNav, { ServerProps } from "../index";
import { normalizeParam } from "utils";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import Error from "next/error";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembers, getMemberProperty } from "../../data/team";

export const getStaticPaths: GetStaticPaths = async () => {
  const subteams = await getMemberProperty("subteam");
  return {
    paths: subteams.map((subteam) => ({
      params: {
        subteam: normalizeParam(subteam),
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

const Subteam: FC<ServerProps> = (props) => {
  const router = useRouter();

  if (!props.data) {
    return <Error statusCode={500} />;
  }

  const subteam = router.query.subteam;
  let formattedSubteam = "";

  const data = props.data.filter((member) => {
    if (member.subteam && normalizeParam(member.subteam) === subteam) {
      formattedSubteam = member.subteam;
      return true;
    }
    return false;
  });

  return (
    <TeamNav
      {...props}
      title={formattedSubteam}
      data={data}
      NoResults={() => <NoResults page={formattedSubteam} />}
    />
  );
};

export default Subteam;
