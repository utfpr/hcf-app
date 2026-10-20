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

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}))

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  types: {},
}))

jest.mock('react-native-audio-recorder-player', () => {
  return jest.fn().mockImplementation(() => ({
    startRecorder: jest.fn(),
    stopRecorder: jest.fn(),
    addRecordBackListener: jest.fn(),
    removeRecordBackListener: jest.fn(),
    startPlayer: jest.fn(),
    stopPlayer: jest.fn(),
  }))
})
