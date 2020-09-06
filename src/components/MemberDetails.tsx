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
  const { manager, reports } = member;
  const showOrg = !!member.org;
  const showTeam = showOrg && member.team && !member.org?.includes(member.team);
  const showSubteam =
    showTeam && member.subteam && !member.team!.includes(member.subteam);

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
        {showOrg && (
          <>
            <Serif size="4" weight="semibold">
              Organization:
            </Serif>
            <Serif size="4">{member.org}</Serif>
          </>
        )}

        {/* Show team */}
        {showTeam && (
          <>
            <Serif size="4" weight="semibold">
              Team:
            </Serif>
            <Serif size="4">{member.team}</Serif>
          </>
        )}

        {/* Show subteam */}
        {showSubteam && (
          <>
            <Serif size="4" weight="semibold">
              Subteam:
            </Serif>
            <Serif size="4">{member.subteam}</Serif>
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
