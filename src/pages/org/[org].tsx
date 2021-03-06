import TeamNav from "../index";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembersIndex, MemberIndexListing } from "data/teamMember";
import { getSidebarData } from "data/sidebar";
import { prisma } from "data/prisma";

export const getStaticPaths: GetStaticPaths<{ org: string }> = async () => {
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
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const orgSlug = params?.org as string;
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
    notFound: !org,
    props: {
      data: members,
      sidebarData: await getSidebarData(),
      org: org?.name,
    },
    // page revalidates at most every minute
    revalidate: 60,
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
