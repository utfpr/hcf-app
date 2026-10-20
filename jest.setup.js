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

jest.mock('react-native-video', () => ({
  __esModule: true,
  default: 'Video',
}))
