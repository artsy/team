import { H1 } from "components/Typography";
import { useRouter } from "next/router";
import { Flex, Link } from "@artsy/palette";
import RouterLink from "next/link";
import { useSearchParam } from "../utils";

interface NoResultsProps {
  page?: string;
}
export const NoResults = ({ page }: NoResultsProps) => {
  const searchParam = useSearchParam();
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      mt="20%"
    >
      <H1>
        Couldn't find results for <i>{decodeURI(searchParam)}</i>{" "}
        {page && `in ${page}`}
      </H1>
      {page && (
        <RouterLink href={"/?search=" + searchParam} passHref>
          <Link>Search the whole team</Link>
        </RouterLink>
      )}
    </Flex>
  );
};
