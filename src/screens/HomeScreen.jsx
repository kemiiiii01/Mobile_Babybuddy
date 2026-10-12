import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { WeeksCircle } from '../components/WeeksCircle'
import { colors, fonts, layout } from '../theme'
import { plural } from '../constants/gestation'
import { CARE_SLOT_MS, STORIES, STORY_ORDER, careSlot, gestationMonth, gestationToday } from '../constants/stories'
import { useSeenStories } from '../hooks/useSeenStories'

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// Os sete dias da semana atual, de domingo a sábado.
function currentWeek(today) {
  const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
  return Array.from({ length: 7 }, (_, i) => new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i))
}

export default function HomeScreen({ navigation }) {
  const { profile, currentUser } = useApp()
  const seenList = useSeenStories(currentUser?.email)

  // O cuidado troca a cada 30 minutos: quando vira, a Home redesenha e o anel volta.
  const [slot, setSlot] = useState(careSlot())
  useEffect(() => {
    let timer
    const schedule = () => {
      timer = setTimeout(() => { setSlot(careSlot()); schedule() }, CARE_SLOT_MS - (Date.now() % CARE_SLOT_MS) + 500)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])
  const isSeen = type => seenList.includes(type === 'care' ? `care:${slot}` : type)
  const { width: windowWidth, height } = useWindowDimensions()
  const width = Math.min(windowWidth, layout.maxWidth)
  // em telas baixas os espaços encolhem para os cards de conteúdo continuarem à vista
  const short = height < 700
  const today = new Date()
  const gestation = gestationToday(profile)
  const pictureSize = Math.min(220, width - 130, Math.round(height * 0.32))
  // cabem três cards e um pedaço do quarto, para mostrar que a lista rola para o lado
  const cardWidth = Math.min(124, Math.max(92, Math.round((width - 24 - 3 * 8) / 3.4)))

  const openStory = type => navigation.navigate('Story', { type })

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[styles.date, short && styles.dateShort]}>{today.getDate()} de {MONTHS[today.getMonth()]}</Text>

        <View style={styles.week}>
          {currentWeek(today).map((day, i) => {
            const isToday = day.getDate() === today.getDate() && day.getMonth() === today.getMonth()
            return (
              <View key={i} style={styles.weekCol}>
                <Text style={styles.weekday}>{WEEKDAYS[i]}</Text>
                <View style={[styles.weekDay, isToday && styles.weekDayToday]}>
                  <Text style={[styles.weekDayText, isToday && styles.weekDayTextToday]}>
                    {String(day.getDate()).padStart(2, '0')}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        <TouchableOpacity
          style={[styles.picture, short && styles.pictureShort]}
          onPress={() => (gestation ? openStory('baby') : navigation.navigate('PersonalData'))}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={gestation
            ? `${plural(gestation.weeks, 'semana', 'semanas')}, ${gestationMonth(gestation.weeks)}º mês. Ver seu bebê`
            : 'Configurar a gestação em Dados Pessoais'}
        >
          {/* O círculo destaca as semanas e o mês; a imagem do bebê fica no story "Seu bebê". */}
          <WeeksCircle weeks={gestation?.weeks} size={pictureSize}>
            <Text style={styles.pictureSetup}>Toque para configurar{'\n'}a sua gestação</Text>
          </WeeksCircle>
        </TouchableOpacity>

        <View style={[styles.daily, short && styles.dailyShort]}>
        <Text style={styles.sectionTitle}>Meu conteúdo diário - Hoje</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardsScroll}
          contentContainerStyle={styles.cards}
        >
          <TouchableOpacity
            style={[styles.ring, { width: cardWidth }, !isSeen('day') && styles.ringUnseen]}
            onPress={() => openStory('day')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Dia da gravidez${gestation ? `: ${gestation.days}` : ''}${isSeen('day') ? '' : ', ainda não visto'}`}
          >
            <View style={[styles.card, styles.dayCard, { backgroundColor: STORIES.day.color }]}>
              <Text style={styles.dayLabel}>Dia da{'\n'}gravidez</Text>
              <Text style={styles.dayNumber} numberOfLines={1} adjustsFontSizeToFit>{gestation ? gestation.days : '–'}</Text>
            </View>
          </TouchableOpacity>

          {STORY_ORDER.filter(type => type !== 'day').map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.ring, { width: cardWidth }, !isSeen(type) && styles.ringUnseen]}
              onPress={() => openStory(type)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`${STORIES[type].title}${isSeen(type) ? '' : ', ainda não visto'}`}
            >
              <View style={styles.card}>
                <View style={[styles.cardBand, { backgroundColor: STORIES[type].color }]} />
                <View style={[styles.cardIcon, { backgroundColor: STORIES[type].accent }]}>
                  <Icon name={STORIES[type].icon} color={colors.white} size={18} />
                </View>
                <Text style={styles.cardLabel}>{STORIES[type].title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 },

  // a data e a semana sobem um pouco; o resto do conteúdo continua onde estava
  date: { fontSize: 15, fontFamily: fonts.bold, color: colors.black, textAlign: 'center', marginTop: -30 },

  // sem o recuo negativo: em tela baixa o conteúdo rola e a data ficaria cortada
  dateShort:    { marginTop: 0 },
  pictureShort: { marginTop: 26 },
  dailyShort:   { marginTop: 26 },

  week:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  weekCol: { alignItems: 'center', gap: 6, width: 34 },
  weekday: { fontSize: 15, fontFamily: fonts.bold, color: colors.black },
  weekDay: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  weekDayToday: { backgroundColor: colors.primary },
  // paddingTop compensa a League Spartan, que desenha os números acima do meio da linha
  weekDayText:      { fontSize: 14, fontFamily: fonts.medium, color: colors.black, paddingTop: 3 },
  weekDayTextToday: { fontFamily: fonts.bold, color: colors.white },

  picture: { alignSelf: 'center', marginTop: 58 },
  pictureSetup:   { fontSize: 15, lineHeight: 20, fontFamily: fonts.bold, color: colors.white, textAlign: 'center' },

  daily: { marginTop: 56 },
  sectionTitle: { fontSize: 19, fontFamily: fonts.bold, color: colors.black },
  // a fileira vai até as bordas da tela; o recuo fica dentro, para o primeiro card alinhar com o título
  cardsScroll: { marginHorizontal: -24, marginTop: 12, flexGrow: 0 },
  cards: { flexDirection: 'row', gap: 8, paddingHorizontal: 24 },
  // Anel fino em volta do card, com um respiro entre os dois, como nos stories.
  // Rosa = o story ainda não foi aberto hoje; some depois de visto.
  ring:       { borderRadius: 14, borderWidth: 1, borderColor: 'transparent', padding: 3 },
  ringUnseen: { borderColor: colors.primary },
  card: {
    height: 118, borderRadius: 10, backgroundColor: colors.grayBg, overflow: 'hidden',
    padding: 8, justifyContent: 'space-between',
  },
  // no card do dia, o rótulo fica junto do número, no meio da altura do card e à esquerda
  dayCard:   { justifyContent: 'center', gap: 4, paddingHorizontal: 12 },
  dayLabel:  { fontSize: 12, lineHeight: 14, fontFamily: fonts.semiBold, color: colors.ink },
  dayNumber: { fontSize: 34, lineHeight: 36, fontFamily: fonts.bold, color: colors.white },
  cardBand:  { position: 'absolute', left: 0, right: 0, top: 0, height: 56 },
  cardIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    marginTop: 28, marginLeft: 2,
  },
  cardLabel: { fontSize: 12, fontFamily: fonts.semiBold, color: colors.ink },
})
