import TeamNav from "../index";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { PrismaClient } from "@prisma/client";
import { getMembersIndex, MemberIndexListing } from "data/teamMember";
import { getSidebarData } from "data/sidebar";

export const getStaticPaths: GetStaticPaths<{ org: string }> = async () => {
  const prisma = new PrismaClient();
  const orgs = await prisma.organization.findMany({
    select: {
      slug: true,
    },
  });
  return {
    paths: orgs.map(({ slug }) => ({
      params: {
        org: slug,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const orgSlug = params?.org as string;
  const prisma = new PrismaClient();
  const members = await getMembersIndex({
    orgs: {
      some: {
        slug: orgSlug,
      },
    },
  });
  const org = await prisma.organization.findFirst({
    select: { name: true },
    where: { slug: orgSlug },
  });
  return {
    props: {
      data: members,
      sidebarData: await getSidebarData(),
      org: org?.name,
    },
  };
};

interface OrgPageProps {
  data: MemberIndexListing;
  org?: string;
}

const Org: FC<OrgPageProps> = (props) => {
  const { data, org } = props;

  return (
    <TeamNav
      {...props}
      title={org}
      data={data}
      NoResults={() => <NoResults page={org} />}
    />
  );
};

export default Org;
