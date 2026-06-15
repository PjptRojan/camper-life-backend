import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { prisma } from './db.js'; // Import our live database client
import { authRouter } from './auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- LIVE API Endpoints (Fetching from PostgreSQL) ---

// 2. Register the Auth Router endpoints
app.use('/api/auth', authRouter);

// 1. Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('Camping-as-a-Service Backend is running with Postgres! 🌲');
});

// 2. Get All Destinations from Database (public catalog of Nepal treks)
const TREK_REGIONS = ['Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Mustang', 'Kanchenjunga'] as const;
type TrekRegion = (typeof TREK_REGIONS)[number];

// Fields exposed to the frontend — exactly the API contract shape (no createdAt).
const DESTINATION_SELECT = {
  id: true,
  name: true,
  region: true,
  description: true,
  location: true,
  pricePerNight: true,
  emoji: true,
  maxAltitudeMeters: true,
  difficulty: true,
  durationDaysMin: true,
  durationDaysMax: true,
  bestSeasons: true,
  startPoint: true,
  permitsRequired: true,
} as const;

app.get('/api/destinations', async (req: Request, res: Response): Promise<any> => {
  try {
    // Optional ?region= filter (frontend currently filters client-side).
    const region = req.query.region;
    if (region !== undefined && !TREK_REGIONS.includes(region as TrekRegion)) {
      return res.status(400).json({
        message: `Invalid region "${region}". Expected one of: ${TREK_REGIONS.join(', ')}.`,
      });
    }

    const destinations = await prisma.destination.findMany({
      ...(region ? { where: { region: region as TrekRegion } } : {}),
      orderBy: { name: 'asc' },
      select: DESTINATION_SELECT,
    });

    res.json(destinations);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. Get All Gear Items from Database
app.get('/api/gear', async (req: Request, res: Response) => {
  try {
    const gearItems = await prisma.gearItem.findMany();
    res.json(gearItems);
  } catch (error) {
    console.error('Error fetching gear items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server successfully running on http://localhost:${PORT}`);
});