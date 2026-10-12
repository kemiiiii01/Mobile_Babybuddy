import { useEffect, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing, PanResponder, useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { colors, fonts, layout } from '../theme'
import { plural } from '../constants/gestation'
import { STORIES, babyWeekText, careSlot, careTipOf, gestationMonth, gestationToday } from '../constants/stories'
import { dailyTopicOf } from '../constants/dailyTopics'
import { markStorySeen } from '../hooks/useSeenStories'

const STORY_MS = 10000      // tempo até o story fechar sozinho
const TOPIC_MS = 16000      // os temas com lista têm mais texto para ler
const DISMISS_DISTANCE = 120 // quanto arrastar para baixo para fechar
const CARE_INK = '#8A5A00'   // laranja escuro: o laranja do story não dá leitura sobre o amarelo

export default function StoryScreen({ navigation, route }) {
  const { profile, currentUser } = useApp()
  const type = STORIES[route?.params?.type] ? route.params.type : 'day'
  const story = STORIES[type]
  const gestation = gestationToday(profile)
  // o cuidado mostrado é o do momento em que o story abriu, mesmo que o relógio vire
  const openedAt = useRef(new Date()).current
  const slot = careSlot(openedAt)
  const topic = dailyTopicOf(type, openedAt)
  const duration = topic ? TOPIC_MS : STORY_MS

  const { width, height } = useWindowDimensions()
  // em telas pequenas os textos e espaços encolhem para o conteúdo caber sem rolar
  const compact = height < 700 || width < 350
  const c = compact ? compactStyles : noStyles
  const translateY = useRef(new Animated.Value(height)).current
  const progress = useRef(new Animated.Value(0)).current
  const progressAt = useRef(0)
  const closing = useRef(false)

  // Como nos stories: sobe ao abrir, a barra do topo corre e, ao encher, ele fecha.
  function run() {
    Animated.timing(progress, {
      toValue: 1, duration: duration * (1 - progressAt.current), easing: Easing.linear, useNativeDriver: false,
    }).start(({ finished }) => { if (finished) navigation.goBack() })
  }
  function pause() {
    progress.stopAnimation(value => { progressAt.current = value })
  }

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start()
    run()
    return () => progress.stopAnimation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fechar (X, fim do tempo, arrastar ou botão voltar) sempre desce a tela antes de sair.
  useEffect(() => navigation.addListener('beforeRemove', e => {
    if (closing.current) return
    e.preventDefault()
    closing.current = true
    progress.stopAnimation()
    // ao fechar, o story conta como visto: a borda do card na Home some
    markStorySeen(currentUser?.email, type === 'care' ? `care:${slot}` : type)
    Animated.timing(translateY, {
      toValue: height, duration: 320, easing: Easing.in(Easing.cubic), useNativeDriver: true,
    }).start(() => navigation.dispatch(e.data.action))
  }), [navigation, translateY, progress, height, currentUser?.email, type, slot])

  // Segurar pausa o tempo; arrastar para baixo acompanha o dedo e fecha ao soltar.
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
    onPanResponderGrant: pause,
    onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy) },
    onPanResponderRelease: (_, g) => {
      if (g.dy > DISMISS_DISTANCE || g.vy > 1.2) { navigation.goBack(); return }
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start()
      run()
    },
    onPanResponderTerminate: () => {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start()
      run()
    },
  })).current

  // O fundo acompanha o arrasto: vai clareando conforme a tela desce.
  const backdrop = translateY.interpolate({ inputRange: [0, height], outputRange: [1, 0], extrapolate: 'clamp' })
  const ink = story.ink
  const soft = type === 'day' ? 'rgba(255,255,255,0.85)' : colors.blackSoft

  function configure() {
    navigation.goBack()
    navigation.navigate('PersonalData')
  }

  const setup = (
    <View style={styles.center}>
      <Text style={[styles.heading, { color: ink }]}>Conte sobre a sua gestação</Text>
      <Text style={[styles.body, { color: soft }]}>
        Informe a data prevista para o parto em Dados Pessoais para acompanhar cada dia.
      </Text>
      <TouchableOpacity style={styles.setupBtn} onPress={configure} accessibilityRole="button">
        <Text style={styles.setupBtnText}>Abrir Dados Pessoais</Text>
      </TouchableOpacity>
    </View>
  )

  let content
  if (topic) {
    content = (
      <View style={[styles.baby, c.baby]}>
        <Text style={[styles.babyEyebrow, c.babyEyebrow, { color: story.accent }]}>{story.eyebrow}</Text>
        <Text style={[styles.babyHeading, c.babyHeading]}>{story.heading}</Text>

        <View style={[styles.babyCard, c.babyCard, { backgroundColor: story.accent }]}>
          <View style={[styles.careIcon, c.careIcon]}>
            <Icon name={story.icon} color={story.accent} size={24} />
          </View>
          <View style={styles.babyCardInfo}>
            <Text style={[styles.babyWeeks, c.babyWeeks]}>{topic.title}</Text>
          </View>
        </View>

        <Text style={[styles.babyLabel, c.babyLabel]}>{story.label}</Text>
        {topic.items.map(item => (
          <View key={item} style={[styles.topicItem, c.topicItem]}>
            <View style={[styles.topicDot, c.topicDot, { backgroundColor: story.accent }]} />
            <Text style={[styles.topicText, c.topicText]}>{item}</Text>
          </View>
        ))}
        <View style={[styles.babyRule, c.babyRule, { backgroundColor: story.accent }]} />
        <Text style={[styles.babyNote, c.babyNote]}>{story.note}</Text>
      </View>
    )
  } else if (type === 'care') {
    const tip = careTipOf(openedAt)
    content = (
      <View style={[styles.baby, c.baby]}>
        <Text style={[styles.babyEyebrow, c.babyEyebrow, { color: CARE_INK }]}>CUIDADO DE AGORA</Text>
        <Text style={[styles.babyHeading, c.babyHeading]}>Um cuidado simples para o seu dia</Text>

        <View style={[styles.babyCard, c.babyCard, { backgroundColor: story.accent }]}>
          <View style={[styles.careIcon, c.careIcon]}>
            <Icon name={tip.icon} color={story.accent} size={24} />
          </View>
          <View style={styles.babyCardInfo}>
            <Text style={[styles.babyWeeks, c.babyWeeks]}>{tip.title}</Text>
          </View>
        </View>

        <Text style={[styles.babyLabel, c.babyLabel]}>Por que isso importa</Text>
        <Text style={[styles.babyText, c.babyText]}>{tip.text}</Text>
        <View style={[styles.babyRule, c.babyRule, { backgroundColor: story.accent }]} />
        <Text style={[styles.babyNote, c.babyNote]}>Em caso de dúvida, converse com o seu médico.</Text>
      </View>
    )
  } else if (!gestation) {
    content = setup
  } else if (type === 'baby') {
    content = (
      <View style={[styles.baby, c.baby]}>
        <Text style={[styles.babyEyebrow, c.babyEyebrow, { color: story.accent }]}>NESTA SEMANA</Text>
        <Text style={[styles.babyHeading, c.babyHeading]}>Veja como o seu bebê está se desenvolvendo</Text>

        <View style={[styles.babyCard, c.babyCard, { backgroundColor: story.accent }]}>
          <Text style={[styles.babyNumber, c.babyNumber]}>{gestation.weeks}</Text>
          <View style={styles.babyCardInfo}>
            <Text style={[styles.babyWeeks, c.babyWeeks]}>{gestation.weeks === 1 ? 'semana' : 'semanas'} de gestação</Text>
            <Text style={styles.babyMonth}>
              {gestationMonth(gestation.weeks)}º mês · {gestation.weeks < 14 ? 1 : gestation.weeks < 28 ? 2 : 3}º trimestre
            </Text>
          </View>
        </View>

        <Text style={[styles.babyLabel, c.babyLabel]}>O que está acontecendo na {gestation.weeks < 1 ? 1 : Math.min(42, gestation.weeks)}ª semana</Text>
        <Text style={[styles.babyText, c.babyText]}>{babyWeekText(gestation.weeks)}</Text>
        <View style={[styles.babyRule, c.babyRule, { backgroundColor: story.accent }]} />
        <Text style={[styles.babyNote, c.babyNote]}>Cada gestação tem o seu ritmo. O pré-natal acompanha o desenvolvimento do seu bebê.</Text>
      </View>
    )
  } else {
    content = (
      <View style={[styles.day, c.day]}>
        <Text style={[styles.dayTitle, c.dayTitle]}>Dia da{'\n'}gravidez</Text>
        <Text style={[styles.dayNumber, c.dayNumber]}>{gestation.days}</Text>
        <Text style={styles.dayInfo}>
          {gestation.exact ? '' : 'cerca de '}
          {plural(gestation.weeks, 'semana', 'semanas')}
          {gestation.extraDays > 0 ? ` e ${plural(gestation.extraDays, 'dia', 'dias')}` : ''}
          {gestation.daysLeft > 0 ? ` · faltam ${plural(gestation.daysLeft, 'dia', 'dias')}` : ''}
        </Text>
        {!gestation.exact && (
          <TouchableOpacity onPress={configure} accessibilityRole="button">
            <Text style={[styles.dayInfo, styles.noteLink]}>
              Informe a data prevista para o parto para ter a contagem exata.
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdrop }]} />
      <Animated.View style={[styles.sheet, { backgroundColor: story.color, transform: [{ translateY }] }]} {...pan.panHandlers}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.progressBg}>
            <Animated.View
              style={[styles.progressBar, { backgroundColor: ink, width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
            />
          </View>
          <View style={styles.top}>
            <Text style={[styles.title, { color: ink }]} accessibilityRole="header">{story.title}</Text>
            <TouchableOpacity
              style={styles.close}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Icon name="x" color={ink} size={24} />
            </TouchableOpacity>
          </View>
          {content}
        </SafeAreaView>
      </Animated.View>
    </View>
  )
}

const noStyles = {}
const compactStyles = StyleSheet.create({
  day:       { paddingBottom: 16 },
  dayTitle:  { fontSize: 32, lineHeight: 34 },
  dayNumber: { fontSize: 88, lineHeight: 92, marginTop: 6 },
  baby:        { paddingBottom: 12 },
  babyEyebrow: { fontSize: 11 },
  babyHeading: { fontSize: 21, lineHeight: 25, marginTop: 4 },
  babyCard:    { marginTop: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  babyNumber:  { fontSize: 46, lineHeight: 48, paddingTop: 6 },
  babyWeeks:   { fontSize: 15, lineHeight: 19 },
  babyLabel:   { fontSize: 14, marginTop: 16 },
  babyText:    { fontSize: 14, lineHeight: 20, marginTop: 4 },
  topicItem:   { marginTop: 6 },
  topicDot:    { marginTop: 7 },
  topicText:   { fontSize: 13.5, lineHeight: 18 },
  babyRule:    { marginTop: 12 },
  babyNote:    { fontSize: 12, lineHeight: 16, marginTop: 8 },
  careIcon:    { width: 40, height: 40, borderRadius: 20 },
})

const styles = StyleSheet.create({
  root:     { flex: 1 },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet:    { flex: 1 },
  safe:     { flex: 1, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: 20 },
  progressBg:  { height: 3, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.14)', marginTop: 10, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 2 },
  // título centralizado sob a barra de tempo; o X fica por cima, à direita
  top:   { height: 28, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  title: { fontSize: 16, fontFamily: fonts.bold, textAlign: 'center' },
  close: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 40 },
  day:       { flex: 1, justifyContent: 'center', paddingBottom: 40 },
  dayTitle:  { fontSize: 40, lineHeight: 42, fontFamily: fonts.bold, color: colors.ink },
  dayNumber: { fontSize: 112, lineHeight: 118, fontFamily: fonts.bold, color: colors.white, marginTop: 10 },
  dayInfo:   { fontSize: 15, lineHeight: 21, fontFamily: fonts.bold, color: colors.ink, marginTop: 6 },
  heading:     { fontSize: 24, lineHeight: 30, fontFamily: fonts.bold, textAlign: 'center' },
  // stories "Seu bebê" e "Cuidados": blocos alinhados à esquerda, nos tons de cada story
  baby:         { flex: 1, justifyContent: 'center', paddingBottom: 40 },
  babyEyebrow:  { fontSize: 12, fontFamily: fonts.bold, letterSpacing: 2 },
  babyHeading:  { fontSize: 26, lineHeight: 31, fontFamily: fonts.bold, color: colors.ink, marginTop: 6 },
  babyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14, marginTop: 22,
  },
  babyNumber:   { fontSize: 60, lineHeight: 62, fontFamily: fonts.bold, color: colors.white, paddingTop: 8 },
  babyCardInfo: { flex: 1, gap: 3 },
  babyWeeks:    { fontSize: 17, lineHeight: 21, fontFamily: fonts.bold, color: colors.white },
  babyMonth:    { fontSize: 13, lineHeight: 17, fontFamily: fonts.medium, color: 'rgba(255,255,255,0.88)' },
  babyLabel:    { fontSize: 15, fontFamily: fonts.bold, color: colors.ink, marginTop: 24 },
  babyText:     { fontSize: 16, lineHeight: 24, fontFamily: fonts.regular, color: colors.inkSoft, marginTop: 6 },
  topicItem:    { flexDirection: 'row', gap: 10, marginTop: 10 },
  topicDot:     { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  topicText:    { flex: 1, fontSize: 15, lineHeight: 21, fontFamily: fonts.regular, color: colors.inkSoft },
  babyRule:     { width: 32, height: 3, borderRadius: 2, marginTop: 20 },
  babyNote:     { fontSize: 13, lineHeight: 18, fontFamily: fonts.regular, color: colors.blackSoft, marginTop: 10 },
  body:        { fontSize: 16, lineHeight: 23, fontFamily: fonts.medium, textAlign: 'center', maxWidth: 320 },
  note:        { fontSize: 13, lineHeight: 18, fontFamily: fonts.regular, textAlign: 'center', maxWidth: 300, marginTop: 14 },
  noteLink:    { textDecorationLine: 'underline' },
  careIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  setupBtn:     { height: 42, paddingHorizontal: 22, borderRadius: 21, backgroundColor: colors.white, justifyContent: 'center', marginTop: 10 },
  setupBtnText: { fontSize: 14, fontFamily: fonts.bold, color: colors.primary },
})
