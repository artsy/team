import { Member } from "pages";
import { Serif, Link } from "@artsy/palette";
import { formatDistanceToNow } from "date-fns";
import { capitalize } from "lodash-es";
import RouterLink from "next/link";
import { normalizeParam } from "utils";
import { Fragment } from "react";
import { Grid } from "components/Grid";

interface MemberDetailsProps {
  member: Member;
}

export function MemberDetails({ member }: MemberDetailsProps) {
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
        {member.start_date && (
          <>
            <Serif size="4" weight="semibold">
              Joined:
            </Serif>
            <Link href={member.intro_email} underlineBehavior="hover">
              <Serif size="4">
                {capitalize(formatDistanceToNow(new Date(member.start_date)))}{" "}
                ago
              </Serif>
            </Link>
          </>
        )}

        {/* Preferred pronouns */}
        {member.preferred_pronouns && (
          <>
            <Serif size="4" weight="semibold">
              Pronouns:
            </Serif>
            <Serif size="4">{member.preferred_pronouns}</Serif>
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
                <Fragment key={`org-${normalizeParam(org)}`}>
                  <RouterLink href={`/org/${normalizeParam(org)}`} passHref>
                    <Link noUnderline>
                      <Serif size="4">{org}</Serif>
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
                <Fragment key={`team-${normalizeParam(team)}`}>
                  <RouterLink href={`/team/${normalizeParam(team)}`} passHref>
                    <Link noUnderline>
                      <Serif size="4">{team}</Serif>
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
                <Fragment key={`subteam-${normalizeParam(subteam)}`}>
                  <RouterLink
                    href={`/subteam/${normalizeParam(subteam)}`}
                    passHref
                  >
                    <Link noUnderline>
                      <Serif size="4">{subteam}</Serif>
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
            <RouterLink
              href={"/member/[member]"}
              as={`/member/${normalizeParam(manager.name)}`}
              passHref
            >
              <Link noUnderline>
                <Serif size="4">{manager.name}</Serif>
              </Link>
            </RouterLink>
          </>
        )}

        {/* Show reports */}
        {reports && (
          <>
            <Serif size="4" weight="semibold">
              Reports:
            </Serif>
            <span>
              {reports.map((report) => (
                <Fragment key={`report-${normalizeParam(report.name)}`}>
                  <RouterLink
                    href={"/member/[member]"}
                    as={`/member/${normalizeParam(report.name)}`}
                    passHref
                  >
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
