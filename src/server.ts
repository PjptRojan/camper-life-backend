import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { authRouter } from './auth.js';
import { destinationsRouter } from './routes/destinations.js';
import { gearRouter } from './routes/gear.js';
import { servicesRouter } from './routes/services.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('Camping-as-a-Service Backend is running with Postgres! 🌲');
});

// --- LIVE API Endpoints (Postgres via Prisma) ---
// Each router exposes a public GET plus admin-only POST/PUT/DELETE
// (the write routes are gated behind authenticate + requireAdmin).
app.use('/api/auth', authRouter);
app.use('/api/destinations', destinationsRouter);
app.use('/api/gear', gearRouter);
app.use('/api/services', servicesRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server successfully running on http://localhost:${PORT}`);
});
