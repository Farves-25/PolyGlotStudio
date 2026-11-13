import { Injectable, signal } from '@angular/core';

export interface ComprehensiveVocabCard {
  id: string;
  langId: string;
  term: string;
  phonetic: string;
  pos: 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Phrase' | 'Number' | 'Pronoun';
  category: 'Numbers & Math' | 'Greetings & Courtesy' | 'Food & Dining' | 'Travel & Transport' | 'Time & Calendar' | 'Family & People' | 'Colors & Nature' | 'Essential Actions' | 'Health & Emergency' | 'City & Shopping';
  translation: string;
  exampleSentence: string;
  exampleTranslation: string;
  cefr: 'A1' | 'A2' | 'B1' | 'B2';
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string;
}

export const VOCABULARY_CATEGORIES = [
  'All',
  'Numbers & Math',
  'Greetings & Courtesy',
  'Food & Dining',
  'Travel & Transport',
  'Time & Calendar',
  'Family & People',
  'Colors & Nature',
  'Essential Actions',
  'Health & Emergency',
  'City & Shopping'
] as const;

@Injectable({ providedIn: 'root' })
export class VocabularyService {

  private readonly MASTER_VOCABULARY: Record<string, ComprehensiveVocabCard[]> = {
    // ────────────────────────── SPANISH ──────────────────────────
    es: [
      // Numbers & Math
      { id: 'es-num-1', langId: 'es', term: 'Uno', phonetic: '[ˈu.no]', pos: 'Number', category: 'Numbers & Math', translation: 'One (1)', exampleSentence: 'Quiero un café, por favor.', exampleTranslation: 'I want one coffee, please.', cefr: 'A1', easeFactor: 2.5, intervalDays: 14, repetitions: 4, dueDate: '2026-11-20' },
      { id: 'es-num-2', langId: 'es', term: 'Diez', phonetic: '[djeθ]', pos: 'Number', category: 'Numbers & Math', translation: 'Ten (10)', exampleSentence: 'Son las diez de la mañana.', exampleTranslation: 'It is ten in the morning.', cefr: 'A1', easeFactor: 2.6, intervalDays: 10, repetitions: 3, dueDate: '2026-11-18' },
      { id: 'es-num-3', langId: 'es', term: 'Cien', phonetic: '[sjen]', pos: 'Number', category: 'Numbers & Math', translation: 'One hundred (100)', exampleSentence: 'Cuesta cien euros.', exampleTranslation: 'It costs one hundred euros.', cefr: 'A1', easeFactor: 2.4, intervalDays: 7, repetitions: 2, dueDate: '2026-11-16' },

      // Greetings & Courtesy
      { id: 'es-grt-1', langId: 'es', term: 'Buenos días', phonetic: '[ˈbwe.nos ˈði.as]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Good morning', exampleSentence: 'Buenos días a todos.', exampleTranslation: 'Good morning to everyone.', cefr: 'A1', easeFactor: 2.7, intervalDays: 20, repetitions: 5, dueDate: '2026-11-25' },
      { id: 'es-grt-2', langId: 'es', term: 'Por favor', phonetic: '[poɾ faˈβoɾ]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Please', exampleSentence: 'La cuenta, por favor.', exampleTranslation: 'The bill, please.', cefr: 'A1', easeFactor: 2.8, intervalDays: 30, repetitions: 6, dueDate: '2026-11-30' },
      { id: 'es-grt-3', langId: 'es', term: 'Muchas gracias', phonetic: '[ˈmu.tʃas ˈɡɾa.sjas]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Thank you very much', exampleSentence: 'Muchas gracias por su hospitalidad.', exampleTranslation: 'Thank you very much for your hospitality.', cefr: 'A1', easeFactor: 2.8, intervalDays: 28, repetitions: 5, dueDate: '2026-11-28' },

      // Food & Dining
      { id: 'es-foo-1', langId: 'es', term: 'Agua', phonetic: '[ˈa.ɣwa]', pos: 'Noun', category: 'Food & Dining', translation: 'Water', exampleSentence: 'Un vaso de agua sin gas.', exampleTranslation: 'A glass of still water.', cefr: 'A1', easeFactor: 2.6, intervalDays: 14, repetitions: 3, dueDate: '2026-11-22' },
      { id: 'es-foo-2', langId: 'es', term: 'Pan', phonetic: '[pan]', pos: 'Noun', category: 'Food & Dining', translation: 'Bread', exampleSentence: 'Comemos pan tostado con tomate.', exampleTranslation: 'We eat toasted bread with tomato.', cefr: 'A1', easeFactor: 2.5, intervalDays: 12, repetitions: 3, dueDate: '2026-11-21' },
      { id: 'es-foo-3', langId: 'es', term: 'Desayuno', phonetic: '[de.saˈʝu.no]', pos: 'Noun', category: 'Food & Dining', translation: 'Breakfast', exampleSentence: 'El desayuno está incluido.', exampleTranslation: 'Breakfast is included.', cefr: 'A2', easeFactor: 2.4, intervalDays: 6, repetitions: 2, dueDate: '2026-11-15' },

      // Travel & Transport
      { id: 'es-trv-1', langId: 'es', term: 'Aeropuerto', phonetic: '[a.e.ɾoˈpweɾ.to]', pos: 'Noun', category: 'Travel & Transport', translation: 'Airport', exampleSentence: '¿Dónde está el autobús al aeropuerto?', exampleTranslation: 'Where is the bus to the airport?', cefr: 'A1', easeFactor: 2.5, intervalDays: 9, repetitions: 2, dueDate: '2026-11-17' },
      { id: 'es-trv-2', langId: 'es', term: 'Estación de tren', phonetic: '[es.taˈsjon de tɾen]', pos: 'Noun', category: 'Travel & Transport', translation: 'Train station', exampleSentence: 'Llegamos a la estación central.', exampleTranslation: 'We arrive at the central station.', cefr: 'A1', easeFactor: 2.4, intervalDays: 8, repetitions: 2, dueDate: '2026-11-16' },
      { id: 'es-trv-3', langId: 'es', term: 'Billete', phonetic: '[biˈʝe.te]', pos: 'Noun', category: 'Travel & Transport', translation: 'Ticket', exampleSentence: 'Dos billetes de ida y vuelta.', exampleTranslation: 'Two round-trip tickets.', cefr: 'A2', easeFactor: 2.3, intervalDays: 5, repetitions: 1, dueDate: '2026-11-14' },

      // Time & Calendar
      { id: 'es-tim-1', langId: 'es', term: 'Hoy', phonetic: '[oj]', pos: 'Adverb', category: 'Time & Calendar', translation: 'Today', exampleSentence: 'Hoy hace un día soleado.', exampleTranslation: 'Today is a sunny day.', cefr: 'A1', easeFactor: 2.7, intervalDays: 18, repetitions: 4, dueDate: '2026-11-24' },
      { id: 'es-tim-2', langId: 'es', term: 'Mañana', phonetic: '[maˈɲa.na]', pos: 'Noun', category: 'Time & Calendar', translation: 'Tomorrow / Morning', exampleSentence: 'Nos vemos mañana por la tarde.', exampleTranslation: 'See you tomorrow afternoon.', cefr: 'A1', easeFactor: 2.5, intervalDays: 10, repetitions: 3, dueDate: '2026-11-18' },

      // Family & People
      { id: 'es-fam-1', langId: 'es', term: 'Familia', phonetic: '[faˈmi.lja]', pos: 'Noun', category: 'Family & People', translation: 'Family', exampleSentence: 'Mi familia vive en Sevilla.', exampleTranslation: 'My family lives in Seville.', cefr: 'A1', easeFactor: 2.6, intervalDays: 15, repetitions: 3, dueDate: '2026-11-23' },
      { id: 'es-fam-2', langId: 'es', term: 'Amigo', phonetic: '[aˈmi.ɣo]', pos: 'Noun', category: 'Family & People', translation: 'Friend', exampleSentence: 'Carlos es mi mejor amigo.', exampleTranslation: 'Carlos is my best friend.', cefr: 'A1', easeFactor: 2.8, intervalDays: 25, repetitions: 5, dueDate: '2026-11-27' },

      // Essential Actions
      { id: 'es-act-1', langId: 'es', term: 'Hablar', phonetic: '[aˈβlaɾ]', pos: 'Verb', category: 'Essential Actions', translation: 'To speak', exampleSentence: 'Hablo español e inglés.', exampleTranslation: 'I speak Spanish and English.', cefr: 'A1', easeFactor: 2.6, intervalDays: 14, repetitions: 4, dueDate: '2026-11-21' },
      { id: 'es-act-2', langId: 'es', term: 'Comprender', phonetic: '[kom.pɾenˈdeɾ]', pos: 'Verb', category: 'Essential Actions', translation: 'To understand', exampleSentence: 'Comprendo la situación.', exampleTranslation: 'I understand the situation.', cefr: 'A2', easeFactor: 2.4, intervalDays: 6, repetitions: 2, dueDate: '2026-11-15' },

      // Health & Emergency
      { id: 'es-hea-1', langId: 'es', term: 'Farmacia', phonetic: '[faɾˈma.sja]', pos: 'Noun', category: 'Health & Emergency', translation: 'Pharmacy', exampleSentence: 'Hay una farmacia de guardia cerca.', exampleTranslation: 'There is an on-call pharmacy nearby.', cefr: 'A1', easeFactor: 2.5, intervalDays: 9, repetitions: 2, dueDate: '2026-11-17' },
      { id: 'es-hea-2', langId: 'es', term: 'Ayuda', phonetic: '[aˈʝu.ða]', pos: 'Noun', category: 'Health & Emergency', translation: 'Help', exampleSentence: '¡Necesito ayuda urgente!', exampleTranslation: 'I need urgent help!', cefr: 'A1', easeFactor: 2.7, intervalDays: 16, repetitions: 4, dueDate: '2026-11-23' }
    ],

    // ────────────────────────── GERMAN ──────────────────────────
    de: [
      // Numbers & Math
      { id: 'de-num-1', langId: 'de', term: 'Eins', phonetic: '[aɪ̯ns]', pos: 'Number', category: 'Numbers & Math', translation: 'One (1)', exampleSentence: 'Ein Kaffee bitte.', exampleTranslation: 'One coffee please.', cefr: 'A1', easeFactor: 2.5, intervalDays: 14, repetitions: 3, dueDate: '2026-11-20' },
      { id: 'de-num-2', langId: 'de', term: 'Zehn', phonetic: '[tseːn]', pos: 'Number', category: 'Numbers & Math', translation: 'Ten (10)', exampleSentence: 'Es ist zehn Uhr.', exampleTranslation: 'It is ten o\'clock.', cefr: 'A1', easeFactor: 2.5, intervalDays: 12, repetitions: 3, dueDate: '2026-11-18' },
      { id: 'de-num-3', langId: 'de', term: 'Hundert', phonetic: '[ˈhʊndɐt]', pos: 'Number', category: 'Numbers & Math', translation: 'One hundred (100)', exampleSentence: 'Das kostet hundert Euro.', exampleTranslation: 'That costs one hundred euros.', cefr: 'A1', easeFactor: 2.4, intervalDays: 8, repetitions: 2, dueDate: '2026-11-16' },

      // Greetings & Courtesy
      { id: 'de-grt-1', langId: 'de', term: 'Guten Tag', phonetic: '[ˌɡuːtn̩ ˈtaːk]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Good day / Hello', exampleSentence: 'Guten Tag, wie geht es Ihnen?', exampleTranslation: 'Good day, how are you?', cefr: 'A1', easeFactor: 2.7, intervalDays: 20, repetitions: 4, dueDate: '2026-11-25' },
      { id: 'de-grt-2', langId: 'de', term: 'Bitte schön', phonetic: '[ˈbɪtə ʃøːn]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'You are very welcome / Here you go', exampleSentence: 'Bitte schön, Ihr Kaffee.', exampleTranslation: 'Here you go, your coffee.', cefr: 'A1', easeFactor: 2.6, intervalDays: 15, repetitions: 3, dueDate: '2026-11-22' },
      { id: 'de-grt-3', langId: 'de', term: 'Vielen Dank', phonetic: '[ˈfiːlən daŋk]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Many thanks', exampleSentence: 'Vielen Dank für deine Hilfe.', exampleTranslation: 'Many thanks for your help.', cefr: 'A1', easeFactor: 2.8, intervalDays: 25, repetitions: 5, dueDate: '2026-11-27' },

      // Food & Dining
      { id: 'de-foo-1', langId: 'de', term: 'Wasser', phonetic: '[ˈvasɐ]', pos: 'Noun', category: 'Food & Dining', translation: 'Water', exampleSentence: 'Ein Glas stilles Wasser, bitte.', exampleTranslation: 'A glass of still water, please.', cefr: 'A1', easeFactor: 2.6, intervalDays: 14, repetitions: 3, dueDate: '2026-11-21' },
      { id: 'de-foo-2', langId: 'de', term: 'Frühstück', phonetic: '[ˈfʁyːˌʃtʏk]', pos: 'Noun', category: 'Food & Dining', translation: 'Breakfast', exampleSentence: 'Das Frühstück ist köstlich.', exampleTranslation: 'The breakfast is delicious.', cefr: 'A2', easeFactor: 2.4, intervalDays: 7, repetitions: 2, dueDate: '2026-11-16' },

      // Travel & Transport
      { id: 'de-trv-1', langId: 'de', term: 'Bahnhof', phonetic: '[ˈbaːnˌhoːf]', pos: 'Noun', category: 'Travel & Transport', translation: 'Train station', exampleSentence: 'Wo ist der Hauptbahnhof?', exampleTranslation: 'Where is the central train station?', cefr: 'A1', easeFactor: 2.5, intervalDays: 10, repetitions: 2, dueDate: '2026-11-17' },
      { id: 'de-trv-2', langId: 'de', term: 'Fahrkarte', phonetic: '[ˈfaːɐ̯ˌkaʁtə]', pos: 'Noun', category: 'Travel & Transport', translation: 'Ticket / Travel pass', exampleSentence: 'Eine Fahrkarte nach München.', exampleTranslation: 'A ticket to Munich.', cefr: 'A1', easeFactor: 2.3, intervalDays: 6, repetitions: 1, dueDate: '2026-11-14' },

      // Essential Actions
      { id: 'de-act-1', langId: 'de', term: 'Sprechen', phonetic: '[ˈʃpʁɛçn̩]', pos: 'Verb', category: 'Essential Actions', translation: 'To speak', exampleSentence: 'Ich spreche ein wenig Deutsch.', exampleTranslation: 'I speak a little German.', cefr: 'A1', easeFactor: 2.5, intervalDays: 12, repetitions: 3, dueDate: '2026-11-19' },
      { id: 'de-act-2', langId: 'de', term: 'Verstehen', phonetic: '[fɛɐ̯ˈʃteːən]', pos: 'Verb', category: 'Essential Actions', translation: 'To understand', exampleSentence: 'Ich verstehe die Frage nicht.', exampleTranslation: 'I do not understand the question.', cefr: 'A1', easeFactor: 2.4, intervalDays: 9, repetitions: 2, dueDate: '2026-11-17' }
    ],

    // ────────────────────────── FRENCH ──────────────────────────
    fr: [
      // Numbers & Math
      { id: 'fr-num-1', langId: 'fr', term: 'Un / Une', phonetic: '[œ̃ / yn]', pos: 'Number', category: 'Numbers & Math', translation: 'One (1)', exampleSentence: 'Une baguette, s\'il vous plaît.', exampleTranslation: 'One baguette, please.', cefr: 'A1', easeFactor: 2.7, intervalDays: 16, repetitions: 4, dueDate: '2026-11-22' },
      { id: 'fr-num-2', langId: 'fr', term: 'Dix', phonetic: '[dis]', pos: 'Number', category: 'Numbers & Math', translation: 'Ten (10)', exampleSentence: 'Le train part dans dix minutes.', exampleTranslation: 'The train leaves in ten minutes.', cefr: 'A1', easeFactor: 2.5, intervalDays: 11, repetitions: 3, dueDate: '2026-11-18' },

      // Greetings & Courtesy
      { id: 'fr-grt-1', langId: 'fr', term: 'Bonjour', phonetic: '[bɔ̃.ʒuʁ]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Hello / Good morning', exampleSentence: 'Bonjour madame, comment allez-vous ?', exampleTranslation: 'Hello madam, how are you?', cefr: 'A1', easeFactor: 2.8, intervalDays: 25, repetitions: 5, dueDate: '2026-11-26' },
      { id: 'fr-grt-2', langId: 'fr', term: 'Merci beaucoup', phonetic: '[mɛʁ.si bo.ku]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Thank you very much', exampleSentence: 'Merci beaucoup pour votre aide.', exampleTranslation: 'Thank you very much for your help.', cefr: 'A1', easeFactor: 2.8, intervalDays: 22, repetitions: 5, dueDate: '2026-11-25' },

      // Food & Dining
      { id: 'fr-foo-1', langId: 'fr', term: 'Eau', phonetic: '[o]', pos: 'Noun', category: 'Food & Dining', translation: 'Water', exampleSentence: 'Une carafe d\'eau, s\'il vous plaît.', exampleTranslation: 'A jug of tap water, please.', cefr: 'A1', easeFactor: 2.6, intervalDays: 14, repetitions: 3, dueDate: '2026-11-20' },
      { id: 'fr-foo-2', langId: 'fr', term: 'Addition', phonetic: '[a.di.sjɔ̃]', pos: 'Noun', category: 'Food & Dining', translation: 'The restaurant bill', exampleSentence: 'L\'addition, s\'il vous plaît.', exampleTranslation: 'The bill, please.', cefr: 'A1', easeFactor: 2.5, intervalDays: 10, repetitions: 3, dueDate: '2026-11-18' },

      // Travel & Transport
      { id: 'fr-trv-1', langId: 'fr', term: 'Gare', phonetic: '[ɡaʁ]', pos: 'Noun', category: 'Travel & Transport', translation: 'Train station', exampleSentence: 'La gare de Lyon est très grande.', exampleTranslation: 'The Lyon station is very big.', cefr: 'A1', easeFactor: 2.5, intervalDays: 12, repetitions: 3, dueDate: '2026-11-19' },
      { id: 'fr-trv-2', langId: 'fr', term: 'Billet', phonetic: '[bi.jɛ]', pos: 'Noun', category: 'Travel & Transport', translation: 'Ticket', exampleSentence: 'Voici mon billet de train.', exampleTranslation: 'Here is my train ticket.', cefr: 'A1', easeFactor: 2.4, intervalDays: 8, repetitions: 2, dueDate: '2026-11-16' },

      // Essential Actions
      { id: 'fr-act-1', langId: 'fr', term: 'Parler', phonetic: '[paʁ.le]', pos: 'Verb', category: 'Essential Actions', translation: 'To speak', exampleSentence: 'Parlez-vous anglais ?', exampleTranslation: 'Do you speak English?', cefr: 'A1', easeFactor: 2.6, intervalDays: 15, repetitions: 4, dueDate: '2026-11-21' }
    ],

    // ────────────────────────── JAPANESE ──────────────────────────
    ja: [
      // Numbers & Math
      { id: 'ja-num-1', langId: 'ja', term: '一 (Ichi)', phonetic: '[i.tʃi]', pos: 'Number', category: 'Numbers & Math', translation: 'One (1)', exampleSentence: '一つください (Hitotsu kudasai).', exampleTranslation: 'One piece please.', cefr: 'A1', easeFactor: 2.6, intervalDays: 15, repetitions: 4, dueDate: '2026-11-21' },
      { id: 'ja-num-2', langId: 'ja', term: '十 (Jū)', phonetic: '[dʒɯː]', pos: 'Number', category: 'Numbers & Math', translation: 'Ten (10)', exampleSentence: '十分かかります (Juppun kakarimasu).', exampleTranslation: 'It takes ten minutes.', cefr: 'A1', easeFactor: 2.5, intervalDays: 11, repetitions: 3, dueDate: '2026-11-18' },
      { id: 'ja-num-3', langId: 'ja', term: '百 (Hyaku)', phonetic: '[ça.kɯ]', pos: 'Number', category: 'Numbers & Math', translation: 'One hundred (100)', exampleSentence: '百円です (Hyaku-en desu).', exampleTranslation: 'It is one hundred yen.', cefr: 'A1', easeFactor: 2.4, intervalDays: 8, repetitions: 2, dueDate: '2026-11-16' },

      // Greetings & Courtesy
      { id: 'ja-grt-1', langId: 'ja', term: 'こんにちは (Konnichiwa)', phonetic: '[kon.ni.tʃi.wa]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Hello / Good day', exampleSentence: 'こんにちは、お元気ですか？', exampleTranslation: 'Hello, how are you?', cefr: 'A1', easeFactor: 2.8, intervalDays: 24, repetitions: 5, dueDate: '2026-11-26' },
      { id: 'ja-grt-2', langId: 'ja', term: 'ありがとうございます (Arigatō gozaimasu)', phonetic: '[a.ɾi.ɡa.toː ɡo.za.i.ma.sɯ]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Thank you very much (polite)', exampleSentence: '親切にありがとうございます。', exampleTranslation: 'Thank you very much for your kindness.', cefr: 'A1', easeFactor: 2.8, intervalDays: 28, repetitions: 6, dueDate: '2026-11-29' },
      { id: 'ja-grt-3', langId: 'ja', term: 'すみません (Sumimasen)', phonetic: '[sɯ.mi.ma.seɴ]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Excuse me / Sorry', exampleSentence: 'すみません、駅はどこですか？', exampleTranslation: 'Excuse me, where is the train station?', cefr: 'A1', easeFactor: 2.7, intervalDays: 18, repetitions: 4, dueDate: '2026-11-23' },

      // Food & Dining
      { id: 'ja-foo-1', langId: 'ja', term: '水 (Mizu)', phonetic: '[mi.zɯ]', pos: 'Noun', category: 'Food & Dining', translation: 'Water (cold)', exampleSentence: 'お水を一杯お願いします。', exampleTranslation: 'One glass of water, please.', cefr: 'A1', easeFactor: 2.6, intervalDays: 13, repetitions: 3, dueDate: '2026-11-20' },
      { id: 'ja-foo-2', langId: 'ja', term: 'お会計 (O-kaikei)', phonetic: '[o.ka.i.keː]', pos: 'Noun', category: 'Food & Dining', translation: 'The bill / check', exampleSentence: 'お会計をお願いします。', exampleTranslation: 'The bill, please.', cefr: 'A1', easeFactor: 2.4, intervalDays: 8, repetitions: 2, dueDate: '2026-11-16' },

      // Travel & Transport
      { id: 'ja-trv-1', langId: 'ja', term: '駅 (Eki)', phonetic: '[e.ki]', pos: 'Noun', category: 'Travel & Transport', translation: 'Train station', exampleSentence: '東京駅はとても広いです。', exampleTranslation: 'Tokyo Station is very spacious.', cefr: 'A1', easeFactor: 2.6, intervalDays: 14, repetitions: 3, dueDate: '2026-11-21' },
      { id: 'ja-trv-2', langId: 'ja', term: '切符 (Kippu)', phonetic: '[kʲi.pːɯ]', pos: 'Noun', category: 'Travel & Transport', translation: 'Ticket', exampleSentence: '切符売り場はあそこです。', exampleTranslation: 'The ticket counter is over there.', cefr: 'A1', easeFactor: 2.5, intervalDays: 9, repetitions: 2, dueDate: '2026-11-17' },

      // Essential Actions
      { id: 'ja-act-1', langId: 'ja', term: '話す (Hanasu)', phonetic: '[ha.na.sɯ]', pos: 'Verb', category: 'Essential Actions', translation: 'To speak', exampleSentence: '日本語を少し話します。', exampleTranslation: 'I speak a little Japanese.', cefr: 'A1', easeFactor: 2.5, intervalDays: 10, repetitions: 3, dueDate: '2026-11-18' },
      { id: 'ja-act-2', langId: 'ja', term: '食べる (Taberu)', phonetic: '[ta.be.ɾɯ]', pos: 'Verb', category: 'Essential Actions', translation: 'To eat', exampleSentence: '一緒にラーメンを食べましょう。', exampleTranslation: 'Let\'s eat ramen together.', cefr: 'A1', easeFactor: 2.6, intervalDays: 12, repetitions: 3, dueDate: '2026-11-19' }
    ],

    // ────────────────────────── ARABIC ──────────────────────────
    ar: [
      // Numbers & Math
      { id: 'ar-num-1', langId: 'ar', term: 'وَاحِد (Wahid)', phonetic: '[waː.ħid]', pos: 'Number', category: 'Numbers & Math', translation: 'One (1)', exampleSentence: 'شَاي وَاحِد، مِنْ فَضْلِك.', exampleTranslation: 'One tea, please.', cefr: 'A1', easeFactor: 2.6, intervalDays: 14, repetitions: 3, dueDate: '2026-11-20' },
      { id: 'ar-num-2', langId: 'ar', term: 'عَشَرَة (Ashara)', phonetic: '[ʕa.ʃa.ra]', pos: 'Number', category: 'Numbers & Math', translation: 'Ten (10)', exampleSentence: 'عَشَرَة دَرَاهِم.', exampleTranslation: 'Ten dirhams.', cefr: 'A1', easeFactor: 2.5, intervalDays: 10, repetitions: 2, dueDate: '2026-11-17' },

      // Greetings & Courtesy
      { id: 'ar-grt-1', langId: 'ar', term: 'مَرْحَبًا (Marhaban)', phonetic: '[mar.ħa.ban]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Hello / Welcome', exampleSentence: 'مَرْحَبًا بِكُمْ فِي مِصْر.', exampleTranslation: 'Welcome to Egypt.', cefr: 'A1', easeFactor: 2.8, intervalDays: 24, repetitions: 5, dueDate: '2026-11-26' },
      { id: 'ar-grt-2', langId: 'ar', term: 'شُكْرًا جَزِيلًا (Shukran Jazeelan)', phonetic: '[ʃuk.ran dʒa.ziː.lan]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Thank you very much', exampleSentence: 'شُكْرًا جَزِيلًا عَلَى مُسَاعَدَتِك.', exampleTranslation: 'Thank you very much for your help.', cefr: 'A1', easeFactor: 2.8, intervalDays: 25, repetitions: 5, dueDate: '2026-11-27' },
      { id: 'ar-grt-3', langId: 'ar', term: 'مِنْ فَضْلِك (Min Fadlik)', phonetic: '[min fadˤ.lik]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Please (to male/female)', exampleSentence: 'الفَاتُورَة، مِنْ فَضْلِك.', exampleTranslation: 'The bill, please.', cefr: 'A1', easeFactor: 2.7, intervalDays: 18, repetitions: 4, dueDate: '2026-11-22' },

      // Food & Dining
      { id: 'ar-foo-1', langId: 'ar', term: 'مَاء (Ma\')', phonetic: '[maːʔ]', pos: 'Noun', category: 'Food & Dining', translation: 'Water', exampleSentence: 'أُرِيدُ قِنِّينَة مَاء بَارِد.', exampleTranslation: 'I want a bottle of cold water.', cefr: 'A1', easeFactor: 2.6, intervalDays: 13, repetitions: 3, dueDate: '2026-11-19' },
      { id: 'ar-foo-2', langId: 'ar', term: 'خُبْز (Khubz)', phonetic: '[xubz]', pos: 'Noun', category: 'Food & Dining', translation: 'Bread', exampleSentence: 'خُبْز طَازَج لَذِيذ.', exampleTranslation: 'Delicious fresh bread.', cefr: 'A1', easeFactor: 2.5, intervalDays: 11, repetitions: 3, dueDate: '2026-11-18' },

      // Travel & Transport
      { id: 'ar-trv-1', langId: 'ar', term: 'مَطَار (Matar)', phonetic: '[ma.tˤaːr]', pos: 'Noun', category: 'Travel & Transport', translation: 'Airport', exampleSentence: 'كَيْفَ أَصِلُ إِلَى المَطَار؟', exampleTranslation: 'How do I get to the airport?', cefr: 'A1', easeFactor: 2.5, intervalDays: 12, repetitions: 3, dueDate: '2026-11-19' },
      { id: 'ar-trv-2', langId: 'ar', term: 'تَذْكِرَة (Tadhkira)', phonetic: '[tað.ki.ra]', pos: 'Noun', category: 'Travel & Transport', translation: 'Ticket', exampleSentence: 'حَجَزْتُ تَذْكِرَة قِطَار.', exampleTranslation: 'I booked a train ticket.', cefr: 'A1', easeFactor: 2.4, intervalDays: 8, repetitions: 2, dueDate: '2026-11-16' },

      // Essential Actions
      { id: 'ar-act-1', langId: 'ar', term: 'تَكَلَّمَ (Takallama)', phonetic: '[ta.kal.la.ma]', pos: 'Verb', category: 'Essential Actions', translation: 'To speak', exampleSentence: 'أَتَكَلَّمُ العَرَبِيَّة قَلِيلًا.', exampleTranslation: 'I speak a little Arabic.', cefr: 'A1', easeFactor: 2.5, intervalDays: 10, repetitions: 2, dueDate: '2026-11-17' }
    ],

    // ────────────────────────── TAMIL ──────────────────────────
    ta: [
      // Numbers & Math
      { id: 'ta-num-1', langId: 'ta', term: 'ஒன்று (Ondru)', phonetic: '[on.dru]', pos: 'Number', category: 'Numbers & Math', translation: 'One (1)', exampleSentence: 'ஒரு தேநீர் கொடுங்கள் (Oru theneer kodungal).', exampleTranslation: 'Give one tea, please.', cefr: 'A1', easeFactor: 2.6, intervalDays: 14, repetitions: 3, dueDate: '2026-11-20' },
      { id: 'ta-num-2', langId: 'ta', term: 'பத்து (Pathu)', phonetic: '[pat.t̪u]', pos: 'Number', category: 'Numbers & Math', translation: 'Ten (10)', exampleSentence: 'பத்து நிமிடங்கள் ஆகும் (Pathu nimidangal aagum).', exampleTranslation: 'It will take ten minutes.', cefr: 'A1', easeFactor: 2.5, intervalDays: 10, repetitions: 2, dueDate: '2026-11-17' },
      { id: 'ta-num-3', langId: 'ta', term: 'நூறு (Nooru)', phonetic: '[nuː.ru]', pos: 'Number', category: 'Numbers & Math', translation: 'One hundred (100)', exampleSentence: 'இது நூறு ரூபாய் (Idhu nooru roobai).', exampleTranslation: 'This is one hundred rupees.', cefr: 'A1', easeFactor: 2.4, intervalDays: 8, repetitions: 2, dueDate: '2026-11-16' },

      // Greetings & Courtesy
      { id: 'ta-grt-1', langId: 'ta', term: 'வணக்கம் (Vanakkam)', phonetic: '[ʋa.ɳak.kam]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Greetings / Hello', exampleSentence: 'அனைவருக்கும் வணக்கம் (Anaivarukkum vanakkam).', exampleTranslation: 'Greetings to everyone.', cefr: 'A1', easeFactor: 2.8, intervalDays: 25, repetitions: 5, dueDate: '2026-11-26' },
      { id: 'ta-grt-2', langId: 'ta', term: 'மிக்க நன்றி (Mikka Nandri)', phonetic: '[mik.ka nan.dri]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Thank you very much', exampleSentence: 'உங்கள் உதவிக்கு மிக்க நன்றி.', exampleTranslation: 'Thank you very much for your help.', cefr: 'A1', easeFactor: 2.8, intervalDays: 24, repetitions: 5, dueDate: '2026-11-25' },
      { id: 'ta-grt-3', langId: 'ta', term: 'தயவுசெய்து (Thayavuseithu)', phonetic: '[t̪a.ja.ʋu.sej.t̪u]', pos: 'Phrase', category: 'Greetings & Courtesy', translation: 'Please', exampleSentence: 'தயவுசெய்து உள்ளே வாருங்கள்.', exampleTranslation: 'Please come inside.', cefr: 'A1', easeFactor: 2.7, intervalDays: 18, repetitions: 4, dueDate: '2026-11-22' },

      // Food & Dining
      { id: 'ta-foo-1', langId: 'ta', term: 'தண்ணீர் (Thanneer)', phonetic: '[t̪aɳ.ɳiːr]', pos: 'Noun', category: 'Food & Dining', translation: 'Water', exampleSentence: 'குடிநீர் தண்ணீர் கொடுங்கள்.', exampleTranslation: 'Give drinking water, please.', cefr: 'A1', easeFactor: 2.6, intervalDays: 14, repetitions: 3, dueDate: '2026-11-20' },
      { id: 'ta-foo-2', langId: 'ta', term: 'உணவு (Unavu)', phonetic: '[u.ɳa.ʋu]', pos: 'Noun', category: 'Food & Dining', translation: 'Food / Meal', exampleSentence: 'இந்த உணவு மிகவும் சுவையாக இருக்கிறது.', exampleTranslation: 'This food is very delicious.', cefr: 'A1', easeFactor: 2.5, intervalDays: 11, repetitions: 3, dueDate: '2026-11-18' },
      { id: 'ta-foo-3', langId: 'ta', term: 'காலை உணவு (Kaalai unavu)', phonetic: '[kaː.laɪ u.ɳa.ʋu]', pos: 'Noun', category: 'Food & Dining', translation: 'Breakfast (Idli / Dosa)', exampleSentence: 'காலை உணவுக்கு இட்லி கிடைக்கும்.', exampleTranslation: 'Idli is available for breakfast.', cefr: 'A1', easeFactor: 2.4, intervalDays: 9, repetitions: 2, dueDate: '2026-11-17' },

      // Travel & Transport
      { id: 'ta-trv-1', langId: 'ta', term: 'ரயில் நிலையம் (Rayil nilaiyam)', phonetic: '[ra.jil ni.laɪ.jam]', pos: 'Noun', category: 'Travel & Transport', translation: 'Railway station', exampleSentence: 'ரயில் நிலையம் எங்கே உள்ளது?', exampleTranslation: 'Where is the railway station located?', cefr: 'A1', easeFactor: 2.5, intervalDays: 12, repetitions: 3, dueDate: '2026-11-19' },
      { id: 'ta-trv-2', langId: 'ta', term: 'பயணச்சீட்டு (Payanacheettu)', phonetic: '[pa.ja.ɳat.tʃiːt.tu]', pos: 'Noun', category: 'Travel & Transport', translation: 'Ticket', exampleSentence: 'சென்னைக்கு இரண்டு பயணச்சீட்டு கொடுங்கள்.', exampleTranslation: 'Give two tickets to Chennai.', cefr: 'A1', easeFactor: 2.3, intervalDays: 7, repetitions: 1, dueDate: '2026-11-15' },

      // Essential Actions
      { id: 'ta-act-1', langId: 'ta', term: 'பேசு (Pēsu)', phonetic: '[peː.su]', pos: 'Verb', category: 'Essential Actions', translation: 'To speak', exampleSentence: 'நான் தமிழ் பேசுகிறேன் (Naan Tamil pesugiren).', exampleTranslation: 'I speak Tamil.', cefr: 'A1', easeFactor: 2.6, intervalDays: 15, repetitions: 4, dueDate: '2026-11-21' },
      { id: 'ta-act-2', langId: 'ta', term: 'சாப்பிடு (Sāppiḍu)', phonetic: '[saːp.pi.ɖu]', pos: 'Verb', category: 'Essential Actions', translation: 'To eat', exampleSentence: 'நேரத்திற்கு சாப்பிடுங்கள்.', exampleTranslation: 'Eat on time.', cefr: 'A1', easeFactor: 2.5, intervalDays: 10, repetitions: 2, dueDate: '2026-11-18' }
    ]
  };

  getVocabularyForLanguage(langId: string): ComprehensiveVocabCard[] {
    return this.MASTER_VOCABULARY[langId] || this.MASTER_VOCABULARY['es'];
  }
}

