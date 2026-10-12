import { gestationOn, todayIso } from './gestation'

// Os conteúdos diários da Home. Cada um abre um story com a cor do seu card.
// Os três últimos são temas com um assunto por dia (os textos ficam em dailyTopics.js).
export const STORIES = {
  day:  { title: 'Dia da gravidez', color: '#B9A3CB', ink: '#FFFFFF' },
  baby: { title: 'Seu bebê',        color: '#CFE0DA', ink: '#1D1D1D', accent: '#5E8F82', icon: 'prenatal' },
  care: { title: 'Cuidados',        color: '#FFE169', ink: '#1D1D1D', accent: '#F59A0C', icon: 'plus' },
  layette: {
    title: 'Enxoval', color: '#CFE3F5', ink: '#1D1D1D', accent: '#4F86B8', icon: 'baby',
    eyebrow: 'IDEIAS DE ENXOVAL', heading: 'O que vale a pena preparar', label: 'Para se organizar',
    note: 'Não precisa comprar tudo de uma vez: comece pelo essencial.',
  },
  benefits: {
    title: 'Benefícios', color: '#FBD3E2', ink: '#1D1D1D', accent: '#DA1D6B', icon: 'shield',
    eyebrow: 'SEUS DIREITOS', heading: 'Benefícios e direitos da gestante', label: 'O que você precisa saber',
    note: 'As regras podem mudar: confirme nos canais oficiais antes de fazer o pedido.',
  },
  stretch: {
    title: 'Alongamento', color: '#FFD3C7', ink: '#1D1D1D', accent: '#D9603F', icon: 'heart',
    eyebrow: 'ALONGAMENTO DO DIA', heading: 'Um movimento simples para hoje', label: 'Como fazer',
    note: 'Faça sem pressa e pare se sentir dor ou tontura. Confirme com o seu médico se você está liberada para exercícios.',
  },
}

// Ordem dos cards na Home.
export const STORY_ORDER = ['day', 'baby', 'care', 'layette', 'benefits', 'stretch']

// Cuidados que se revezam ao longo do dia, um a cada 30 minutos.
// Orientações gerais; nenhuma substitui a conversa com o médico.
export const CARE_TIPS = [
  { icon: 'steth', title: 'Não falte ao pré-natal', text: 'As consultas acompanham a sua saúde e o crescimento do bebê. Leve suas dúvidas anotadas para não esquecer nenhuma.' },
  { icon: 'heart', title: 'Beba água ao longo do dia', text: 'Manter-se hidratada ajuda na circulação e pode aliviar o inchaço e a prisão de ventre. Deixe uma garrafinha sempre por perto.' },
  { icon: 'pill',  title: 'Vitaminas, só as indicadas', text: 'Tome os suplementos que o seu médico receitou, nos horários combinados, e não comece nenhum remédio por conta própria.' },
  { icon: 'clock', title: 'Descanse sem culpa', text: 'O cansaço é comum na gestação. Sempre que der, faça pausas durante o dia e tente dormir mais cedo.' },
  { icon: 'heart', title: 'Movimente o corpo', text: 'Caminhadas leves e alongamentos costumam fazer bem. Antes de começar ou manter uma atividade, combine com o seu médico.' },
  { icon: 'shield', title: 'Álcool e cigarro, fora', text: 'Não existe quantidade segura de álcool na gravidez, e o cigarro também faz mal ao bebê. Se precisar de ajuda para parar, fale com a equipe de saúde.' },
  { icon: 'exam',  title: 'Exames em dia', text: 'Os exames pedidos no pré-natal ajudam a encontrar e cuidar cedo de qualquer alteração. Guarde os resultados e leve às consultas.' },
  { icon: 'heart', title: 'Prato colorido', text: 'Frutas, verduras, legumes e proteínas variadas ajudam você e o bebê. Lave bem os alimentos crus e evite carnes e ovos mal cozidos.' },
  { icon: 'shield', title: 'Vacinas da gestante', text: 'Algumas vacinas são recomendadas durante a gravidez. Pergunte na consulta quais são as suas e quando tomar.' },
  { icon: 'bell',  title: 'Fique atenta aos sinais', text: 'Sangramento, dor forte, febre, perda de líquido ou o bebê mexendo bem menos que o normal pedem contato imediato com o serviço de saúde.' },
  { icon: 'heart', title: 'Cuide da cabeça também', text: 'Oscilações de humor acontecem. Converse com quem você confia e conte ao seu médico se a tristeza ou a ansiedade não passarem.' },
  { icon: 'clock', title: 'Durma de lado', text: 'Na segunda metade da gestação, deitar de lado costuma ser mais confortável. Um travesseiro entre os joelhos ajuda.' },
  { icon: 'shield', title: 'Proteja a pele do sol', text: 'Na gravidez a pele mancha com mais facilidade. Use protetor solar todos os dias e prefira chapéu e sombra nos horários de sol forte.' },
  { icon: 'check', title: 'Sorriso em dia', text: 'As gengivas ficam mais sensíveis e podem sangrar. Mantenha a escovação e o fio dental e avise o dentista de que você está grávida.' },
  { icon: 'shield', title: 'Cinto de segurança sempre', text: 'Use o cinto em todo trajeto: a faixa de baixo passa sob a barriga, apoiada no quadril, e a diagonal entre os seios, ao lado da barriga.' },
  { icon: 'clock', title: 'Café com moderação', text: 'Café, chá preto, mate e refrigerantes de cola têm cafeína. Pergunte ao seu médico qual é o limite seguro para você.' },
  { icon: 'pill',  title: 'Chás e naturais também contam', text: 'Nem todo chá, erva ou produto natural é seguro na gestação. Antes de usar, confirme com a equipe de saúde.' },
  { icon: 'check', title: 'Higiene na cozinha', text: 'Lave as mãos antes de preparar a comida, higienize frutas e verduras e evite leite e queijos não pasteurizados.' },
  { icon: 'heart', title: 'Roupas e sapatos confortáveis', text: 'Prefira roupas que não apertem a barriga e sapatos firmes, de salto baixo. O equilíbrio muda com o crescimento da barriga.' },
  { icon: 'clock', title: 'Pernas para cima', text: 'Se os pés e os tornozelos incharem, descanse com as pernas elevadas e evite ficar muito tempo em pé. Inchaço repentino no rosto ou nas mãos pede contato com o médico.' },
  { icon: 'heart', title: 'Pouco e várias vezes', text: 'Refeições menores ao longo do dia costumam aliviar o enjoo e a azia. Coma devagar e evite deitar logo depois de comer.' },
  { icon: 'bell',  title: 'Sinta o bebê mexer', text: 'No fim da gestação, observe o padrão de movimentos do seu bebê. Se ele estiver mexendo bem menos que o habitual, procure o serviço de saúde no mesmo dia.' },
  { icon: 'user',  title: 'Monte a sua rede de apoio', text: 'Combine desde já quem pode ajudar nas consultas, no parto e nos primeiros dias com o bebê. Pedir ajuda também é cuidar de você.' },
  { icon: 'file',  title: 'Cartão da gestante na bolsa', text: 'Leve o cartão da gestante e os exames mais recentes sempre que sair. Em uma emergência, eles contam a sua história para quem atender.' },
  { icon: 'steth', title: 'Converse sobre o parto', text: 'Leve para as consultas as suas dúvidas e preferências sobre o parto. Saber o que esperar ajuda a chegar mais tranquila ao grande dia.' },
  { icon: 'heart', title: 'Fortaleça o assoalho pélvico', text: 'Exercícios para a musculatura que sustenta a bexiga e o útero podem ajudar na gestação e no pós-parto. Peça orientação de como fazer.' },
  { icon: 'clock', title: 'Mude de posição', text: 'Evite passar horas sentada ou em pé sem se mexer. Em viagens e no trabalho, levante-se e caminhe um pouco de tempos em tempos.' },
]

export const CARE_SLOT_MS = 30 * 60 * 1000

// Número do intervalo de 30 minutos em que um instante cai. Vira às horas cheias e
// às meias horas, e serve também para saber se o cuidado atual já foi visto.
export function careSlot(date = new Date()) {
  return Math.floor(date.getTime() / CARE_SLOT_MS)
}

// O cuidado troca a cada 30 minutos, todos os dias, seguindo a ordem da lista.
export function careTipOf(date = new Date()) {
  return CARE_TIPS[careSlot(date) % CARE_TIPS.length]
}

// Como o bebê costuma estar em cada semana de gestação (contada a partir da última
// menstruação, como no pré-natal). Textos gerais, sem medidas exatas: cada gestação
// tem o seu ritmo, e quem acompanha o desenvolvimento é a equipe de saúde.
const BABY_WEEKS = [
  /*  1 */ 'Pela contagem usada no pré-natal, a gestação começa no primeiro dia da última menstruação. Nesta semana ainda não há bebê: o corpo está se preparando para a ovulação.',
  /*  2 */ 'O óvulo amadurece e a ovulação se aproxima. A fecundação costuma acontecer por volta do fim desta semana.',
  /*  3 */ 'O óvulo foi fecundado e já começou a se dividir em várias células enquanto segue em direção ao útero.',
  /*  4 */ 'O embrião se fixa na parede do útero. Começam a se formar a placenta e a bolsa que vai protegê-lo. É por volta de agora que o teste de gravidez dá positivo.',
  /*  5 */ 'O tubo neural, que dará origem ao cérebro e à medula, está se formando, e o coração começa a se desenvolver.',
  /*  6 */ 'O coração já bate. Surgem os pequenos brotos que vão se transformar em braços e pernas.',
  /*  7 */ 'O cérebro cresce rapidamente e o rosto começa a ganhar forma, com os primeiros traços dos olhos e das narinas.',
  /*  8 */ 'Braços e pernas se alongam e os dedos começam a se formar. O embrião já faz pequenos movimentos, ainda impossíveis de sentir.',
  /*  9 */ 'Os órgãos principais continuam se formando. As pálpebras já cobrem os olhos e os cotovelos começam a dobrar.',
  /* 10 */ 'Termina a fase de embrião: os órgãos essenciais estão formados e agora vão amadurecer. A partir daqui o bebê passa a ser chamado de feto.',
  /* 11 */ 'A cabeça ainda é grande em relação ao corpo. Os dedos das mãos e dos pés já estão separados e as unhas começam a surgir.',
  /* 12 */ 'O bebê abre e fecha as mãos e faz movimentos de sucção. Os rins começam a funcionar e a produzir urina.',
  /* 13 */ 'Chega ao fim o primeiro trimestre. As impressões digitais começam a se formar nas pontas dos dedos.',
  /* 14 */ 'O pescoço se alonga e o rosto já faz pequenas expressões. Uma penugem bem fina, a lanugem, começa a cobrir o corpo.',
  /* 15 */ 'Os ossos continuam endurecendo. O bebê se mexe bastante, embora você provavelmente ainda não sinta.',
  /* 16 */ 'Os olhos fazem movimentos lentos e as orelhas chegam à posição definitiva. Em algumas gestações já dá para sentir os primeiros movimentos.',
  /* 17 */ 'O bebê começa a acumular gordura sob a pele, e o esqueleto, antes de cartilagem, vai se transformando em osso.',
  /* 18 */ 'A audição está se desenvolvendo e o bebê pode começar a perceber sons. Muitas mães sentem os movimentos pela primeira vez por volta de agora.',
  /* 19 */ 'Uma camada esbranquiçada e protetora, o vérnix, começa a cobrir a pele do bebê.',
  /* 20 */ 'Metade do caminho. O bebê engole líquido amniótico e alterna momentos de sono e de atividade. O ultrassom morfológico costuma ser pedido por volta desta fase.',
  /* 21 */ 'Os movimentos ficam mais fortes e coordenados, e as sobrancelhas já aparecem.',
  /* 22 */ 'O bebê percebe melhor os sons e o tato se desenvolve. Os lábios e as pálpebras estão mais definidos.',
  /* 23 */ 'A pele ainda é fina e enrugada. Os pulmões seguem se preparando para respirar depois do nascimento.',
  /* 24 */ 'O bebê reage a sons mais altos e à sua voz. Os pulmões começam a produzir a substância que vai ajudá-los a se abrir na respiração.',
  /* 25 */ 'O bebê ganha peso e a pele vai ficando menos enrugada. As mãos estão mais ágeis e exploram o que encontram.',
  /* 26 */ 'Os olhos começam a se abrir. O bebê responde a estímulos de luz e de som.',
  /* 27 */ 'Chega ao fim o segundo trimestre. O bebê dorme e acorda em intervalos mais regulares e pode ter soluços, que você sente como pequenos pulinhos ritmados.',
  /* 28 */ 'Começa o terceiro trimestre. O bebê abre e fecha os olhos, e o cérebro passa por um desenvolvimento intenso.',
  /* 29 */ 'Músculos e pulmões seguem amadurecendo. Os chutes ficam mais fortes e o espaço no útero começa a diminuir.',
  /* 30 */ 'O bebê ganha gordura e a lanugem começa a desaparecer. A medula dos ossos assume a produção das células do sangue.',
  /* 31 */ 'O bebê já vira a cabeça de um lado para o outro e o cérebro processa cada vez mais informações dos sentidos.',
  /* 32 */ 'As unhas dos pés estão formadas e o bebê treina os movimentos da respiração. Muitos já estão de cabeça para baixo.',
  /* 33 */ 'Os ossos endurecem, mas os do crânio continuam maleáveis para facilitar o nascimento. As pupilas já reagem à luz.',
  /* 34 */ 'O sistema nervoso e os pulmões continuam amadurecendo, e a camada de vérnix fica mais espessa.',
  /* 35 */ 'O bebê ganha peso rapidamente. Com menos espaço, os movimentos mudam de jeito, mas você deve continuar sentindo-os todos os dias.',
  /* 36 */ 'O bebê costuma descer e se encaixar na pelve. A maior parte da lanugem já caiu.',
  /* 37 */ 'A gestação entra na reta final. O bebê continua ganhando peso e terminando de amadurecer os pulmões e o cérebro.',
  /* 38 */ 'Os órgãos estão prontos para funcionar fora do útero, e o bebê já segura com firmeza o que toca a palma da mão.',
  /* 39 */ 'A gestação está completa. O bebê tem gordura suficiente para ajudar a manter a temperatura do corpo depois de nascer.',
  /* 40 */ 'Chegou a semana da data prevista. Poucos bebês nascem exatamente no dia marcado: pode ser alguns dias antes ou depois.',
  /* 41 */ 'A data prevista passou, e isso é comum. A equipe de saúde acompanha de perto o bebê e a placenta.',
  /* 42 */ 'O acompanhamento fica mais frequente, e a equipe de saúde costuma conversar com você sobre os próximos passos para o parto.',
]

// Texto da semana informada; antes da 1ª usa o da 1ª, depois da 42ª usa o da 42ª.
export function babyWeekText(weeks) {
  const index = Math.min(BABY_WEEKS.length, Math.max(1, Math.floor(weeks) || 1)) - 1
  return BABY_WEEKS[index]
}

// 37 semanas -> 9 (nono mês)
export function gestationMonth(weeks) {
  return Math.min(9, Math.floor(weeks / 4.4) + 1)
}

// Situação da gestação hoje. Com a data prevista do parto a conta é exata e muda a
// cada dia; só com as semanas informadas, os dias são uma estimativa (exact: false).
export function gestationToday(profile) {
  const g = gestationOn(profile.due, todayIso())
  if (g) return { ...g, exact: true }
  const weeks = parseInt(profile.weeks, 10)
  if (!weeks) return null
  return { weeks, extraDays: 0, days: weeks * 7, daysLeft: null, exact: false }
}
