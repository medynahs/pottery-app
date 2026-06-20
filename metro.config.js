const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Force Metro to use the CJS build of tslib.
// Metro can resolve tslib to its ESM modules/index.js via the package "exports"
// field, which breaks CJS interop (__extends etc. come back as undefined).
// extraNodeModules alone does not cover the SSR/static-export bundler path.
const tslibPath = path.resolve(__dirname, "node_modules/tslib/tslib.js");
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib" || moduleName.endsWith("/tslib")) {
    return { filePath: tslibPath, type: "sourceFile" };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });