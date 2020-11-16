import { Popover, Target, Trigger, useIsOpen } from "@accessible/popover";
import React from "react";
import { Flex, Box, Link, Serif } from "@artsy/palette";
import RouterLink from "next/link";
import { Image } from "./Image";
import styled from "styled-components";
import { Location } from "@prisma/client";

interface MemberLinkProps {
  slug: string;
  name: string;
  headshot?: string | null;
  title: string;
  location: Location;
}

export const MemberLink = (props: MemberLinkProps) => {
  return (
    <Popover>
      <Trigger on="hover">
        <Box width="max-content">
          <RouterLink href={`/member/${props.slug}`} passHref>
            <Link noUnderline>
              <Serif size="4">{props.name}</Serif>
            </Link>
          </RouterLink>
        </Box>
      </Trigger>
      <MemberPopover {...props} />
    </Popover>
  );
};

const PopoverContainer = styled(Flex)`
  align-items: center;
  background: white;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
`;

interface MemberPopoverProps {
  headshot?: string | null;
  title: string;
  location: Location;
}
const MemberPopover = ({ headshot, title, location }: MemberPopoverProps) => {
  const isOpen = useIsOpen();
  return (
    <Target placement="top">
      <PopoverContainer px={1} py={1} display={isOpen ? "flex" : "none"}>
        <Image borderRadius="50%" width="80px" height="80px" src={headshot} />
        <Flex flexDirection="column" alignItems="center" ml={1}>
          <Serif size="3t" mt={0.5}>
            {title}
          </Serif>
          <Serif size="3t" color="black60" mt={0.5}>
            {location.city}
          </Serif>
        </Flex>
      </PopoverContainer>
    </Target>
  );
};
