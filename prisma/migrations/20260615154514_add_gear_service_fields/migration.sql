-- AlterTable
ALTER TABLE "GearItem" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "emoji" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "OnSiteService" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "emoji" TEXT NOT NULL DEFAULT '';
