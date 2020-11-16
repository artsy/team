import { FC, useState } from "react";
import { normalizeParam } from "../utils";
import { AvatarFallback } from "./AvatarFallback";
import RouterLink from "next/link";
import { Box, Serif, Flex, Link, color } from "@artsy/palette";
import styled, { keyframes } from "styled-components";
import { AwardIcon } from "./AwardIcon";
import { isWeekOf } from "utils/date";
import { Member, Location } from "@prisma/client";
import { Image } from "components/Image";

const TeamMemberContainer = styled(Flex)`
  border-radius: 5px;
  transition: background-color 250ms;
  background-color: transparent;
  &:hover {
    background-color: ${color("black5")};
  }
`;

const location = (member: TeamMemberProps["member"]) =>
  [
    member.location?.city,
    member.location?.floor && `Fl. ${member.location.floor}`,
  ]
    .filter((v) => v)
    .join(", ");

export interface TeamMemberProps {
  member: Member & { location: Location };
  showAvatar?: boolean;
}
export const TeamMember: FC<TeamMemberProps> = (props) => {
  const { member, showAvatar = true } = props;

  return (
    <RouterLink
      href="/member/[member]"
      as={`/member/${normalizeParam(member.name)}`}
      passHref
    >
      <Link underlineBehavior="none">
        <TeamMemberContainer width="390px" p={1} ml={(!showAvatar && -1) || 0}>
          {showAvatar && (
            <Box flexShrink={0} mr={1} position="relative">
              <>
                {member.startDate && isWeekOf(new Date(member.startDate)) && (
                  <AwardIcon
                    color="#6E1FFF"
                    bottom="0px"
                    right="0px"
                    position="absolute"
                    zIndex="10"
                  />
                )}
                {member.headshot ? (
                  <Image
                    width="100px"
                    height="100px"
                    layout="fixed"
                    src={member.headshot}
                    sizes="100px"
                    borderRadius="50%"
                  />
                ) : (
                  <AvatarFallback diameter={"100px"} />
                )}
              </>
            </Box>
          )}

          <Flex flexDirection="column">
            <Flex>
              <Serif size="4" weight="semibold">
                {member.name}
              </Serif>
              {member.preferredPronouns && (
                <Serif size="4" color="black60" ml={1}>
                  {member.preferredPronouns}
                </Serif>
              )}
            </Flex>
            <Serif size="4">{member.title}</Serif>
            <Serif size="4" color="black60">
              {location(member)}
            </Serif>
          </Flex>
        </TeamMemberContainer>
      </Link>
    </RouterLink>
  );
};
