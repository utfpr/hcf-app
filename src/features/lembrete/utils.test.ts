import { dataBrParaIso, hojeIso, maskDataBr } from './utils'

describe('maskDataBr', () => {
  it.each([
    ['2', '2'],
    ['201', '20/1'],
    ['20112026', '20/11/2026'],
    ['20/11/2026', '20/11/2026'],
    ['20a11b2026999', '20/11/2026'],
  ])('%s -> %s', (input, expected) => {
    expect(maskDataBr(input)).toBe(expected)
  })
})

describe('dataBrParaIso', () => {
  it('converts DD/MM/AAAA to YYYY-MM-DD', () => {
    expect(dataBrParaIso('20/11/2026')).toBe('2026-11-20')
  })

  it.each(['30/02/2026', '20/13/2026', '20/11/26', ''])('rejects %s', input => {
    expect(dataBrParaIso(input)).toBeNull()
  })
})

describe('hojeIso', () => {
  it('formats the local date with zero padding', () => {
    expect(hojeIso(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
