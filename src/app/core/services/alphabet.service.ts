import { Injectable } from '@angular/core';

export interface AlphabetLetter {
  glyph: string;
  name: string;
  transliteration: string;
  ipa: string;
  category: 'vowel' | 'consonant' | 'special' | 'diacritic';
  exampleWord: string;
  exampleTranslation: string;
  audioText: string;
  isolated?: string;
  initial?: string;
  medial?: string;
  final?: string;
  notes?: string;
}

export interface ScriptGroup {
  id: string;
  title: string;
  description: string;
  letters: AlphabetLetter[];
}

export interface LanguageAlphabet {
  langId: string;
  scriptName: string;
  writingDirection: 'ltr' | 'rtl';
  overview: string;
  totalCharacters: number;
  groups: ScriptGroup[];
}

@Injectable({ providedIn: 'root' })
export class AlphabetService {

  private readonly ALPHABET_DATA: Record<string, LanguageAlphabet> = {
    // ────────────────────────── SPANISH ──────────────────────────
    es: {
      langId: 'es',
      scriptName: 'Alfabeto Español (Latin Script)',
      writingDirection: 'ltr',
      overview: 'The Spanish alphabet consists of 27 letters (26 Latin letters + Ñ), with phonetic consistency and clear vowel sounds.',
      totalCharacters: 27,
      groups: [
        {
          id: 'vowels',
          title: 'Las Vocales (Vowels)',
          description: 'Spanish has 5 pure, unchanging vowels. Never reduced to a schwa.',
          letters: [
            { glyph: 'A a', name: 'la a', transliteration: 'a', ipa: '/a/', category: 'vowel', exampleWord: 'Amigo', exampleTranslation: 'Friend', audioText: 'a, amigo' },
            { glyph: 'E e', name: 'la e', transliteration: 'e', ipa: '/e/', category: 'vowel', exampleWord: 'España', exampleTranslation: 'Spain', audioText: 'e, España' },
            { glyph: 'I i', name: 'la i', transliteration: 'i', ipa: '/i/', category: 'vowel', exampleWord: 'Isla', exampleTranslation: 'Island', audioText: 'i, isla' },
            { glyph: 'O o', name: 'la o', transliteration: 'o', ipa: '/o/', category: 'vowel', exampleWord: 'Sol', exampleTranslation: 'Sun', audioText: 'o, sol' },
            { glyph: 'U u', name: 'la u', transliteration: 'u', ipa: '/u/', category: 'vowel', exampleWord: 'Uno', exampleTranslation: 'One', audioText: 'u, uno', notes: 'Silent after q and in gue/gui unless marked with ü (diéresis).' }
          ]
        },
        {
          id: 'consonants',
          title: 'Las Consonantes (Consonants)',
          description: 'Consonants including distinct Spanish sounds like Ñ and R trills.',
          letters: [
            { glyph: 'B b', name: 'la be', transliteration: 'b', ipa: '/b, β/', category: 'consonant', exampleWord: 'Bueno', exampleTranslation: 'Good', audioText: 'be, bueno' },
            { glyph: 'C c', name: 'la ce', transliteration: 'c / s / th', ipa: '/k, θ, s/', category: 'consonant', exampleWord: 'Casa / Cielo', exampleTranslation: 'House / Sky', audioText: 'ce, casa' },
            { glyph: 'D d', name: 'la de', transliteration: 'd', ipa: '/d, ð/', category: 'consonant', exampleWord: 'Día', exampleTranslation: 'Day', audioText: 'de, día' },
            { glyph: 'F f', name: 'la efe', transliteration: 'f', ipa: '/f/', category: 'consonant', exampleWord: 'Fiesta', exampleTranslation: 'Party', audioText: 'efe, fiesta' },
            { glyph: 'G g', name: 'la ge', transliteration: 'g / j', ipa: '/ɡ, ɣ, x/', category: 'consonant', exampleWord: 'Gato / Gente', exampleTranslation: 'Cat / People', audioText: 'ge, gato' },
            { glyph: 'H h', name: 'la hache', transliteration: 'silent', ipa: '/-/', category: 'consonant', exampleWord: 'Hola', exampleTranslation: 'Hello', audioText: 'hache, hola', notes: 'Always completely silent in modern Spanish.' },
            { glyph: 'J j', name: 'la jota', transliteration: 'j / kh', ipa: '/x/', category: 'consonant', exampleWord: 'Jardín', exampleTranslation: 'Garden', audioText: 'jota, jardín' },
            { glyph: 'K k', name: 'la ka', transliteration: 'k', ipa: '/k/', category: 'consonant', exampleWord: 'Kilo', exampleTranslation: 'Kilogram', audioText: 'ka, kilo' },
            { glyph: 'L l', name: 'la ele', transliteration: 'l', ipa: '/l/', category: 'consonant', exampleWord: 'Luna', exampleTranslation: 'Moon', audioText: 'ele, luna' },
            { glyph: 'M m', name: 'la eme', transliteration: 'm', ipa: '/m/', category: 'consonant', exampleWord: 'Madre', exampleTranslation: 'Mother', audioText: 'eme, madre' },
            { glyph: 'N n', name: 'la ene', transliteration: 'n', ipa: '/n/', category: 'consonant', exampleWord: 'Noche', exampleTranslation: 'Night', audioText: 'ene, noche' },
            { glyph: 'Ñ ñ', name: 'la eñe', transliteration: 'ny / gn', ipa: '/ɲ/', category: 'special', exampleWord: 'Niño', exampleTranslation: 'Child', audioText: 'eñe, niño', notes: 'The iconic Spanish letter with a tilde virgulilla.' },
            { glyph: 'P p', name: 'la pe', transliteration: 'p', ipa: '/p/', category: 'consonant', exampleWord: 'Playa', exampleTranslation: 'Beach', audioText: 'pe, playa' },
            { glyph: 'Q q', name: 'la cu', transliteration: 'k', ipa: '/k/', category: 'consonant', exampleWord: 'Queso', exampleTranslation: 'Cheese', audioText: 'cu, queso' },
            { glyph: 'R r', name: 'la erre', transliteration: 'r', ipa: '/ɾ, r/', category: 'consonant', exampleWord: 'Río', exampleTranslation: 'River', audioText: 'erre, río', notes: 'Alveolar tap in middle of words; alveolar trill at start or double rr.' },
            { glyph: 'S s', name: 'la ese', transliteration: 's', ipa: '/s/', category: 'consonant', exampleWord: 'Sol', exampleTranslation: 'Sun', audioText: 'ese, sol' },
            { glyph: 'T t', name: 'la te', transliteration: 't', ipa: '/t/', category: 'consonant', exampleWord: 'Tiempo', exampleTranslation: 'Weather / Time', audioText: 'te, tiempo' },
            { glyph: 'V v', name: 'la uve', transliteration: 'b / v', ipa: '/b, β/', category: 'consonant', exampleWord: 'Vida', exampleTranslation: 'Life', audioText: 'uve, vida', notes: 'Identical pronunciation to B in standard Spanish.' },
            { glyph: 'W w', name: 'la uve doble', transliteration: 'w', ipa: '/w/', category: 'consonant', exampleWord: 'Web', exampleTranslation: 'Web', audioText: 'uve doble, web' },
            { glyph: 'X x', name: 'la equis', transliteration: 'x / ks', ipa: '/ks, s/', category: 'consonant', exampleWord: 'Éxito', exampleTranslation: 'Success', audioText: 'equis, éxito' },
            { glyph: 'Y y', name: 'la i griega / ye', transliteration: 'y', ipa: '/ʝ, i/', category: 'consonant', exampleWord: 'Yo', exampleTranslation: 'I', audioText: 'ye, yo' },
            { glyph: 'Z z', name: 'la zeta', transliteration: 'th / s', ipa: '/θ, s/', category: 'consonant', exampleWord: 'Zapato', exampleTranslation: 'Shoe', audioText: 'zeta, zapato' }
          ]
        },
        {
          id: 'special',
          title: 'Dígrafos Tradicionales (Digraphs)',
          description: 'Special two-letter combinations with unique phonetics.',
          letters: [
            { glyph: 'CH ch', name: 'la che', transliteration: 'ch', ipa: '/tʃ/', category: 'special', exampleWord: 'Chocolate', exampleTranslation: 'Chocolate', audioText: 'che, chocolate' },
            { glyph: 'LL ll', name: 'la elle / doble ele', transliteration: 'y / ly', ipa: '/ʝ, ʎ/', category: 'special', exampleWord: 'Lluvia', exampleTranslation: 'Rain', audioText: 'elle, lluvia' },
            { glyph: 'RR rr', name: 'la doble erre', transliteration: 'rr trill', ipa: '/r/', category: 'special', exampleWord: 'Perro', exampleTranslation: 'Dog', audioText: 'doble erre, perro' }
          ]
        }
      ]
    },

    // ────────────────────────── GERMAN ──────────────────────────
    de: {
      langId: 'de',
      scriptName: 'Deutsches Alphabet (German Alphabet)',
      writingDirection: 'ltr',
      overview: 'German uses the 26 Latin letters plus 3 modified vowels called Umlauts (Ä, Ö, Ü) and the ligature Eszett (ß).',
      totalCharacters: 30,
      groups: [
        {
          id: 'umlauts',
          title: 'Umlaute & Eszett (Special Characters)',
          description: 'Characteristic German letters that modify sound and grammar.',
          letters: [
            { glyph: 'Ä ä', name: 'A-Umlaut', transliteration: 'ae', ipa: '/ɛː, ɛ/', category: 'special', exampleWord: 'Käse', exampleTranslation: 'Cheese', audioText: 'ä, Käse' },
            { glyph: 'Ö ö', name: 'O-Umlaut', transliteration: 'oe', ipa: '/øː, œ/', category: 'special', exampleWord: 'Schön', exampleTranslation: 'Beautiful', audioText: 'ö, schön' },
            { glyph: 'Ü ü', name: 'U-Umlaut', transliteration: 'ue', ipa: '/yː, ʏ/', category: 'special', exampleWord: 'Tür', exampleTranslation: 'Door', audioText: 'ü, Tür' },
            { glyph: 'ß', name: 'das Eszett / scharfes S', transliteration: 'ss', ipa: '/s/', category: 'special', exampleWord: 'Straße', exampleTranslation: 'Street', audioText: 'Eszett, Straße', notes: 'Never appears at the start of a word. Represents a sharp unvoiced S after long vowels.' }
          ]
        },
        {
          id: 'vowels',
          title: 'Die Grundvokale (Basic Vowels)',
          description: 'Pronounced either long (closed) or short (open).',
          letters: [
            { glyph: 'A a', name: 'das A', transliteration: 'a', ipa: '/aː, a/', category: 'vowel', exampleWord: 'Abend', exampleTranslation: 'Evening', audioText: 'A, Abend' },
            { glyph: 'E e', name: 'das E', transliteration: 'e', ipa: '/eː, ɛ, ə/', category: 'vowel', exampleWord: 'Essen', exampleTranslation: 'To eat / Food', audioText: 'E, Essen' },
            { glyph: 'I i', name: 'das I', transliteration: 'i', ipa: '/iː, ɪ/', category: 'vowel', exampleWord: 'Igel', exampleTranslation: 'Hedgehog', audioText: 'I, Igel' },
            { glyph: 'O o', name: 'das O', transliteration: 'o', ipa: '/oː, ɔ/', category: 'vowel', exampleWord: 'Opa', exampleTranslation: 'Grandfather', audioText: 'O, Opa' },
            { glyph: 'U u', name: 'das U', transliteration: 'u', ipa: '/uː, ʊ/', category: 'vowel', exampleWord: 'Uhr', exampleTranslation: 'Clock / Watch', audioText: 'U, Uhr' }
          ]
        },
        {
          id: 'consonants',
          title: 'Die Konsonanten (Consonants)',
          description: 'Consonants with distinct German phonetic mechanics (W = /v/, V = /f/, Z = /ts/).',
          letters: [
            { glyph: 'B b', name: 'das Be', transliteration: 'b', ipa: '/b, p/', category: 'consonant', exampleWord: 'Buch', exampleTranslation: 'Book', audioText: 'Be, Buch' },
            { glyph: 'C c', name: 'das Ce', transliteration: 'ts / k', ipa: '/ts, k/', category: 'consonant', exampleWord: 'Café', exampleTranslation: 'Café', audioText: 'Ce, Café' },
            { glyph: 'D d', name: 'das De', transliteration: 'd', ipa: '/d, t/', category: 'consonant', exampleWord: 'Danke', exampleTranslation: 'Thank you', audioText: 'De, Danke' },
            { glyph: 'F f', name: 'das Ef', transliteration: 'f', ipa: '/f/', category: 'consonant', exampleWord: 'Freund', exampleTranslation: 'Friend', audioText: 'Ef, Freund' },
            { glyph: 'G g', name: 'das Ge', transliteration: 'g', ipa: '/ɡ, k/', category: 'consonant', exampleWord: 'Gut', exampleTranslation: 'Good', audioText: 'Ge, Gut' },
            { glyph: 'H h', name: 'das Ha', transliteration: 'h', ipa: '/h, -/', category: 'consonant', exampleWord: 'Haus', exampleTranslation: 'House', audioText: 'Ha, Haus' },
            { glyph: 'J j', name: 'das Jot', transliteration: 'y', ipa: '/j/', category: 'consonant', exampleWord: 'Jahr', exampleTranslation: 'Year', audioText: 'Jot, Jahr' },
            { glyph: 'K k', name: 'das Ka', transliteration: 'k', ipa: '/k/', category: 'consonant', exampleWord: 'Kind', exampleTranslation: 'Child', audioText: 'Ka, Kind' },
            { glyph: 'L l', name: 'das El', transliteration: 'l', ipa: '/l/', category: 'consonant', exampleWord: 'Licht', exampleTranslation: 'Light', audioText: 'El, Licht' },
            { glyph: 'M m', name: 'das Em', transliteration: 'm', ipa: '/m/', category: 'consonant', exampleWord: 'Mutter', exampleTranslation: 'Mother', audioText: 'Em, Mutter' },
            { glyph: 'N n', name: 'das En', transliteration: 'n', ipa: '/n/', category: 'consonant', exampleWord: 'Nacht', exampleTranslation: 'Night', audioText: 'En, Nacht' },
            { glyph: 'P p', name: 'das Pe', transliteration: 'p', ipa: '/p/', category: 'consonant', exampleWord: 'Platz', exampleTranslation: 'Square / Seat', audioText: 'Pe, Platz' },
            { glyph: 'Q q', name: 'das Qu', transliteration: 'kv', ipa: '/kv/', category: 'consonant', exampleWord: 'Quelle', exampleTranslation: 'Source / Spring', audioText: 'Qu, Quelle' },
            { glyph: 'R r', name: 'das Er', transliteration: 'r', ipa: '/ʁ, ɐ/', category: 'consonant', exampleWord: 'Rot', exampleTranslation: 'Red', audioText: 'Er, Rot' },
            { glyph: 'S s', name: 'das Es', transliteration: 'z / s / sh', ipa: '/z, s, ʃ/', category: 'consonant', exampleWord: 'Sonne', exampleTranslation: 'Sun', audioText: 'Es, Sonne', notes: 'Voiced /z/ before vowels; /ʃ/ before p or t (e.g. Stadt).' },
            { glyph: 'T t', name: 'das Te', transliteration: 't', ipa: '/t/', category: 'consonant', exampleWord: 'Tag', exampleTranslation: 'Day', audioText: 'Te, Tag' },
            { glyph: 'V v', name: 'das Fau', transliteration: 'f', ipa: '/f, v/', category: 'consonant', exampleWord: 'Vater', exampleTranslation: 'Father', audioText: 'Fau, Vater', notes: 'Almost always pronounced like an English F.' },
            { glyph: 'W w', name: 'das We', transliteration: 'v', ipa: '/v/', category: 'consonant', exampleWord: 'Wasser', exampleTranslation: 'Water', audioText: 'We, Wasser', notes: 'Always pronounced like an English V.' },
            { glyph: 'Z z', name: 'das Zett', transliteration: 'ts', ipa: '/ts/', category: 'consonant', exampleWord: 'Zeit', exampleTranslation: 'Time', audioText: 'Zett, Zeit', notes: 'Always pronounced like "ts" in cats.' }
          ]
        }
      ]
    },

    // ────────────────────────── FRENCH ──────────────────────────
    fr: {
      langId: 'fr',
      scriptName: 'Alphabet Français (French Alphabet)',
      writingDirection: 'ltr',
      overview: 'French uses the 26 Latin letters with 5 diacritical accents (aigu, grave, circonflexe, cédille, tréma) and unique nasal vowels.',
      totalCharacters: 26,
      groups: [
        {
          id: 'accents',
          title: 'Les Accents (Diacritics)',
          description: 'Essential marks that modify pronunciation and word meaning.',
          letters: [
            { glyph: 'É é', name: 'e accent aigu', transliteration: 'é', ipa: '/e/', category: 'diacritic', exampleWord: 'Été', exampleTranslation: 'Summer', audioText: 'e accent aigu, été' },
            { glyph: 'È è', name: 'e accent grave', transliteration: 'è', ipa: '/ɛ/', category: 'diacritic', exampleWord: 'Père', exampleTranslation: 'Father', audioText: 'e accent grave, père' },
            { glyph: 'Ê ê', name: 'e accent circonflexe', transliteration: 'ê', ipa: '/ɛ/', category: 'diacritic', exampleWord: 'Fête', exampleTranslation: 'Party / Festival', audioText: 'e accent circonflexe, fête' },
            { glyph: 'Ç ç', name: 'c cédille', transliteration: 's', ipa: '/s/', category: 'diacritic', exampleWord: 'Français', exampleTranslation: 'French', audioText: 'c cédille, français', notes: 'Softens the C before a, o, or u into an S sound.' },
            { glyph: 'Ï ï', name: 'i tréma', transliteration: 'ï', ipa: '/i/', category: 'diacritic', exampleWord: 'Naïf', exampleTranslation: 'Naive', audioText: 'i tréma, naïf', notes: 'Indicates the vowel is pronounced separately from the preceding one.' }
          ]
        },
        {
          id: 'vowels',
          title: 'Les Voyelles (Vowels)',
          description: 'Pure and nasal vowels of standard French.',
          letters: [
            { glyph: 'A a', name: 'a', transliteration: 'a', ipa: '/a/', category: 'vowel', exampleWord: 'Ami', exampleTranslation: 'Friend', audioText: 'a, ami' },
            { glyph: 'E e', name: 'e', transliteration: 'e', ipa: '/ə, e, ɛ/', category: 'vowel', exampleWord: 'Eau', exampleTranslation: 'Water', audioText: 'e, eau' },
            { glyph: 'I i', name: 'i', transliteration: 'i', ipa: '/i/', category: 'vowel', exampleWord: 'Ici', exampleTranslation: 'Here', audioText: 'i, ici' },
            { glyph: 'O o', name: 'o', transliteration: 'o', ipa: '/o, ɔ/', category: 'vowel', exampleWord: 'Oui', exampleTranslation: 'Yes', audioText: 'o, oui' },
            { glyph: 'U u', name: 'u', transliteration: 'u rounded', ipa: '/y/', category: 'vowel', exampleWord: 'Lune', exampleTranslation: 'Moon', audioText: 'u, lune', notes: 'Round your lips like whistling while saying ee.' },
            { glyph: 'Y y', name: 'i grec', transliteration: 'y', ipa: '/i, j/', category: 'vowel', exampleWord: 'Yeux', exampleTranslation: 'Eyes', audioText: 'i grec, yeux' }
          ]
        },
        {
          id: 'consonants',
          title: 'Les Consonantes (Consonants)',
          description: 'French consonants featuring the uvular R and soft J.',
          letters: [
            { glyph: 'B b', name: 'bé', transliteration: 'b', ipa: '/b/', category: 'consonant', exampleWord: 'Bonjour', exampleTranslation: 'Hello', audioText: 'bé, bonjour' },
            { glyph: 'C c', name: 'cé', transliteration: 'k / s', ipa: '/k, s/', category: 'consonant', exampleWord: 'Café', exampleTranslation: 'Coffee', audioText: 'cé, café' },
            { glyph: 'D d', name: 'dé', transliteration: 'd', ipa: '/d/', category: 'consonant', exampleWord: 'Demain', exampleTranslation: 'Tomorrow', audioText: 'dé, demain' },
            { glyph: 'F f', name: 'effe', transliteration: 'f', ipa: '/f/', category: 'consonant', exampleWord: 'Famille', exampleTranslation: 'Family', audioText: 'effe, famille' },
            { glyph: 'G g', name: 'gé', transliteration: 'g / zh', ipa: '/ɡ, ʒ/', category: 'consonant', exampleWord: 'Gare', exampleTranslation: 'Train station', audioText: 'gé, gare' },
            { glyph: 'H h', name: 'hache', transliteration: 'silent', ipa: '/-/', category: 'consonant', exampleWord: 'Hôtel', exampleTranslation: 'Hotel', audioText: 'hache, hôtel', notes: 'Never pronounced in French (H muet allows elision, H aspiré prevents it).' },
            { glyph: 'J j', name: 'ji', transliteration: 'zh', ipa: '/ʒ/', category: 'consonant', exampleWord: 'Jour', exampleTranslation: 'Day', audioText: 'ji, jour' },
            { glyph: 'L l', name: 'elle', transliteration: 'l', ipa: '/l/', category: 'consonant', exampleWord: 'Livre', exampleTranslation: 'Book', audioText: 'elle, livre' },
            { glyph: 'M m', name: 'emme', transliteration: 'm', ipa: '/m/', category: 'consonant', exampleWord: 'Merci', exampleTranslation: 'Thank you', audioText: 'emme, merci' },
            { glyph: 'N n', name: 'enne', transliteration: 'n', ipa: '/n/', category: 'consonant', exampleWord: 'Nuit', exampleTranslation: 'Night', audioText: 'enne, nuit' },
            { glyph: 'R r', name: 'erre', transliteration: 'r uvular', ipa: '/ʁ/', category: 'consonant', exampleWord: 'Rouge', exampleTranslation: 'Red', audioText: 'erre, rouge' },
            { glyph: 'S s', name: 'esse', transliteration: 's / z', ipa: '/s, z/', category: 'consonant', exampleWord: 'Soleil', exampleTranslation: 'Sun', audioText: 'esse, soleil' }
          ]
        }
      ]
    },

    // ────────────────────────── JAPANESE ──────────────────────────
    ja: {
      langId: 'ja',
      scriptName: '日本語の文字 (Hiragana, Katakana & Kanji)',
      writingDirection: 'ltr',
      overview: 'Japanese employs three integrated writing systems: Hiragana for native words & grammar, Katakana for loanwords, and Kanji for roots.',
      totalCharacters: 92,
      groups: [
        {
          id: 'hiragana-vowels',
          title: 'ひらがな: あ行 (Hiragana Vowels)',
          description: 'The foundation of all Japanese syllables (Gojūon).',
          letters: [
            { glyph: 'あ', name: 'a', transliteration: 'a', ipa: '/a/', category: 'vowel', exampleWord: 'ありがとう (Arigatō)', exampleTranslation: 'Thank you', audioText: 'あ, ありがとう' },
            { glyph: 'い', name: 'i', transliteration: 'i', ipa: '/i/', category: 'vowel', exampleWord: '犬 (Inu)', exampleTranslation: 'Dog', audioText: 'い, 犬' },
            { glyph: 'う', name: 'u', transliteration: 'u', ipa: '/ɯᵝ/', category: 'vowel', exampleWord: '海 (Umi)', exampleTranslation: 'Sea / Ocean', audioText: 'う, 海' },
            { glyph: 'え', name: 'e', transliteration: 'e', ipa: '/e/', category: 'vowel', exampleWord: '駅 (Eki)', exampleTranslation: 'Train station', audioText: 'え, 駅' },
            { glyph: 'お', name: 'o', transliteration: 'o', ipa: '/o/', category: 'vowel', exampleWord: 'お茶 (Ocha)', exampleTranslation: 'Green tea', audioText: 'お, お茶' }
          ]
        },
        {
          id: 'hiragana-consonants',
          title: 'ひらがな: か行〜さ行 (K & S Rows)',
          description: 'Consonant rows combined with the 5 vowels.',
          letters: [
            { glyph: 'か', name: 'ka', transliteration: 'ka', ipa: '/ka/', category: 'consonant', exampleWord: '傘 (Kasa)', exampleTranslation: 'Umbrella', audioText: 'か, 傘' },
            { glyph: 'き', name: 'ki', transliteration: 'ki', ipa: '/ki/', category: 'consonant', exampleWord: '切符 (Kippu)', exampleTranslation: 'Ticket', audioText: 'き, 切符' },
            { glyph: 'く', name: 'ku', transliteration: 'ku', ipa: '/kɯᵝ/', category: 'consonant', exampleWord: '車 (Kuruma)', exampleTranslation: 'Car', audioText: 'く, 車' },
            { glyph: 'け', name: 'ke', transliteration: 'ke', ipa: '/ke/', category: 'consonant', exampleWord: '今朝 (Kesa)', exampleTranslation: 'This morning', audioText: 'け, 今朝' },
            { glyph: 'こ', name: 'ko', transliteration: 'ko', ipa: '/ko/', category: 'consonant', exampleWord: '言葉 (Kotoba)', exampleTranslation: 'Word / Language', audioText: 'こ, 言葉' },
            { glyph: 'さ', name: 'sa', transliteration: 'sa', ipa: '/sa/', category: 'consonant', exampleWord: '桜 (Sakura)', exampleTranslation: 'Cherry blossom', audioText: 'さ, 桜' },
            { glyph: 'し', name: 'shi', transliteration: 'shi', ipa: '/ɕi/', category: 'consonant', exampleWord: '白 (Shiro)', exampleTranslation: 'White', audioText: 'し, 白' },
            { glyph: 'す', name: 'su', transliteration: 'su', ipa: '/sɯᵝ/', category: 'consonant', exampleWord: '寿司 (Sushi)', exampleTranslation: 'Sushi', audioText: 'す, 寿司' },
            { glyph: 'せ', name: 'se', transliteration: 'se', ipa: '/se/', category: 'consonant', exampleWord: '先生 (Sensei)', exampleTranslation: 'Teacher', audioText: 'せ, 先生' },
            { glyph: 'そ', name: 'so', transliteration: 'so', ipa: '/so/', category: 'consonant', exampleWord: '空 (Sora)', exampleTranslation: 'Sky', audioText: 'そ, 空' }
          ]
        },
        {
          id: 'katakana',
          title: 'カタカナ (Katakana Loanwords)',
          description: 'Angular script used for international loanwords and emphasis.',
          letters: [
            { glyph: 'ア', name: 'a', transliteration: 'a', ipa: '/a/', category: 'vowel', exampleWord: 'アメリカ (Amerika)', exampleTranslation: 'America', audioText: 'ア, アメリカ' },
            { glyph: 'コ', name: 'ko', transliteration: 'ko', ipa: '/ko/', category: 'consonant', exampleWord: 'コーヒー (Kōhī)', exampleTranslation: 'Coffee', audioText: 'コ, コーヒー' },
            { glyph: 'ホ', name: 'ho', transliteration: 'ho', ipa: '/ho/', category: 'consonant', exampleWord: 'ホテル (Hoteru)', exampleTranslation: 'Hotel', audioText: 'ホ, ホテル' },
            { glyph: 'タ', name: 'ta', transliteration: 'ta', ipa: '/ta/', category: 'consonant', exampleWord: 'タクシー (Takushī)', exampleTranslation: 'Taxi', audioText: 'タ, タクシー' },
            { glyph: 'ン', name: 'n', transliteration: 'n moraic', ipa: '/N/', category: 'special', exampleWord: 'パン (Pan)', exampleTranslation: 'Bread', audioText: 'ン, パン' }
          ]
        },
        {
          id: 'kanji-basics',
          title: '基礎漢字 (Essential Basic Kanji)',
          description: 'Logographic characters representing whole concepts.',
          letters: [
            { glyph: '一', name: 'ichi', transliteration: 'one', ipa: '/itʃi/', category: 'special', exampleWord: '一つ (Hitotsu)', exampleTranslation: 'One thing', audioText: 'いち, ひとつ' },
            { glyph: '二', name: 'ni', transliteration: 'two', ipa: '/ni/', category: 'special', exampleWord: '二月 (Nigatsu)', exampleTranslation: 'February', audioText: 'に, にがつ' },
            { glyph: '三', name: 'san', transliteration: 'three', ipa: '/saN/', category: 'special', exampleWord: '三人 (Sannin)', exampleTranslation: 'Three people', audioText: 'さん, さんにん' },
            { glyph: '日', name: 'nichi / hi', transliteration: 'sun / day', ipa: '/ɲitʃi/', category: 'special', exampleWord: '日本 (Nihon)', exampleTranslation: 'Japan', audioText: 'にち, にほん' },
            { glyph: '月', name: 'tsuki / getsu', transliteration: 'moon / month', ipa: '/tsɯki/', category: 'special', exampleWord: '今月 (Kongetsu)', exampleTranslation: 'This month', audioText: 'つき, こんげつ' }
          ]
        }
      ]
    },

    // ────────────────────────── ARABIC ──────────────────────────
    ar: {
      langId: 'ar',
      scriptName: 'الأبجدية العربية (Arabic Abjad)',
      writingDirection: 'rtl',
      overview: 'Arabic is written right-to-left in cursive script. The 28 consonants change shape based on their position (isolated, initial, medial, final).',
      totalCharacters: 28,
      groups: [
        {
          id: 'alif-dal',
          title: 'الحروف الأولى (Letters Alif to Dal)',
          description: 'Primary consonants and glottal stops with full cursive shape transitions.',
          letters: [
            { glyph: 'ا', name: 'Alif (أَلِف)', transliteration: 'ā / \'', ipa: '/aː, ʔ/', category: 'vowel', exampleWord: 'أَمَل (Amal)', exampleTranslation: 'Hope', audioText: 'أَلِف, أَمَل', isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا' },
            { glyph: 'ب', name: 'Bā\' (بَاء)', transliteration: 'b', ipa: '/b/', category: 'consonant', exampleWord: 'بَيْت (Bayt)', exampleTranslation: 'House', audioText: 'بَاء, بَيْت', isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب' },
            { glyph: 'ت', name: 'Tā\' (تَاء)', transliteration: 't', ipa: '/t/', category: 'consonant', exampleWord: 'تَمْر (Tamr)', exampleTranslation: 'Dates (fruit)', audioText: 'تَاء, تَمْر', isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت' },
            { glyph: 'ث', name: 'Thā\' (ثَاء)', transliteration: 'th', ipa: '/θ/', category: 'consonant', exampleWord: 'ثَوْب (Thawb)', exampleTranslation: 'Garment / Robe', audioText: 'ثَاء, ثَوْب', isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' },
            { glyph: 'ج', name: 'Jīm (جِيم)', transliteration: 'j', ipa: '/dʒ, ʒ/', category: 'consonant', exampleWord: 'جَمِيل (Jameel)', exampleTranslation: 'Beautiful', audioText: 'جِيم, جَمِيل', isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج' }
          ]
        },
        {
          id: 'emphatics',
          title: 'الحروف المفخمة (Emphatic & Throat Consonants)',
          description: 'Deep pharyngeal and uvular consonants unique to Arabic phonology.',
          letters: [
            { glyph: 'ح', name: 'Ḥā\' (حَاء)', transliteration: 'ḥ pharyngeal', ipa: '/ħ/', category: 'consonant', exampleWord: 'حَلِيب (Haleeb)', exampleTranslation: 'Milk', audioText: 'حَاء, حَلِيب', isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح' },
            { glyph: 'خ', name: 'Khā\' (خَاء)', transliteration: 'kh uvular', ipa: '/x/', category: 'consonant', exampleWord: 'خُبْز (Khubz)', exampleTranslation: 'Bread', audioText: 'خَاء, خُبْز', isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' },
            { glyph: 'ص', name: 'Ṣād (صَاد)', transliteration: 'ṣ emphatic', ipa: '/sˤ/', category: 'special', exampleWord: 'صَبَاح (Sabah)', exampleTranslation: 'Morning', audioText: 'صَاد, صَبَاح', isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص' },
            { glyph: 'ض', name: 'Ḍād (ضَاد)', transliteration: 'ḍ emphatic', ipa: '/dˤ/', category: 'special', exampleWord: 'ضَوْء (Daw\')', exampleTranslation: 'Light', audioText: 'ضَاد, ضَوْء', isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض', notes: 'Arabic is known as "Lughat al-Dad" because this sound is unique to Arabic.' },
            { glyph: 'ع', name: '\'Ayn (عَيْن)', transliteration: '\' voiced pharyngeal', ipa: '/ʕ/', category: 'special', exampleWord: 'عَرَبِيّ (\'Arabiyy)', exampleTranslation: 'Arabic', audioText: 'عَيْن, عَرَبِيّ', isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع' },
            { glyph: 'ق', name: 'Qāf (قَاف)', transliteration: 'q uvular', ipa: '/q/', category: 'consonant', exampleWord: 'قَلَم (Qalam)', exampleTranslation: 'Pen', audioText: 'قَاف, قَلَم', isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق' }
          ]
        },
        {
          id: 'harakat',
          title: 'الحركات التشكيلية (Short Vowel Diacritics)',
          description: 'Diacritical marks written above or below consonants to indicate short vowels.',
          letters: [
            { glyph: 'َـ', name: 'Fatḥah (فَتْحَة)', transliteration: 'a', ipa: '/a/', category: 'diacritic', exampleWord: 'دَرَسَ (Darasa)', exampleTranslation: 'He studied', audioText: 'فَتْحَة' },
            { glyph: 'ِـ', name: 'Kasrah (كَسْرَة)', transliteration: 'i', ipa: '/i/', category: 'diacritic', exampleWord: 'كِتَاب (Kitab)', exampleTranslation: 'Book', audioText: 'كَسْرَة' },
            { glyph: 'ُـ', name: 'Ḍammah (ضَمَّة)', transliteration: 'u', ipa: '/u/', category: 'diacritic', exampleWord: 'شُكْرًا (Shukran)', exampleTranslation: 'Thank you', audioText: 'ضَمَّة' },
            { glyph: 'ْـ', name: 'Sukūn (سُكُون)', transliteration: 'no vowel', ipa: '/Ø/', category: 'diacritic', exampleWord: 'مَسْجِد (Masjid)', exampleTranslation: 'Mosque', audioText: 'سُكُون' }
          ]
        }
      ]
    },

    // ────────────────────────── TAMIL ──────────────────────────
    ta: {
      langId: 'ta',
      scriptName: 'தமிழ் எழுத்துக்கள் (Tamil Script & Syllabary)',
      writingDirection: 'ltr',
      overview: 'Tamil is an abugida script with 12 vowels (Uyir), 18 consonants (Mei), 1 special Ayutha letter, and 216 combined syllabic glyphs (Uyirmei).',
      totalCharacters: 31,
      groups: [
        {
          id: 'uyir',
          title: 'உயிரெழுத்துக்கள் (12 Primary Vowels)',
          description: 'The soul/life vowels that stand alone at the beginning of words.',
          letters: [
            { glyph: 'அ', name: 'A (Short)', transliteration: 'a', ipa: '/ʌ/', category: 'vowel', exampleWord: 'அம்மா (Amma)', exampleTranslation: 'Mother', audioText: 'அ, அம்மா' },
            { glyph: 'ஆ', name: 'Aa (Long)', transliteration: 'ā', ipa: '/aː/', category: 'vowel', exampleWord: 'ஆடு (Aadu)', exampleTranslation: 'Goat', audioText: 'ஆ, ஆடு' },
            { glyph: 'இ', name: 'I (Short)', transliteration: 'i', ipa: '/i/', category: 'vowel', exampleWord: 'இலை (Ilai)', exampleTranslation: 'Leaf', audioText: 'இ, இலை' },
            { glyph: 'ஈ', name: 'Ee (Long)', transliteration: 'ī', ipa: '/iː/', category: 'vowel', exampleWord: 'ஈட்டி (Eetti)', exampleTranslation: 'Spear', audioText: 'ஈ, ஈட்டி' },
            { glyph: 'உ', name: 'U (Short)', transliteration: 'u', ipa: '/u/', category: 'vowel', exampleWord: 'உலகம் (Ulagam)', exampleTranslation: 'World', audioText: 'உ, உலகம்' },
            { glyph: 'ஊ', name: 'Oo (Long)', transliteration: 'ū', ipa: '/uː/', category: 'vowel', exampleWord: 'ஊர் (Oor)', exampleTranslation: 'Hometown / Village', audioText: 'ஊ, ஊர்' },
            { glyph: 'எ', name: 'E (Short)', transliteration: 'e', ipa: '/e/', category: 'vowel', exampleWord: 'எலி (Eli)', exampleTranslation: 'Mouse', audioText: 'எ, எலி' },
            { glyph: 'ஏ', name: 'Ae (Long)', transliteration: 'ē', ipa: '/eː/', category: 'vowel', exampleWord: 'ஏணி (Eani)', exampleTranslation: 'Ladder', audioText: 'ஏ, ஏணி' },
            { glyph: 'ஐ', name: 'Ai (Diphthong)', transliteration: 'ai', ipa: '/aɪ/', category: 'vowel', exampleWord: 'ஐந்து (Ainthu)', exampleTranslation: 'Five', audioText: 'ஐ, ஐந்து' },
            { glyph: 'ஒ', name: 'O (Short)', transliteration: 'o', ipa: '/o/', category: 'vowel', exampleWord: 'ஒன்று (Ondru)', exampleTranslation: 'One', audioText: 'ஒ, ஒன்று' },
            { glyph: 'ஓ', name: 'Oh (Long)', transliteration: 'ō', ipa: '/oː/', category: 'vowel', exampleWord: 'ஓடம் (Odam)', exampleTranslation: 'Boat', audioText: 'ஓ, ஓடம்' },
            { glyph: 'ஔ', name: 'Au (Diphthong)', transliteration: 'au', ipa: '/aʊ/', category: 'vowel', exampleWord: 'ஔவையார் (Avvaiyar)', exampleTranslation: 'Ancient Tamil Poetess', audioText: 'ஔ, ஔவையார்' }
          ]
        },
        {
          id: 'ayutham',
          title: 'ஆய்த எழுத்து (Special Letter)',
          description: 'Unique solitary phonetic character in Tamil orthography.',
          letters: [
            { glyph: 'ஃ', name: 'Ayutha Ezhuthu (அக்கு)', transliteration: 'ḵ / akh', ipa: '/x/', category: 'special', exampleWord: 'எஃகு (Ehgu)', exampleTranslation: 'Steel', audioText: 'அக்கு, எஃகு' }
          ]
        },
        {
          id: 'mei',
          title: 'மெய்யெழுத்துக்கள் (18 Body Consonants)',
          description: 'Consonants written with a distinctive dot (Pulli) on top.',
          letters: [
            { glyph: 'க்', name: 'Ik', transliteration: 'k', ipa: '/k/', category: 'consonant', exampleWord: 'கண் (Kan)', exampleTranslation: 'Eye', audioText: 'க், கண்' },
            { glyph: 'ங்', name: 'Ing', transliteration: 'ng', ipa: '/ŋ/', category: 'consonant', exampleWord: 'சங்கு (Sangu)', exampleTranslation: 'Conch', audioText: 'ங், சங்கு' },
            { glyph: 'ச்', name: 'Ich', transliteration: 'ch / s', ipa: '/tʃ, s/', category: 'consonant', exampleWord: 'சந்திரன் (Chandiran)', exampleTranslation: 'Moon', audioText: 'ச், சந்திரன்' },
            { glyph: 'ஞ்', name: 'Inj', transliteration: 'ny', ipa: '/ɲ/', category: 'consonant', exampleWord: 'ஞாயிறு (Gnayiru)', exampleTranslation: 'Sunday / Sun', audioText: 'ஞ், ஞாயிறு' },
            { glyph: 'ட்', name: 'It (Retroflex)', transliteration: 'ṭ', ipa: '/ʈ/', category: 'consonant', exampleWord: 'பட்டம் (Pattam)', exampleTranslation: 'Kite', audioText: 'ட், பட்டம்' },
            { glyph: 'ண்', name: 'In (Retroflex)', transliteration: 'ṇ', ipa: '/ɳ/', category: 'consonant', exampleWord: 'பணம் (Panam)', exampleTranslation: 'Money', audioText: 'ண், பணம்' },
            { glyph: 'த்', name: 'Ith (Dental)', transliteration: 't', ipa: '/t̪/', category: 'consonant', exampleWord: 'தாமரை (Thamarai)', exampleTranslation: 'Lotus', audioText: 'த், தாமரை' },
            { glyph: 'ந்', name: 'Inh (Dental)', transliteration: 'n', ipa: '/n̪/', category: 'consonant', exampleWord: 'நன்றி (Nandri)', exampleTranslation: 'Thank you', audioText: 'ந், நன்றி' },
            { glyph: 'ப்', name: 'Ip', transliteration: 'p', ipa: '/p/', category: 'consonant', exampleWord: 'பால் (Paal)', exampleTranslation: 'Milk', audioText: 'ப், பால்' },
            { glyph: 'ம்', name: 'Im', transliteration: 'm', ipa: '/m/', category: 'consonant', exampleWord: 'மலர் (Malar)', exampleTranslation: 'Flower', audioText: 'ம், மலர்' },
            { glyph: 'ய்', name: 'Iy', transliteration: 'y', ipa: '/j/', category: 'consonant', exampleWord: 'யானை (Yaanai)', exampleTranslation: 'Elephant', audioText: 'ய், யானை' },
            { glyph: 'ர்', name: 'Ir', transliteration: 'r tap', ipa: '/ɾ/', category: 'consonant', exampleWord: 'ரயில் (Rayil)', exampleTranslation: 'Train', audioText: 'ர், ரயில்' },
            { glyph: 'ல்', name: 'Il (Alveolar)', transliteration: 'l', ipa: '/l/', category: 'consonant', exampleWord: 'நிலா (Nila)', exampleTranslation: 'Moon', audioText: 'ல், நிலா' },
            { glyph: 'வ்', name: 'Iv', transliteration: 'v', ipa: '/ʋ/', category: 'consonant', exampleWord: 'வாழை (Vaazhai)', exampleTranslation: 'Banana', audioText: 'வ், வாழை' },
            { glyph: 'ழ்', name: 'Izha (Retroflex Approximant)', transliteration: 'ḻ / zha', ipa: '/ɻ/', category: 'special', exampleWord: 'தமிழ் (Thamizh)', exampleTranslation: 'Tamil', audioText: 'ழ், தமிழ்', notes: 'The iconic Tamil retroflex consonant zha, pronounced with curled tongue.' },
            { glyph: 'ள்', name: 'Ila (Retroflex Lateral)', transliteration: 'ḷ', ipa: '/ɭ/', category: 'consonant', exampleWord: 'பள்ளி (Palli)', exampleTranslation: 'School', audioText: 'ள், பள்ளி' },
            { glyph: 'ற்', name: 'Itr (Alveolar Trill)', transliteration: 'ṟ', ipa: '/r, tr/', category: 'consonant', exampleWord: 'காற்று (Kaatru)', exampleTranslation: 'Wind', audioText: 'ற், காற்று' },
            { glyph: 'ன்', name: 'In (Alveolar Nasal)', transliteration: 'ṉ', ipa: '/n/', category: 'consonant', exampleWord: 'அன்பு (Anbu)', exampleTranslation: 'Love', audioText: 'ன், அன்பு' }
          ]
        }
      ]
    }
  };

  getAlphabetForLanguage(langId: string): LanguageAlphabet {
    return this.ALPHABET_DATA[langId] || this.ALPHABET_DATA['es'];
  }
}

