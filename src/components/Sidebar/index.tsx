import {
  ArtsyMarkIcon,
  Input,
  Flex,
  Separator,
  color,
  Box,
  Link,
  Spacer,
  Sans,
} from "@artsy/palette";
import { LinkConfig, LinkSection } from "./LinkSection";
import styled from "styled-components";
import RouteLink from "next/link";
import Router, { NextRouter, useRouter } from "next/router";
import { debounce } from "lodash-es";
import { useRef, useEffect } from "react";
import { getSearchParam } from "utils";
import { SidebarData } from "data/sidebar";

const search = debounce((router: NextRouter, searchTerm: string) => {
  const searchParam = encodeURI(searchTerm);
  const searchFromCurrentPath = [
    "team",
    "[location]",
    "[org]",
    "[team]",
  ].some((route) => router.pathname.endsWith(route));
  const pathname = searchFromCurrentPath ? router.pathname : "/";
  const as = pathname.match(/\[[\w-]+\]/)
    ? router.asPath.split("?")[0]
    : undefined;

  searchParam
    ? router.push(
        { pathname, query: as ? {} : { search: searchParam } },
        as && { pathname: as, query: { search: searchParam } }
      )
    : router.push(pathname, as);
}, 200);

const helpfulLinks: LinkConfig[] = [
  {
    text: "Atlas",
    external: true,
    href: "https://atlas.artsy.net",
  },
  {
    text: "NYC OfficeSpace",
    external: true,
    href: "https://artsy.officespacesoftware.com/visual-directory/floors/12",
  },
  {
    text: "LDN OfficeSpace",
    external: true,
    href: "https://artsy.officespacesoftware.com/visual-directory/floors/11",
  },
  // TODO: Implement this
  // {
  //   text: "Who is New?",
  //   href: "/who-is-new",
  // },
  {
    text: "Did you know?",
    href: "/did-you-know",
  },
];

const SidebarContainer = styled(Flex)`
  border-right: 1px solid ${color("black10")};
  overflow-y: scroll;
`;

interface SidebarProps {
  data: SidebarData;
}

export const Sidebar = ({ data }: SidebarProps) => {
  const router = useRouter();
  const inputEl = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (!inputEl || !inputEl.current) return;
      if (!url.includes("search=")) {
        inputEl.current.value = "";
      } else {
        inputEl.current.value = getSearchParam(url);
      }
    };

    Router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      Router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [inputEl.current]);
  return (
    <SidebarContainer
      flexDirection="column"
      flexShrink="0"
      width="450px"
      height="100%"
      px={3}
      mr={3}
    >
      <Box position="fixed" bg="white" width="390px">
        <RouteLink href="/" passHref>
          <Link underlineBehavior="hover">
            <Sans size="3" weight="medium" my={1}>
              Team Navigator
            </Sans>
          </Link>
        </RouteLink>
        <Flex alignItems="center">
          <ArtsyMarkIcon width="48" height="48" mr={1} />
          <Input
            ref={inputEl}
            defaultValue={
              router.query.search
                ? decodeURI(router.query.search as string)
                : ""
            }
            placeholder="Search team members"
            onChange={(e) => {
              const { value } = e.target as any;
              search(router, value);
            }}
          />
        </Flex>
        <Separator mt={3} />
      </Box>
      {/* This spacer should have an mb of the height above + 30px */}
      <Spacer mb="140px" />
      <LinkSection title="Links" links={helpfulLinks} />
      {data?.map(([title, prefix, entries]) => {
        return (
          <LinkSection
            key={`${prefix}-links`}
            title={title}
            links={entries.map(({ name: text, slug, count }) => ({
              text,
              href: `/${prefix}/${slug}`,
              count,
            }))}
          />
        );
      })}
    </SidebarContainer>
  );
};
