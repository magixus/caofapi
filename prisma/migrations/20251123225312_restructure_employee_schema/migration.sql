-- Step 1: Restructure Employee table to use userId as primary key
-- Drop existing Employee table (it's not being used yet based on the old schema)
DROP TABLE IF EXISTS "Employee" CASCADE;

-- Create new Employee table with userId as PK
CREATE TABLE "Employee" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("userId")
);

-- Create index on type
CREATE INDEX "Employee_type_idx" ON "Employee"("type");

-- Add foreign key to User
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 2: Restructure Doctor table - remove id, use userId as PK
-- First, we need to handle existing data if any
DO $$
DECLARE
    doctor_record RECORD;
BEGIN
    -- Create temporary table to store old data
    CREATE TEMP TABLE temp_doctors AS
    SELECT * FROM "Doctor";
    
    -- Drop the old table
    DROP TABLE "Doctor";
    
    -- Create new Doctor table with userId as PK
    CREATE TABLE "Doctor" (
        "userId" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "specialization" TEXT NOT NULL,
        "licenseNumber" TEXT NOT NULL,
        "dateOfBirth" TIMESTAMP(3) NOT NULL,
        "gender" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "hireDate" TIMESTAMP(3) NOT NULL,
        "status" "EmployeeStatus" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Doctor_pkey" PRIMARY KEY ("userId")
    );

    -- Recreate indexes
    CREATE UNIQUE INDEX "Doctor_licenseNumber_key" ON "Doctor"("licenseNumber");
    CREATE INDEX "Doctor_email_idx" ON "Doctor"("email");
    CREATE INDEX "Doctor_status_idx" ON "Doctor"("status");

    -- Add foreign key
    ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Migrate data from temp table if any exists
    FOR doctor_record IN SELECT * FROM temp_doctors LOOP
        INSERT INTO "Doctor" ("userId", "firstName", "lastName", "email", "phone", "specialization", "licenseNumber", "dateOfBirth", "gender", "address", "city", "hireDate", "status", "createdAt", "updatedAt")
        VALUES (doctor_record."userId", doctor_record."firstName", doctor_record."lastName", doctor_record."email", doctor_record."phone", doctor_record."specialization", doctor_record."licenseNumber", doctor_record."dateOfBirth", doctor_record."gender", doctor_record."address", doctor_record."city", doctor_record."hireDate", doctor_record."status", doctor_record."createdAt", doctor_record."updatedAt");
        
        -- Create corresponding Employee record
        INSERT INTO "Employee" ("userId", "type", "createdAt", "updatedAt")
        VALUES (doctor_record."userId", 'doctor', doctor_record."createdAt", doctor_record."updatedAt")
        ON CONFLICT ("userId") DO NOTHING;
    END LOOP;

    DROP TABLE temp_doctors;
END $$;

-- Step 3: Restructure Receptionist table
DO $$
DECLARE
    receptionist_record RECORD;
BEGIN
    CREATE TEMP TABLE temp_receptionists AS
    SELECT * FROM "Receptionist";
    
    DROP TABLE "Receptionist";
    
    CREATE TABLE "Receptionist" (
        "userId" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "dateOfBirth" TIMESTAMP(3) NOT NULL,
        "gender" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "hireDate" TIMESTAMP(3) NOT NULL,
        "shift" "Shift" NOT NULL,
        "status" "EmployeeStatus" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Receptionist_pkey" PRIMARY KEY ("userId")
    );

    CREATE INDEX "Receptionist_email_idx" ON "Receptionist"("email");
    CREATE INDEX "Receptionist_status_idx" ON "Receptionist"("status");

    ALTER TABLE "Receptionist" ADD CONSTRAINT "Receptionist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    FOR receptionist_record IN SELECT * FROM temp_receptionists LOOP
        INSERT INTO "Receptionist" ("userId", "firstName", "lastName", "email", "phone", "dateOfBirth", "gender", "address", "city", "hireDate", "shift", "status", "createdAt", "updatedAt")
        VALUES (receptionist_record."userId", receptionist_record."firstName", receptionist_record."lastName", receptionist_record."email", receptionist_record."phone", receptionist_record."dateOfBirth", receptionist_record."gender", receptionist_record."address", receptionist_record."city", receptionist_record."hireDate", receptionist_record."shift", receptionist_record."status", receptionist_record."createdAt", receptionist_record."updatedAt");
        
        INSERT INTO "Employee" ("userId", "type", "createdAt", "updatedAt")
        VALUES (receptionist_record."userId", 'receptionist', receptionist_record."createdAt", receptionist_record."updatedAt")
        ON CONFLICT ("userId") DO NOTHING;
    END LOOP;

    DROP TABLE temp_receptionists;
END $$;

-- Step 4: Restructure Applicator table
DO $$
DECLARE
    applicator_record RECORD;
BEGIN
    CREATE TEMP TABLE temp_applicators AS
    SELECT * FROM "Applicator";
    
    DROP TABLE "Applicator";
    
    CREATE TABLE "Applicator" (
        "userId" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "specialization" TEXT NOT NULL,
        "certificationNumber" TEXT NOT NULL,
        "dateOfBirth" TIMESTAMP(3) NOT NULL,
        "gender" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "hireDate" TIMESTAMP(3) NOT NULL,
        "experienceYears" INTEGER NOT NULL,
        "status" "EmployeeStatus" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Applicator_pkey" PRIMARY KEY ("userId")
    );

    CREATE UNIQUE INDEX "Applicator_certificationNumber_key" ON "Applicator"("certificationNumber");
    CREATE INDEX "Applicator_email_idx" ON "Applicator"("email");
    CREATE INDEX "Applicator_status_idx" ON "Applicator"("status");

    ALTER TABLE "Applicator" ADD CONSTRAINT "Applicator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    FOR applicator_record IN SELECT * FROM temp_applicators LOOP
        INSERT INTO "Applicator" ("userId", "firstName", "lastName", "email", "phone", "specialization", "certificationNumber", "dateOfBirth", "gender", "address", "city", "hireDate", "experienceYears", "status", "createdAt", "updatedAt")
        VALUES (applicator_record."userId", applicator_record."firstName", applicator_record."lastName", applicator_record."email", applicator_record."phone", applicator_record."specialization", applicator_record."certificationNumber", applicator_record."dateOfBirth", applicator_record."gender", applicator_record."address", applicator_record."city", applicator_record."hireDate", applicator_record."experienceYears", applicator_record."status", applicator_record."createdAt", applicator_record."updatedAt");
        
        INSERT INTO "Employee" ("userId", "type", "createdAt", "updatedAt")
        VALUES (applicator_record."userId", 'applicator', applicator_record."createdAt", applicator_record."updatedAt")
        ON CONFLICT ("userId") DO NOTHING;
    END LOOP;

    DROP TABLE temp_applicators;
END $$;
