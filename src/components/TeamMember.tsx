import { Member } from "../pages";
import { FC } from "react";
import { normalizeParam } from "../utils";
import { AvatarFallback } from "./AvatarFallback";
import RouterLink from "next/link";
import { Avatar, Box, Serif, Flex, Link } from "@artsy/palette";
import styled from "styled-components";
import { color } from "styled-system";
import { AwardIcon } from "./AwardIcon";
import { isWeekOf } from "utils/date";

const TeamMemberContainer = styled(Flex)`
  border-radius: 5px;
  transition: background-color 250ms;
  background-color: transparent;
  &:hover {
    background-color: ${color("black5")};
  }
`;

const AvatarContainer = styled(Box)`
  flex-shrink: 0;
  position: relative;
`;

const location = ({ city, floor }: { city?: string; floor?: string }) =>
  [city, floor && `Fl. ${floor}`].filter((v) => v).join(", ");

export interface TeamMemberProps {
  member: Member;
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
            <AvatarContainer mr={1}>
              <>
                {member.start_date && isWeekOf(new Date(member.start_date)) && (
                  <AwardIcon
                    color="#6E1FFF"
                    bottom="0px"
                    right="0px"
                    position="absolute"
                    zIndex="10"
                  />
                )}
                {member.avatar ? (
                  <Avatar
                    size="md"
                    src={member.avatar}
                    lazyLoad={true}
                    renderFallback={({ diameter }) => (
                      <AvatarFallback diameter={diameter} />
                    )}
                  />
                ) : (
                  <AvatarFallback diameter={"100px"} />
                )}
              </>
            </AvatarContainer>
          )}

          <Flex flexDirection="column">
            <Flex>
              <Serif size="4" weight="semibold">
                {member.name}
              </Serif>
              {member.preferred_pronouns && (
                <Serif size="4" color="black60" ml={1}>
                  {member.preferred_pronouns}
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
