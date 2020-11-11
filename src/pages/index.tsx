import { Box, Flex, Separator } from "@artsy/palette";
import { GetStaticProps } from "next";
import { H1 } from "components/Typography";
import { NoResults as DefaultNoResults } from "components/NoResults";
import { FC } from "react";
import Error from "next/error";
import { useSearchParam } from "utils";
import { getMembers } from "../data/team";
import { TeamMember } from "../components/TeamMember";

export interface Member {
  name: string;
  title?: string;
  /** @deprecated prefer `orgs` */
  org?: string;
  orgs: string[];
  /** @deprecated prefer `teams` */
  team?: string;
  teams: string[];
  /** @deprecated prefer `subteams` */
  subteam?: string;
  subteams: string[];
  reports_to?: string;
  team_rank?: number;
  email?: string;
  city?: string;
  country?: string;
  floor?: string;
  phone?: string;
  start_date?: string;
  headshot?: string;
  avatar?: string;
  role_text?: string;
  intro_email?: string;
  slack_handle?: string;
  github_handle?: string;
  seat?: string;
  preferred_pronouns?: string;
  profileImage?: string;
  manager?: Member;
  reports?: Member[];
}

export interface ServerProps {
  data?: Member[];
  title?: string;
  NoResults?: typeof DefaultNoResults;
}

export const getStaticProps: GetStaticProps = async () => {
  const members = await getMembers();
  return {
    props: {
      data: members,
    },
  };
};

const normalizeSearchTerm = (content: string) => {
  return content.toLowerCase().replace(/\s/g, "");
};

const TeamNav: FC<ServerProps> = (props) => {
  const { title, data, NoResults = DefaultNoResults } = props;
  const searchParam = useSearchParam();

  console.log("data", data);

  if (!data) {
    return <Error statusCode={500} />;
  }

  const group: { [groupLetter: string]: Member[] } = {};
  data
    .filter((member) =>
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
