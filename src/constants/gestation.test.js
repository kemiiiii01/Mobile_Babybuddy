import { diffDays, gestationOn, parseIso, toIso } from './gestation'

describe('gestation', () => {
  it('parseIso rejeita datas que não existem', () => {
    expect(parseIso('2026-02-29')).toBeNull()
    expect(parseIso('2028-02-29')).toEqual([2028, 1, 29]) // bissexto
    expect(parseIso('15/10/2026')).toBeNull()
    expect(parseIso('')).toBeNull()
  })

  it('diffDays conta dias corridos, inclusive atravessando ano bissexto', () => {
    expect(diffDays('2026-10-12', '2026-10-12')).toBe(0)
    expect(diffDays('2026-12-31', '2027-01-01')).toBe(1)
    expect(diffDays('2028-02-28', '2028-03-01')).toBe(2)
    expect(diffDays('2026-10-12', '2026-10-05')).toBe(-7)
  })

  it('calcula semanas, dias e total de forma coerente a partir da data prevista', () => {
    // 154 dias antes da data prevista = 126 dias de gestação = 18 semanas exatas
    const g = gestationOn('2027-03-15', '2026-10-12')
    expect(g).toMatchObject({ days: 126, weeks: 18, extraDays: 0, trimester: 2, daysLeft: 154 })
    expect(g.weeks * 7 + g.extraDays).toBe(g.days)
  })

  it('no dia previsto para o parto são 40 semanas', () => {
    expect(gestationOn('2027-03-15', '2027-03-15')).toMatchObject({ days: 280, weeks: 40, extraDays: 0, daysLeft: 0 })
  })

  it('não inventa número fora do período da gravidez nem sem data prevista', () => {
    expect(gestationOn('2027-03-15', '2026-06-07')).toBeNull() // um dia antes do início
    expect(gestationOn('2027-03-15', '2026-06-08')).toMatchObject({ days: 0, weeks: 0 })
    expect(gestationOn('2027-03-15', '2027-03-30')).toBeNull() // mais de 42 semanas
    expect(gestationOn('', '2026-10-12')).toBeNull()
    expect(gestationOn('15/03/2027', '2026-10-12')).toBeNull()
  })

  it('toIso monta a data com zeros à esquerda', () => {
    expect(toIso(2026, 0, 5)).toBe('2026-01-05')
  })
})
