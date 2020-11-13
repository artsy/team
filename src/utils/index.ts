import { IncomingMessage } from "http";
import crypto from "crypto";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const hash = (source: string) =>
  crypto.createHash("md5").update(source).digest("hex");

export const firstIfMany = <T>(arg: T | T[]): T => {
  if (Array.isArray(arg)) {
    return arg[0];
  }
  return arg;
};

export const normalizeParam = (param: string) =>
  param
    .trim()
    .replace(/[\W_]+/g, "_")
    .toLowerCase();

export const urlFromReq = (req: IncomingMessage) => {
  const host = req.headers.host ?? "localhost:3000";
  const protocol = host.split(":")[0] === "localhost" ? "http" : "https";
  return `${protocol}://${host}${process.env.ASSET_PREFIX ?? ""}`;
};

export const getSearchParam = (url: string) => {
  return decodeURI(
    new URL("http://noop" + url).searchParams.get("search") || ""
  );
};

export const useSearchParam = () => {
  const router = useRouter();
  return getSearchParam(router.asPath);
};

export const useDelay = (delay: number) => {
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFinished(true);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  return finished;
};
