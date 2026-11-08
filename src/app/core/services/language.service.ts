import { Injectable, inject, signal } from '@angular/core';
import { Language, Lesson } from '../models/language.model';
import { Exercise } from '../models/exercise.model';
import { SupabaseService } from './supabase.service';

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    id: 'es',
    name: 'Spanish',
    native_name: 'Español',
    flag_emoji: '🇪🇸',
    script_direction: 'ltr',
    locale_code: 'es-ES',
    accent_color: '#f59e0b',
    badge_gradient: 'from-amber-500 to-red-500',
    tagline: 'Vibrant Romance Language with rhythmic phonetics',
    difficulty: 'Beginner-Friendly'
  },
  {
    id: 'de',
    name: 'German',
    native_name: 'Deutsch',
    flag_emoji: '🇩🇪',
    script_direction: 'ltr',
    locale_code: 'de-DE',
    accent_color: '#3b82f6',
    badge_gradient: 'from-blue-500 to-indigo-600',
    tagline: 'Precision syntax and rich compound morphology',
    difficulty: 'Moderate'
  },
  {
    id: 'ja',
    name: 'Japanese',
    native_name: '日本語',
    flag_emoji: '🇯🇵',
    script_direction: 'ltr',
    locale_code: 'ja-JP',
    accent_color: '#ec4899',
    badge_gradient: 'from-pink-500 to-rose-600',
    tagline: 'Honorific nuances with SOV particle markers',
    difficulty: 'Challenging'
  },
  {
    id: 'ar',
    name: 'Arabic',
    native_name: 'العربية',
    flag_emoji: '🇸🇦',
    script_direction: 'rtl',
    locale_code: 'ar-SA',
    accent_color: '#10b981',
    badge_gradient: 'from-emerald-500 to-teal-600',
    tagline: 'Rich Semitic triconsonantal root system with RTL script',
    difficulty: 'Expert'
  },
  {
    id: 'fr',
    name: 'French',
    native_name: 'Français',
    flag_emoji: '🇫🇷',
    script_direction: 'ltr',
    locale_code: 'fr-FR',
    accent_color: '#8b5cf6',
    badge_gradient: 'from-purple-500 to-indigo-500',
    tagline: 'Harmonious nasal vowels and sophisticated liaisons',
    difficulty: 'Moderate'
  },
  {
    id: 'ta',
    name: 'Tamil',
    native_name: 'தமிழ்',
    flag_emoji: '🇮🇳',
    script_direction: 'ltr',
    locale_code: 'ta-IN',
    accent_color: '#f97316',
    badge_gradient: 'from-orange-500 to-amber-600',
    tagline: 'Classical Dravidian tongue with rich agglutinative grammar',
    difficulty: 'Challenging'
  }
];

export const PRESEEDED_LESSONS: Lesson[] = [
  // Spanish
  {
    id: 'les-es-1',
    language_id: 'es',
    title: 'Essential Greetings & Introductions',
    cefr_level: 'A1',
    topic: 'Conversational Openers & Politeness',
    order_index: 1,
    description: 'Master authentic Castilian accents, gender agreement, and everyday greetings.',
    exercise_count: 4,
    estimated_minutes: 8
  },
  {
    id: 'les-es-2',
    language_id: 'es',
    title: 'Cafe Culture & Culinary Tapas',
    cefr_level: 'A2',
    topic: 'Ordering Food & Social Etiquette',
    order_index: 2,
    description: 'Learn indirect object pronouns and dynamic dialogue at a tapas bar in Madrid.',
    exercise_count: 4,
    estimated_minutes: 10
  },
  // German
  {
    id: 'les-de-1',
    language_id: 'de',
    title: 'First Encounters & Word Order',
    cefr_level: 'A1',
    topic: 'V2 Syntax & Polite Greetings',
    order_index: 1,
    description: 'Grasp the famous Verb-Second (V2) rule and guttural / ch pronunciations.',
    exercise_count: 4,
    estimated_minutes: 9
  },
  // Japanese
  {
    id: 'les-ja-1',
    language_id: 'ja',
    title: 'Particle Mechanics & Polite Speech',
    cefr_level: 'A1',
    topic: 'Wa / Ga / O Particles & Desu/Masu',
    order_index: 1,
    description: 'Deconstruct Japanese sentence particles and cultivate natural pitch accent.',
    exercise_count: 4,
    estimated_minutes: 12
  },
  // Arabic (RTL)
  {
    id: 'les-ar-1',
    language_id: 'ar',
    title: 'Sun & Moon Letters & Greetings',
    cefr_level: 'A1',
    topic: 'Phonetic Articulation & RTL Flow',
    order_index: 1,
    description: 'Navigate emphatic consonants (ح, ص, ط) and natural Right-to-Left sentence flow.',
    exercise_count: 4,
    estimated_minutes: 12
  },
  // French
  {
    id: 'les-fr-1',
    language_id: 'fr',
    title: 'Nasal Vowels & Parisian Courtesy',
    cefr_level: 'A1',
    topic: 'Pronunciation & Subjunctive Nuances',
    order_index: 1,
    description: 'Unlock seamless liaison phonetics and polite bakery ordering conventions.',
    exercise_count: 4,
    estimated_minutes: 8
  },
  // Tamil
  {
    id: 'les-ta-1',
    language_id: 'ta',
    title: 'Vanakkam: Formal & Respectful Speech',
    cefr_level: 'A1',
    topic: 'Agglutinative Suffixes & Everyday Hospitality',
    order_index: 1,
    description: 'Explore retroflex consonants (ழ, ள, ற) and conversational Tamil hospitality.',
    exercise_count: 4,
    estimated_minutes: 10
  }
];

export const PRESEEDED_EXERCISES: Exercise[] = [
  // SPANISH EXERCISES
  {
    id: 'ex-es-1',
    lesson_id: 'les-es-1',
    type: 'pronunciation',
    prompt: 'Listen to the native phrase and speak into your microphone to verify phoneme precision.',
    target_text: 'Buenos días, ¿cómo estás hoy?',
    phonetic_guide: '[ˈbwe.nos ˈði.as ˈko.mo esˈtas oi̯]',
    order_index: 1,
    translation: 'Good morning, how are you today?',
    cultural_context: 'Common morning greeting in Madrid and throughout the Hispanic world.'
  },
  {
    id: 'ex-es-2',
    lesson_id: 'les-es-1',
    type: 'syntax_dissector',
    prompt: 'Tap tokens to dissect parts of speech, gender agreements, and syntactic roles.',
    target_text: 'El gato duerme plácidamente bajo la mesa roja.',
    phonetic_guide: '[el ˈɡa.to ˈdweɾ.me pla.si.ðaˈmen.te ˈba.xo la ˈme.sa ˈro.xa]',
    order_index: 2,
    translation: 'The cat sleeps peacefully under the red table.',
    syntax_tokens: [
      { token: 'El', pos: 'article', meaning: 'The (masculine singular definite article)', root_form: 'el' },
      { token: 'gato', pos: 'noun', meaning: 'Cat (masculine singular noun)', root_form: 'gato' },
      { token: 'duerme', pos: 'verb', meaning: 'Sleeps (dormir, present 3rd person singular)', root_form: 'dormir' },
      { token: 'plácidamente', pos: 'adverb', meaning: 'Peacefully / calmly', root_form: 'plácido' },
      { token: 'bajo', pos: 'preposition', meaning: 'Under / beneath', root_form: 'bajo' },
      { token: 'la', pos: 'article', meaning: 'The (feminine singular definite article)', root_form: 'la' },
      { token: 'mesa', pos: 'noun', meaning: 'Table (feminine singular noun)', root_form: 'mesa' },
      { token: 'roja', pos: 'adjective', meaning: 'Red (feminine singular adjective agreeing with mesa)', root_form: 'rojo' }
    ]
  },
  {
    id: 'ex-es-3',
    lesson_id: 'les-es-1',
    type: 'srs_card',
    prompt: 'SuperMemo Flashcard: Recall the phrase and test yourself against the spaced repetition engine.',
    target_text: 'Mucho gusto en conocerte.',
    phonetic_guide: '[ˈmu.tʃo ˈɣus.to en ko.noˈseɾ.te]',
    order_index: 3,
    translation: 'Pleased to meet you / It is a pleasure to meet you.',
    cultural_context: 'Universal polite phrase used when introduced to someone new.'
  },
  {
    id: 'ex-es-4',
    lesson_id: 'les-es-1',
    type: 'dialogue',
    prompt: 'Interactive Contextual Roleplay: Ordering breakfast at a traditional café.',
    target_text: 'Café con leche y una tostada con tomate, por favor.',
    order_index: 4,
    translation: 'A coffee with milk and toast with tomato, please.',
    dialogue_scenario: {
      title: 'Tavern Breakfast in Plaza Mayor',
      role: 'Visiting traveler',
      ai_role: 'Camarero (Waiter)',
      setting: 'A sunny terrace bar in central Madrid',
      initial_ai_message: '¡Hola! Buenos días. ¿Qué le pongo para desayunar hoy?',
      initial_ai_translation: 'Hello! Good morning. What can I get you for breakfast today?',
      suggested_responses: [
        { text: 'Un café con leche y una tostada con tomate, por favor.', translation: 'A coffee with milk and toast with tomato, please.' },
        { text: '¿Tienen zumo de naranja recién exprimido?', translation: 'Do you have freshly squeezed orange juice?' },
        { text: 'Solo un espresso corto y un cruasán, gracias.', translation: 'Just a short espresso and a croissant, thank you.' }
      ]
    }
  },

  // GERMAN EXERCISES
  {
    id: 'ex-de-1',
    lesson_id: 'les-de-1',
    type: 'pronunciation',
    prompt: 'Listen to native German pronunciation and enunciate clearly into the mic.',
    target_text: 'Guten Tag, wie geht es Ihnen heute?',
    phonetic_guide: '[ˈɡuːtn̩ taːk viː ɡeːt ɛs ˈiːnən ˈhɔɪ̯tə]',
    order_index: 1,
    translation: 'Good day, how are you doing today? (Formal)',
    cultural_context: 'Polite greeting in business and professional interactions in Berlin and Munich.'
  },
  {
    id: 'ex-de-2',
    lesson_id: 'les-de-1',
    type: 'syntax_dissector',
    prompt: 'Inspect German case markers (Nominative, Accusative) and V2 verb placement.',
    target_text: 'Der neugierige Hund rennt schnell durch den Wald.',
    phonetic_guide: '[deːɐ̯ ˈnɔɪ̯ˌɡiːʁɪɡə hʊnt ʁɛnt ʃnɛl dʊʁç deːn valt]',
    order_index: 2,
    translation: 'The curious dog runs quickly through the forest.',
    syntax_tokens: [
      { token: 'Der', pos: 'article', meaning: 'The (Masculine Nominative definite article)', root_form: 'der' },
      { token: 'neugierige', pos: 'adjective', meaning: 'Curious (weak declension agreeing with masculine nominative)', root_form: 'neugierig' },
      { token: 'Hund', pos: 'noun', meaning: 'Dog (Masculine subject noun)', root_form: 'Hund' },
      { token: 'rennt', pos: 'verb', meaning: 'Runs (rennen, 3rd person singular present in V2 slot)', root_form: 'rennen' },
      { token: 'schnell', pos: 'adverb', meaning: 'Quickly / rapidly', root_form: 'schnell' },
      { token: 'durch', pos: 'preposition', meaning: 'Through (always triggers Accusative case)', root_form: 'durch' },
      { token: 'den', pos: 'article', meaning: 'The (Masculine Accusative definite article)', root_form: 'der' },
      { token: 'Wald', pos: 'noun', meaning: 'Forest (Masculine accusative noun)', root_form: 'Wald' }
    ]
  },
  {
    id: 'ex-de-3',
    lesson_id: 'les-de-1',
    type: 'srs_card',
    prompt: 'Recall the German idiom for wishing someone good luck / crossing fingers.',
    target_text: 'Ich drücke dir die Daumen!',
    phonetic_guide: '[ɪç ˈdʁʏkə diːɐ̯ diː ˈdaʊ̯mən]',
    order_index: 3,
    translation: 'I am keeping my fingers crossed for you! (Literally: I press the thumbs for you)',
    cultural_context: 'Common German encouraging expression before an exam or interview.'
  },
  {
    id: 'ex-de-4',
    lesson_id: 'les-de-1',
    type: 'dialogue',
    prompt: 'AI Dialogue: Tech Interview discussion at a Mitte tech hub in Berlin.',
    target_text: 'Ich habe fünf Jahre Erfahrung in der Softwareentwicklung.',
    order_index: 4,
    translation: 'I have five years of experience in software development.',
    dialogue_scenario: {
      title: 'Tech Interview in Berlin Mitte',
      role: 'Senior Frontend Engineer Candidate',
      ai_role: 'Lead Architect Interviewer',
      setting: 'A sleek tech studio office overlooking the Spree river',
      initial_ai_message: 'Willkommen in unserem Büro! Erzählen Sie mir bitte kurz über Ihren Werdegang.',
      initial_ai_translation: 'Welcome to our office! Please tell me briefly about your professional background.',
      suggested_responses: [
        { text: 'Ich habe fünf Jahre Erfahrung in modernem Angular und TypeScript.', translation: 'I have five years of experience in modern Angular and TypeScript.' },
        { text: 'Ich entwickle skalierbare Web-Applikationen mit Fokus auf Performance.', translation: 'I build scalable web applications focused on performance.' },
        { text: 'Ich freue mich sehr darauf, Ihr Engineering-Team kennenzulernen.', translation: 'I look forward very much to meeting your engineering team.' }
      ]
    }
  },

  // JAPANESE EXERCISES
  {
    id: 'ex-ja-1',
    lesson_id: 'les-ja-1',
    type: 'pronunciation',
    prompt: 'Practice Japanese pitch accent and smooth syllabic mora flow.',
    target_text: 'こんにちは、お元気ですか？',
    phonetic_guide: '[koɲɲitɕiwa oɡeŋki desɯ̥ ka]',
    order_index: 1,
    translation: 'Hello, how are you? (Polite)',
    cultural_context: 'Universal polite daytime greeting in Japan.'
  },
  {
    id: 'ex-ja-2',
    lesson_id: 'les-ja-1',
    type: 'syntax_dissector',
    prompt: 'Dissect Topic particle (は), Location particle (で), Object particle (を), and Politeness (ます).',
    target_text: '私は 図書館で 日本語の 本を 静かに 読みます。',
    phonetic_guide: '[watasi wa toʃokaɴ de nihoɴɡo no hoɴ o ʃizɯka ni jomimasɯ]',
    order_index: 2,
    translation: 'I quietly read a Japanese book at the library.',
    syntax_tokens: [
      { token: '私', pos: 'pronoun', meaning: 'I / myself (Watashi)', root_form: 'わたし' },
      { token: 'は', pos: 'particle', meaning: 'Topic marker particle (pronounced "wa")', root_form: 'は' },
      { token: '図書館', pos: 'noun', meaning: 'Library (Toshokan)', root_form: 'としょかん' },
      { token: 'で', pos: 'particle', meaning: 'Action location particle (at / in)', root_form: 'で' },
      { token: '日本語', pos: 'noun', meaning: 'Japanese language (Nihongo)', root_form: 'にほんご' },
      { token: 'の', pos: 'particle', meaning: 'Possessive / associative particle (of / \s)', root_form: 'の' },
      { token: '本', pos: 'noun', meaning: 'Book (Hon)', root_form: 'ほん' },
      { token: 'を', pos: 'particle', meaning: 'Direct object marker particle (pronounced "o")', root_form: 'を' },
      { token: '静かに', pos: 'adverb', meaning: 'Quietly (Shizuka ni, Na-adjective functioning as adverb)', root_form: 'しずか' },
      { token: '読みます', pos: 'verb', meaning: 'Read (Polite non-past form of yomu)', root_form: 'よむ' }
    ]
  },
  {
    id: 'ex-ja-3',
    lesson_id: 'les-ja-1',
    type: 'srs_card',
    prompt: 'Spaced repetition: Master essential Japanese gratitude and etiquette.',
    target_text: 'どうもありがとうございます。',
    phonetic_guide: '[doːmo aɾiɡatoː ɡozaimasɯ]',
    order_index: 3,
    translation: 'Thank you very much (Formal and respectful).',
    cultural_context: 'Essential polite phrase throughout Japan.'
  },
  {
    id: 'ex-ja-4',
    lesson_id: 'les-ja-1',
    type: 'dialogue',
    prompt: 'AI Dialogue: Checking in to a tranquil traditional Ryokan in Kyoto.',
    target_text: '予約した田中ですが、チェックインをお願いします。',
    order_index: 4,
    translation: 'I am Tanaka with a reservation, I would like to check in please.',
    dialogue_scenario: {
      title: 'Ryokan Check-in in Gion, Kyoto',
      role: 'Guest',
      ai_role: 'Okami-san (Innkeeper)',
      setting: 'A serene tatami-matted entrance hall with soothing garden water features',
      initial_ai_message: 'いらっしゃいませ。京都へようこそ。ご予約のお名前をお伺いしてもよろしいでしょうか？',
      initial_ai_translation: 'Welcome. Welcome to Kyoto. May I inquire as to your reservation name?',
      suggested_responses: [
        { text: '予約したスミスですが、チェックインをお願いします。', translation: 'I am Smith with a reservation, check-in please.' },
        { text: '夕食の時間は何時からですか？', translation: 'What time is dinner served?' },
        { text: '荷物を預かっていただけますか？', translation: 'Could you please keep my luggage?' }
      ]
    }
  },

  // ARABIC EXERCISES (NATIVE RTL)
  {
    id: 'ex-ar-1',
    lesson_id: 'les-ar-1',
    type: 'pronunciation',
    prompt: 'Practice emphatic pharyngeal consonants with native RTL audio feedback.',
    target_text: 'صباح الخير، كيف حالك اليوم؟',
    phonetic_guide: '[sˤɑˈbaːħ alˈxajr kajfa ˈħaːluk alˈjawm]',
    order_index: 1,
    translation: 'Good morning, how are you today?',
    cultural_context: 'Standard Arabic morning greeting across the Middle East and North Africa.'
  },
  {
    id: 'ex-ar-2',
    lesson_id: 'les-ar-1',
    type: 'syntax_dissector',
    prompt: 'Dissect the Right-to-Left Arabic sentence: VSO word order, case endings, and adjective agreement.',
    target_text: 'يَقْرَأُ الطَّالِبُ الذَّكِيُّ كِتَابًا مُفِيدًا فِي الْمَكْتَبَةِ.',
    phonetic_guide: '[yaqraʔu tˤ-tˤaːlibu ð-ðakiyyu kitaːban mufiːdan fiː l-maktabati]',
    order_index: 2,
    translation: 'The intelligent student reads a beneficial book in the library.',
    syntax_tokens: [
      { token: 'يَقْرَأُ', pos: 'verb', meaning: 'Reads (Imperfect present tense verb, 3rd person masculine singular)', root_form: 'ق-ر-أ' },
      { token: 'الطَّالِبُ', pos: 'noun', meaning: 'The student (Nominative subject with definite article Al-)', root_form: 'ط-ل-ب' },
      { token: 'الذَّكِيُّ', pos: 'adjective', meaning: 'Intelligent (Definite adjective agreeing with subject in case, number, gender)', root_form: 'ذ-ك-ي' },
      { token: 'كِتَابًا', pos: 'noun', meaning: 'A book (Accusative direct object with tanween fath)', root_form: 'ك-ت-ب' },
      { token: 'مُفِيدًا', pos: 'adjective', meaning: 'Beneficial / useful (Accusative adjective agreeing with kitaaban)', root_form: 'ف-ي-د' },
      { token: 'فِي', pos: 'preposition', meaning: 'In / inside (harf jarr)', root_form: 'في' },
      { token: 'الْمَكْتَبَةِ', pos: 'noun', meaning: 'The library (Genitive noun governed by preposition fi)', root_form: 'ك-ت-ب' }
    ]
  },
  {
    id: 'ex-ar-3',
    lesson_id: 'les-ar-1',
    type: 'srs_card',
    prompt: 'SuperMemo review: The traditional greeting of peace and blessing.',
    target_text: 'السلام عليكم ورحمة الله وبركاته',
    phonetic_guide: '[as-salaːmu ʕalajkum wa raħmatu lˤ-lˤaːhi wa barakaːtuh]',
    order_index: 3,
    translation: 'Peace be upon you, and the mercy of God and His blessings.',
    cultural_context: 'The premier universal greeting of brotherhood in the Arab world.'
  },
  {
    id: 'ex-ar-4',
    lesson_id: 'les-ar-1',
    type: 'dialogue',
    prompt: 'AI Dialogue: Browsing authentic spices and teas in Khan el-Khalili, Cairo.',
    target_text: 'أريد شراء بعض الزعفران والشاي بالنعناع، كم سعر الكيلو؟',
    order_index: 4,
    translation: 'I would like to purchase some saffron and mint tea, what is the price per kilo?',
    dialogue_scenario: {
      title: 'Khan el-Khalili Bazaar in Cairo',
      role: 'Curious traveler',
      ai_role: 'Spicemaster Merchant',
      setting: 'A fragrant market stall filled with sacks of cardamom, saffron, and hibiscus',
      initial_ai_message: 'أهلاً وسهلاً بك في دكاني! لدينا أفضل التوابل والأعشاب الطازجة. بماذا يمكنني أن أخدمك اليوم؟',
      initial_ai_translation: 'Welcome to my shop! We have the finest spices and fresh herbs. How can I assist you today?',
      suggested_responses: [
        { text: 'أريد شراء بعض الزعفران والشاي بالنعناع، كم سعر الكيلو؟', translation: 'I want to buy some saffron and mint tea, what is the price per kilo?' },
        { text: 'هل هذا الزعفران طبيعي وأصلي؟', translation: 'Is this saffron natural and authentic?' },
        { text: 'شكراً جزيلاً، جودة التوابل هنا ممتازة حقاً.', translation: 'Thank you very much, the spice quality here is truly excellent.' }
      ]
    }
  },

  // FRENCH EXERCISES
  {
    id: 'ex-fr-1',
    lesson_id: 'les-fr-1',
    type: 'pronunciation',
    prompt: 'Practice delicate French nasal vowels and liaisons.',
    target_text: 'Bonjour, enchanté de faire votre connaissance.',
    phonetic_guide: '[bɔ̃.ʒuʁ ɑ̃.ʃɑ̃.te də fɛʁ vɔ.tʁə kɔ.nɛ.sɑ̃s]',
    order_index: 1,
    translation: 'Hello, delighted to make your acquaintance.',
    cultural_context: 'Elegantly formal French introduction.'
  },
  {
    id: 'ex-fr-2',
    lesson_id: 'les-fr-1',
    type: 'syntax_dissector',
    prompt: 'Dissect French nominal groups, adjective placement, and contracted articles.',
    target_text: 'Le jeune artiste peint un magnifique tableau dans son atelier.',
    phonetic_guide: '[lə ʒœn aʁ.tist pɛ̃ œ̃ ma.ɲi.fik ta.blo dɑ̃ sɔ̃ a.tə.lje]',
    order_index: 2,
    translation: 'The young artist paints a magnificent picture in his workshop.',
    syntax_tokens: [
      { token: 'Le', pos: 'article', meaning: 'The (Masculine singular definite article)', root_form: 'le' },
      { token: 'jeune', pos: 'adjective', meaning: 'Young (Pre-nominal qualifying adjective)', root_form: 'jeune' },
      { token: 'artiste', pos: 'noun', meaning: 'Artist (Masculine singular noun)', root_form: 'artiste' },
      { token: 'peint', pos: 'verb', meaning: 'Paints (Peindre, 3rd person singular present)', root_form: 'peindre' },
      { token: 'un', pos: 'article', meaning: 'A / an (Masculine singular indefinite article)', root_form: 'un' },
      { token: 'magnifique', pos: 'adjective', meaning: 'Magnificent / splendid', root_form: 'magnifique' },
      { token: 'tableau', pos: 'noun', meaning: 'Painting / picture', root_form: 'tableau' },
      { token: 'dans', pos: 'preposition', meaning: 'In / inside', root_form: 'dans' },
      { token: 'son', pos: 'determiner', meaning: 'His / her (Possessive adjective agreeing with masculine noun)', root_form: 'son' },
      { token: 'atelier', pos: 'noun', meaning: 'Studio / workshop', root_form: 'atelier' }
    ]
  },
  {
    id: 'ex-fr-3',
    lesson_id: 'les-fr-1',
    type: 'srs_card',
    prompt: 'Spaced repetition: Master conversational French agreement and courtesy.',
    target_text: 'Je vous en prie, prenez votre temps.',
    phonetic_guide: '[ʒə vu.z‿ɑ̃ pʁi pʁə.ne vɔtʁ tɑ̃]',
    order_index: 3,
    translation: 'You are very welcome / Please, take your time.',
    cultural_context: 'Polite formal phrase used across France and French-speaking nations.'
  },
  {
    id: 'ex-fr-4',
    lesson_id: 'les-fr-1',
    type: 'dialogue',
    prompt: 'AI Dialogue: Ordering fresh croissants and pain au chocolat in a Paris boulangerie.',
    target_text: 'Deux croissants pur beurre et une baguette tradition, s\'il vous plaît.',
    order_index: 4,
    translation: 'Two pure butter croissants and a traditional baguette, please.',
    dialogue_scenario: {
      title: 'Artisan Boulangerie in Montmartre',
      role: 'Customer',
      ai_role: 'Boulangère',
      setting: 'A warm Parisian bakery smelling of freshly baked sourdough and golden pastries',
      initial_ai_message: 'Bonjour monsieur / madame ! Qu\'est-ce qui vous ferait plaisir aujourd\'hui ?',
      initial_ai_translation: 'Good day sir / madam! What would bring you pleasure today?',
      suggested_responses: [
        { text: 'Deux croissants pur beurre et une baguette tradition, s\'il vous plaît.', translation: 'Two pure butter croissants and a traditional baguette, please.' },
        { text: 'Avez-vous des éclairs au chocolat fraîchement préparés ?', translation: 'Do you have freshly prepared chocolate éclairs?' },
        { text: 'Ce sera tout pour aujourd\'hui, merci beaucoup !', translation: 'That will be all for today, thank you very much!' }
      ]
    }
  },

  // TAMIL EXERCISES
  {
    id: 'ex-ta-1',
    lesson_id: 'les-ta-1',
    type: 'pronunciation',
    prompt: 'Practice Tamil retroflex and dental articulation with native speech feedback.',
    target_text: 'காலை வணக்கம், நீங்கள் நலமாக இருக்கிறீர்களா?',
    phonetic_guide: '[kaːlaɪ vaɳakkam niːŋɡaɭ nalamaːɡa iɾukkiɾiːrɡaɭaː]',
    order_index: 1,
    translation: 'Good morning, are you doing well? (Polite / Respectful)',
    cultural_context: 'Traditional respectful greeting in Tamil Nadu, Sri Lanka, and Singapore.'
  },
  {
    id: 'ex-ta-2',
    lesson_id: 'les-ta-1',
    type: 'syntax_dissector',
    prompt: 'Dissect Tamil agglutinative noun cases (locative -il), coordinating enclitics (-um), and past tense.',
    target_text: 'நான் காலையில் சுவையான தோசையும் தேநீரும் சாப்பிட்டேன்.',
    phonetic_guide: '[naːn kaːlaɪjil suvaɪjaːna d̪oːsaɪjum d̪eːniːrum saːppiʈʈeːn]',
    order_index: 2,
    translation: 'I ate delicious dosa and drank tea in the morning.',
    syntax_tokens: [
      { token: 'நான்', pos: 'pronoun', meaning: 'I (First person singular pronoun)', root_form: 'நான்' },
      { token: 'காலையில்', pos: 'noun', meaning: 'In the morning (Kaalai + il locative case suffix)', root_form: 'காலை' },
      { token: 'சுவையான', pos: 'adjective', meaning: 'Delicious / tasty (Suvai + aana adjective marker)', root_form: 'சுவை' },
      { token: 'தோசையும்', pos: 'noun', meaning: 'Dosa also / and dosa (Dosai + um coordinating conjunction)', root_form: 'தோசை' },
      { token: 'தேநீரும்', pos: 'noun', meaning: 'Tea also / and tea (Theeneer + um coordinating conjunction)', root_form: 'தேநீர்' },
      { token: 'சாப்பிட்டேன்', pos: 'verb', meaning: 'Ate (Saapidu, past tense, first person singular suffix -een)', root_form: 'சாப்பிடு' }
    ]
  },
  {
    id: 'ex-ta-3',
    lesson_id: 'les-ta-1',
    type: 'srs_card',
    prompt: 'Spaced repetition: Master everyday Tamil gratitude and cordiality.',
    target_text: 'மிக்க நன்றி, மீண்டும் சந்திப்போம்.',
    phonetic_guide: '[mikka nanri, meendum sandhippom]',
    order_index: 3,
    translation: 'Thank you very much, we shall meet again.',
    cultural_context: 'Heartfelt polite farewell.'
  },
  {
    id: 'ex-ta-4',
    lesson_id: 'les-ta-1',
    type: 'dialogue',
    prompt: 'AI Dialogue: Ordering aromatic filter coffee and hot tiffin at a Mylapore Bhavan.',
    target_text: 'ஒரு சூடான ஃபில்டர் காபியும் நெய் ரோஸ்டும் கொண்டு வாருங்கள்.',
    order_index: 4,
    translation: 'Please bring a hot filter coffee and a ghee roast dosa.',
    dialogue_scenario: {
      title: 'Mylapore Heritage Bhavan in Chennai',
      role: 'Hungry diner',
      ai_role: 'Server (Master)',
      setting: 'A bustling traditional South Indian restaurant with aroma of roasted coffee beans and ghee',
      initial_ai_message: 'வணக்கம் ஐயா! இன்று எங்கள் உணவகத்தில் சூடான பொடி இட்லியும் மொறுமொறு நெய் தோசையும் சிறப்பு. என்ன கொண்டு வரட்டும்?',
      initial_ai_translation: 'Welcome sir! Today our specials are hot podi idli and crispy ghee dosa. What may I bring for you?',
      suggested_responses: [
        { text: 'ஒரு சூடான ஃபில்டர் காபியும் நெய் ரோஸ்டும் கொண்டு வாருங்கள்.', translation: 'Please bring a hot filter coffee and a ghee roast dosa.' },
        { text: 'சாம்பார் மற்றும் தேங்காய் சட்னி கூடுதல் கொடுங்கள்.', translation: 'Please give extra sambar and coconut chutney.' },
        { text: 'உணவு மிகவும் அருமையாக இருந்தது, நன்றி!', translation: 'The food was exceptionally splendid, thank you!' }
      ]
    }
  }
];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private supabase = inject(SupabaseService);

  public readonly languages = signal<Language[]>(SUPPORTED_LANGUAGES);
  public readonly selectedLanguage = signal<Language>(SUPPORTED_LANGUAGES[0]);
  public readonly lessons = signal<Lesson[]>(PRESEEDED_LESSONS);
  public readonly selectedLesson = signal<Lesson>(PRESEEDED_LESSONS[0]);
  public readonly exercises = signal<Exercise[]>(PRESEEDED_EXERCISES);
  public readonly activeExerciseIndex = signal<number>(0);

  constructor() {
    this.initLanguageData();
  }

  private async initLanguageData() {
    // If Supabase is connected, attempt fetching remote records with fallback
    if (this.supabase.client && this.supabase.isConfigured()) {
      try {
        const { data: langs } = await this.supabase.client.from('languages').select('*');
        if (langs && langs.length > 0) {
          // Merge metadata like flags and colors
          const merged = SUPPORTED_LANGUAGES.map(local => {
            const remote = langs.find(r => r.id === local.id);
            return remote ? { ...local, ...remote } : local;
          });
          this.languages.set(merged);
        }
      } catch (err) {
        console.warn('Could not query languages from Supabase, using preseeded:', err);
      }
    }
  }

  public selectLanguage(languageId: string): void {
    const lang = this.languages().find(l => l.id === languageId);
    if (lang) {
      this.selectedLanguage.set(lang);
      const lessonsForLang = this.getLessonsForLanguage(lang.id);
      if (lessonsForLang.length > 0) {
        this.selectedLesson.set(lessonsForLang[0]);
        this.activeExerciseIndex.set(0);
      }
    }
  }

  public selectLesson(lesson: Lesson): void {
    this.selectedLesson.set(lesson);
    this.activeExerciseIndex.set(0);
  }

  public getLessonsForLanguage(languageId: string): Lesson[] {
    return this.lessons().filter(l => l.language_id === languageId);
  }

  public getExercisesForLesson(lessonId: string): Exercise[] {
    return this.exercises().filter(e => e.lesson_id === lessonId);
  }

  public getCurrentLessonExercises(): Exercise[] {
    const curLesson = this.selectedLesson();
    return curLesson ? this.getExercisesForLesson(curLesson.id) : [];
  }

  public getCurrentExercise(): Exercise | null {
    const list = this.getCurrentLessonExercises();
    const idx = this.activeExerciseIndex();
    return list[idx] || null;
  }

  public nextExercise(): boolean {
    const list = this.getCurrentLessonExercises();
    if (this.activeExerciseIndex() < list.length - 1) {
      this.activeExerciseIndex.update(i => i + 1);
      return true;
    }
    return false;
  }

  public prevExercise(): boolean {
    if (this.activeExerciseIndex() > 0) {
      this.activeExerciseIndex.update(i => i - 1);
      return true;
    }
    return false;
  }

  public goToExercise(index: number): void {
    const list = this.getCurrentLessonExercises();
    if (index >= 0 && index < list.length) {
      this.activeExerciseIndex.set(index);
    }
  }
}

