export const DHACK_2026_MISSION =
  'Our mission is to cultivate a culture of innovation among school students and university participants by empowering them to solve real-world challenges through creativity, collaboration, and human-centered design. Through the integration of Artificial Intelligence and a commitment to global sustainability goals, we inspire the next generation to create meaningful digital solutions for a better future.';

export const WHATSAPP_COMMUNITY_URL =
  'https://chat.whatsapp.com/KK32rw7lU1Z7VIgdc1xLdr';

export type CompetitionCategory =
  | 'inter_university'
  | 'inter_school'
  | 'rebrand';

export const COMPETITIONS: Record<
  CompetitionCategory,
  {
    id: CompetitionCategory;
    title: string;
    shortTitle: string;
    description: string;
    institutionType: 'university' | 'school' | 'faculty';
    minMembers: number;
    maxMembers: number;
    exactMembers?: number;
    eligibility: string[];
  }
> = {
  inter_university: {
    id: 'inter_university',
    title: 'Inter-University - Innovation',
    shortTitle: 'University',
    description:
      'For undergraduate teams from recognized universities building AI-assisted digital solutions for real-world challenges.',
    institutionType: 'university',
    minMembers: 3,
    maxMembers: 3,
    exactMembers: 3,
    eligibility: [
      'Recognized university students',
      'Team size: exactly 3 members',
      'University, faculty, degree program, and student ID required',
    ],
  },
  inter_school: {
    id: 'inter_school',
    title: 'InterSchool - Innovation',
    shortTitle: 'School',
    description:
      'A school-level innovation track for student teams guided by a teacher and supported by parent or guardian contact details.',
    institutionType: 'school',
    minMembers: 5,
    maxMembers: 5,
    exactMembers: 5,
    eligibility: [
      'School students only',
      'Exactly 5 members',
      'Only one team can register from each school',
    ],
  },
  rebrand: {
    id: 'rebrand',
    title: 'ReBrand Hackathon',
    shortTitle: 'ReBrand',
    description:
      'A faculty-exclusive brand and UI/UX challenge for FMSC students at the University of Sri Jayewardenepura.',
    institutionType: 'faculty',
    minMembers: 5,
    maxMembers: 5,
    exactMembers: 5,
    eligibility: [
      'Exactly 5 FMSC students from the University of Sri Jayewardenepura',
      'Exactly 3 Business Information Systems students',
      'Exactly 2 members from other FMSC departments',
    ],
  },
};

export const FMSC_FACULTY = 'Faculty of Management Studies and Commerce';
export const USJ = 'University of Sri Jayewardenepura';
export const BIS_DEPARTMENT = 'Business Information Systems';

export const SRI_LANKA_TIME_ZONE = 'Asia/Colombo';

export const DHACK_2026_CONFIG = {
  registrationOpenAt: '2026-07-08T00:00:00+05:30',
  registrationCloseAt: '2026-07-26T00:00:00+05:30',
  registrationEnabled: false,
  countdownTargetAt: '2026-08-27T23:59:00+05:30',
  currentRound: 'round_02_submission',
  maintenanceMode: false,
  maintenanceMessage:
    "We're making DHACK better. Please check back soon.",
  maintenanceEstimatedReturn: '',
  contactEmail: 'info@dhack.lk',
} as const;

export const DHACK_2026_SUBMISSION_WINDOWS = [
  {
    round: 1,
    label: 'Round 01 Submission',
    opens_at: '2026-07-26T00:00:00+05:30',
    closes_at: '2026-08-03T23:59:59+05:30',
  },
  {
    round: 2,
    label: 'Round 02 Submission',
    opens_at: '2026-08-16T00:00:00+05:30',
    closes_at: '2026-08-27T23:59:00+05:30',
  },
  {
    round: 3,
    label: 'Final Round',
    opens_at: '2026-09-10T00:00:00+05:30',
    closes_at: '2026-09-12T23:59:59+05:30',
  },
] as const;

export const FAQS_2026 = [
  {
    question: "Who can participate in DHACK'26?",
    answer:
      "DHACK'26 is open to university students and school students across Sri Lanka through three tracks: Inter-University, InterSchool, and the FMSC-exclusive ReBrand Hackathon.",
  },
  {
    question: 'What are the team size requirements?',
    answer:
      'Inter-University teams must have exactly 3 members. InterSchool and ReBrand teams must have exactly 5 members.',
  },
  {
    question: 'What deliverables are required for submission?',
    answer:
      'Deliverables may differ by round. Teams will receive detailed instructions before each stage, including proposal, wireframe, prototype, final UI/UX, AI integration, and SDG alignment requirements.',
  },
  {
    question: 'How will projects be judged and evaluated?',
    answer:
      'Projects will be judged across proposal, wireframe, and final UI/UX stages. Evaluation focuses on creativity, problem relevance, user-centered design, clarity, AI integration, and contribution to at least one UN Sustainable Development Goal.',
  },
  {
    question: 'Are there any registration fees or costs involved?',
    answer: "Participation in DHACK'26 is completely free.",
  },
];

export const DHACK_2026_EVENTS = [
  {
    id: 'dhack26-registration-open',
    name: 'Registration Open',
    description: 'Team registration opens for all DHACK 2026 competitions.',
    category: 'innovation',
    type: 'registration',
    start_at: '2026-07-08T00:00:00+05:30',
    end_at: '2026-07-08T23:59:59+05:30',
    displayDate: '08 July 2026',
  },
  {
    id: 'dhack26-registration-closed',
    name: 'Registration Closed',
    description: 'Registration has been completed for DHACK 2026.',
    category: 'innovation',
    type: 'registration',
    start_at: '2026-07-26T00:00:00+05:30',
    end_at: '2026-07-26T00:00:00+05:30',
    displayDate: 'Completed',
  },
  {
    id: 'dhack26-first-round',
    name: 'Round 01 Submission',
    description: 'Registered teams submit Round 01 deliverables through the official submission portal.',
    category: 'innovation',
    type: 'proposal',
    start_at: '2026-07-26T00:00:00+05:30',
    end_at: '2026-08-03T23:59:59+05:30',
    displayDate: '26 July - 03 August 2026',
  },
  {
    id: 'dhack26-second-round',
    name: 'Round 02 Submission',
    description: 'Teams selected for Round 2 submit their Google Drive deliverables through the official Round 2 submission portal.',
    category: 'innovation',
    type: 'wireframe',
    start_at: '2026-08-16T00:00:00+05:30',
    end_at: '2026-08-27T23:59:00+05:30',
    displayDate: '16 August - 27 August 2026',
  },
  {
    id: 'dhack26-final-round',
    name: 'Final Round',
    description: 'Final competition round for top DHACK 2026 teams.',
    category: 'innovation',
    type: 'final',
    start_at: '2026-09-12T00:00:00+05:30',
    end_at: '2026-09-12T23:59:59+05:30',
    displayDate: '12 September 2026',
  },
  {
    id: 'dhack26-rebrand-hackathon',
    name: 'ReBrand Hackathon',
    description: 'FMSC-exclusive ReBrand Hackathon. Exact September date to be announced.',
    category: 'rebrand',
    type: 'final',
    start_at: '2026-09-15T00:00:00+05:30',
    end_at: '2026-09-15T23:59:59+05:30',
    displayDate: 'September (Date TBA)',
  },
] as const;
