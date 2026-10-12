import { REMINDER_COLORS } from '../constants/reminders'

// O servidor só guarda o tipo do compromisso, não se ele nasceu como lembrete ou
// como evento no app. Consultas e exames voltam como lembretes; o resto, como evento.
const TIPO_PARA_CATEGORIA = {
  consulta: 'Consulta',
  exame: 'Exame',
  ultrassom: 'Exame',
}

const chave = item => `${item.title}|${item.date}|${item.time || ''}`

// Recebe os compromissos da conta vindos do servidor e devolve só os que ainda não
// existem no aparelho, já no formato de lembrete ou de evento do app.
export default function mesclarCompromissosRemotos(remotos, reminders, events) {
  const locais = [...reminders, ...events]
  const idsConhecidos = new Set(locais.map(item => item.remoteId).filter(Boolean))
  // Um item local pode estar sendo enviado agora e ainda não ter o id do servidor:
  // título + data + hora iguais contam como o mesmo compromisso.
  const chavesConhecidas = new Set(locais.map(chave))

  const novos = { reminders: [], events: [] }
  for (const remoto of remotos) {
    if (!remoto?.id || !remoto.date) continue
    if (String(remoto.statusAgenda || '').toUpperCase().startsWith('CANCEL')) continue
    if (idsConhecidos.has(remoto.id) || chavesConhecidas.has(chave(remoto))) continue
    idsConhecidos.add(remoto.id)
    chavesConhecidas.add(chave(remoto))

    const base = {
      id: `remoto_${remoto.id}`,
      remoteId: remoto.id,
      title: remoto.title,
      date: remoto.date,
      time: remoto.time || '',
      notes: remoto.informacao || '',
    }
    const categoria = TIPO_PARA_CATEGORIA[remoto.tipoEvento]
    if (categoria) {
      novos.reminders.push({ ...base, cat: categoria, freq: 'Uma vez', done: false, color: REMINDER_COLORS[0].value })
    } else {
      novos.events.push({ ...base, local: '' })
    }
  }
  return novos
}
