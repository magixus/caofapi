-- AlterTable Patient - Change emergency contact from separate columns to JSON
-- First, migrate existing data to JSON format (if any exists)
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "emergencyContact" JSONB;

-- Migrate existing data to JSON (for patients that already have emergency contact data)
UPDATE "Patient" 
SET "emergencyContact" = jsonb_build_object(
  'name', COALESCE("emergencyContactName", ''),
  'relationship', COALESCE("emergencyContactRelationship", ''),
  'phone', COALESCE("emergencyContactPhone", '')
)
WHERE "emergencyContactName" IS NOT NULL;

-- Drop old columns
ALTER TABLE "Patient" DROP COLUMN IF EXISTS "emergencyContactName";
ALTER TABLE "Patient" DROP COLUMN IF EXISTS "emergencyContactRelationship";
ALTER TABLE "Patient" DROP COLUMN IF EXISTS "emergencyContactPhone";

-- Make emergencyContact required
ALTER TABLE "Patient" ALTER COLUMN "emergencyContact" SET NOT NULL;
