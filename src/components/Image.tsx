import styled, { keyframes } from "styled-components";
import { color, Box, UserSingleIcon } from "@artsy/palette";
import img from "next/image";
import { ComponentPropsWithoutRef, useState } from "react";
import { borderRadius, BorderRadiusProps } from "styled-system";

type ImageProps = Omit<ComponentPropsWithoutRef<typeof img>, "src"> &
  BorderRadiusProps & {
    src?: string | null;
    width: number | string;
    height: number | string;
  };

export function Image({
  width,
  height,
  borderRadius,
  src,
  ...otherProps
}: ImageProps) {
  const [opacity, setOpacity] = useState(0);
  return (
    <ImageContainer width={width} height={height} borderRadius={borderRadius}>
      {src ? (
        <BaseImage
          // @ts-ignore
          layout="fixed"
          width={width}
          height={height}
          borderRadius={borderRadius}
          opacity={opacity}
          src={src}
          onLoad={() => setOpacity(1)}
          {...otherProps}
        />
      ) : (
        <Box
          borderRadius={borderRadius}
          backgroundColor="black10"
          width={width}
          height={height}
        >
          <UserSingleIcon
            fill="black30"
            height={height}
            width={width}
            p={0.5}
          />
        </Box>
      )}
    </ImageContainer>
  );
}

const pulse = keyframes`
  0% { background-color: ${color("black10")}; }
  50% { background-color: ${color("black5")}; }
  100% { background-color: ${color("black10")}; }
`;

const ImageContainer = styled(Box)`
  background-color: ${color("black10")};
  animation: ${pulse} 2s ease-in-out infinite;
  ${borderRadius}
`;

const BaseImage = styled(img)<ImageProps & { opacity: number }>`
  opacity: ${(props) => props.opacity};
  transition: opacity 0.3s;
  ${borderRadius}
`;
