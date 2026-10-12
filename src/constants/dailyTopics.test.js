import { DAILY_TOPICS, dailyTopicOf } from './dailyTopics'
import { STORIES } from './stories'

describe('dailyTopics', () => {
  it('cada tema tem um story, e cada assunto tem título e itens', () => {
    for (const [type, topics] of Object.entries(DAILY_TOPICS)) {
      expect(STORIES[type]).toMatchObject({ title: expect.any(String), heading: expect.any(String) })
      expect(topics.length).toBeGreaterThanOrEqual(6)
      expect(topics.every(t => t.title && t.items.length >= 3 && t.items.length <= 4)).toBe(true)
      expect(new Set(topics.map(t => t.title)).size).toBe(topics.length)
    }
  })

  it('o assunto é o mesmo o dia todo e troca no dia seguinte', () => {
    const at = (day, h) => new Date(2026, 9, day, h, 0, 0)
    expect(dailyTopicOf('stretch', at(12, 0))).toBe(dailyTopicOf('stretch', at(12, 23)))
    expect(dailyTopicOf('stretch', at(13, 0))).not.toBe(dailyTopicOf('stretch', at(12, 23)))
  })

  it('em dias seguidos, passa por todos os assuntos antes de repetir', () => {
    for (const [type, topics] of Object.entries(DAILY_TOPICS)) {
      const titulos = topics.map((_, i) => dailyTopicOf(type, new Date(2026, 9, 12 + i)).title)
      expect(new Set(titulos).size).toBe(topics.length)
    }
  })

  it('devolve null para os stories que não são temas diários', () => {
    expect(dailyTopicOf('care')).toBeNull()
  })
})
