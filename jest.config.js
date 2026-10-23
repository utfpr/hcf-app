module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // fontes das bibliotecas de ícones não são JavaScript
    '\\.ttf$': '<rootDir>/__mocks__/fileMock.js',
    // o exports do pacote entrega o build ESM (.mjs) para react-native, que o Jest não transforma
    '^lucide-react-native$': '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-[^/]+)?|@react-native(-community|-documents)?|@react-native-vector-icons|@react-navigation|react-native-screens|react-native-safe-area-context)/)',
  ],
}
