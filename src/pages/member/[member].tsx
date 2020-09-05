import { useRouter } from "next/router";
import { formatDistanceToNow } from "date-fns";
import {
  Box,
  Link,
  Serif,
  Flex,
  ResponsiveImage,
  Spacer,
  space,
  Separator,
} from "@artsy/palette";
import Error from "next/error";
import { normalizeParam } from "utils";
import { capitalize } from "lodash-es";
import { FC, Fragment } from "react";
import { H1 } from "components/Typography";
import RouterLink from "next/link";
import { Member as MemberType, ServerProps } from "../index";
import { GetStaticProps, GetStaticPaths } from "next";
import { getMembers, getMemberProperty } from "../../data/team";
import { Composition } from "atomic-layout";
import { MemberDetails } from "components/member/Details";

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

const areasSmall = `
  heading
  image
  summary
  details
`;

const areasLarge = `
  heading heading
  image details
  summary details
`;

interface MemberProps {
  member: MemberType;
}

const Member: FC<MemberProps> = ({ member }) => {
  if (!member) {
    return <Error statusCode={404} />;
  }

  return (
    <Composition
      areas={areasSmall}
      areasXl={areasLarge}
      templateColsXl="300px auto"
      gutterRow={space(2)}
    >
      {(Areas) => (
        <>
          <Areas.Heading>
            <H1>{member.name}</H1>
            <Separator mb={2} />
          </Areas.Heading>
          <Areas.Image>
            <Box minWidth="300px" width="300px">
              {member.profileImage && (
                <ResponsiveImage src={member.profileImage} />
              )}
            </Box>
          </Areas.Image>
          <Areas.Summary width="300px">
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
          </Areas.Summary>
          <Areas.Details marginLeftXl={space(3)}>
            <MemberDetails member={member} />
          </Areas.Details>
        </>
      )}
    </Composition>
  );
};

export default Member;
