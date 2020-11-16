import TeamNav from "../index";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembersIndex, MemberIndexListing } from "data/teamMember";
import { getSidebarData } from "data/sidebar";
import { prisma } from "data/prisma";

export const getStaticPaths: GetStaticPaths = async () => {
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
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const locationSlug = params?.location as string;
  const members = await getMembersIndex({
    locationSlug,
  });
  const location = await prisma.location.findFirst({
    select: { city: true },
    where: { slug: locationSlug },
  });
  return {
    notFound: !location,
    props: {
      data: members,
      sidebarData: await getSidebarData(),
      location: location?.city,
    },
    // page revalidates at most every minute
    revalidate: 60,
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
