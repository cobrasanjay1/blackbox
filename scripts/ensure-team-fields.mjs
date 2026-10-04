import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

try {
  await client.query("BEGIN");

  await client.query(`
    ALTER TABLE "Team"
      ADD COLUMN IF NOT EXISTS "nameKey" TEXT,
      ADD COLUMN IF NOT EXISTS "code" TEXT
  `);

  await client.query(`
    UPDATE "Team"
    SET "nameKey" = lower(regexp_replace(trim("name"), '\\s+', ' ', 'g'))
    WHERE "nameKey" IS NULL
  `);

  const teams = await client.query(
    'SELECT "id" FROM "Team" WHERE "code" IS NULL FOR UPDATE'
  );

  for (const row of teams.rows) {
    let assigned = false;

    while (!assigned) {
      const result = await client.query(
        `
          UPDATE "Team"
          SET "code" = lpad((floor(random() * 1000000))::int::text, 6, '0')
          WHERE "id" = $1
            AND "code" IS NULL
          RETURNING "code"
        `,
        [row.id]
      );

      if (!result.rows[0]?.code) continue;

      const code = result.rows[0].code;
      const collision = await client.query(
        'SELECT 1 FROM "Team" WHERE "code" = $1 AND "id" <> $2 LIMIT 1',
        [code, row.id]
      );

      if (collision.rowCount === 0) {
        assigned = true;
      } else {
        await client.query(
          'UPDATE "Team" SET "code" = NULL WHERE "id" = $1',
          [row.id]
        );
      }
    }
  }

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Team_code_key"
    ON "Team"("code")
  `);

  await client.query("COMMIT");
  console.log("[team-schema] Team rejoin fields are ready");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("[team-schema] Failed:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
