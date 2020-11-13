import {
  MemberCreateInput,
  MemberGetPayload,
  MemberSelect,
  MemberWhereInput,
  PrismaClient,
} from "@prisma/client";
import { UnWrapPromise } from "utils/type-helpers";

export type MemberIndexListing = UnWrapPromise<
  ReturnType<typeof getMembersIndex>
>;
export async function getMembersIndex(where: MemberWhereInput = {}) {
  const prisma = new PrismaClient();
  const data = await prisma.member.findMany({
    select: {
      name: true,
      startDate: true,
      title: true,
      headshot: true,
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
  const prisma = new PrismaClient();
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
