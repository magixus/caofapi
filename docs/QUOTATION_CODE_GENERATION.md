# Quotation Code Generation

## Overview
Every quotation in the system is automatically assigned a unique sequential code for easy identification and tracking in the UI.

## Code Format
```
CA-YYYYMM0000000001
```

### Components:
- **CA**: Fixed prefix (Chiffre d'Affaires / Quotation)
- **YYYY**: 4-digit year (e.g., 2025)
- **MM**: 2-digit month (01-12)
- **0000000001**: 10-digit sequential number (padded with leading zeros)

## Examples
- First quotation in November 2025: `CA-2025110000000001`
- Second quotation in November 2025: `CA-2025110000000002`
- 100th quotation in November 2025: `CA-2025110000000100`
- First quotation in December 2025: `CA-2025120000000001` (sequence resets)

## Behavior

### Sequential Numbering
- Sequence starts at 1 for each new month
- Sequence resets to 1 when a new month begins
- Numbers are padded with leading zeros to maintain a 10-digit format
- Maximum sequence per month: 9,999,999,999 (10 billion quotations)

### Automatic Generation
The code is automatically generated when creating a quotation:
1. System extracts current year and month
2. Queries database for the last quotation in current month
3. Increments the sequence number
4. Formats the code with proper padding
5. Saves the quotation with the unique code

### Uniqueness
- The `code` field is **unique** across the entire database
- Database enforces uniqueness constraint at the schema level
- Indexed for fast lookups and sorting

## Database Schema

```prisma
model Quotation {
  id               String             @id @default(uuid())
  code             String             @unique // CA-YYYYMM0000000001
  patient          Patient            @relation(fields: [patientId], references: [id])
  patientId        String
  createdBy        Employee           @relation(fields: [createdById], references: [id])
  createdById      String
  status           QuotationStatus    @default(created)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  
  @@index([code])
  @@index([createdAt])
}
```

## API Response Example

When creating a quotation via POST `/quotation`:

**Request:**
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "CA-2025110000000042",
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "createdById": "e4f5g6h7-i8j9-0123-4567-890abcdef123",
  "status": "created",
  "createdAt": "2025-11-21T14:30:25.123Z",
  "updatedAt": "2025-11-21T14:30:25.123Z",
  "patient": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    // ... other patient fields
  },
  "createdBy": {
    "id": "e4f5g6h7-i8j9-0123-4567-890abcdef123",
    "firstName": "Jane",
    "lastName": "Smith",
    // ... other employee fields
  }
}
```

## Implementation Details

### Service Method: `generateQuotationCode()`

```typescript
private async generateQuotationCode(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `CA-${year}${month}`;

  // Find the last quotation for this year-month
  const lastQuotation = await this.prisma.quotation.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: 'desc',
    },
  });

  let sequence = 1;
  if (lastQuotation && lastQuotation.code) {
    // Extract the last 10 digits and increment
    const lastSequence = parseInt(lastQuotation.code.slice(-10), 10);
    sequence = lastSequence + 1;
  }

  // Format: CA-YYYYMM0000000001 (10 digits for sequence)
  const sequenceStr = String(sequence).padStart(10, '0');
  const code = `${prefix}${sequenceStr}`;
  
  return code;
}
```

## Migration

Existing quotations are automatically assigned codes during migration:
- Sorted by `createdAt` in ascending order
- Codes generated based on original creation month
- Sequential numbering within each month
- No duplicate codes

**Migration SQL** (excerpt):
```sql
-- Add code column
ALTER TABLE "Quotation" ADD COLUMN "code" TEXT;

-- Generate codes for existing quotations
DO $$
DECLARE
    quotation_record RECORD;
    year_month TEXT;
    sequence_num INT;
    new_code TEXT;
BEGIN
    -- Loop through quotations by creation date
    FOR quotation_record IN 
        SELECT id, "createdAt" 
        FROM "Quotation" 
        ORDER BY "createdAt" ASC
    LOOP
        -- Generate sequential code
        -- ...
    END LOOP;
END $$;

-- Make code NOT NULL and unique
ALTER TABLE "Quotation" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "Quotation_code_key" ON "Quotation"("code");
```

## Benefits

### For Users
1. **Human-readable**: Easy to communicate over phone/email
2. **Sortable**: Natural chronological ordering
3. **Trackable**: Month-based organization
4. **Predictable**: Sequential numbering is intuitive

### For System
1. **Unique**: Guaranteed uniqueness via database constraint
2. **Indexed**: Fast queries and lookups
3. **Scalable**: Supports billions of quotations per month
4. **Automatic**: No manual intervention required

## Best Practices

### Display in UI
- **Show code prominently** in quotation lists and detail views
- Use code as primary identifier for users (UUID for system)
- Sort by code for chronological view
- Include code in search functionality

### Example UI Display
```
Quotation #CA-2025110000000042
Patient: John Doe
Status: Created
Date: Nov 21, 2025
```

### Search and Filter
- Search by code: `CA-202511*` (all Nov 2025 quotations)
- Filter by month: Extract YYYYMM from code
- Sort by code: Natural chronological ordering

## Error Handling

The system handles edge cases gracefully:
- **Concurrent creation**: Database unique constraint prevents duplicates
- **Missing codes in sequence**: System continues from last code
- **Month rollover**: Automatic sequence reset
- **Large numbers**: Supports up to 10 billion per month

## Testing

Test scenarios:
1. Create first quotation in a new month
2. Create multiple quotations in same month (verify sequential increment)
3. Create quotation in new month (verify sequence reset)
4. Retrieve quotation by code
5. Filter quotations by code prefix

## Future Enhancements

Potential improvements:
- Custom prefixes per branch/location (e.g., `CA-LOC1-202511-0000000001`)
- Year-based sequential numbering (reset yearly instead of monthly)
- Configurable sequence padding (e.g., 6 digits instead of 10)
- Code generation strategy selection (monthly, yearly, continuous)

---

**Created**: November 21, 2025  
**Last Updated**: November 21, 2025  
**Author**: GenSpark AI Developer
