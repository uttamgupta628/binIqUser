const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = mergeConfig(defaultConfig, {
  transformer: {
    babelTransformerPath: require.resolve(
      "react-native-svg-transformer/react-native"
    ),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
  },
});

module.exports = config; // ← Just export config, no withNativeWind