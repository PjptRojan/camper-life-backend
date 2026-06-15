/**
 * routes/destinations.ts
 * -----------------------------------------------------------------------------
 * Public read + admin write for the Nepal-trek destination catalog.
 *
 *   GET    /api/destinations          public  (optional ?region= filter)
 *   POST   /api/destinations          admin
 *   PUT    /api/destinations/:id      admin
 *   DELETE /api/destinations/:id      admin
 *
 * Validation mirrors the rules enforced in prisma/seed.ts so admin-created
 * destinations are held to the same standard as seeded ones.
 */

import { Router, type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export const destinationsRouter = Router();

const TREK_REGIONS = ['Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Mustang', 'Kanchenjunga'] as const;
const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Strenuous'] as const;
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

type TrekRegion = (typeof TREK_REGIONS)[number];

// Fields exposed to the frontend — the API contract shape (no createdAt).
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

/** A validated, persistable destination payload. */
interface DestinationInput {
  id: string;
  name: string;
  region: string;
  description: string;
  location: string;
  pricePerNight: number;
  emoji: string;
  maxAltitudeMeters: number;
  difficulty: string;
  durationDaysMin: number;
  durationDaysMax: number;
  bestSeasons: string[];
  startPoint: string;
  permitsRequired: string[];
}

/**
 * Validate a request body into a destination payload. `requireId` is false for
 * updates (the id comes from the URL param instead of the body).
 */
function validateDestination(
  body: any,
  requireId: boolean,
): { errors: string[]; data?: DestinationInput } {
  const errors: string[] = [];
  const b = body ?? {};

  const str = (field: string): string => {
    const v = b[field];
    if (typeof v !== 'string' || v.trim() === '') errors.push(`${field} is required and must be a non-empty string`);
    return typeof v === 'string' ? v : '';
  };
  const posInt = (field: string): number => {
    const v = b[field];
    if (!Number.isInteger(v) || v <= 0) errors.push(`${field} must be a positive integer`);
    return typeof v === 'number' ? v : 0;
  };
  const strArray = (field: string, allowEmpty: boolean): string[] => {
    const v = b[field];
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) {
      errors.push(`${field} must be an array of strings`);
      return [];
    }
    if (!allowEmpty && v.length === 0) errors.push(`${field} must be non-empty`);
    return v;
  };

  if (requireId) str('id');
  const name = str('name');
  const region = str('region');
  if (region && !TREK_REGIONS.includes(region as TrekRegion)) {
    errors.push(`region must be one of: ${TREK_REGIONS.join(', ')}`);
  }
  const description = str('description');
  const location = str('location');
  const emoji = str('emoji');
  const startPoint = str('startPoint');
  const difficulty = str('difficulty');
  if (difficulty && !DIFFICULTIES.includes(difficulty as any)) {
    errors.push(`difficulty must be one of: ${DIFFICULTIES.join(', ')}`);
  }
  const pricePerNight = posInt('pricePerNight');
  const maxAltitudeMeters = posInt('maxAltitudeMeters');
  const durationDaysMin = posInt('durationDaysMin');
  const durationDaysMax = posInt('durationDaysMax');
  if (durationDaysMin && durationDaysMax && durationDaysMin > durationDaysMax) {
    errors.push('durationDaysMin must be <= durationDaysMax');
  }
  const bestSeasons = strArray('bestSeasons', false);
  for (const s of bestSeasons) {
    if (!SEASONS.includes(s as any)) errors.push(`invalid season "${s}"`);
  }
  const permitsRequired = strArray('permitsRequired', true);

  if (errors.length > 0) return { errors };
  return {
    errors,
    data: {
      id: b.id,
      name,
      region,
      description,
      location,
      pricePerNight,
      emoji,
      maxAltitudeMeters,
      difficulty,
      durationDaysMin,
      durationDaysMax,
      bestSeasons,
      startPoint,
      permitsRequired,
    },
  };
}

// --- GET (public) ----------------------------------------------------------
destinationsRouter.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
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

// --- POST (admin) ----------------------------------------------------------
destinationsRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<any> => {
  const { errors, data } = validateDestination(req.body, true);
  if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });
  try {
    const existing = await prisma.destination.findUnique({ where: { id: data!.id } });
    if (existing) return res.status(409).json({ message: `A destination with id "${data!.id}" already exists.` });
    const created = await prisma.destination.create({ data: data as any, select: DESTINATION_SELECT });
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- PUT (admin) -----------------------------------------------------------
destinationsRouter.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  const { errors, data } = validateDestination(req.body, false);
  if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });
  try {
    const existing = await prisma.destination.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: `No destination with id "${id}".` });
    const { id: _ignore, ...rest } = data!;
    const updated = await prisma.destination.update({ where: { id }, data: rest as any, select: DESTINATION_SELECT });
    res.json(updated);
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- DELETE (admin) --------------------------------------------------------
destinationsRouter.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  try {
    const existing = await prisma.destination.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: `No destination with id "${id}".` });
    await prisma.destination.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
