jest.mock('@env', () => ({
  API_BASE_URL: 'http://localhost/api',
}), { virtual: true })

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map()

  return {
    __esModule: true,
    default: {
      getItem: async (key) => (store.has(key) ? store.get(key) : null),
      setItem: async (key, value) => {
        store.set(key, value)
      },
      removeItem: async (key) => {
        store.delete(key)
      },
      clear: async () => {
        store.clear()
      },
    },
  }
})

// Módulos nativos de multimídia: no Jest não há binário nativo registrado
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(async () => ({ didCancel: true })),
  launchImageLibrary: jest.fn(async () => ({ didCancel: true })),
}))

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(async () => []),
  keepLocalCopy: jest.fn(async ({ files }) => files.map(file => ({
    status: 'success', sourceUri: file.uri, localUri: file.uri,
  }))),
  types: { audio: 'audio/*', images: 'image/*', video: 'video/*', allFiles: '*/*' },
}))

jest.mock('react-native-audio-recorder-player', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    startRecorder: jest.fn(),
    stopRecorder: jest.fn(),
    startPlayer: jest.fn(),
    stopPlayer: jest.fn(),
    pausePlayer: jest.fn(),
    resumePlayer: jest.fn(),
    seekToPlayer: jest.fn(),
    addRecordBackListener: jest.fn(),
    removeRecordBackListener: jest.fn(),
    addPlayBackListener: jest.fn(),
    removePlayBackListener: jest.fn(),
  })),
}))

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn(), dismiss: jest.fn() },
}))

jest.mock('react-native-video', () => ({
  __esModule: true,
  default: 'Video',
}))

// Armazenamento local (JSON e mídia): no Jest, um sistema de arquivos em memória
jest.mock('@dr.pogodin/react-native-fs', () => {
  const files = new Map()
  return {
    DocumentDirectoryPath: '/documents',
    exists: jest.fn(async path => files.has(path)),
    mkdir: jest.fn(async () => undefined),
    readFile: jest.fn(async path => files.get(path)),
    writeFile: jest.fn(async (path, contents) => {
      files.set(path, contents)
    }),
    moveFile: jest.fn(async (from, to) => {
      files.set(to, files.get(from))
      files.delete(from)
    }),
    copyFile: jest.fn(async (from, to) => {
      files.set(to, files.get(from) ?? '')
    }),
    unlink: jest.fn(async path => {
      ;[...files.keys()].filter(key => key === path || key.startsWith(`${path}/`)).forEach(key => files.delete(key))
    }),
  }
})

jest.mock('@react-native-community/netinfo', () => require('@react-native-community/netinfo/jest/netinfo-mock.js'))

// GPS: no Jest não há localização; o formulário mostra "Sem GPS"
jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn((_success, error) => error?.({ code: 2, message: 'indisponível' })),
    requestAuthorization: jest.fn(),
  },
}))
