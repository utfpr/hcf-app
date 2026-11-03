import { mimeDoArquivo } from './formEvidencia'

describe('mimeDoArquivo', () => {
  it('maps Android image/jpg to image/jpeg', () => {
    expect(mimeDoArquivo({ uri: 'file:///a.jpg', name: 'a.jpg', type: 'image/jpg' }))
      .toBe('image/jpeg')
  })

  it('keeps a type the API already accepts', () => {
    expect(mimeDoArquivo({ uri: 'file:///a.jpg', name: 'a.jpg', type: 'image/jpeg' }))
      .toBe('image/jpeg')
  })

  it('infers jpeg from the name when the picker sends octet-stream', () => {
    expect(mimeDoArquivo({
      uri: 'file:///a.jpg',
      name: 'foto.jpg',
      type: 'application/octet-stream',
    })).toBe('image/jpeg')
  })

  it('does not guess video/mp4 from .mp4: the recorder also saves audio in mp4', () => {
    expect(mimeDoArquivo({
      uri: 'file:///a.mp4',
      name: 'audio.mp4',
      type: 'audio/mp4',
    })).toBe('audio/mp4')
  })
})
