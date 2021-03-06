import { Box, Flex, Separator } from "@artsy/palette";
import { GetStaticProps } from "next";
import { H1 } from "components/Typography";
import { NoResults as DefaultNoResults } from "components/NoResults";
import { FC } from "react";
import { useSearchParam } from "utils";
import { TeamMember } from "../components/TeamMember";
import { getMembersIndex, MemberIndexListing } from "data/teamMember";
import { getSidebarData } from "data/sidebar";

export interface ServerProps {
  data?: MemberIndexListing;
  title?: string;
  NoResults?: typeof DefaultNoResults;
}

export const getStaticProps: GetStaticProps<ServerProps> = async () => {
  return {
    props: {
      data: await getMembersIndex(),
      sidebarData: await getSidebarData(),
    },
    // page revalidates at most every minute
    revalidate: 60,
  };
};

const normalizeSearchTerm = (content: string) => {
  return content.toLowerCase().replace(/\s/g, "");
};

const TeamNav: FC<ServerProps> = (props) => {
  const { title, data, NoResults = DefaultNoResults } = props;
  const searchParam = useSearchParam();

  const group: { [groupLetter: string]: MemberIndexListing } = {};
  data
    ?.filter((member) =>
      normalizeSearchTerm(member.name).includes(
        normalizeSearchTerm(searchParam)
      )
    )
    .forEach((member) => {
      const firstLetter = member.name[0];
      if (!group[firstLetter]) {
        group[firstLetter] = [];
      }
      group[firstLetter].push(member);
    });

  if (Object.keys(group).length === 0) {
    return <NoResults />;
  }

  return (
    <>
      {title && (
        <>
          <H1>{title}</H1>
          <Separator />
        </>
      )}
      <section>
        {Object.entries(group).map(
          ([firstLetter, members]: [string, any[]]) => {
            return (
              <Box key={`group-${firstLetter}`} width="100%">
                <H1>{firstLetter}</H1>
                <Flex flexWrap="wrap">
                  {members.map((member) => (
                    <TeamMember key={member.name} member={member} />
                  ))}
                </Flex>
                <Separator mt={3} />
              </Box>
            );
          }
        )}
      </section>
    </>
  );
};

export default TeamNav;
