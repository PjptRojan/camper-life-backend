-- CreateEnum
CREATE TYPE "TrekRegion" AS ENUM ('Everest', 'Annapurna', 'Langtang', 'Manaslu', 'Mustang', 'Kanchenjunga');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('Easy', 'Moderate', 'Challenging', 'Strenuous');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('Spring', 'Summer', 'Autumn', 'Winter');

-- Clear legacy camping catalog rows (Mountain/Lakeside/Forest). This is
-- reference/catalog data with no per-user state; it is fully replaced by the
-- curated Nepal trek seed, so the new required columns can be added safely.
DELETE FROM "Destination";

-- AlterTable
ALTER TABLE "Destination"
  DROP COLUMN "basePrice",
  DROP COLUMN "type",
  ADD COLUMN "region" "TrekRegion" NOT NULL,
  ADD COLUMN "description" TEXT NOT NULL,
  ADD COLUMN "location" TEXT NOT NULL,
  ADD COLUMN "pricePerNight" INTEGER NOT NULL,
  ADD COLUMN "emoji" TEXT NOT NULL,
  ADD COLUMN "maxAltitudeMeters" INTEGER NOT NULL,
  ADD COLUMN "difficulty" "Difficulty" NOT NULL,
  ADD COLUMN "durationDaysMin" INTEGER NOT NULL,
  ADD COLUMN "durationDaysMax" INTEGER NOT NULL,
  ADD COLUMN "bestSeasons" "Season"[],
  ADD COLUMN "startPoint" TEXT NOT NULL,
  ADD COLUMN "permitsRequired" TEXT[];

-- CreateIndex
CREATE INDEX "Destination_region_idx" ON "Destination"("region");
