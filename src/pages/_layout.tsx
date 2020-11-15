import { Box, Flex, space, Serif, Link, color, Spacer } from "@artsy/palette";
import { Sidebar } from "components/Sidebar";
import styled from "styled-components";
import { cloneElement } from "react";
import { External as ExternalIcon } from "react-bytesize-icons";
import Error from "next/error";

const PageContainer = styled(Box)`
  overflow-y: scroll;
`;

interface TeamProps {
  mdx?: boolean;
  data?: any;
  sidebarData?: any;
  errorCode?: number;
  errorMessage?: string;
}

export const Layout: React.FC<TeamProps> = ({ children, ...props }) => {
  const { errorCode, data, errorMessage } = props;
  if (errorCode) {
    return <Error statusCode={errorCode} title={errorMessage}></Error>;
  }
  return (
    <Flex height="100%">
      <Sidebar {...props} data={props.sidebarData} />
      <PageContainer
        width="100%"
        height="100%"
        position="relative"
        pt={space(1) + 3}
        pr={3}
      >
        <Flex
          position="fixed"
          bottom={0}
          pr={2}
          pb={0.5}
          style={{ right: 0 }}
          background="white"
        >
          <Serif size="2" color="black60">
            Something missing or incorrect?&nbsp;
          </Serif>
          <Link href="https://dashboard.managedbyq.com/tasks/artsy/catalog?initialItemId=IfRG9X35cn">
            <Flex alignItems="center">
              <Serif size="2" color="black60">
                Request an update
              </Serif>
              <Spacer mr={0.5} />
              <ExternalIcon width={10} height={10} color={color("black60")} />
            </Flex>
          </Link>
        </Flex>
        {cloneElement(children as any, { data, errorMessage })}
      </PageContainer>
    </Flex>
  );
};
