import { FC, useState } from "react";
import { normalizeParam } from "../utils";
import { AvatarFallback } from "./AvatarFallback";
import RouterLink from "next/link";
import { Box, Serif, Flex, Link, color } from "@artsy/palette";
import styled, { keyframes } from "styled-components";
import { AwardIcon } from "./AwardIcon";
import { isWeekOf } from "utils/date";
import Image from "next/image";
import { Member, Location } from "@prisma/client";

const TeamMemberContainer = styled(Flex)`
  border-radius: 5px;
  transition: background-color 250ms;
  background-color: transparent;
  &:hover {
    background-color: ${color("black5")};
  }
`;

const pulse = keyframes`
  0% { background-color: ${color("black10")}; }
  50% { background-color: ${color("black5")}; }
  100% { background-color: ${color("black10")}; }
`;

const AvatarContainer = styled(Box)`
  flex-shrink: 0;
  position: relative;
  width: 100px;
  height: 100px;
  background-color: ${color("black10")};
  animation: ${pulse} 2s ease-in-out infinite;
  border-radius: 50%;
`;

const Avatar = styled(Image)`
  border-radius: 50%;
  opacity: ${(props) => (props as any).opacity};
  transition: opacity 0.3s;
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
  const [opacity, setOpacity] = useState(0);

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
                  <Avatar
                    width="100px"
                    height="100px"
                    // @ts-ignore Unsure why layout prop types are off
                    layout="fixed"
                    src={member.headshot}
                    sizes="100px"
                    onLoad={() => setOpacity(1)}
                    opacity={opacity}
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
