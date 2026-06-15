/**
 * routes/gear.ts
 * -----------------------------------------------------------------------------
 * Public read + admin write for the gear catalog.
 *
 *   GET    /api/gear          public
 *   POST   /api/gear          admin
 *   PUT    /api/gear/:id      admin
 *   DELETE /api/gear/:id      admin
 */

import { Router, type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export const gearRouter = Router();

interface GearInput {
  name: string;
  category: string;
  description: string;
  emoji: string;
  rentPrice: number;
  buyPrice: number;
}

function validateGear(body: any): { errors: string[]; data?: GearInput } {
  const errors: string[] = [];
  const b = body ?? {};

  const str = (field: string, required: boolean): string => {
    const v = b[field];
    if (required && (typeof v !== 'string' || v.trim() === '')) {
      errors.push(`${field} is required and must be a non-empty string`);
    } else if (v !== undefined && typeof v !== 'string') {
      errors.push(`${field} must be a string`);
    }
    return typeof v === 'string' ? v : '';
  };
  const nonNegNum = (field: string): number => {
    const v = b[field];
    if (typeof v !== 'number' || Number.isNaN(v) || v < 0) errors.push(`${field} must be a number >= 0`);
    return typeof v === 'number' ? v : 0;
  };

  const name = str('name', true);
  const category = str('category', true);
  const description = str('description', false);
  const emoji = str('emoji', false);
  const rentPrice = nonNegNum('rentPrice');
  const buyPrice = nonNegNum('buyPrice');

  if (errors.length > 0) return { errors };
  return { errors, data: { name, category, description, emoji, rentPrice, buyPrice } };
}

gearRouter.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const gearItems = await prisma.gearItem.findMany({ orderBy: { name: 'asc' } });
    res.json(gearItems);
  } catch (error) {
    console.error('Error fetching gear items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

gearRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<any> => {
  const { errors, data } = validateGear(req.body);
  if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });
  try {
    const created = await prisma.gearItem.create({ data: data! });
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating gear item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

gearRouter.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  const { errors, data } = validateGear(req.body);
  if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });
  try {
    const existing = await prisma.gearItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: `No gear item with id "${id}".` });
    const updated = await prisma.gearItem.update({ where: { id }, data: data! });
    res.json(updated);
  } catch (error) {
    console.error('Error updating gear item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

gearRouter.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  try {
    const existing = await prisma.gearItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: `No gear item with id "${id}".` });
    await prisma.gearItem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting gear item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
