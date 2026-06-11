import express, { type Request, type Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows your React app to connect
app.use(express.json()); // Allows the server to read JSON bodies in POST requests

// Hardcoded Mock Data for Learning/Testing
const destinations = [
  { id: '1', name: 'Whispering Pines Valley', type: 'Forest', basePrice: 120 },
  { id: '2', name: 'Mirror Lake Oasis', type: 'Lakeside', basePrice: 150 },
  { id: '3', name: 'Eagle Eye Peak', type: 'Mountain', basePrice: 180 }
];

const gearItems = [
  { id: '101', name: 'Premium 4-Person Tent', category: 'Tents & Bedding', rentPrice: 30, buyPrice: 200 },
  { id: '102', name: 'Dual Burner Gas Stove', category: 'Cooking', rentPrice: 15, buyPrice: 80 },
  { id: '103', name: 'Luxury Camp Chair', category: 'Comfort', rentPrice: 8, buyPrice: 45 }
];

// --- API Endpoints (Routes) ---

// 1. Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('Camping-as-a-Service Backend is running! 🌲');
});

// 2. Get All Destinations
app.get('/api/destinations', (req: Request, res: Response) => {
  res.json(destinations);
});

// 3. Get All Gear Items
app.get('/api/gear', (req: Request, res: Response) => {
  res.json(gearItems);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server successfully running on http://localhost:${PORT}`);
});