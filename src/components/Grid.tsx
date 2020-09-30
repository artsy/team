import styled from "styled-components";
import {
  compose,
  grid,
  GridProps as _GridProps,
  space,
  SpaceProps,
  layout,
  LayoutProps,
} from "styled-system";
import { zipObject, mapValues } from "lodash-es";
import { FC, PropsWithChildren, useMemo } from "react";
import { breakpoints } from "@artsy/palette";

interface GridProps extends _GridProps, SpaceProps, LayoutProps {}

export const Grid = styled.div<GridProps>(compose(grid, space, layout));

Grid.defaultProps = {
  display: "grid",
};

interface AreaProps
  extends Pick<_GridProps, "gridArea">,
    SpaceProps,
    LayoutProps {}

export const Area = styled.div<AreaProps>`
  grid-area: ${(props) => props.gridArea};
  ${compose(space, layout)};
`;

type AreaBreakpoints<A> =
  | Array<A[][] | null>
  | ({ [key in keyof typeof breakpoints]?: A[][] } & { _?: A[][] });

export function useAreaGrid<A>(
  areas: readonly A[],
  layouts: AreaBreakpoints<A>
) {
  return useMemo(() => {
    const templateAreas = Array.isArray(layouts)
      ? layouts.map((area) =>
          area?.map((row) => `"${row.join(" ")}"`).join("\n")
        )
      : mapValues(layouts, (area: A[][] | null) =>
          area?.map((row) => `"${row.join(" ")}"`).join("\n")
        );
    return {
      Grid: (
        props: PropsWithChildren<Omit<GridProps, "gridTemplateAreas">>
      ) => <Grid gridTemplateAreas={templateAreas as string[]} {...props} />,
      Area: zipObject<FC<Omit<AreaProps, "gridArea">>>(
        (areas as unknown) as string[],
        areas.map((area) => (props) => <Area gridArea={area} {...props} />)
        // @ts-ignore
      ) as { [key in A]: FC<Omit<AreaProps, "gridArea">> },
    };
  }, [areas, layouts]);
}
