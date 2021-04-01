import sharp from "sharp";
import S3 from "aws-sdk/clients/s3";
import stream from "stream";
import { google } from "googleapis";
import memoize from "p-memoize";
import { extractFirstPartialMatch, hash } from "utils";
import to from "await-to-js";
import { log } from "utils/logger";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const drive = google.drive({
  version: "v3",
  auth: new google.auth.GoogleAuth({
    keyFile: "./.google-api-creds.json",
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.appdata",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.metadata",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
      "https://www.googleapis.com/auth/drive.photos.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  }),
});

const s3 = new S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

/**
 * Returns a list of all images stored in the currently configured
 * S3 bucket. This method is cached for an hour and can be cleared by
 * calling `memoize.clear(listS3Images)`.
 */
export const listS3Images = memoize(
  (bucketPrefix: string) => {
    return s3
      .listObjectsV2({
        Bucket: process.env.IMAGE_BUCKET as string,
        Delimiter: "/",
        Prefix: bucketPrefix,
      })
      .promise();
  },
  { maxAge: 1 * HOUR }
);

const streamToS3 = (
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

export async function uploadUserImage(
  userSlug: string,
  imageUrl: URL
): Promise<string> {
  const bucketPrefix = "team-full/";
  const Bucket = process.env.IMAGE_BUCKET as string;

  if (!imageUrl.href.startsWith("https://drive.google.com")) {
    throw new Error(`Error processing ${imageUrl.href}, not a drive url`);
  }

  const imageId = imageUrl.href.split("/file/d/")[1]?.split("/")[0];
  if (!imageId) {
    throw new Error(
      `Invalid formatted google drive image url: ${imageUrl.href}`
    );
  }

  /**
   * Used to determine the uniqueness of images. Any images w/ the same
   * hash for the same user won't be overwrote. If changes to the image
   * processing are done you can update the salt value to regenerate all
   * the hashes.
   */
  const imageUrlHash = hash(imageUrl.toString() + "salt2");
  const userImageName = `${bucketPrefix}${userSlug}-${imageUrlHash}`;

  const [ErrorAccessingS3Images, S3Images] = await to(
    listS3Images(bucketPrefix)
  );
  if (ErrorAccessingS3Images || !S3Images) {
    log.error("Unable to access images on S3", ErrorAccessingS3Images);
  } else {
    const userImages: string[] =
      S3Images.Contents?.map((image) => image.Key ?? "").filter((image) =>
        image.includes(`/${userSlug}-`)
      ) ?? [];
    const [currentUserImage, oldUserImages] = extractFirstPartialMatch(
      userImageName,
      userImages
    );
    // Delete any old images
    for (let oldImage of oldUserImages) {
      const [deleteError] = await to(
        s3
          .deleteObject({
            Bucket,
            Key: oldImage,
          })
          .promise()
      );
      if (deleteError) {
        log.error(`Failed to delete old user image ${oldImage}`, deleteError);
      }
    }
    if (currentUserImage) {
      // This image has already been uploaded, let's skip the rest
      return `https://${Bucket}.s3.amazonaws.com/${currentUserImage}`;
    }
  }

  log.info(`Uploading image for ${userSlug}`);

  const normalizer = sharp().rotate().resize(500, 500);

  const file = await drive.files.get(
    {
      fileId: imageId,
      alt: "media",
    },
    { responseType: "stream" }
  );

  const contentType = file.headers["content-type"];
  const allowedImageTypes = [
    "JPEG",
    "PNG",
    "WebP",
    "GIF",
    "SVG",
    "TIFF",
  ].map((e) => e.toLowerCase());

  const extension: string | false =
    contentType.includes("image") && contentType.split("image/")[1];

  if (!extension) throw new Error(`No valid extension for ${imageUrl.href}`);
  if (!allowedImageTypes.includes(extension.toLowerCase()))
    throw new Error(`Invalid image format: ${imageUrl.href}`);

  return new Promise((resolve, reject) => {
    file.data.pipe(normalizer).pipe(
      streamToS3(`${userImageName}.${extension}`, (err, data) => {
        if (err) {
          reject(err);
        } else {
          log.info(`successfully uploaded ${userSlug} image`, {
            url: data.Location,
          });
          resolve(data.Location);
        }
      })
    );
  });
}
