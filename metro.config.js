const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Force Metro to use the CJS build of tslib.
// Metro can resolve tslib to its ESM .mjs file via the package "exports" field,
// which breaks CJS interop (__extends etc. come back as undefined).
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  tslib: path.resolve(__dirname, "node_modules/tslib/tslib.js"),
};

module.exports = withNativeWind(config, { input: "./global.css" });