import { prisma } from '../src/db.js';

// ---------------------------------------------------------------------------
// Real Nepal trekking destinations (catalog / reference data).
//
// Altitudes, durations and permits are realistic; prices are placeholder
// USD/day package rates. Seeding is idempotent: each trek is upserted by its
// stable slug `id`, so re-running this script is always safe.
// ---------------------------------------------------------------------------

const TREK_REGIONS = ['Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Mustang', 'Kanchenjunga'] as const;
const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Strenuous'] as const;
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

type TrekRegion = (typeof TREK_REGIONS)[number];
type Difficulty = (typeof DIFFICULTIES)[number];
type Season = (typeof SEASONS)[number];

interface DestinationSeed {
  id: string;
  name: string;
  region: TrekRegion;
  description: string;
  location: string;
  pricePerNight: number;
  emoji: string;
  maxAltitudeMeters: number;
  difficulty: Difficulty;
  durationDaysMin: number;
  durationDaysMax: number;
  bestSeasons: Season[];
  startPoint: string;
  permitsRequired: string[];
}

const destinations: DestinationSeed[] = [
  {
    id: 'ebc',
    name: 'Everest Base Camp',
    region: 'Everest',
    description: "Trek to the foot of the world's highest peak through Sherpa villages and glacial moraine.",
    location: 'Solukhumbu District',
    pricePerNight: 95,
    emoji: '🏔️',
    maxAltitudeMeters: 5364,
    difficulty: 'Challenging',
    durationDaysMin: 12,
    durationDaysMax: 14,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Lukla',
    permitsRequired: ['Sagarmatha National Park Permit', 'Khumbu Pasang Lhamu Rural Municipality Permit'],
  },
  {
    id: 'gokyo-lakes',
    name: 'Gokyo Lakes',
    region: 'Everest',
    description: 'Wander past turquoise glacial lakes to the Gokyo Ri viewpoint over the Ngozumpa Glacier.',
    location: 'Solukhumbu District',
    pricePerNight: 90,
    emoji: '🏞️',
    maxAltitudeMeters: 5357,
    difficulty: 'Challenging',
    durationDaysMin: 12,
    durationDaysMax: 14,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Lukla',
    permitsRequired: ['Sagarmatha National Park Permit', 'Khumbu Pasang Lhamu Rural Municipality Permit'],
  },
  {
    id: 'three-passes',
    name: 'Everest Three Passes',
    region: 'Everest',
    description: 'A high-altitude circuit crossing the Kongma La, Cho La and Renjo La passes of the Khumbu.',
    location: 'Solukhumbu District',
    pricePerNight: 110,
    emoji: '⛰️',
    maxAltitudeMeters: 5535,
    difficulty: 'Strenuous',
    durationDaysMin: 18,
    durationDaysMax: 21,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Lukla',
    permitsRequired: ['Sagarmatha National Park Permit', 'Khumbu Pasang Lhamu Rural Municipality Permit'],
  },
  {
    id: 'abc',
    name: 'Annapurna Base Camp',
    region: 'Annapurna',
    description: 'Climb into a natural amphitheatre of peaks at the sanctuary beneath Annapurna I.',
    location: 'Kaski District',
    pricePerNight: 75,
    emoji: '🏔️',
    maxAltitudeMeters: 4130,
    difficulty: 'Moderate',
    durationDaysMin: 7,
    durationDaysMax: 12,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Nayapul (Pokhara)',
    permitsRequired: ['Annapurna Conservation Area Permit (ACAP)', 'TIMS Card'],
  },
  {
    id: 'annapurna-circuit',
    name: 'Annapurna Circuit',
    region: 'Annapurna',
    description: 'Loop the Annapurna massif over the Thorong La pass through changing climates and cultures.',
    location: 'Manang & Mustang Districts',
    pricePerNight: 80,
    emoji: '🥾',
    maxAltitudeMeters: 5416,
    difficulty: 'Challenging',
    durationDaysMin: 12,
    durationDaysMax: 18,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Besisahar',
    permitsRequired: ['Annapurna Conservation Area Permit (ACAP)', 'TIMS Card'],
  },
  {
    id: 'poon-hill',
    name: 'Ghorepani Poon Hill',
    region: 'Annapurna',
    description: 'A gentle short trek to a famous sunrise viewpoint over the Annapurna and Dhaulagiri ranges.',
    location: 'Kaski & Myagdi Districts',
    pricePerNight: 60,
    emoji: '🌄',
    maxAltitudeMeters: 3210,
    difficulty: 'Easy',
    durationDaysMin: 4,
    durationDaysMax: 5,
    bestSeasons: ['Spring', 'Autumn', 'Winter'],
    startPoint: 'Nayapul (Pokhara)',
    permitsRequired: ['Annapurna Conservation Area Permit (ACAP)', 'TIMS Card'],
  },
  {
    id: 'mardi-himal',
    name: 'Mardi Himal',
    region: 'Annapurna',
    description: 'A quieter ridge trek through rhododendron forest to a high camp beneath Machhapuchhre.',
    location: 'Kaski District',
    pricePerNight: 70,
    emoji: '🏕️',
    maxAltitudeMeters: 4500,
    difficulty: 'Moderate',
    durationDaysMin: 5,
    durationDaysMax: 7,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Kande',
    permitsRequired: ['Annapurna Conservation Area Permit (ACAP)', 'TIMS Card'],
  },
  {
    id: 'langtang-valley',
    name: 'Langtang Valley',
    region: 'Langtang',
    description: 'Follow a glacial valley of yak pastures and Tamang villages close to the Tibetan border.',
    location: 'Rasuwa District',
    pricePerNight: 65,
    emoji: '🏞️',
    maxAltitudeMeters: 4773,
    difficulty: 'Moderate',
    durationDaysMin: 7,
    durationDaysMax: 10,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Syabrubesi',
    permitsRequired: ['Langtang National Park Permit', 'TIMS Card'],
  },
  {
    id: 'manaslu-circuit',
    name: 'Manaslu Circuit',
    region: 'Manaslu',
    description: "Circle the world's eighth-highest mountain over the Larkya La on a remote restricted route.",
    location: 'Gorkha District',
    pricePerNight: 105,
    emoji: '⛰️',
    maxAltitudeMeters: 5106,
    difficulty: 'Challenging',
    durationDaysMin: 14,
    durationDaysMax: 18,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Machha Khola',
    permitsRequired: [
      'Manaslu Restricted Area Permit',
      'Manaslu Conservation Area Permit (MCAP)',
      'Annapurna Conservation Area Permit (ACAP)',
    ],
  },
  {
    id: 'tsum-valley',
    name: 'Tsum Valley',
    region: 'Manaslu',
    description: 'A sacred hidden Himalayan valley of ancient monasteries and Tibetan Buddhist culture.',
    location: 'Gorkha District',
    pricePerNight: 100,
    emoji: '🛕',
    maxAltitudeMeters: 3700,
    difficulty: 'Moderate',
    durationDaysMin: 12,
    durationDaysMax: 16,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Machha Khola',
    permitsRequired: ['Manaslu Restricted Area Permit', 'Manaslu Conservation Area Permit (MCAP)'],
  },
  {
    id: 'upper-mustang',
    name: 'Upper Mustang',
    region: 'Mustang',
    description: 'Explore the walled city of Lo Manthang across an arid, Tibetan-influenced rain-shadow kingdom.',
    location: 'Mustang District',
    pricePerNight: 130,
    emoji: '🏜️',
    maxAltitudeMeters: 3840,
    difficulty: 'Moderate',
    durationDaysMin: 10,
    durationDaysMax: 14,
    bestSeasons: ['Spring', 'Summer', 'Autumn'],
    startPoint: 'Jomsom',
    permitsRequired: ['Upper Mustang Restricted Area Permit', 'Annapurna Conservation Area Permit (ACAP)'],
  },
  {
    id: 'kanchenjunga-bc',
    name: 'Kanchenjunga Base Camp',
    region: 'Kanchenjunga',
    description: "A long expedition-style trek to the base of the world's third-highest peak in remote east Nepal.",
    location: 'Taplejung District',
    pricePerNight: 120,
    emoji: '🏔️',
    maxAltitudeMeters: 5143,
    difficulty: 'Strenuous',
    durationDaysMin: 20,
    durationDaysMax: 24,
    bestSeasons: ['Spring', 'Autumn'],
    startPoint: 'Taplejung',
    permitsRequired: ['Kanchenjunga Restricted Area Permit', 'Kanchenjunga Conservation Area Permit (KCAP)'],
  },
];

// --- Validation (enforces the rules from the spec at seed time) -------------
function validate(list: DestinationSeed[]): void {
  const seenIds = new Set<string>();
  const errors: string[] = [];

  for (const d of list) {
    const where = `"${d.id || '(missing id)'}"`;

    if (!d.id) errors.push(`${where}: id is required`);
    if (seenIds.has(d.id)) errors.push(`${where}: duplicate id`);
    seenIds.add(d.id);

    if (!TREK_REGIONS.includes(d.region)) errors.push(`${where}: invalid region "${d.region}"`);
    if (!DIFFICULTIES.includes(d.difficulty)) errors.push(`${where}: invalid difficulty "${d.difficulty}"`);

    if (d.bestSeasons.length === 0) errors.push(`${where}: bestSeasons must be non-empty`);
    for (const s of d.bestSeasons) {
      if (!SEASONS.includes(s)) errors.push(`${where}: invalid season "${s}"`);
    }

    for (const [field, value] of [
      ['pricePerNight', d.pricePerNight],
      ['maxAltitudeMeters', d.maxAltitudeMeters],
      ['durationDaysMin', d.durationDaysMin],
      ['durationDaysMax', d.durationDaysMax],
    ] as const) {
      if (!Number.isInteger(value) || value <= 0) {
        errors.push(`${where}: ${field} must be a positive integer (got ${value})`);
      }
    }

    if (d.durationDaysMin > d.durationDaysMax) {
      errors.push(`${where}: durationDaysMin (${d.durationDaysMin}) > durationDaysMax (${d.durationDaysMax})`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Seed validation failed:\n  - ${errors.join('\n  - ')}`);
  }
}

async function main(): Promise<void> {
  validate(destinations);

  for (const d of destinations) {
    await prisma.destination.upsert({
      where: { id: d.id },
      update: d,
      create: d,
    });
  }

  console.log(`✅ Seeded ${destinations.length} Nepal trekking destinations.`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
