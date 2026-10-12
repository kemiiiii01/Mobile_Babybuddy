import mesclarCompromissosRemotos from './mesclarCompromissosRemotos'

const remoto = (id, extra = {}) => ({
  id, title: `Compromisso ${id}`, date: '2026-10-15', time: '10:00',
  informacao: null, tipoEvento: 'outro', statusAgenda: 'AGENDADO', ...extra,
})

describe('mesclarCompromissosRemotos', () => {
  it('traz o que só existe no servidor: consulta/exame viram lembrete, o resto vira evento', () => {
    const novos = mesclarCompromissosRemotos([
      remoto(1, { tipoEvento: 'consulta', informacao: 'Levar exames' }),
      remoto(2, { tipoEvento: 'ultrassom' }),
      remoto(3, { tipoEvento: 'outro' }),
    ], [], [])

    expect(novos.reminders).toEqual([
      expect.objectContaining({ id: 'remoto_1', remoteId: 1, cat: 'Consulta', notes: 'Levar exames', done: false }),
      expect.objectContaining({ id: 'remoto_2', remoteId: 2, cat: 'Exame' }),
    ])
    expect(novos.events).toEqual([expect.objectContaining({ id: 'remoto_3', remoteId: 3, title: 'Compromisso 3' })])
  })

  it('não duplica o que o aparelho já tem (pelo id do servidor)', () => {
    const novos = mesclarCompromissosRemotos(
      [remoto(1), remoto(2)],
      [{ id: 'a', remoteId: 1, title: 'x', date: '2026-10-01' }],
      [{ id: 'b', remoteId: 2, title: 'y', date: '2026-10-02' }],
    )
    expect(novos).toEqual({ reminders: [], events: [] })
  })

  it('não duplica um item local que ainda está sendo enviado (mesmo título, data e hora)', () => {
    const local = { id: 'a', title: 'Compromisso 1', date: '2026-10-15', time: '10:00' }
    expect(mesclarCompromissosRemotos([remoto(1)], [local], [])).toEqual({ reminders: [], events: [] })
  })

  it('ignora cancelados, itens sem data e repetidos na própria resposta', () => {
    const novos = mesclarCompromissosRemotos([
      remoto(1, { statusAgenda: 'CANCELADO' }),
      remoto(2, { date: '' }),
      remoto(3),
      remoto(3),
    ], [], [])
    expect(novos.reminders).toEqual([])
    expect(novos.events.map(e => e.remoteId)).toEqual([3])
  })
})
