import { CARE_TIPS, babyWeekText, careSlot, careTipOf, gestationMonth, gestationToday } from './stories'
import { todayIso } from './gestation'

describe('stories', () => {
  it('tem um texto próprio para cada uma das 42 semanas', () => {
    const textos = Array.from({ length: 42 }, (_, i) => babyWeekText(i + 1))
    expect(textos.every(t => typeof t === 'string' && t.length > 40)).toBe(true)
    expect(new Set(textos).size).toBe(42)
  })

  it('fora do intervalo, usa a primeira ou a última semana', () => {
    expect(babyWeekText(0)).toBe(babyWeekText(1))
    expect(babyWeekText(undefined)).toBe(babyWeekText(1))
    expect(babyWeekText(45)).toBe(babyWeekText(42))
  })

  it('são 27 cuidados, todos com ícone, título e texto', () => {
    expect(CARE_TIPS).toHaveLength(27)
    expect(CARE_TIPS.every(t => t.icon && t.title && t.text.length > 40)).toBe(true)
    expect(new Set(CARE_TIPS.map(t => t.title)).size).toBe(27)
  })

  it('o cuidado é o mesmo dentro da meia hora e troca na seguinte', () => {
    const at = (h, m) => new Date(2026, 9, 12, h, m, 0)
    expect(careTipOf(at(10, 0))).toBe(careTipOf(at(10, 29)))
    expect(careTipOf(at(10, 30))).not.toBe(careTipOf(at(10, 29)))
    expect(careSlot(at(10, 30)) - careSlot(at(10, 29))).toBe(1)
  })

  it('em sequência, passa por todos os cuidados antes de repetir', () => {
    const inicio = new Date(2026, 9, 12, 0, 0, 0).getTime()
    const titulos = Array.from({ length: 27 }, (_, i) => careTipOf(new Date(inicio + i * 30 * 60 * 1000)).title)
    expect(new Set(titulos).size).toBe(27)
  })

  it('calcula o mês de gestação a partir das semanas', () => {
    expect(gestationMonth(4)).toBe(1)
    expect(gestationMonth(18)).toBe(5)
    expect(gestationMonth(37)).toBe(9)
    expect(gestationMonth(42)).toBe(9)
  })

  it('gestationToday: exata com a data prevista, estimada só com as semanas, nula sem nada', () => {
    expect(gestationToday({ due: todayIso() })).toMatchObject({ days: 280, weeks: 40, exact: true })
    expect(gestationToday({ weeks: '24' })).toMatchObject({ weeks: 24, days: 168, exact: false })
    expect(gestationToday({})).toBeNull()
  })
})
