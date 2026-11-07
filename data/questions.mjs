// Every question comes from the narration of one video:
//   "Diwali – A Festival of Light Animation", Basics of Sikhi
//   https://youtu.be/3myspuH4zkc  (11:30 long)
// except the one marked `source: 'description'`, which comes from the
// video's YouTube description, and says so on the page.
//
// `t` is the second in the video where the answer is said. The quiz links
// "watch at m:ss" there, and the answer key prints it, so every answer can
// be checked against the video itself. If you change a question, re-watch
// that moment first. Do not add anything the video does not say.
//
// Types:
//   choice  options[], answer = index of the right option
//   multi   options[], answer = indexes of every right option
//   number  answer = the number
//   order   items[] written in the RIGHT order (the page shuffles them)

export const VIDEO = {
  id: '3myspuH4zkc',
  title: 'Diwali – A Festival of Light Animation',
  channel: 'Basics of Sikhi',
  url: 'https://youtu.be/3myspuH4zkc',
};

export const PARTS = [
  { id: 'A', title: "Chandu's plans", from: 0 },
  { id: 'B', title: 'Inside Gwalior prison', from: 247 },
  { id: 'C', title: 'The lions and the release', from: 378 },
  { id: 'D', title: 'The whole story', from: 0 },
];

export const QUESTIONS = [
  // ---------- Part A: Chandu's plans ----------
  {
    part: 'A', type: 'choice', t: 33,
    q: "News of Guru Hargobind Sahib Ji's powerful army spread across the land. Whose heart did it strike fear into?",
    options: ['Emperor Jahangir', 'Chandu', 'The astrologer', 'Bhai Hardas Ji'],
    answer: 1,
    why: 'Word of the army spread across the land and struck fear into the heart of Chandu.',
  },
  {
    part: 'A', type: 'choice', t: 42,
    q: 'Chandu played a key role in whose martyrdom?',
    options: ['Guru Nanak Dev Ji', 'Guru Ram Das Ji', 'Guru Arjan Dev Ji', 'Guru Angad Dev Ji'],
    answer: 2,
    why: "Chandu played a key role in Guru Arjan Dev Ji's martyrdom, and was worried that Guru Arjan Dev Ji's son, Guru Hargobind Sahib Ji, would use their army to seek revenge.",
  },
  {
    part: 'A', type: 'choice', t: 58,
    q: "Chandu's first plan was for Emperor Jahangir to meet Guru Ji. What did he hope would happen?",
    options: [
      'The emperor would take away Guru Ji’s army',
      'The emperor would despise Guru Ji and see them as an enemy',
      'The emperor would send Guru Ji back to Amritsar',
      'The emperor would make Chandu his chief minister',
    ],
    answer: 1,
    why: 'Chandu hoped the emperor would despise Guru Ji. Instead, the emperor became very fond of Guru Ji.',
  },
  {
    part: 'A', type: 'choice', t: 95,
    q: 'On a journey, a fierce lion ambushed the emperor’s soldiers and turned towards the emperor. How did Guru Ji save him?',
    options: [
      'Shot the lion with an arrow',
      'Ordered the soldiers to surround it',
      'Scared it away with a shout',
      'Blocked its attack with their shield and struck it with their sword',
    ],
    answer: 3,
    why: "The soldiers hid in fear. Guru Ji blocked the lion's attack with their shield and quickly struck it with their sword.",
  },
  {
    part: 'A', type: 'choice', t: 126,
    q: 'Lying to the emperor was a serious crime. How did Chandu pay the astrologer to do it?',
    options: [
      '500 coins first, and 5,000 more once the task was done',
      '5,000 coins first, and 500 more once the task was done',
      '52 gold coins',
      'A beautiful robe',
    ],
    answer: 0,
    why: 'Chandu paid 500 coins first and promised another 5,000 coins when the task was done.',
  },
  {
    part: 'A', type: 'choice', t: 148,
    q: 'What lie did Chandu order the astrologer to tell the emperor?',
    options: [
      'That Guru Ji was planning to attack Delhi',
      'That the emperor had been cursed, and would die if he didn’t act fast',
      'That a lion would attack the emperor again',
      'That the kings in Gwalior prison were plotting against him',
    ],
    answer: 1,
    why: 'The lie was that Emperor Jahangir had been cursed and would die if he did not act fast.',
  },
  {
    part: 'A', type: 'multi', t: 157,
    q: 'To lift the "curse", someone had to perform three tasks. Tick all three.',
    options: [
      'Bathe three times a day',
      'Fast for 40 days',
      'Meditate continuously',
      'Give 5,000 coins to the poor',
      'Do all of this in Gwalior prison for 40 days',
      'Wear a robe with 50 tassels',
    ],
    answer: [0, 2, 4],
    why: 'Bathe three times a day; meditate continuously; and do it all in Gwalior prison for 40 days.',
  },
  {
    part: 'A', type: 'choice', t: 179,
    q: 'Who did the lie say could complete the tasks for the emperor?',
    options: [
      'Only a king',
      'Only the emperor himself',
      'Only someone called “Hargobind”',
      'Only an astrologer',
    ],
    answer: 2,
    why: 'Only someone called "Hargobind" could complete the tasks, and Chandu then suggested that only Guru Hargobind Sahib Ji fitted the description.',
  },
  {
    part: 'A', type: 'choice', t: 236,
    q: 'True or false: Guru Hargobind Sahib Ji believed the curse was real.',
    options: ['True', 'False'],
    answer: 1,
    why: 'False. Guru Ji knew the emperor had been lied to, but agreed anyway: they knew they had to enter Gwalior prison for a different reason.',
  },

  // ---------- Part B: Inside Gwalior prison ----------
  {
    part: 'B', type: 'choice', t: 247,
    q: 'Who did Guru Ji find in Gwalior prison?',
    options: [
      'Many kings who had been wrongly imprisoned by the emperor',
      'Sikhs who had been arrested for following Guru Ji',
      'Chandu’s soldiers',
      'Nobody: the prison was empty',
    ],
    answer: 0,
    why: 'Many of the prisoners were kings who had been wrongly imprisoned by the emperor. They were covered in lice, in dirty, ripped clothes, and many could hardly walk.',
  },
  {
    part: 'B', type: 'choice', t: 288,
    q: 'Chandu knew Guru Ji would leave after 40 days. What was his plan to get rid of Guru Ji once and for all?',
    options: [
      'Poison in Guru Ji’s food',
      'A beautiful robe covered in a strong poison',
      'Bribing the guards to lock the gates',
      'Telling the emperor to keep Guru Ji for 40 more days',
    ],
    answer: 1,
    why: 'Chandu had a beautiful robe made and covered it in a strong poison, hoping it would kill Guru Ji once worn.',
  },
  {
    part: 'B', type: 'choice', t: 301,
    q: 'Who stopped the poisoned robe from reaching Guru Ji?',
    options: ['Bhai Jetha Ji', 'Bhai Pirana Ji', 'The astrologer', 'Bhai Hardas Ji'],
    answer: 3,
    why: "Bhai Hardas Ji, the prison warden, had already heard of Chandu's plan and stopped the robe being delivered.",
  },
  {
    part: 'B', type: 'choice', t: 314,
    q: 'In prison Guru Ji started a routine of Simran and Seva with the kings. What do these words mean?',
    options: [
      'Simran = meditation, Seva = selfless service',
      'Simran = selfless service, Seva = meditation',
      'Simran = singing, Seva = cooking',
      'Simran = fasting, Seva = bathing',
    ],
    answer: 0,
    why: "Guru Ji started a routine of meditation and selfless service, known as 'Simran' and 'Seva'.",
  },
  {
    part: 'B', type: 'choice', t: 355,
    q: 'Fill the gap: Guru Ji showed that being in prison and being a ______ were two very different things.',
    options: ['king', 'prisoner', 'warden', 'Sikh'],
    answer: 1,
    why: 'Being in prison and being a prisoner are two very different things.',
  },
  {
    part: 'B', type: 'choice', t: 371,
    q: 'The 40th day passed. Why was Guru Ji not released?',
    options: [
      'Chandu locked the prison gates',
      'Guru Ji refused to leave',
      'The emperor had forgotten about Guru Ji',
      'The curse had not been lifted yet',
    ],
    answer: 2,
    why: 'The emperor had forgotten about Guru Ji, so the Sikhs realised they had to remind him themselves.',
  },

  // ---------- Part C: The lions and the release ----------
  {
    part: 'C', type: 'choice', t: 387,
    q: 'Which two Sikhs snuck into the emperor’s fort at night?',
    options: [
      'Bhai Hardas Ji and Bhai Jetha Ji',
      'Bhai Jetha Ji and Bhai Pirana Ji',
      'Bhai Pirana Ji and Bhai Hardas Ji',
      'Two of the kings from the prison',
    ],
    answer: 1,
    why: "Bhai Jetha Ji and Bhai Pirana Ji snuck past the guards and found the emperor asleep.",
  },
  {
    part: 'C', type: 'choice', t: 437,
    q: 'In the morning the emperor told his advisors about the lions. What did Chandu say?',
    options: [
      'That it was proof the curse was real, so Guru Ji should stay locked in prison',
      'That it was only a bad dream',
      'That Guru Ji should be released at once',
      'That the astrologer had lied',
    ],
    answer: 0,
    why: 'Chandu said this proved the curse was real, and advised keeping Guru Ji locked in prison.',
  },
  {
    part: 'C', type: 'choice', t: 467,
    q: 'After visiting as lions a second time, what did Bhai Jetha Ji disguise himself as?',
    options: ['An astrologer', 'A messenger', 'A guard', 'A doctor'],
    answer: 3,
    why: 'The terrified emperor called for a doctor, and Bhai Jetha Ji disguised himself as one.',
  },
  {
    part: 'C', type: 'choice', t: 519,
    q: 'A messenger came to release Guru Ji. What did Guru Ji tell the messenger?',
    options: [
      'That Guru Ji would stay in prison for ever',
      'That all the falsely imprisoned kings would have to be released too',
      'That Chandu must be punished first',
      'That the Sikhs must come and fetch Guru Ji',
    ],
    answer: 1,
    why: 'The kings did not want to be without Guru Ji. Guru Ji’s reply was that all the falsely imprisoned kings would have to be released too.',
  },
  {
    part: 'C', type: 'choice', t: 541,
    q: 'The emperor did not want to free every prisoner. What did he declare?',
    options: [
      'Only the 10 richest kings could go',
      'Only those who could hold onto Guru Ji’s robe could go',
      'The kings could go after another 40 days',
      'Only kings who paid 500 coins could go',
    ],
    answer: 1,
    why: "Only those who could hold onto Guru Ji's robe as Guru Ji left would also be free to go.",
  },
  {
    part: 'C', type: 'number', t: 551,
    q: 'How many tassels did the Sikhs put on Guru Ji’s unique robe?',
    answer: 50,
    why: 'Guru Ji asked the Sikhs to make a unique robe with 50 tassels for the prisoners to hold onto.',
  },
  {
    part: 'C', type: 'choice', t: 567,
    q: 'Two kings found no tassels left for them. What did Guru Ji let them hold onto?',
    options: ['Guru Ji’s hands', 'Guru Ji’s sleeves', 'Guru Ji’s sword', 'Guru Ji’s horse'],
    answer: 1,
    why: 'Seeing their love, Guru Ji smiled, raised their arms and let the two kings hold onto their sleeves.',
  },
  {
    part: 'C', type: 'number', t: 594,
    q: 'How many kings walked free by Guru Ji’s side?',
    answer: 52,
    why: 'A crowd of thousands saw Guru Ji walk free with all 52 kings by their side.',
  },
  {
    part: 'C', type: 'choice', t: 605,
    q: 'From that day Guru Ji was known as “Bandi Chhor”. What does it mean?',
    options: ['The True King', 'The Liberator', 'The Warrior', 'The Light'],
    answer: 1,
    why: "Bandi Chhor means 'The Liberator'.",
  },
  {
    part: 'C', type: 'choice', t: 613,
    q: 'Where did Guru Ji travel back to, where the Sikhs lit many diva lamps in celebration?',
    options: ['Gwalior', 'Amritsar Sahib', 'Delhi', 'Anandpur Sahib'],
    answer: 1,
    why: 'Guru Ji travelled back to Amritsar Sahib, where the Sikhs lit many diva lamps to celebrate.',
  },
  {
    part: 'C', type: 'choice', t: 636,
    q: 'Why are diva lamps lit, according to the end of the video?',
    options: [
      'To scare away lions',
      'To remember the emperor’s fort',
      'To recognise Guru Ji as the light that saves us from the prison of darkness',
      'To mark the end of the 40 days',
    ],
    answer: 2,
    why: 'Diva lamps are lit to recognise Guru Ji as the light that saves us from the prison of darkness, and to remember we too can be saved if we reach out and take Guru Ji’s support.',
  },

  // ---------- Part D: The whole story ----------
  {
    part: 'D', type: 'order', t: 25,
    q: 'Put these events in the order they happen in the video.',
    items: [
      'Guru Ji saves the emperor from a lion',
      'Chandu pays an astrologer to lie',
      'Guru Ji enters Gwalior prison',
      'Bhai Hardas Ji stops the poisoned robe',
      'Bhai Jetha Ji and Bhai Pirana Ji visit the emperor as lions',
      'Bhai Jetha Ji visits the emperor disguised as a doctor',
      'The 52 kings walk free with Guru Ji',
    ],
    why: 'Lion attack (1:15) → astrologer (1:59) → Gwalior prison (4:07) → poisoned robe stopped (5:01) → lions (6:27) → doctor (7:47) → 52 kings free (9:54).',
  },
];

// The one question not from the narration. It comes from the video's
// YouTube description; Harteg chose (6 Nov 2026) to include it, marked.
export const BONUS = {
  part: 'bonus', type: 'choice', t: null, source: 'description',
  q: 'The robe Guru Hargobind Sahib Ji wore to free the 52 kings can still be seen today. Where?',
  // Wrong options are other itihaasak asthaans (Harteg's call, 7 Nov 2026),
  // all written "Gurdwara X Sahib, Town" so the right one doesn't stand out.
  options: [
    'Gurdwara Kartarpur Sahib, Kartarpur',
    'Gurdwara Chola Sahib, Ghudani Kalan',
    'Gurdwara Ber Sahib, Sultanpur Lodhi',
    'Gurdwara Panja Sahib, Hasan Abdal',
  ],
  answer: 1,
  why: 'From the video’s description (not the narration): the robe can still be seen at Gurdwara Chola Sahib, Ghudani Kalan, Punjab.',
};
