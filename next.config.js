const withTM = require("next-transpile-modules")(["lodash-es"]);
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(
  withTM({
    reactStrictMode: true,
    images: {
      domains: [`${process.env.IMAGE_BUCKET}.s3.amazonaws.com`],
    },
  })
);
