/**
 * routes/services.ts
 * -----------------------------------------------------------------------------
 * Public read + admin write for the on-site services catalog.
 *
 *   GET    /api/services          public
 *   POST   /api/services          admin
 *   PUT    /api/services/:id      admin
 *   DELETE /api/services/:id      admin
 */

import { Router, type Request, type Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export const servicesRouter = Router();

interface ServiceInput {
  name: string;
  category: string;
  description: string;
  emoji: string;
  price: number;
}

function validateService(body: any): { errors: string[]; data?: ServiceInput } {
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

  const name = str('name', true);
  const category = str('category', true);
  const description = str('description', false);
  const emoji = str('emoji', false);
  const price = b.price;
  if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
    errors.push('price must be a number >= 0');
  }

  if (errors.length > 0) return { errors };
  return { errors, data: { name, category, description, emoji, price: price as number } };
}

servicesRouter.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const services = await prisma.onSiteService.findMany({ orderBy: { name: 'asc' } });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

servicesRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<any> => {
  const { errors, data } = validateService(req.body);
  if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });
  try {
    const created = await prisma.onSiteService.create({ data: data! });
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

servicesRouter.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  const { errors, data } = validateService(req.body);
  if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });
  try {
    const existing = await prisma.onSiteService.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: `No service with id "${id}".` });
    const updated = await prisma.onSiteService.update({ where: { id }, data: data! });
    res.json(updated);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

servicesRouter.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  try {
    const existing = await prisma.onSiteService.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: `No service with id "${id}".` });
    await prisma.onSiteService.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
