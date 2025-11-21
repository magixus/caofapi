-- AlterTable
ALTER TABLE "Patient" DROP CONSTRAINT IF EXISTS "Patient_nationalId_key";
ALTER TABLE "Patient" DROP CONSTRAINT IF EXISTS "Patient_socialSecurityNumber_key";

-- AlterTable Patient - Add new columns
ALTER TABLE "Patient" 
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "gender" TEXT,
  ADD COLUMN IF NOT EXISTS "address" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "bloodType" TEXT,
  ADD COLUMN IF NOT EXISTS "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "currentMedications" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "emergencyContactName" TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyContactRelationship" TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyContactPhone" TEXT;

-- AlterTable Patient - Modify existing columns
ALTER TABLE "Patient" 
  ALTER COLUMN "nationalId" TYPE TEXT,
  ALTER COLUMN "socialSecurityNumber" TYPE TEXT,
  ALTER COLUMN "insuranceType" DROP NOT NULL;

-- Make new required fields NOT NULL (after data migration if needed)
ALTER TABLE "Patient"
  ALTER COLUMN "email" SET NOT NULL,
  ALTER COLUMN "phone" SET NOT NULL,
  ALTER COLUMN "dateOfBirth" SET NOT NULL,
  ALTER COLUMN "gender" SET NOT NULL,
  ALTER COLUMN "address" SET NOT NULL,
  ALTER COLUMN "city" SET NOT NULL,
  ALTER COLUMN "bloodType" SET NOT NULL,
  ALTER COLUMN "emergencyContactName" SET NOT NULL,
  ALTER COLUMN "emergencyContactRelationship" SET NOT NULL,
  ALTER COLUMN "emergencyContactPhone" SET NOT NULL;
