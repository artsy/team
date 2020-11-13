import TeamNav from "../index";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { PrismaClient } from "@prisma/client";
import { getMembersIndex, MemberIndexListing } from "data/teamMember";
import { getSidebarData } from "data/sidebar";

export const getStaticPaths: GetStaticPaths<{ subteam: string }> = async () => {
  const prisma = new PrismaClient();
  const subteams = await prisma.subteam.findMany({
    select: {
      slug: true,
    },
  });
  return {
    paths: subteams.map(({ slug }) => ({
      params: {
        subteam: slug,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const subteamSlug = params?.subteam as string;
  const prisma = new PrismaClient();
  const members = await getMembersIndex({
    subteams: {
      some: {
        slug: subteamSlug,
      },
    },
  });
  const subteam = await prisma.subteam.findFirst({
    select: { name: true },
    where: { slug: subteamSlug },
  });
  return {
    props: {
      data: members,
      sidebarData: await getSidebarData(),
      subteam: subteam?.name,
    },
  };
};

interface SubteamPageProps {
  data: MemberIndexListing;
  subteam?: string;
}

const Team: FC<SubteamPageProps> = (props) => {
  const { data, subteam } = props;

  return (
    <TeamNav
      {...props}
      title={subteam}
      data={data}
      NoResults={() => <NoResults page={subteam} />}
    />
  );
};

export default Team;
