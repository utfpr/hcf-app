module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    [
      'babel-plugin-module-resolver', {
        root: ['./src'],
        alias: {
          '@': './src',
        },
      }
    ],
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }]
  ],
};
