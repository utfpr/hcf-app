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
      // O .env não vai para o git; nos testes (Jest define NODE_ENV=test) usa o
      // .env.example para que rodem num clone novo ou no CI. ENVFILE escolhe outro
      // arquivo, ex.: ENVFILE=.env.release para o APK que outras pessoas instalam
      path: process.env.NODE_ENV === 'test' ? '.env.example' : process.env.ENVFILE ?? '.env',
    }]
  ],
};
