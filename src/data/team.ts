import csv from "csvtojson";
import pLimit from "p-limit";
import { imageCache } from "utils/models";
import { hash } from "utils";
import { capitalize, isEmpty, omit, union, memoize, uniqBy } from "lodash-es";
import { Member } from "../pages/index";
import { resizeImage } from "./image";
import { log } from "utils/logger";

const limit = pLimit(10);

const getResizedImageUrl = async (
  imageUrl: string,
  size: number
): Promise<string | undefined> => {
  const cacheKey = hash(imageUrl + (size ? `&size=${size}` : ""));
  const cachedImage = await imageCache.get(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }
  return limit(() => resizeImage(new URL(imageUrl), size)).then(
    async function afterResizingImage(resizedImageUrl) {
      if (!resizedImageUrl) {
        log.error(`No image URL provided`);
        return;
      }
      log.info(`resized ${imageUrl} to ${size}`);
      log.info(resizedImageUrl);
      await imageCache.set(cacheKey, resizedImageUrl);
      return resizedImageUrl;
    }
  );
};

export const getMembers = memoize(async () => {
  const { SHEETS_URL } = process.env;

  if (typeof SHEETS_URL !== "string") {
    throw new Error("Expected SHEETS_URL env var to be defined");
  }

  const parsed: Member[] = await fetch(SHEETS_URL)
    .then((res) => res.text())
    .then((csvContent) => csv().fromString(csvContent));

  const promisedMembers = parsed
    .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)) // sort alphabetically
    .map(async (member) => {
      member.orgs ??= member.org?.split(";") ?? [];
      member.orgs = member.orgs
        .map((org) => org.trim())
        .filter((org) => org.length > 0);
      member.teams ??= member.team?.split(";") ?? [];
      member.teams = member.teams
        .map((team) => team.trim())
        .filter((team) => team.length > 0);
      member.subteams ??= member.subteam?.split(";") ?? [];
      member.subteams = member.subteams
        .map((subteam) => subteam.trim())
        .filter((subteam) => subteam.length > 0);
      if (member.preferred_pronouns) {
        member.preferred_pronouns = member.preferred_pronouns
          .split("/")
          .map((p: string) => capitalize(p))
          .join("/");
      }
      if (member.headshot) {
        try {
          member.profileImage = await getResizedImageUrl(member.headshot, 500);
          member.avatar = await getResizedImageUrl(member.headshot, 200);
        } catch (error) {
          log.error(error);
          member.profileImage = "";
          member.avatar = "";
        }
      }
      if (member.reports_to) {
        const manager = parsed.find((m) => m.name === member.reports_to);
        if (!isEmpty(manager)) {
          member.manager = omit(manager, "manager");
        }
      }
      const reports = uniqBy(
        parsed
          .filter((m) => m.reports_to === member.name)
          .map((report) => omit(report, ["manager", "reports"])),
        "name"
      );

      if (reports.length > 0) {
        member.reports = reports;
      }
      return member;
    });
  return await Promise.all(promisedMembers);
});

export const getMemberProperty = memoize(async (property: keyof Member) => {
  return union(
    (await getMembers())
      .map((member) => member[property])
      .filter((prop) => !isEmpty(prop))
  ) as string[];
});
