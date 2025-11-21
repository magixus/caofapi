-- AlterTable Permission - Add description column
ALTER TABLE "Permission" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Set default descriptions for existing permissions (if any)
UPDATE "Permission" SET "description" = 
  CASE 
    WHEN action = 'create' THEN 'Create ' || resource || ' resources'
    WHEN action = 'read' THEN 'View ' || resource || ' information'
    WHEN action = 'update' THEN 'Modify ' || resource || ' details'
    WHEN action = 'delete' THEN 'Remove ' || resource || ' from system'
    WHEN action = 'manage' THEN 'Manage ' || resource || ' operations'
    ELSE action || ' permission for ' || resource
  END
WHERE "description" IS NULL;

-- Make description required
ALTER TABLE "Permission" ALTER COLUMN "description" SET NOT NULL;
