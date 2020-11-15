import { MemberSelect, MemberWhereInput } from "@prisma/client";
import { UnWrapPromise } from "utils/type-helpers";
import { prisma } from "data/prisma";

export type MemberIndexListing = UnWrapPromise<
  ReturnType<typeof getMembersIndex>
>;
export async function getMembersIndex(where: MemberWhereInput = {}) {
  const data = await prisma.member.findMany({
    select: {
      name: true,
      startDate: true,
      title: true,
      headshot: true,
      location: {
        select: {
          city: true,
          floor: true,
        },
      },
      orgs: {
        select: {
          name: true,
        },
      },
      teams: {
        select: {
          name: true,
        },
      },
    },
    where,
  });
  return data.map((datum) => ({
    ...datum,
    startDate: datum.startDate.toISOString(),
    orgs: datum.orgs.map(({ name }) => name),
    teams: datum.teams.map(({ name }) => name),
  }));
}

export async function getMemberField<R>(
  field: keyof MemberSelect
): Promise<R[]> {
  const data = (
    await prisma.member.findMany({
      select: {
        [field]: true,
      },
      distinct: [field as any],
    })
  )
    .map((d: any) => d[field])
    .filter((d) => !!d);
  return data;
}
