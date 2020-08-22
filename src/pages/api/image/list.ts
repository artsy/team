import { imageCache } from "utils/models";
import { NowResponse } from "@now/node";

export default async (_: never, res: NowResponse) => {
  const results = await imageCache.list();
  if (results) {
    res.status(200).send(JSON.stringify(results));
  } else {
    res.status(404).send("No results");
  }
};
