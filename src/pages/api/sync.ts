import { NowRequest, NowResponse } from "@now/node";
import { google } from "googleapis";
import { MemberUpsertArgs, PrismaClient } from "@prisma/client";
import { range, zipObject, difference } from "lodash-es";
import to from "await-to-js";
import { normalizeParam } from "utils";

const prisma = new PrismaClient();

const sheets = google.sheets({
  version: "v4",
  auth: new google.auth.GoogleAuth({
    keyFile: "./.google-api-creds.json",
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  }),
});

// Some cells can contain multiple values separated by a `;`
const splitMultiValueCell = (cellValue: string): string[] | undefined => {
  const values = cellValue
    .split(";")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  return values.length > 0 ? values : undefined;
};

export default async function sync(req: NowRequest, res: NowResponse) {
  // 1. grab sheet
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID as string,
    range: "Team Members!A1:AA500",
  });

  if (!data.values) {
    res.status(500).send("Sheet values empty").end();
    return;
  }

  const [keys, ...memberRowsWithWhitespace] = data.values;
  const memberRows = memberRowsWithWhitespace.map((row) =>
    row.map((cell) => cell.trim())
  );

  /** Represents the mapping of the gsheet column names to the returned data */
  const column = zipObject(keys, range(keys.length));

  /**
   * 2. Create many mapped non-member entities
   * Many-to-many relationships require some extra boilerplate...
   */

  const allOrgs = Array.from(
    new Set(memberRows.flatMap((row) => splitMultiValueCell(row[column.org])))
  );
  const allTeams = Array.from(
    new Set(memberRows.flatMap((row) => splitMultiValueCell(row[column.team])))
  );
  const allSubteams = Array.from(
    new Set(
      memberRows.flatMap((row) => splitMultiValueCell(row[column.subteam]))
    )
  );

  const body = (slug: string, name: string) => ({
    create: {
      slug,
      name,
    },
    update: {
      name,
    },
    where: {
      slug,
    },
  });

  // Create or update orgs
  for (let org of allOrgs) {
    if (!org) continue;
    const slug = normalizeParam(org);
    await prisma.organization.upsert(body(slug, org));
  }

  // Create or update teams
  for (let team of allTeams) {
    if (!team) continue;
    const slug = normalizeParam(team);
    await prisma.team.upsert(body(slug, team));
  }

  // Create or update subteams
  for (let subteam of allSubteams) {
    if (!subteam) continue;
    const slug = normalizeParam(subteam);
    await prisma.subteam.upsert(body(slug, subteam));
  }

  // 3. Delete any orphaned members
  const memberSlugsFromSheets = memberRows.map((row) =>
    normalizeParam(row[column.name])
  );
  const memberSlugsFromTable = await prisma.member
    .findMany({
      select: {
        slug: true,
      },
    })
    .then((slugs) => slugs.map(({ slug }) => slug));
  const orphanedMembers = difference(
    memberSlugsFromTable,
    memberSlugsFromSheets
  );
  if (orphanedMembers.length > 0) {
    await prisma.member.deleteMany({
      where: { OR: orphanedMembers },
    });
  }

  /**
   * An array of cells from one row of the gsheet. To access the data use
   * the following pattern:
   *
   * `row[column.<sheet_column_name>]`
   *
   * e.g.
   *
   * `row[column.email]`
   * */
  let row;

  // 4. Create or update team members
  for (row of memberRows) {
    row = row.map((r) => r.trim());
    const orgs = splitMultiValueCell(row[column.org]);
    const teams = splitMultiValueCell(row[column.team]);
    const subteams = splitMultiValueCell(row[column.subteam]);

    const [err] = await to(
      prisma.member.upsert<MemberUpsertArgs>({
        create: {
          name: row[column.name],
          slug: normalizeParam(row[column.name]),
          title: row[column.title],
          email: row[column.email],
          headshot: row[column.headshot],
          preferredPronouns: row[column.preferred_pronouns],
          introEmail: row[column.intro_email],
          roleText: row[column.role_text],
          startDate: new Date(row[column.start_date]),
          slack: row[column.slack_handle],
          github: row[column.github_handle],
          location: {
            connectOrCreate: {
              where: {
                slug: `${normalizeParam(row[column.city])}-${normalizeParam(
                  row[column.country]
                )}`,
              },
              create: {
                slug: `${normalizeParam(row[column.city])}-${normalizeParam(
                  row[column.country]
                )}`,
                city: row[column.city],
                country: row[column.country],
                floor: row[column.floor],
              },
            },
          },
          orgs: {
            connect: orgs?.map((org) => ({
              slug: normalizeParam(org),
            })),
          },
          teams: {
            connect: teams?.map((team) => ({
              slug: normalizeParam(team),
            })),
          },
          subteams: {
            connect: subteams?.map((subteam) => ({
              slug: normalizeParam(subteam),
            })),
          },
        },
        update: {
          name: row[column.name],
          slug: normalizeParam(row[column.name]),
          title: row[column.title],
          email: row[column.email],
          headshot: row[column.headshot],
          preferredPronouns: row[column.preferred_pronouns],
          introEmail: row[column.intro_email],
          roleText: row[column.role_text],
          startDate: new Date(row[column.start_date]),
          slack: row[column.slack_handle],
          github: row[column.github_handle],
          location: {
            connectOrCreate: {
              where: {
                slug: `${normalizeParam(row[column.city])}-${normalizeParam(
                  row[column.country]
                )}`,
              },
              create: {
                slug: `${normalizeParam(row[column.city])}-${normalizeParam(
                  row[column.country]
                )}`,
                city: row[column.city],
                country: row[column.country],
                floor: row[column.floor],
              },
            },
          },
          orgs: {
            set:
              orgs?.map((value) => ({
                slug: normalizeParam(value),
              })) ?? [],
          },
          teams: {
            set:
              teams?.map((value) => ({
                slug: normalizeParam(value),
              })) ?? [],
          },
          subteams: {
            set:
              subteams?.map((value) => ({
                slug: normalizeParam(value),
              })) ?? [],
          },
        },
        where: {
          slug: normalizeParam(row[column.name]),
        },
      })
    );

    if (err) {
      console.error(`Unable to load ${row[column.name]}`);
      console.error(err);
    }
  }

  // 5. Associate reports relationship
  for (let row of memberRows) {
    if (row[column.reports_to] === "") continue;
    const [err] = await to(
      prisma.member.update({
        where: {
          name: row[column.name],
        },
        data: {
          manager: {
            connect: { name: row[column.reports_to] },
          },
        },
      })
    );

    if (err) {
      console.error(`unable to assign manager for ${row[column.name]}`);
    }
  }

  // 6. Delete any unused entities
  const slug = {
    slug: true,
    members: {
      select: {
        slug: true,
      },
      take: 1,
    },
  } as const;

  const unused = (selection: { slug: string; members: { slug: string }[] }[]) =>
    selection
      .filter((select) => select.members.length === 0)
      .map(({ slug }) => ({ slug }));

  const unusedLocations = unused(
    await prisma.location.findMany({ select: slug })
  );
  if (unusedLocations.length > 0) {
    const deletedLocations = await prisma.location.deleteMany({
      where: { OR: unusedLocations },
    });
    console.log("locations deleted:", deletedLocations);
  }

  const unusedOrgs = unused(
    await prisma.organization.findMany({ select: slug })
  );
  if (unusedOrgs.length > 0) {
    const deletedOrgs = await prisma.organization.deleteMany({
      where: { OR: unusedOrgs },
    });
    console.log("orgs deleted:", deletedOrgs);
  }

  const unusedTeams = unused(await prisma.team.findMany({ select: slug }));
  if (unusedTeams.length > 0) {
    const deletedTeams = await prisma.team.deleteMany({
      where: { OR: unusedTeams },
    });
    console.log("teams deleted:", deletedTeams);
  }

  const unusedSubteams = unused(
    await prisma.subteam.findMany({ select: slug })
  );
  if (unusedSubteams.length > 0) {
    const deletedSubteams = await prisma.subteam.deleteMany({
      where: { OR: unusedSubteams },
    });
    console.log("subteams deleted:", deletedSubteams);
  }

  res.status(200).end();
}
