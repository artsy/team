import { imageCache } from "utils/models";
import { firstIfMany } from "utils";
import to from "await-to-js";
import { NowResponse, NowRequest } from "@now/node";

export default async (req: NowRequest, res: NowResponse) => {
  const { id } = req.query;
  const [error] = await to(imageCache.delete(firstIfMany(id)));
  if (error) {
    res.status(500).send(error);
  } else {
    res.status(200).send(`Image ${id} deleted`);
  }
};
