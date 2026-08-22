export const COLORS = {
  base: '#0F101E',
  orange: '#F18C24',
  teal: '#1EC0C3',
  accent: '#28A7A9',
};

export const COUNTDOWN_TARGET = '2026-08-27T23:59:00+05:30';

export const DEV_MODE =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_ALLOW_DEV_SUBMISSIONS === 'true';

export const ROUND_DATES = {
  round1: {
    start: '2026-07-26T00:00:00+05:30',
    end: '2026-08-03T23:59:59+05:30',
    title: 'Round 1: Proposal',
    description: 'Submit your problem, AI approach, SDG alignment, and concept.',
  },
  round2: {
    start: '2026-08-16T00:00:00+05:30',
    end: '2026-08-27T23:59:00+05:30',
    title: 'Round 2: Wireframes',
    description: 'Submit user flows, wireframes, and early design evidence.',
  },
  round3: {
    start: '2026-09-10T00:00:00+05:30',
    end: '2026-09-12T23:59:59+05:30',
    title: 'Round 3: Final UI/UX',
    description: 'Submit final prototype, presentation, and demo materials.',
  },
};

export function isRoundAvailable(round: string): boolean {
  if (DEV_MODE) return true;
  const now = new Date();
  const roundInfo = ROUND_DATES[round as keyof typeof ROUND_DATES];
  if (!roundInfo) return false;
  return now >= new Date(roundInfo.start) && now <= new Date(roundInfo.end);
}

export const TIMELINE = [
  {
    date: '2026-07-08',
    title: 'Registration Opens',
    phase: 'registration',
    location: 'Online',
  },
  {
    date: '2026-07-26',
    title: 'Registration Closes',
    phase: 'registration',
    location: 'Online',
  },
  {
    date: '2026-07-26',
    title: 'Round 01 Submission',
    phase: 'round1',
    location: 'Online',
  },
  {
    date: '2026-08-23',
    title: 'Second Round',
    phase: 'round2',
    location: 'Online',
  },
  {
    date: '2026-09-12',
    title: 'Final Round',
    phase: 'final-round',
    location: 'Online',
  },
  {
    date: '2026-09-10',
    title: 'ReBrand Hackathon',
    phase: 'rebrand',
    location: 'Online',
  },
];

export const WORKSHOPS = [
  {
    name: 'Design Thinking for Impact',
    icon: 'Lightbulb',
    description: 'Frame real-world problems with empathy, research, and SDGs.',
  },
  {
    name: 'AI-Enabled Product Strategy',
    icon: 'Package',
    description: 'Turn AI capabilities into usable, responsible digital products.',
  },
  {
    name: 'UI Systems and Prototyping',
    icon: 'Brush',
    description: 'Create polished interfaces, design systems, and prototypes.',
  },
  {
    name: 'UX Validation',
    icon: 'Pointer',
    description: 'Test concepts, improve flows, and present user-centered evidence.',
  },
];

export const PRIZES = [
  { position: '1st Place', amount: '70,000', rank: 1 },
  { position: '2nd Place', amount: '50,000', rank: 2 },
  { position: '3rd Place', amount: '30,000', rank: 3 },
];

export const CONTACT = {
  office: 'Department of Information Technology, University of Sri Jayewardenepura',
  phone: '+94 77 261 5050',
  email: 'avindigetawakanda@gmail.com',
  whatsapp:
    'https://chat.whatsapp.com/KK32rw7lU1Z7VIgdc1xLdr',
  personas: [
    {
      role: 'Co-Chairperson - DHack',
      name: 'Avindi Getawakanda',
      phone: '0772615050',
      email: 'avindigetawakanda@gmail.com',
    },
    {
      role: 'PR and Delegates Crew Head',
      name: 'Minoli Fernando',
      phone: '0765449807',
      email: 'official.dhack2026@gmail.com',
    },
  ],
  social: {
    facebook: 'https://www.facebook.com/ITCSJP?mibextid=wwXIfr',
    instagram:
      'https://www.instagram.com/sait_usj?igsh=Ynp0dGRvY2tsdzFi&utm_source=qr',
    linkedin:
      'https://www.linkedin.com/company/students-association-of-information-technology/',
    youtube:
      'https://youtube.com/@studentsassociationofinformati?si=VEiBMM-vtYWCtAtK',
    tiktok: 'https://www.tiktok.com/@japura.sait?_t=ZS-8zPPdZc6Q6R&_r=1',
  },
};
