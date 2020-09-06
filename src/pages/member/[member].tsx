import { Box, Serif, ResponsiveImage, Separator } from "@artsy/palette";
import Error from "next/error";
import { normalizeParam } from "utils";
import { FC } from "react";
import { H1 } from "components/Typography";
import { Member as MemberType } from "../index";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembers, getMemberProperty } from "../../data/team";
import { MemberDetails } from "components/MemberDetails";
import { useAreaGrid } from "components/Grid";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const members = await getMembers();
  return {
    props: {
      data: members,
      member: members.find(
        (member) => normalizeParam(member.name) === params?.member
      ),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const names = await getMemberProperty("name");
  return {
    paths: names.map((name) => ({
      params: {
        member: normalizeParam(name),
      },
    })),
    fallback: false,
  };
};

const area = ["Heading", "Image", "Details", "Summary"] as const;
type AreaType = typeof area[number];

const defaultLayout: AreaType[][] = [
  ["Heading"],
  ["Image"],
  ["Summary"],
  ["Details"],
];

const largeLayout: AreaType[][] = [
  ["Heading", "Heading"],
  ["Image", "Details"],
  ["Summary", "Details"],
];

interface MemberProps {
  member: MemberType;
}

const Member: FC<MemberProps> = ({ member }) => {
  const { Grid, Area } = useAreaGrid(area, {
    _: defaultLayout,
    xl: largeLayout,
  });
  if (!member) {
    return <Error statusCode={404} />;
  }

  return (
    <>
      <Grid
        gridTemplateColumns={{ xl: "300px auto" }}
        gridRowGap={2}
        gridColumnGap={3}
      >
        <Area.Heading>
          <H1>{member.name}</H1>
          <Separator mb={2} />
        </Area.Heading>
        <Area.Image>
          <Box minWidth="300px" width="300px">
            {member.profileImage && (
              <ResponsiveImage src={member.profileImage} />
            )}
          </Box>
        </Area.Image>
        <Area.Summary width="300px">
          {member.title && (
            <Serif size="6" mb={0.5}>
              {member.title}
            </Serif>
          )}
          {member.city && (
            <Serif size="6" color="black60">
              {member.city}
            </Serif>
          )}
          {member.role_text && (
            <Serif size="4" mt={1}>
              {member.role_text}
            </Serif>
          )}
        </Area.Summary>
        <Area.Details>
          <MemberDetails member={member} />
        </Area.Details>
      </Grid>
    </>
  );
};

export default Member;
