import TeamNav from "../index";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembersIndex, MemberIndexListing } from "data/teamMember";
import { getSidebarData } from "data/sidebar";
import { prisma } from "data/prisma";

export const getStaticPaths: GetStaticPaths<{ team: string }> = async () => {
  const teams = await prisma.team.findMany({
    select: {
      slug: true,
    },
  });
  return {
    paths: teams.map(({ slug }) => ({
      params: {
        team: slug,
      },
    })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const teamSlug = params?.team as string;
  const members = await getMembersIndex({
    teams: {
      some: {
        slug: teamSlug,
      },
    },
  });
  const team = await prisma.team.findFirst({
    select: { name: true },
    where: { slug: teamSlug },
  });
  return {
    notFound: !team,
    props: {
      data: members,
      sidebarData: await getSidebarData(),
      team: team?.name,
    },
    // page revalidates at most every 5 minutes
    revalidate: 1 * 60 * 5,
  };
};

interface TeamPageProps {
  data: MemberIndexListing;
  team?: string;
}

const Team: FC<TeamPageProps> = (props) => {
  const { data, team } = props;

  return (
    <TeamNav
      {...props}
      title={team}
      data={data}
      NoResults={() => <NoResults page={team} />}
    />
  );
};

export default Team;
