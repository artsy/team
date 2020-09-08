import { Flex, Box, Serif, ResponsiveImage, Separator } from "@artsy/palette";
import Error from "next/error";
import { normalizeParam, useDelay } from "utils";
import { FC, useEffect, useState } from "react";
import { H1 } from "components/Typography";
import { Member as MemberType } from "../index";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembers, getMemberProperty } from "../../data/team";
import { MemberDetails } from "components/MemberDetails";
import { useAreaGrid } from "components/Grid";
import { isWeekOf, relativeDaysTillAnniversary, isDayOf } from "utils/date";
import { AwardIcon } from "components/AwardIcon";
import { useWindowSize } from "@react-hook/window-size";
import Confetti from "react-confetti";

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
  const finished = useDelay(10);
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize({ initialWidth: 0, initialHeight: 0 });
  const { Grid, Area } = useAreaGrid(area, {
    _: defaultLayout,
    xl: largeLayout,
  });
  if (!member) {
    return <Error statusCode={404} />;
  }

  useEffect(() => {
    if (member.start_date && !finished) {
      setShowConfetti(true);
    }
  }, [setShowConfetti, member.start_date, finished]);

  return (
    <>
      {showConfetti && isDayOf(new Date(member.start_date!)) && (
        <Confetti
          width={width}
          height={height}
          recycle={!finished}
          numberOfPieces={400}
        />
      )}
      <Grid
        gridTemplateColumns={{ xl: "300px auto" }}
        gridRowGap={2}
        gridColumnGap={3}
      >
        <Area.Heading>
          <Flex alignItems="center" justifyContent="space-between">
            <H1>{member.name}</H1>
            {member.start_date && isWeekOf(new Date(member.start_date)) && (
              <>
                <Flex ml={4}>
                  <AwardIcon />
                  <Serif size="4">
                    Artsyversary{" "}
                    {relativeDaysTillAnniversary(new Date(member.start_date))}
                  </Serif>
                </Flex>
              </>
            )}
          </Flex>

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
