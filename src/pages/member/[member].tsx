import { useRouter } from "next/router";
import { formatDistanceToNow } from "date-fns";
import {
  Box,
  Link,
  Serif,
  Spinner,
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

interface MemberProps {
  member: MemberType;
}

const Member: FC<MemberProps> = (props) => {
  const { member } = props;
  const { manager, reports } = member;

  if (!member) {
    return <Error statusCode={404} />;
  }

  const showOrg = !!member.org;
  const showTeam = showOrg && member.team && !member.org?.includes(member.team);
  const showSubteam =
    showTeam && member.subteam && !member.team!.includes(member.subteam);

  return (
    <>
      <H1>{member.name}</H1>
      <Separator mb={space(4) + 5} />
      <Flex>
        <Flex flexDirection="column" flexBasis="min-content">
          <Box minWidth="300px" width="300px" mb={2}>
            {member.profileImage && (
              <ResponsiveImage src={member.profileImage} />
            )}
          </Box>

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
          <Spacer mb={2} />

          {member.role_text && (
            <Serif size="4" mb={2}>
              {member.role_text}
            </Serif>
          )}
          <Flex flexDirection="column">
            {member.start_date && (
              <Flex mb={0.5}>
                <Serif size="4" weight="semibold" mr={0.5} style={{ flex: 1 }}>
                  Joined:
                </Serif>
                <Link
                  href={member.intro_email}
                  underlineBehavior="hover"
                  mr={0.5}
                  style={{ flex: 1 }}
                >
                  <Flex alignItems="center">
                    <Serif size="4" mr={0.5}>
                      {capitalize(
                        formatDistanceToNow(new Date(member.start_date))
                      )}{" "}
                      ago
                    </Serif>
                  </Flex>
                </Link>
              </Flex>
            )}
            {member.preferred_pronouns && (
              <Flex mb={0.5}>
                <Serif size="4" weight="semibold" mr={0.5} style={{ flex: 1 }}>
                  Pronouns:
                </Serif>
                <Serif size="4" mr={0.5} style={{ flex: 1 }}>
                  {member.preferred_pronouns}
                </Serif>
              </Flex>
            )}
            {showOrg && (
              <Flex mb={0.5}>
                <Serif size="4" weight="semibold" mr={0.5} style={{ flex: 1 }}>
                  Organization:
                </Serif>
                <Serif size="4" mr={0.5} style={{ flex: 1 }}>
                  {member.org}
                </Serif>
              </Flex>
            )}
            {showTeam && (
              <Flex mb={0.5}>
                <Serif size="4" weight="semibold" mr={0.5} style={{ flex: 1 }}>
                  Team:
                </Serif>{" "}
                <Serif size="4" mr={0.5} style={{ flex: 1 }}>
                  {member.team}
                </Serif>
              </Flex>
            )}
            {showSubteam && (
              <Flex mb={0.5}>
                <Serif size="4" weight="semibold" mr={0.5} style={{ flex: 1 }}>
                  Subteam:
                </Serif>
                <Serif size="4" mr={0.5} style={{ flex: 1 }}>
                  {member.subteam}
                </Serif>
              </Flex>
            )}
            {manager && (
              <Flex mb={0.5}>
                <Serif size="4" weight="semibold" style={{ flex: 1 }}>
                  Manager:
                </Serif>
                <Box style={{ flex: 1 }}>
                  <RouterLink
                    href={"/member/[member]"}
                    as={`/member/${normalizeParam(manager.name)}`}
                    passHref
                  >
                    <Link noUnderline>
                      <Serif size="4">{manager.name}</Serif>
                    </Link>
                  </RouterLink>
                </Box>
              </Flex>
            )}
            {reports && (
              <Flex mb={0.5}>
                <Serif size="4" weight="semibold" style={{ flex: 1 }}>
                  Reports:
                </Serif>
                <Box style={{ flex: 1 }}>
                  {reports.map((report) => (
                    <Fragment key={`report-${normalizeParam(report.name)}`}>
                      <RouterLink
                        href={"/member/[member]"}
                        as={`/member/${normalizeParam(report.name)}`}
                        passHref
                      >
                        <Link noUnderline>
                          <Serif size="4">{report.name}</Serif>
                        </Link>
                      </RouterLink>
                    </Fragment>
                  ))}
                </Box>
              </Flex>
            )}
          </Flex>
          <Flex flexDirection="column"></Flex>
        </Flex>
        <Flex flexDirection="column" ml={3} width="500px"></Flex>
      </Flex>
    </>
  );
};

export default Member;
