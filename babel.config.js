module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add this plugin:
      'react-native-reanimated/plugin',
      // If using other plugins, keep them here
    ],
  };
};