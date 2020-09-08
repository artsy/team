import styled from "styled-components";
import {
  compose,
  color,
  ColorProps,
  layout,
  LayoutProps,
  space,
  SpaceProps,
  position,
  PositionProps,
} from "styled-system";
import { ComponentPropsWithoutRef } from "react";

interface IconProps
  extends LayoutProps,
    SpaceProps,
    PositionProps,
    ColorProps {}
const Icon = styled.svg<IconProps>(compose(layout, space, position, color));

interface AwardIconProps extends ComponentPropsWithoutRef<typeof Icon> {}

export function AwardIcon(props: AwardIconProps) {
  return (
    <Icon
      xmlns="http://www.w3.org/2000/svg"
      width="28px"
      height="28px"
      viewBox="0 -2 24 26"
      // fill="#6E1FFF"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle strokeWidth="1" stroke="white" cx="12" cy="8" r="9" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
      <circle cx="12" cy="8" r="7" />
      <circle strokeWidth="1.5" stroke="white" cx="12" cy="8" r="5.5" />
    </Icon>
  );
}

AwardIcon.defaultProps = {
  color: "#6E1FFF",
};
