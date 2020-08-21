import { useRouter } from "next/router";
import TeamNav, { ServerProps, Member } from "../index";
import { Spinner } from "@artsy/palette";
import { normalizeParam } from "utils";
import { NoResults } from "components/NoResults";
import { FC } from "react";
import Error from "next/error";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembers, getMemberProperty } from "../../data/team";

export const getStaticPaths: GetStaticPaths = async () => {
  const locations = await getMemberProperty("city");
  return {
    paths: locations.map((location) => ({
      params: {
        location: normalizeParam(location!),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const members = await getMembers();
  return {
    props: {
      data: members,
      location: params?.location,
    },
  };
};

interface LocationProps {
  data: Member[];
  location: string;
}

const Location: FC<LocationProps> = (props) => {
  const { location } = props;

  if (!props.location) {
    return <Error statusCode={404} />;
  }

  let formattedLocation = "";

  const data = props.data.filter((member) => {
    if (member.city && normalizeParam(member.city) === location) {
      formattedLocation = member.city;
      return true;
    }
    return false;
  });

  return (
    <TeamNav
      {...props}
      data={data}
      title={formattedLocation}
      NoResults={() => <NoResults page={formattedLocation} />}
    />
  );
};

export default Location;
