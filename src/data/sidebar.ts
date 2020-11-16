import { prisma } from "data/prisma";

async function getLocationLinksData() {
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

async function getOrgLinksData() {
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

async function getTeamLinksData() {
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
    ["Locations", "location", await getLocationLinksData()],
    ["Organizations", "org", await getOrgLinksData()],
    ["Teams", "team", await getTeamLinksData()],
  ];
};
