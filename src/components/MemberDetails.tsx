import { Serif, Link } from "@artsy/palette";
import { formatDistanceToNow } from "date-fns";
import { capitalize } from "lodash-es";
import RouterLink from "next/link";
import { Fragment } from "react";
import { Grid } from "components/Grid";
import { Location, Member, Organization, Subteam, Team } from "@prisma/client";

interface MemberDetails {
  member: Member & {
    orgs: Organization[];
    locations: Location[];
    teams: Team[];
    subteams: Subteam[];
    manager: {
      name: string;
      slug: string;
    };
    reports: {
      name: string;
      slug: string;
    }[];
  };
}

export function MemberDetails({ member }: MemberDetails) {
  const { manager, reports, orgs, teams, subteams } = member;
  const showOrgs = member.orgs.length > 0;
  const showTeams =
    showOrgs &&
    teams.length > 0 &&
    teams.filter((team) => !orgs.includes(team)).length > 0;
  const showSubteams =
    showTeams &&
    subteams.length > 0 &&
    subteams.filter((subteam) => !teams.includes(subteam)).length > 0;

  return (
    <Grid
      gridTemplateColumns="max-content auto"
      gridColumnGap="20px"
      gridRowGap="5px"
    >
      <>
        {/* Joined time with email link */}
        {member.startDate && (
          <>
            <Serif size="4" weight="semibold">
              Joined:
            </Serif>
            <Link href={member.introEmail} underlineBehavior="hover">
              <Serif size="4">
                {capitalize(formatDistanceToNow(new Date(member.startDate)))}{" "}
                ago
              </Serif>
            </Link>
          </>
        )}

        {/* Preferred pronouns */}
        {member.preferredPronouns && (
          <>
            <Serif size="4" weight="semibold">
              Pronouns:
            </Serif>
            <Serif size="4">{member.preferredPronouns}</Serif>
          </>
        )}

        {/* Show organization */}
        {showOrgs && (
          <>
            <Serif size="4" weight="semibold">
              Organization:
            </Serif>
            <span>
              {orgs.map((org) => (
                <Fragment key={`org-${org.slug}`}>
                  <RouterLink href={`/org/${org.slug}`} passHref>
                    <Link noUnderline>
                      <Serif size="4">{org.name}</Serif>
                    </Link>
                  </RouterLink>
                </Fragment>
              ))}
            </span>
          </>
        )}

        {/* Show team */}
        {showTeams && (
          <>
            <Serif size="4" weight="semibold">
              Team:
            </Serif>

            <span>
              {teams.map((team) => (
                <Fragment key={`team-${team.slug}`}>
                  <RouterLink href={`/team/${team.slug}`} passHref>
                    <Link noUnderline>
                      <Serif size="4">{team.name}</Serif>
                    </Link>
                  </RouterLink>
                </Fragment>
              ))}
            </span>
          </>
        )}

        {/* Show subteam */}
        {showSubteams && (
          <>
            <Serif size="4" weight="semibold">
              Subteam:
            </Serif>
            <span>
              {subteams.map((subteam) => (
                <Fragment key={`subteam-${subteam.slug}`}>
                  <RouterLink href={`/subteam/${subteam.slug}`} passHref>
                    <Link noUnderline>
                      <Serif size="4">{subteam.name}</Serif>
                    </Link>
                  </RouterLink>
                </Fragment>
              ))}
            </span>
          </>
        )}

        {/* Show manager */}
        {manager && (
          <>
            <Serif size="4" weight="semibold">
              Manager:
            </Serif>
            <RouterLink href={`/member/${manager.slug}`} passHref>
              <Link noUnderline>
                <Serif size="4">{manager.name}</Serif>
              </Link>
            </RouterLink>
          </>
        )}

        {/* Show reports */}
        {reports?.length > 0 && (
          <>
            <Serif size="4" weight="semibold">
              Reports:
            </Serif>
            <span>
              {reports.map((report) => (
                <Fragment key={`report-${report.slug}`}>
                  <RouterLink href={`/member/${report.slug}`} passHref>
                    <Link noUnderline>
                      <Serif size="4">{report.name}</Serif>
                    </Link>
                  </RouterLink>
                </Fragment>
              ))}
            </span>
          </>
        )}
      </>
    </Grid>
  );
}
