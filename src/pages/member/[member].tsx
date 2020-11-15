import { Flex, Box, Serif, ResponsiveImage, Separator } from "@artsy/palette";
import Error from "next/error";
import { useDelay } from "utils";
import { FC, useEffect, useState } from "react";
import { H1 } from "components/Typography";
import { GetStaticPaths } from "next";
import { useAreaGrid } from "components/Grid";
import { isWeekOf, relativeDaysTillAnniversary, isDayOf } from "utils/date";
import { AwardIcon } from "components/AwardIcon";
import { MemberDetails } from "components/MemberDetails";
import { useWindowSize } from "@react-hook/window-size";
import Confetti from "react-confetti";
import { prisma } from "data/prisma";
import { getSidebarData } from "data/sidebar";
import { UnWrapPromise } from "utils/type-helpers";

export const getStaticPaths: GetStaticPaths<{ member: string }> = async () => {
  const members = await prisma.member.findMany({
    select: {
      slug: true,
    },
  });
  return {
    paths: members.map(({ slug }) => ({
      params: {
        member: slug,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps = async ({
  params,
}: {
  params: { member: string };
}) => {
  const memberSlug = params.member as string;
  const member = await prisma.member.findFirst({
    include: {
      location: true,
      orgs: true,
      teams: true,
      subteams: true,
      manager: {
        select: {
          slug: true,
          name: true,
        },
      },
      reports: {
        select: {
          slug: true,
          name: true,
        },
      },
    },
    where: {
      slug: memberSlug,
    },
  });
  return {
    props: {
      sidebarData: await getSidebarData(),
      member: JSON.parse(JSON.stringify(member)),
    },
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

export interface MemberProps {
  member: UnWrapPromise<ReturnType<typeof getStaticProps>>["props"]["member"];
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
    if (member.startDate && !finished) {
      setShowConfetti(true);
    }
  }, [setShowConfetti, member.startDate, finished]);

  return (
    <>
      {showConfetti && isDayOf(new Date(member.startDate!)) && (
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
            {member.startDate && isWeekOf(new Date(member.startDate)) && (
              <>
                <Flex ml={4}>
                  <AwardIcon />
                  <Serif size="4">
                    Artsyversary{" "}
                    {relativeDaysTillAnniversary(new Date(member.startDate))}
                  </Serif>
                </Flex>
              </>
            )}
          </Flex>

          <Separator mb={2} />
        </Area.Heading>
        <Area.Image>
          <Box minWidth="300px" width="300px">
            {member.headshot && <ResponsiveImage src={member.headshot} />}
          </Box>
        </Area.Image>
        <Area.Summary width="300px">
          {member.title && (
            <Serif size="6" mb={0.5}>
              {member.title}
            </Serif>
          )}
          {member.location?.city && (
            <Serif size="6" color="black60">
              {member.location.city}
            </Serif>
          )}
          {member.roleText && (
            <Serif size="4" mt={1}>
              {member.roleText}
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
