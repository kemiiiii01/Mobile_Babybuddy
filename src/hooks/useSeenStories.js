import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { todayIso } from '../constants/gestation'

// Quais stories do dia a usuária já abriu. Fica guardado no aparelho, por conta, e
// recomeça vazio a cada dia (o conteúdo é diário). O estado mora aqui no módulo para
// a Home, que continua montada por baixo do story, atualizar na hora em que ele fecha.
let current = { owner: null, seen: [] }
const listeners = new Set()

const storageKey = email => `${email}_storiesSeen`
const ownerOf = email => `${email}|${todayIso()}`

function publish(next) {
  current = next
  listeners.forEach(listener => listener(next.seen))
}

export function markStorySeen(email, type) {
  if (!email) return
  const owner = ownerOf(email)
  const seen = current.owner === owner ? current.seen : []
  if (seen.includes(type)) return
  const next = { owner, seen: [...seen, type] }
  publish(next)
  AsyncStorage.setItem(storageKey(email), JSON.stringify({ date: todayIso(), seen: next.seen })).catch(() => {})
}

export function useSeenStories(email) {
  const owner = email ? ownerOf(email) : null
  const [seen, setSeen] = useState(current.owner === owner ? current.seen : [])

  useEffect(() => {
    listeners.add(setSeen)
    return () => { listeners.delete(setSeen) }
  }, [])

  useEffect(() => {
    if (!owner || current.owner === owner) return
    let active = true
    AsyncStorage.getItem(storageKey(email))
      .then(raw => {
        if (!active) return
        const saved = raw ? JSON.parse(raw) : null
        publish({ owner, seen: saved?.date === todayIso() && Array.isArray(saved.seen) ? saved.seen : [] })
      })
      .catch(() => { if (active) publish({ owner, seen: [] }) })
    return () => { active = false }
  }, [owner]) // eslint-disable-line react-hooks/exhaustive-deps

  return seen
}
