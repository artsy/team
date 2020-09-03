import sharp from "sharp";
import S3 from "aws-sdk/clients/s3";
import stream from "stream";
import { hash } from "utils";
import { google } from "googleapis";

const drive = google.drive({
  version: "v3",
  auth: google.auth.fromJSON(
    JSON.parse(new Buffer(process.env.SHEET_CREDS!, "base64").toString("ascii"))
  ),
});

const streamToS3 = (
  s3: S3,
  key: string,
  done: (err: Error, data: S3.ManagedUpload.SendData) => void
) => {
  const pass = new stream.PassThrough();
  const params: S3.PutObjectRequest = {
    Bucket: process.env.IMAGE_BUCKET as string,
    Key: key,
    Body: pass,
    ACL: "public-read",
  };
  s3.upload(params, done);
  return pass;
};

export async function resizeImage(
  imageUrl: URL,
  size: number
): Promise<string> {
  const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
  });

  if (!imageUrl.href.startsWith("https://drive.google.com")) {
    throw new Error(`Error processing ${imageUrl.href}, not a drive url`);
  }

  const imageId =
    imageUrl.href.startsWith("https://drive.google.com") &&
    imageUrl.href.split("/file/d/")[1]?.split("/")[0];

  if (!imageId) {
    throw new Error(
      `Invalid formatted google drive image url: ${imageUrl.href}`
    );
  }

  imageUrl.href = "https://drive.google.com/a/artsymail.com/uc";
  imageUrl.search = `?id=${imageId}`;

  const resizer = sharp().rotate().resize(size, size);

  const file = await drive.files.get(
    {
      fileId: imageId,
      alt: "media",
    },
    { responseType: "stream" }
  );

  return new Promise((resolve, reject) => {
    file.data.pipe(resizer).pipe(
      streamToS3(
        s3,
        `team/${hash(
          imageUrl.href + "?size=" + size
        )}.${imageUrl.pathname.split(".").pop()}`,
        (err, data) => {
          err ? reject(err) : resolve(data.Location);
        }
      )
    );
  });
}
