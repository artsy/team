const withTM = require("next-transpile-modules")(["lodash-es"]);
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(withTM({}));
