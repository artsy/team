import TeamNav from "../index";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembersIndex, MemberIndexListing } from "data/teamMember";
import { getSidebarData } from "data/sidebar";
import { PrismaClient } from "@prisma/client";

export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  const locations = await prisma.location.findMany({
    select: {
      slug: true,
    },
  });
  return {
    paths: locations.map(({ slug }) => ({
      params: {
        location: slug,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const locationSlug = params?.location as string;
  const prisma = new PrismaClient();
  const members = await getMembersIndex({
    locationSlug,
  });
  const location = await prisma.location.findFirst({
    select: { city: true },
    where: { slug: locationSlug },
  });
  return {
    props: {
      data: members,
      sidebarData: await getSidebarData(),
      location: location?.city,
    },
  };
};

interface LocationProps {
  data: MemberIndexListing;
  location: string;
}

const Location: FC<LocationProps> = (props) => {
  const { data, location } = props;

  return (
    <TeamNav
      {...props}
      data={data}
      title={location}
      NoResults={() => <NoResults page={location} />}
    />
  );
};

export default Location;
