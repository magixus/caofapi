-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN "code" TEXT;

-- Create temporary function to generate sequential codes
DO $$
DECLARE
    quotation_record RECORD;
    year_month TEXT;
    sequence_num INT;
    new_code TEXT;
    current_year_month TEXT;
    current_sequence INT;
BEGIN
    current_year_month := '';
    current_sequence := 0;
    
    -- Loop through all existing quotations ordered by creation date
    FOR quotation_record IN 
        SELECT id, "createdAt" 
        FROM "Quotation" 
        ORDER BY "createdAt" ASC
    LOOP
        -- Extract year-month from createdAt
        year_month := TO_CHAR(quotation_record."createdAt", 'YYYYMM');
        
        -- Reset sequence if we've moved to a new month
        IF year_month != current_year_month THEN
            current_year_month := year_month;
            current_sequence := 0;
        END IF;
        
        -- Increment sequence
        current_sequence := current_sequence + 1;
        
        -- Generate code: CA-YYYYMM0000000001
        new_code := 'CA-' || year_month || LPAD(current_sequence::TEXT, 10, '0');
        
        -- Update the quotation with generated code
        UPDATE "Quotation" 
        SET code = new_code 
        WHERE id = quotation_record.id;
    END LOOP;
END $$;

-- Make code column NOT NULL after populating
ALTER TABLE "Quotation" ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_code_key" ON "Quotation"("code");

-- CreateIndex
CREATE INDEX "Quotation_code_idx" ON "Quotation"("code");

-- CreateIndex
CREATE INDEX "Quotation_createdAt_idx" ON "Quotation"("createdAt");
