import { PrismaClient } from "@prisma/client";

export async function getLocationAggregate() {
  const prisma = new PrismaClient();
  const results = await prisma.location.findMany({
    include: {
      members: true,
    },
  });
  return results.map(({ slug, city, members }) => ({
    slug,
    name: city,
    count: members.length,
  }));
}

export async function getOrgAggregate() {
  const prisma = new PrismaClient();
  const results = await prisma.organization.findMany({
    include: {
      members: true,
    },
  });

  return results.map(({ slug, name, members }) => ({
    slug,
    name,
    count: members.length,
  }));
}

export async function getTeamAggregate() {
  const prisma = new PrismaClient();
  const results = await prisma.team.findMany({
    include: {
      members: true,
    },
  });

  return results.map(({ slug, name, members }) => ({
    slug,
    name,
    count: members.length,
  }));
}

export type SidebarData = [
  title: string,
  prefix: string,
  entries: { slug: string; name: string; count: number }[]
][];

export const getSidebarData = async (): Promise<SidebarData> => {
  return [
    ["Locations", "location", await getLocationAggregate()],
    ["Organizations", "org", await getOrgAggregate()],
    ["Teams", "team", await getTeamAggregate()],
  ];
};
