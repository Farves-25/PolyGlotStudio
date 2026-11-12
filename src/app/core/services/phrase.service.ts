import { Injectable, signal } from '@angular/core';

export interface Phrase {
  id: string;
  langId: string;
  categoryId: string;
  native: string;      // native script
  phonetic: string;    // IPA or romanization
  translation: string; // English
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PhraseCategory {
  id: string;
  name: string;
  icon: string;
  characterEmoji: string;
  characterRole: string;
  accentClass: string;
  badgeBg: string;
  description: string;
}

export const PHRASE_CATEGORIES: PhraseCategory[] = [
  { id: 'essentials',   name: 'Essentials',           icon: '👋', characterEmoji: '🙋‍♂️', characterRole: 'Friendly Local', accentClass: 'indigo',  badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300', description: 'The first words you need in any situation' },
  { id: 'conversation', name: 'Conversation',         icon: '💬', characterEmoji: '🧑‍🤝‍🧑', characterRole: 'Chatty Friend', accentClass: 'blue',    badgeBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300', description: 'Keep the conversation flowing naturally' },
  { id: 'time',         name: 'Time & Numbers',       icon: '🕐', characterEmoji: '⌚', characterRole: 'Train Conductor', accentClass: 'purple',  badgeBg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300', description: 'Days, hours, counts, and calendar' },
  { id: 'greetings',    name: 'Greetings & Farewells', icon: '🤝', characterEmoji: '👋', characterRole: 'Welcoming Host', accentClass: 'emerald', badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300', description: 'Open and close any interaction gracefully' },
  { id: 'restaurant',   name: 'Bar & Restaurant',     icon: '🍽️', characterEmoji: '🧑‍🍳', characterRole: 'Bistro Chef & Waiter', accentClass: 'amber',   badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300', description: 'Order food and drinks with confidence' },
  { id: 'transport',    name: 'Transportation',       icon: '🚕', characterEmoji: '🚕', characterRole: 'City Cab Driver', accentClass: 'orange',  badgeBg: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300', description: 'Navigate trains, taxis, and directions' },
  { id: 'hotel',        name: 'Hotel & Lodging',      icon: '🏨', characterEmoji: '🛎️', characterRole: 'Concierge & Receptionist', accentClass: 'teal',    badgeBg: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300', description: 'Check in, ask for help, and settle in' },
  { id: 'shopping',     name: 'Shopping',             icon: '🛍️', characterEmoji: '🏪', characterRole: 'Boutique Merchant', accentClass: 'pink',    badgeBg: 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300', description: 'Prices, bargaining, and what you need' },
  { id: 'beach',        name: 'Beach & Leisure',      icon: '🏖️', characterEmoji: '🏄', characterRole: 'Beach Lifeguard', accentClass: 'cyan',    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300', description: 'Relaxation, sports, and outdoor activities' },
  { id: 'family',       name: 'Family',               icon: '👨‍👩‍👧', characterEmoji: '🏡', characterRole: 'Family Member', accentClass: 'rose',    badgeBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300', description: 'Talk about people close to you' },
  { id: 'feelings',     name: 'Feelings',             icon: '😊', characterEmoji: '🎭', characterRole: 'Expressive Actor', accentClass: 'violet',  badgeBg: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300', description: 'Express how you feel authentically' },
  { id: 'learning',     name: 'Learning',             icon: '📖', characterEmoji: '🧑‍🏫', characterRole: 'Language Sensei', accentClass: 'slate',   badgeBg: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200', description: 'Ask for help understanding the language' },
  { id: 'numbers',      name: 'Numbers & Colors',     icon: '🔢', characterEmoji: '🎨', characterRole: 'Market Counter', accentClass: 'green',   badgeBg: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300', description: 'Count, describe, and quantify' },
  { id: 'emergency',    name: 'Emergencies',          icon: '🚨', characterEmoji: '🚑', characterRole: 'Emergency Responder', accentClass: 'red',     badgeBg: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300', description: 'Stay safe and get help when it matters' },
];

// ─────────────────────────── SPANISH ─────────────────────────────
const ES_PHRASES: Omit<Phrase, 'langId'>[] = [
  // essentials
  { id:'es-ess-1',  categoryId:'essentials',   native:'Sí',                            phonetic:'[si]',                            translation:'Yes',                                           difficulty:'easy' },
  { id:'es-ess-2',  categoryId:'essentials',   native:'No',                            phonetic:'[no]',                            translation:'No',                                            difficulty:'easy' },
  { id:'es-ess-3',  categoryId:'essentials',   native:'Por favor',                     phonetic:'[poɾ faˈβoɾ]',                   translation:'Please',                                        difficulty:'easy' },
  { id:'es-ess-4',  categoryId:'essentials',   native:'Gracias',                       phonetic:'[ˈɡɾa.θjas]',                    translation:'Thank you',                                     difficulty:'easy' },
  { id:'es-ess-5',  categoryId:'essentials',   native:'De nada',                       phonetic:'[de ˈnaða]',                     translation:'You\'re welcome',                               difficulty:'easy' },
  { id:'es-ess-6',  categoryId:'essentials',   native:'Perdón',                        phonetic:'[peɾˈðon]',                      translation:'Excuse me / Sorry',                             difficulty:'easy' },
  { id:'es-ess-7',  categoryId:'essentials',   native:'No entiendo',                   phonetic:'[no enˈtjen.do]',                translation:'I don\'t understand',                           difficulty:'easy' },
  { id:'es-ess-8',  categoryId:'essentials',   native:'¿Puede repetir, por favor?',    phonetic:'[ˈpwe.ðe re.pe.ˈtiɾ]',          translation:'Can you repeat that, please?',                  difficulty:'medium' },
  { id:'es-ess-9',  categoryId:'essentials',   native:'No hablo bien español',         phonetic:'[no ˈa.βlo ˈbjen esˈpa.ɲol]',   translation:'I don\'t speak Spanish well',                   difficulty:'medium' },
  { id:'es-ess-10', categoryId:'essentials',   native:'¿Habla usted inglés?',          phonetic:'[ˈa.βla usˈteð iŋˈgles]',       translation:'Do you speak English?',                         difficulty:'medium' },
  { id:'es-ess-11', categoryId:'essentials',   native:'¿Dónde está el baño?',         phonetic:'[ˈdon.de esˈta el ˈba.ɲo]',     translation:'Where is the bathroom?',                        difficulty:'medium' },
  { id:'es-ess-12', categoryId:'essentials',   native:'¿Cuánto cuesta?',              phonetic:'[ˈkwan.to ˈkwes.ta]',           translation:'How much does it cost?',                        difficulty:'easy' },
  { id:'es-ess-13', categoryId:'essentials',   native:'Necesito ayuda',               phonetic:'[ne.θe.ˈsi.to aˈju.ða]',        translation:'I need help',                                   difficulty:'easy' },
  { id:'es-ess-14', categoryId:'essentials',   native:'¿Dónde está...?',             phonetic:'[ˈdon.de esˈta]',               translation:'Where is...?',                                  difficulty:'easy' },
  { id:'es-ess-15', categoryId:'essentials',   native:'Está bien',                    phonetic:'[esˈta ˈβjen]',                  translation:'It\'s okay / That\'s fine',                     difficulty:'easy' },
  // greetings
  { id:'es-greet-1',  categoryId:'greetings',  native:'Hola',                          phonetic:'[ˈo.la]',                        translation:'Hello / Hi',                                    difficulty:'easy' },
  { id:'es-greet-2',  categoryId:'greetings',  native:'Buenos días',                   phonetic:'[ˈbwe.nos ˈði.as]',              translation:'Good morning',                                  difficulty:'easy' },
  { id:'es-greet-3',  categoryId:'greetings',  native:'Buenas tardes',                 phonetic:'[ˈbwe.nas ˈtaɾ.ðes]',           translation:'Good afternoon',                                difficulty:'easy' },
  { id:'es-greet-4',  categoryId:'greetings',  native:'Buenas noches',                 phonetic:'[ˈbwe.nas ˈno.tʃes]',           translation:'Good evening / Goodnight',                      difficulty:'easy' },
  { id:'es-greet-5',  categoryId:'greetings',  native:'¿Cómo estás?',                 phonetic:'[ˈko.mo esˈtas]',               translation:'How are you? (informal)',                        difficulty:'easy' },
  { id:'es-greet-6',  categoryId:'greetings',  native:'Mucho gusto',                   phonetic:'[ˈmu.tʃo ˈɣus.to]',             translation:'Nice to meet you',                              difficulty:'easy' },
  { id:'es-greet-7',  categoryId:'greetings',  native:'Me llamo...',                   phonetic:'[me ˈja.mo]',                    translation:'My name is...',                                 difficulty:'easy' },
  { id:'es-greet-8',  categoryId:'greetings',  native:'Hasta luego',                   phonetic:'[ˈas.ta ˈlwe.ɣo]',              translation:'See you later / Goodbye',                       difficulty:'easy' },
  { id:'es-greet-9',  categoryId:'greetings',  native:'Hasta mañana',                  phonetic:'[ˈas.ta maˈɲa.na]',             translation:'See you tomorrow',                              difficulty:'easy' },
  { id:'es-greet-10', categoryId:'greetings',  native:'¡Bienvenido!',                 phonetic:'[bjen.beˈni.ðo]',               translation:'Welcome!',                                      difficulty:'easy' },
  // restaurant
  { id:'es-rest-1',  categoryId:'restaurant',  native:'Una mesa para dos, por favor',  phonetic:'[ˈu.na ˈme.sa ˈpa.ɾa dos]',     translation:'A table for two, please',                       difficulty:'medium' },
  { id:'es-rest-2',  categoryId:'restaurant',  native:'¿Me puede traer la carta?',    phonetic:'[me ˈpwe.ðe tɾaˈeɾ la ˈkaɾ.ta]', translation:'Can you bring me the menu?',                    difficulty:'medium' },
  { id:'es-rest-3',  categoryId:'restaurant',  native:'Quiero pedir...',              phonetic:'[ˈkje.ɾo peˈðiɾ]',             translation:'I would like to order...',                      difficulty:'easy' },
  { id:'es-rest-4',  categoryId:'restaurant',  native:'La cuenta, por favor',         phonetic:'[la ˈkwen.ta poɾ faˈβoɾ]',      translation:'The bill, please',                              difficulty:'easy' },
  { id:'es-rest-5',  categoryId:'restaurant',  native:'Soy alérgico/a a...',          phonetic:'[soi̯ aˈleɾ.xi.ko]',            translation:'I am allergic to...',                           difficulty:'medium' },
  { id:'es-rest-6',  categoryId:'restaurant',  native:'¿Qué recomienda?',            phonetic:'[ke re.ko.ˈmjen.da]',           translation:'What do you recommend?',                        difficulty:'easy' },
  { id:'es-rest-7',  categoryId:'restaurant',  native:'Está delicioso',               phonetic:'[esˈta de.liˈθjo.so]',          translation:'It\'s delicious',                               difficulty:'easy' },
  { id:'es-rest-8',  categoryId:'restaurant',  native:'Un vaso de agua, por favor',   phonetic:'[un ˈba.so ðe ˈa.ɣwa]',         translation:'A glass of water, please',                      difficulty:'easy' },
  { id:'es-rest-9',  categoryId:'restaurant',  native:'Somos vegetarianos',           phonetic:'[ˈso.mos βe.xe.taˈɾja.nos]',   translation:'We are vegetarians',                            difficulty:'medium' },
  { id:'es-rest-10', categoryId:'restaurant',  native:'¿Está incluido el servicio?',  phonetic:'[esˈta in.klwi.ðo el seɾˈβi.θjo]', translation:'Is service included?',                      difficulty:'hard' },
  // transport
  { id:'es-trans-1',  categoryId:'transport',  native:'¿Dónde está la estación de metro?', phonetic:'[ˈdon.de esˈta la es.taˈθjon]', translation:'Where is the metro station?',              difficulty:'medium' },
  { id:'es-trans-2',  categoryId:'transport',  native:'Un billete a..., por favor',   phonetic:'[un biˈje.te a]',               translation:'A ticket to..., please',                        difficulty:'easy' },
  { id:'es-trans-3',  categoryId:'transport',  native:'¿A qué hora sale el tren?',   phonetic:'[a ke ˈo.ɾa ˈsa.le el tɾen]',  translation:'What time does the train leave?',               difficulty:'medium' },
  { id:'es-trans-4',  categoryId:'transport',  native:'¿Está lejos de aquí?',        phonetic:'[esˈta ˈle.xos ðe aˈki]',      translation:'Is it far from here?',                          difficulty:'medium' },
  { id:'es-trans-5',  categoryId:'transport',  native:'Lléveme al aeropuerto',        phonetic:'[ˈje.βe.me al ae.ɾoˈpweɾ.to]', translation:'Take me to the airport',                        difficulty:'medium' },
  { id:'es-trans-6',  categoryId:'transport',  native:'Gire a la derecha / izquierda', phonetic:'[ˈxi.ɾe a la ðeˈɾe.tʃa]',   translation:'Turn right / left',                             difficulty:'easy' },
  { id:'es-trans-7',  categoryId:'transport',  native:'Todo recto',                   phonetic:'[ˈto.ðo ˈɾek.to]',              translation:'Straight ahead',                                difficulty:'easy' },
  { id:'es-trans-8',  categoryId:'transport',  native:'¿Cuánto tarda?',              phonetic:'[ˈkwan.to ˈtaɾ.ða]',           translation:'How long does it take?',                        difficulty:'easy' },
  // hotel
  { id:'es-hotel-1',  categoryId:'hotel',      native:'Tengo una reserva',            phonetic:'[ˈteŋ.go ˈu.na re.ˈseɾ.βa]',   translation:'I have a reservation',                          difficulty:'easy' },
  { id:'es-hotel-2',  categoryId:'hotel',      native:'¿Tiene habitaciones libres?',  phonetic:'[ˈtje.ne a.βi.taˈθjo.nes ˈli.βɾes]', translation:'Do you have any free rooms?',           difficulty:'hard' },
  { id:'es-hotel-3',  categoryId:'hotel',      native:'¿A qué hora es el desayuno?', phonetic:'[a ke ˈo.ɾa es el de.saˈju.no]', translation:'What time is breakfast?',                     difficulty:'medium' },
  { id:'es-hotel-4',  categoryId:'hotel',      native:'Quisiera hacer el check-out', phonetic:'[kiˈsje.ɾa aˈθeɾ el tʃek.ˈaut]', translation:'I\'d like to check out',                     difficulty:'medium' },
  { id:'es-hotel-5',  categoryId:'hotel',      native:'¿Hay wifi aquí?',             phonetic:'[ai̯ ˈwi.fi aˈki]',             translation:'Is there wifi here?',                           difficulty:'easy' },
  // shopping
  { id:'es-shop-1',  categoryId:'shopping',    native:'¿Cuánto cuesta esto?',        phonetic:'[ˈkwan.to ˈkwes.ta ˈes.to]',   translation:'How much does this cost?',                      difficulty:'easy' },
  { id:'es-shop-2',  categoryId:'shopping',    native:'¿Tiene una talla más grande?', phonetic:'[ˈtje.ne ˈu.na ˈta.ja mas ˈɣɾan.de]', translation:'Do you have a bigger size?',          difficulty:'hard' },
  { id:'es-shop-3',  categoryId:'shopping',    native:'Solo estoy mirando',           phonetic:'[ˈso.lo esˈtoi̯ miˈɾan.do]',    translation:'I\'m just browsing',                            difficulty:'medium' },
  { id:'es-shop-4',  categoryId:'shopping',    native:'¿Puedo probármelo?',          phonetic:'[ˈpwe.ðo pro.ˈβaɾ.me.lo]',    translation:'Can I try it on?',                              difficulty:'medium' },
  { id:'es-shop-5',  categoryId:'shopping',    native:'Me lo llevo',                 phonetic:'[me lo ˈje.βo]',               translation:'I\'ll take it',                                 difficulty:'easy' },
  // emergency
  { id:'es-emerg-1', categoryId:'emergency',   native:'¡Ayuda!',                     phonetic:'[aˈju.ða]',                     translation:'Help!',                                         difficulty:'easy' },
  { id:'es-emerg-2', categoryId:'emergency',   native:'Llame a la policía',          phonetic:'[ˈja.me a la po.liˈθi.a]',     translation:'Call the police',                               difficulty:'medium' },
  { id:'es-emerg-3', categoryId:'emergency',   native:'Llame a una ambulancia',      phonetic:'[ˈja.me a ˈu.na am.buˈlan.θja]', translation:'Call an ambulance',                           difficulty:'medium' },
  { id:'es-emerg-4', categoryId:'emergency',   native:'Me han robado',               phonetic:'[me an ro.ˈβa.ðo]',            translation:'I\'ve been robbed',                             difficulty:'medium' },
  { id:'es-emerg-5', categoryId:'emergency',   native:'Necesito un médico',          phonetic:'[ne.θe.ˈsi.to un ˈme.ði.ko]',  translation:'I need a doctor',                               difficulty:'easy' },
  // conversation
  { id:'es-conv-1',  categoryId:'conversation',native:'¿De dónde eres?',            phonetic:'[de ˈdon.de ˈe.ɾes]',          translation:'Where are you from?',                           difficulty:'easy' },
  { id:'es-conv-2',  categoryId:'conversation',native:'Soy de...',                   phonetic:'[soi̯ ðe]',                     translation:'I am from...',                                  difficulty:'easy' },
  { id:'es-conv-3',  categoryId:'conversation',native:'¿Cuántos años tienes?',       phonetic:'[ˈkwan.tos ˈa.ɲos ˈtje.nes]',  translation:'How old are you?',                              difficulty:'easy' },
  { id:'es-conv-4',  categoryId:'conversation',native:'¿A qué te dedicas?',         phonetic:'[a ke te ðeˈði.kas]',          translation:'What do you do for work?',                      difficulty:'medium' },
  { id:'es-conv-5',  categoryId:'conversation',native:'¿Puedes hablar más despacio?', phonetic:'[ˈpwe.ðes aˈβlaɾ mas desˈpa.θjo]', translation:'Can you speak more slowly?',              difficulty:'medium' },
];

// ─────────────────────────── FRENCH ─────────────────────────────
const FR_PHRASES: Omit<Phrase, 'langId'>[] = [
  { id:'fr-ess-1',  categoryId:'essentials',   native:'Oui',                           phonetic:'[wi]',                           translation:'Yes',                                           difficulty:'easy' },
  { id:'fr-ess-2',  categoryId:'essentials',   native:'Non',                           phonetic:'[nɔ̃]',                          translation:'No',                                            difficulty:'easy' },
  { id:'fr-ess-3',  categoryId:'essentials',   native:'S\'il vous plaît',             phonetic:'[sil vu plɛ]',                   translation:'Please (formal)',                                difficulty:'easy' },
  { id:'fr-ess-4',  categoryId:'essentials',   native:'Merci beaucoup',               phonetic:'[mɛʁ.si bo.ku]',                translation:'Thank you very much',                           difficulty:'easy' },
  { id:'fr-ess-5',  categoryId:'essentials',   native:'Je ne comprends pas',          phonetic:'[ʒə nə kɔ̃.pʁɑ̃ pɑ]',           translation:'I don\'t understand',                           difficulty:'medium' },
  { id:'fr-ess-6',  categoryId:'essentials',   native:'Parlez-vous anglais ?',        phonetic:'[paʁ.le vu ɑ̃.glɛ]',            translation:'Do you speak English?',                         difficulty:'medium' },
  { id:'fr-ess-7',  categoryId:'essentials',   native:'Où sont les toilettes ?',      phonetic:'[u sɔ̃ le twa.lɛt]',            translation:'Where are the bathrooms?',                      difficulty:'medium' },
  { id:'fr-ess-8',  categoryId:'essentials',   native:'Combien ça coûte ?',           phonetic:'[kɔ̃.bjɛ̃ sa kut]',              translation:'How much does it cost?',                        difficulty:'easy' },
  { id:'fr-ess-9',  categoryId:'essentials',   native:'Excusez-moi',                  phonetic:'[ɛks.ky.ze mwa]',               translation:'Excuse me',                                     difficulty:'easy' },
  { id:'fr-ess-10', categoryId:'essentials',   native:'J\'ai besoin d\'aide',         phonetic:'[ʒe bə.zwɛ̃ dɛd]',             translation:'I need help',                                   difficulty:'medium' },
  { id:'fr-greet-1', categoryId:'greetings',   native:'Bonjour',                      phonetic:'[bɔ̃.ʒuʁ]',                     translation:'Hello / Good day',                              difficulty:'easy' },
  { id:'fr-greet-2', categoryId:'greetings',   native:'Bonsoir',                      phonetic:'[bɔ̃.swaʁ]',                    translation:'Good evening',                                  difficulty:'easy' },
  { id:'fr-greet-3', categoryId:'greetings',   native:'Comment allez-vous ?',         phonetic:'[kɔ.mɑ̃ ta.le vu]',            translation:'How are you? (formal)',                          difficulty:'medium' },
  { id:'fr-greet-4', categoryId:'greetings',   native:'Enchanté(e)',                  phonetic:'[ɑ̃.ʃɑ̃.te]',                   translation:'Nice to meet you',                              difficulty:'easy' },
  { id:'fr-greet-5', categoryId:'greetings',   native:'Au revoir',                    phonetic:'[o ʁə.vwaʁ]',                   translation:'Goodbye',                                       difficulty:'easy' },
  { id:'fr-rest-1',  categoryId:'restaurant',  native:'L\'addition, s\'il vous plaît', phonetic:'[la.di.sjɔ̃ sil vu plɛ]',     translation:'The bill, please',                              difficulty:'medium' },
  { id:'fr-rest-2',  categoryId:'restaurant',  native:'Une table pour deux',          phonetic:'[yn tabl puʁ dø]',              translation:'A table for two',                               difficulty:'easy' },
  { id:'fr-rest-3',  categoryId:'restaurant',  native:'Je voudrais...',               phonetic:'[ʒə vu.dʁɛ]',                  translation:'I would like...',                               difficulty:'easy' },
  { id:'fr-rest-4',  categoryId:'restaurant',  native:'C\'est délicieux',            phonetic:'[sɛ de.li.sjø]',               translation:'It\'s delicious',                               difficulty:'easy' },
  { id:'fr-rest-5',  categoryId:'restaurant',  native:'Je suis végétarien(ne)',       phonetic:'[ʒə sɥi ve.ʒe.ta.ʁjɛ̃]',       translation:'I am vegetarian',                               difficulty:'medium' },
  { id:'fr-trans-1', categoryId:'transport',   native:'Où est la gare ?',            phonetic:'[u ɛ la gaʁ]',                 translation:'Where is the train station?',                   difficulty:'easy' },
  { id:'fr-trans-2', categoryId:'transport',   native:'Un billet pour..., s\'il vous plaît', phonetic:'[œ̃ bi.jɛ puʁ]',       translation:'A ticket to..., please',                        difficulty:'medium' },
  { id:'fr-trans-3', categoryId:'transport',   native:'À quelle heure part le train ?', phonetic:'[a kɛl œʁ paʁ lə tʁɛ̃]',   translation:'What time does the train leave?',               difficulty:'hard' },
  { id:'fr-hotel-1', categoryId:'hotel',       native:'J\'ai une réservation',        phonetic:'[ʒe yn ʁe.zɛʁ.va.sjɔ̃]',      translation:'I have a reservation',                          difficulty:'medium' },
  { id:'fr-hotel-2', categoryId:'hotel',       native:'Y a-t-il du wifi ?',           phonetic:'[i a til dy wi.fi]',            translation:'Is there wifi?',                                difficulty:'easy' },
  { id:'fr-emerg-1', categoryId:'emergency',   native:'Au secours !',                 phonetic:'[o sə.kuʁ]',                   translation:'Help!',                                         difficulty:'easy' },
  { id:'fr-emerg-2', categoryId:'emergency',   native:'Appelez la police',            phonetic:'[a.ple la pɔ.lis]',            translation:'Call the police',                               difficulty:'medium' },
  { id:'fr-emerg-3', categoryId:'emergency',   native:'J\'ai besoin d\'un médecin',  phonetic:'[ʒe bə.zwɛ̃ dœ̃ me.d.sɛ̃]',    translation:'I need a doctor',                               difficulty:'medium' },
];

// ─────────────────────────── GERMAN ─────────────────────────────
const DE_PHRASES: Omit<Phrase, 'langId'>[] = [
  { id:'de-ess-1',  categoryId:'essentials',   native:'Ja',                            phonetic:'[jaː]',                          translation:'Yes',                                           difficulty:'easy' },
  { id:'de-ess-2',  categoryId:'essentials',   native:'Nein',                          phonetic:'[naɪ̯n]',                        translation:'No',                                            difficulty:'easy' },
  { id:'de-ess-3',  categoryId:'essentials',   native:'Bitte',                         phonetic:'[ˈbɪ.tə]',                      translation:'Please / You\'re welcome',                      difficulty:'easy' },
  { id:'de-ess-4',  categoryId:'essentials',   native:'Danke schön',                   phonetic:'[ˈdaŋ.kə ʃøːn]',               translation:'Thank you very much',                           difficulty:'easy' },
  { id:'de-ess-5',  categoryId:'essentials',   native:'Ich verstehe nicht',            phonetic:'[ɪç fɛɐ̯ˈʃteː.ə nɪçt]',         translation:'I don\'t understand',                           difficulty:'medium' },
  { id:'de-ess-6',  categoryId:'essentials',   native:'Sprechen Sie Englisch?',        phonetic:'[ˈʃpʁɛ.çən ziː ˈɛŋ.lɪʃ]',      translation:'Do you speak English?',                         difficulty:'medium' },
  { id:'de-ess-7',  categoryId:'essentials',   native:'Wo ist die Toilette?',          phonetic:'[voː ɪst diː tɔɪ̯ˈlɛ.tə]',      translation:'Where is the bathroom?',                        difficulty:'medium' },
  { id:'de-ess-8',  categoryId:'essentials',   native:'Was kostet das?',               phonetic:'[vas ˈkɔs.tət das]',            translation:'How much does that cost?',                      difficulty:'easy' },
  { id:'de-ess-9',  categoryId:'essentials',   native:'Entschuldigung',                phonetic:'[ɛntˈʃʊl.dɪ.gʊŋ]',             translation:'Excuse me / Sorry',                             difficulty:'medium' },
  { id:'de-ess-10', categoryId:'essentials',   native:'Ich brauche Hilfe',             phonetic:'[ɪç ˈbʁaʊ̯.xə ˈhɪl.fə]',       translation:'I need help',                                   difficulty:'easy' },
  { id:'de-greet-1', categoryId:'greetings',   native:'Guten Morgen',                  phonetic:'[ˈɡuː.tən ˈmɔʁ.ɡən]',          translation:'Good morning',                                  difficulty:'easy' },
  { id:'de-greet-2', categoryId:'greetings',   native:'Guten Tag',                     phonetic:'[ˈɡuː.tən taːk]',               translation:'Good day',                                      difficulty:'easy' },
  { id:'de-greet-3', categoryId:'greetings',   native:'Auf Wiedersehen',               phonetic:'[aʊ̯f ˈviː.dɐ.zeː.ən]',         translation:'Goodbye',                                       difficulty:'medium' },
  { id:'de-greet-4', categoryId:'greetings',   native:'Freut mich',                    phonetic:'[fʁɔɪ̯t mɪç]',                  translation:'Nice to meet you',                              difficulty:'easy' },
  { id:'de-greet-5', categoryId:'greetings',   native:'Wie heißen Sie?',               phonetic:'[viː ˈhaɪ̯.sən ziː]',           translation:'What is your name? (formal)',                   difficulty:'medium' },
  { id:'de-rest-1',  categoryId:'restaurant',  native:'Die Speisekarte, bitte',        phonetic:'[diː ˈʃpaɪ̯.zə.kaʁ.tə ˈbɪ.tə]', translation:'The menu, please',                            difficulty:'medium' },
  { id:'de-rest-2',  categoryId:'restaurant',  native:'Zahlen bitte',                  phonetic:'[ˈt͡saː.lən ˈbɪ.tə]',           translation:'The bill please',                               difficulty:'easy' },
  { id:'de-rest-3',  categoryId:'restaurant',  native:'Ich möchte bestellen',          phonetic:'[ɪç ˈmœç.tə bəˈʃtɛ.lən]',     translation:'I would like to order',                         difficulty:'medium' },
  { id:'de-rest-4',  categoryId:'restaurant',  native:'Das schmeckt köstlich',         phonetic:'[das ʃmɛkt ˈkœst.lɪç]',        translation:'That tastes delicious',                         difficulty:'medium' },
  { id:'de-trans-1', categoryId:'transport',   native:'Wo ist der Bahnhof?',           phonetic:'[voː ɪst deːɐ̯ ˈbaːn.hoːf]',   translation:'Where is the train station?',                   difficulty:'medium' },
  { id:'de-trans-2', categoryId:'transport',   native:'Eine Fahrkarte nach..., bitte', phonetic:'[ˈaɪ̯.nə ˈfaːɐ̯.kaʁ.tə naːx]', translation:'A ticket to..., please',                       difficulty:'medium' },
  { id:'de-hotel-1', categoryId:'hotel',       native:'Ich habe eine Reservierung',    phonetic:'[ɪç ˈhaː.bə ˈaɪ̯.nə ʁe.zɛʁˈviː.ʁʊŋ]', translation:'I have a reservation',                 difficulty:'hard' },
  { id:'de-hotel-2', categoryId:'hotel',       native:'Gibt es WLAN?',                 phonetic:'[ɡɪpt ɛs veː.laː.ˈʔɛn]',       translation:'Is there wifi?',                                difficulty:'easy' },
  { id:'de-emerg-1', categoryId:'emergency',   native:'Hilfe!',                        phonetic:'[ˈhɪl.fə]',                     translation:'Help!',                                         difficulty:'easy' },
  { id:'de-emerg-2', categoryId:'emergency',   native:'Rufen Sie die Polizei',         phonetic:'[ˈʁuː.fən ziː diː po.liˈt͡saɪ̯]', translation:'Call the police',                            difficulty:'hard' },
  { id:'de-emerg-3', categoryId:'emergency',   native:'Ich brauche einen Arzt',        phonetic:'[ɪç ˈbʁaʊ̯.xə ˈaɪ̯.nən aʁt͡st]', translation:'I need a doctor',                            difficulty:'medium' },
];

// ─────────────────────────── JAPANESE ─────────────────────────────
const JA_PHRASES: Omit<Phrase, 'langId'>[] = [
  { id:'ja-ess-1',  categoryId:'essentials',   native:'はい',                          phonetic:'[hai]',                          translation:'Yes',                                           difficulty:'easy' },
  { id:'ja-ess-2',  categoryId:'essentials',   native:'いいえ',                        phonetic:'[i.i.e]',                        translation:'No',                                            difficulty:'easy' },
  { id:'ja-ess-3',  categoryId:'essentials',   native:'お願いします',                 phonetic:'[o.ne.gai shi.ma.su]',           translation:'Please',                                        difficulty:'medium' },
  { id:'ja-ess-4',  categoryId:'essentials',   native:'ありがとうございます',          phonetic:'[a.ri.ga.tō go.za.i.ma.su]',    translation:'Thank you very much',                           difficulty:'medium' },
  { id:'ja-ess-5',  categoryId:'essentials',   native:'わかりません',                 phonetic:'[wa.ka.ri.ma.sen]',             translation:'I don\'t understand',                           difficulty:'medium' },
  { id:'ja-ess-6',  categoryId:'essentials',   native:'英語が話せますか？',           phonetic:'[ei.go ga ha.na.se.ma.su ka]',  translation:'Do you speak English?',                         difficulty:'hard' },
  { id:'ja-ess-7',  categoryId:'essentials',   native:'トイレはどこですか？',         phonetic:'[to.i.re wa do.ko de.su ka]',   translation:'Where is the bathroom?',                        difficulty:'medium' },
  { id:'ja-ess-8',  categoryId:'essentials',   native:'いくらですか？',               phonetic:'[i.ku.ra de.su ka]',            translation:'How much is it?',                               difficulty:'easy' },
  { id:'ja-ess-9',  categoryId:'essentials',   native:'すみません',                   phonetic:'[su.mi.ma.sen]',                translation:'Excuse me / Sorry',                             difficulty:'easy' },
  { id:'ja-ess-10', categoryId:'essentials',   native:'助けてください',               phonetic:'[ta.su.ke.te ku.da.sai]',       translation:'Please help me',                                difficulty:'medium' },
  { id:'ja-greet-1', categoryId:'greetings',   native:'こんにちは',                   phonetic:'[kon.ni.chi.wa]',               translation:'Hello (daytime greeting)',                       difficulty:'easy' },
  { id:'ja-greet-2', categoryId:'greetings',   native:'おはようございます',           phonetic:'[o.ha.yō go.za.i.ma.su]',      translation:'Good morning',                                  difficulty:'medium' },
  { id:'ja-greet-3', categoryId:'greetings',   native:'こんばんは',                   phonetic:'[kon.ban.wa]',                  translation:'Good evening',                                  difficulty:'easy' },
  { id:'ja-greet-4', categoryId:'greetings',   native:'はじめまして',                 phonetic:'[ha.ji.me.ma.shi.te]',         translation:'Nice to meet you',                              difficulty:'medium' },
  { id:'ja-greet-5', categoryId:'greetings',   native:'さようなら',                   phonetic:'[sa.yō.na.ra]',                 translation:'Goodbye',                                       difficulty:'easy' },
  { id:'ja-rest-1',  categoryId:'restaurant',  native:'メニューをください',           phonetic:'[me.nyū o ku.da.sai]',          translation:'Please give me the menu',                       difficulty:'medium' },
  { id:'ja-rest-2',  categoryId:'restaurant',  native:'お会計をお願いします',         phonetic:'[o.kai.kei o o.ne.gai.shi.ma.su]', translation:'The bill please',                          difficulty:'hard' },
  { id:'ja-rest-3',  categoryId:'restaurant',  native:'これをください',               phonetic:'[ko.re o ku.da.sai]',           translation:'I\'ll have this one',                           difficulty:'easy' },
  { id:'ja-rest-4',  categoryId:'restaurant',  native:'おいしいです',                 phonetic:'[o.i.shi.i de.su]',             translation:'It\'s delicious',                               difficulty:'easy' },
  { id:'ja-trans-1', categoryId:'transport',   native:'駅はどこですか？',             phonetic:'[e.ki wa do.ko de.su ka]',      translation:'Where is the train station?',                   difficulty:'medium' },
  { id:'ja-trans-2', categoryId:'transport',   native:'〜行きの切符を一枚ください',  phonetic:'[yuki no ki.ppu o i.chi.mai ku.da.sai]', translation:'One ticket to..., please',             difficulty:'hard' },
  { id:'ja-hotel-1', categoryId:'hotel',       native:'予約があります',               phonetic:'[yo.ya.ku ga a.ri.ma.su]',      translation:'I have a reservation',                          difficulty:'medium' },
  { id:'ja-hotel-2', categoryId:'hotel',       native:'Wi-Fiはありますか？',          phonetic:'[wai.fai wa a.ri.ma.su ka]',   translation:'Is there Wi-Fi?',                               difficulty:'easy' },
  { id:'ja-emerg-1', categoryId:'emergency',   native:'助けて！',                     phonetic:'[ta.su.ke.te]',                 translation:'Help!',                                         difficulty:'easy' },
  { id:'ja-emerg-2', categoryId:'emergency',   native:'警察を呼んでください',         phonetic:'[kei.sa.tsu o yon.de ku.da.sai]', translation:'Please call the police',                     difficulty:'hard' },
];

// ─────────────────────────── ARABIC ─────────────────────────────
const AR_PHRASES: Omit<Phrase, 'langId'>[] = [
  { id:'ar-ess-1',  categoryId:'essentials',   native:'نعم',                           phonetic:'[naʕam]',                        translation:'Yes',                                           difficulty:'easy' },
  { id:'ar-ess-2',  categoryId:'essentials',   native:'لا',                            phonetic:'[laː]',                          translation:'No',                                            difficulty:'easy' },
  { id:'ar-ess-3',  categoryId:'essentials',   native:'من فضلك',                      phonetic:'[min fad.lak]',                  translation:'Please',                                        difficulty:'easy' },
  { id:'ar-ess-4',  categoryId:'essentials',   native:'شكراً جزيلاً',                phonetic:'[ʃuk.ran d͡ʒa.ziː.lan]',         translation:'Thank you very much',                           difficulty:'easy' },
  { id:'ar-ess-5',  categoryId:'essentials',   native:'لا أفهم',                     phonetic:'[laː ʔaf.ham]',                  translation:'I don\'t understand',                           difficulty:'medium' },
  { id:'ar-ess-6',  categoryId:'essentials',   native:'هل تتحدث الإنجليزية؟',       phonetic:'[hal ta.ta.ħad.daθ al.ʔin.d͡ʒliː.zij.ja]', translation:'Do you speak English?',            difficulty:'hard' },
  { id:'ar-ess-7',  categoryId:'essentials',   native:'أين الحمام؟',                 phonetic:'[ʔajna al.ħam.maːm]',           translation:'Where is the bathroom?',                        difficulty:'medium' },
  { id:'ar-ess-8',  categoryId:'essentials',   native:'بكم هذا؟',                    phonetic:'[bi.kam haː.ðaː]',              translation:'How much is this?',                             difficulty:'easy' },
  { id:'ar-ess-9',  categoryId:'essentials',   native:'عفواً',                       phonetic:'[ʕaf.wan]',                      translation:'Excuse me / Sorry',                             difficulty:'easy' },
  { id:'ar-ess-10', categoryId:'essentials',   native:'أحتاج مساعدة',               phonetic:'[ʔaħ.taːd͡ʒ mu.saː.ʕa.da]',     translation:'I need help',                                   difficulty:'medium' },
  { id:'ar-greet-1', categoryId:'greetings',   native:'السلام عليكم',               phonetic:'[as.sa.laː.mu ʕa.laj.kum]',     translation:'Peace be upon you (greeting)',                   difficulty:'medium' },
  { id:'ar-greet-2', categoryId:'greetings',   native:'صباح الخير',                 phonetic:'[sˤa.baːħ al.χajr]',            translation:'Good morning',                                  difficulty:'easy' },
  { id:'ar-greet-3', categoryId:'greetings',   native:'مساء الخير',                 phonetic:'[ma.saːʔ al.χajr]',             translation:'Good evening',                                  difficulty:'easy' },
  { id:'ar-greet-4', categoryId:'greetings',   native:'أهلاً وسهلاً',              phonetic:'[ʔah.lan wa.sah.lan]',          translation:'Welcome / Hello',                               difficulty:'easy' },
  { id:'ar-greet-5', categoryId:'greetings',   native:'مع السلامة',                 phonetic:'[maʕ as.sa.laː.ma]',            translation:'Goodbye',                                       difficulty:'medium' },
  { id:'ar-rest-1',  categoryId:'restaurant',  native:'الحساب من فضلك',             phonetic:'[al.ħi.saːb min fad.lak]',      translation:'The bill, please',                              difficulty:'medium' },
  { id:'ar-rest-2',  categoryId:'restaurant',  native:'أريد أن أطلب...',           phonetic:'[ʔu.riːd ʔan ʔat.lub]',         translation:'I would like to order...',                      difficulty:'medium' },
  { id:'ar-rest-3',  categoryId:'restaurant',  native:'هذا لذيذ',                   phonetic:'[haː.ðaː la.ðiːð]',             translation:'This is delicious',                             difficulty:'easy' },
  { id:'ar-hotel-1', categoryId:'hotel',       native:'عندي حجز',                   phonetic:'[ʕin.diː ħad͡ʒz]',              translation:'I have a reservation',                          difficulty:'easy' },
  { id:'ar-hotel-2', categoryId:'hotel',       native:'هل يوجد واي فاي؟',          phonetic:'[hal ju.d͡ʒad waː.i faː.i]',    translation:'Is there Wi-Fi?',                               difficulty:'easy' },
  { id:'ar-emerg-1', categoryId:'emergency',   native:'النجدة!',                    phonetic:'[an.nad͡ʒ.da]',                  translation:'Help!',                                         difficulty:'easy' },
  { id:'ar-emerg-2', categoryId:'emergency',   native:'اتصل بالشرطة',              phonetic:'[it.ta.sˤil biʃ.ʃur.tˤa]',     translation:'Call the police',                               difficulty:'medium' },
  { id:'ar-emerg-3', categoryId:'emergency',   native:'أحتاج طبيباً',              phonetic:'[ʔaħ.taːd͡ʒ tˤa.biː.ban]',      translation:'I need a doctor',                               difficulty:'medium' },
];

// ─────────────────────────── TAMIL ─────────────────────────────
const TA_PHRASES: Omit<Phrase, 'langId'>[] = [
  { id:'ta-ess-1',  categoryId:'essentials',   native:'ஆம்',                           phonetic:'[aːm]',                          translation:'Yes',                                           difficulty:'easy' },
  { id:'ta-ess-2',  categoryId:'essentials',   native:'இல்லை',                        phonetic:'[il.lai]',                       translation:'No',                                            difficulty:'easy' },
  { id:'ta-ess-3',  categoryId:'essentials',   native:'தயவுசெய்து',                   phonetic:'[d̪a.ya.vu.sej.d̪u]',           translation:'Please',                                        difficulty:'medium' },
  { id:'ta-ess-4',  categoryId:'essentials',   native:'மிக்க நன்றி',                  phonetic:'[mik.ka nan.ri]',               translation:'Thank you very much',                           difficulty:'easy' },
  { id:'ta-ess-5',  categoryId:'essentials',   native:'எனக்கு புரியவில்லை',           phonetic:'[e.nak.ku pu.ri.ya.vil.lai]',   translation:'I don\'t understand',                           difficulty:'hard' },
  { id:'ta-ess-6',  categoryId:'essentials',   native:'இங்கிலீஷ் பேசுவீர்களா?',     phonetic:'[iŋ.gi.liːʃ peː.su.viːr.ga.ɭaː]', translation:'Do you speak English?',                   difficulty:'hard' },
  { id:'ta-ess-7',  categoryId:'essentials',   native:'கழிவறை எங்கே உள்ளது?',       phonetic:'[ka.ɻi.va.rai eŋ.geː uɭ.ɭa.d̪u]', translation:'Where is the bathroom?',                  difficulty:'hard' },
  { id:'ta-ess-8',  categoryId:'essentials',   native:'இது எவ்வளவு?',                phonetic:'[i.d̪u ev.va.ɭa.vu]',           translation:'How much is this?',                             difficulty:'medium' },
  { id:'ta-ess-9',  categoryId:'essentials',   native:'மன்னிக்கவும்',                phonetic:'[man.nik.ka.vum]',              translation:'Excuse me / Sorry',                             difficulty:'medium' },
  { id:'ta-ess-10', categoryId:'essentials',   native:'எனக்கு உதவி தேவை',           phonetic:'[e.nak.ku u.d̪a.vi t̪eː.vai]', translation:'I need help',                                   difficulty:'medium' },
  { id:'ta-greet-1', categoryId:'greetings',   native:'வணக்கம்',                      phonetic:'[va.ɳak.kam]',                  translation:'Hello / Greetings',                             difficulty:'easy' },
  { id:'ta-greet-2', categoryId:'greetings',   native:'காலை வணக்கம்',               phonetic:'[kaː.lai va.ɳak.kam]',          translation:'Good morning',                                  difficulty:'easy' },
  { id:'ta-greet-3', categoryId:'greetings',   native:'மாலை வணக்கம்',               phonetic:'[maː.lai va.ɳak.kam]',          translation:'Good evening',                                  difficulty:'easy' },
  { id:'ta-greet-4', categoryId:'greetings',   native:'நீங்கள் எப்படி இருக்கிறீர்கள்?', phonetic:'[niːŋ.gaɭ ep.pa.ɖi i.ruk.ki.riːr.gaɭ]', translation:'How are you?',              difficulty:'hard' },
  { id:'ta-greet-5', categoryId:'greetings',   native:'மீண்டும் சந்திப்போம்',        phonetic:'[miːɳ.ɖum san.d̪ip.poːm]',      translation:'We\'ll meet again / Goodbye',                   difficulty:'medium' },
  { id:'ta-rest-1',  categoryId:'restaurant',  native:'கணக்கு தயவுசெய்து',           phonetic:'[ga.ɳak.ku d̪a.ya.vu.sej.d̪u]', translation:'The bill, please',                            difficulty:'medium' },
  { id:'ta-rest-2',  categoryId:'restaurant',  native:'மெனு கொண்டு வாருங்கள்',      phonetic:'[me.nuː koɳ.ɖu vaː.ruŋ.gaɭ]', translation:'Please bring the menu',                         difficulty:'hard' },
  { id:'ta-rest-3',  categoryId:'restaurant',  native:'மிகவும் சுவையாக இருக்கிறது', phonetic:'[mi.ga.vum su.vai.yaːg i.ruk.ki.ra.d̪u]', translation:'It\'s very tasty',               difficulty:'hard' },
  { id:'ta-hotel-1', categoryId:'hotel',       native:'என் பெயரில் பதிவு உள்ளது',   phonetic:'[en pei.ya.ril pa.d̪i.vu uɭ.ɭa.d̪u]', translation:'I have a reservation in my name',      difficulty:'hard' },
  { id:'ta-emerg-1', categoryId:'emergency',   native:'உதவி! உதவி!',               phonetic:'[u.d̪a.vi u.d̪a.vi]',            translation:'Help! Help!',                                   difficulty:'easy' },
  { id:'ta-emerg-2', categoryId:'emergency',   native:'காவல் துறையை அழையுங்கள்',   phonetic:'[kaː.val t̪u.rai.yai a.ɻai.yuŋ.gaɭ]', translation:'Call the police',                     difficulty:'hard' },
];

@Injectable({ providedIn: 'root' })
export class PhraseService {
  private allPhrases: Phrase[] = [
    ...ES_PHRASES.map(p => ({ ...p, langId: 'es' })),
    ...FR_PHRASES.map(p => ({ ...p, langId: 'fr' })),
    ...DE_PHRASES.map(p => ({ ...p, langId: 'de' })),
    ...JA_PHRASES.map(p => ({ ...p, langId: 'ja' })),
    ...AR_PHRASES.map(p => ({ ...p, langId: 'ar' })),
    ...TA_PHRASES.map(p => ({ ...p, langId: 'ta' })),
  ];

  public readonly categories = signal<PhraseCategory[]>(PHRASE_CATEGORIES);

  // Fast O(1) indexed lookup caches
  private readonly categoriesByLangCache = new Map<string, (PhraseCategory & { count: number })[]>();
  private readonly phrasesByCategoryCache = new Map<string, Phrase[]>();
  private readonly phrasesByLangCache = new Map<string, Phrase[]>();

  getCategoriesForLanguage(langId: string): (PhraseCategory & { count: number })[] {
    const cached = this.categoriesByLangCache.get(langId);
    if (cached) return cached;

    const result = PHRASE_CATEGORIES.map(cat => ({
      ...cat,
      count: this.allPhrases.filter(p => p.langId === langId && p.categoryId === cat.id).length
    })).filter(c => c.count > 0);

    this.categoriesByLangCache.set(langId, result);
    return result;
  }

  getPhrasesForCategory(langId: string, categoryId: string): Phrase[] {
    const key = `${langId}:${categoryId}`;
    const cached = this.phrasesByCategoryCache.get(key);
    if (cached) return cached;

    const result = this.allPhrases.filter(p => p.langId === langId && p.categoryId === categoryId);
    this.phrasesByCategoryCache.set(key, result);
    return result;
  }

  getPhrasesForLanguage(langId: string): Phrase[] {
    const cached = this.phrasesByLangCache.get(langId);
    if (cached) return cached;

    const result = this.allPhrases.filter(p => p.langId === langId);
    this.phrasesByLangCache.set(langId, result);
    return result;
  }

  searchPhrases(langId: string, query: string): Phrase[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getPhrasesForLanguage(langId);
    const langPhrases = this.getPhrasesForLanguage(langId);
    return langPhrases.filter(p =>
      p.native.toLowerCase().includes(q) ||
      p.translation.toLowerCase().includes(q) ||
      p.phonetic.toLowerCase().includes(q)
    );
  }

  getTotalPhraseCount(langId: string): number {
    return this.getPhrasesForLanguage(langId).length;
  }
}

