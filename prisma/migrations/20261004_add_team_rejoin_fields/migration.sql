ALTER TABLE "Team"
  ADD COLUMN IF NOT EXISTS "nameKey" TEXT,
  ADD COLUMN IF NOT EXISTS "code" TEXT;

UPDATE "Team"
SET "nameKey" = lower(regexp_replace(trim("name"), '\s+', ' ', 'g'))
WHERE "nameKey" IS NULL;

DO $$
DECLARE
  r RECORD;
  candidate TEXT;
BEGIN
  FOR r IN SELECT "id" FROM "Team" WHERE "code" IS NULL LOOP
    LOOP
      candidate := lpad((floor(random() * 1000000))::int::text, 6, '0');
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM "Team" WHERE "code" = candidate
      );
    END LOOP;

    UPDATE "Team"
    SET "code" = candidate
    WHERE "id" = r."id";
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Team_nameKey_key"
  ON "Team"("nameKey");

CREATE UNIQUE INDEX IF NOT EXISTS "Team_code_key"
  ON "Team"("code");
