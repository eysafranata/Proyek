const postgres = require('postgres');
const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function main() {
  try {
    await sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS plat_kendaraan VARCHAR(50)`;
    console.log("Column plat_kendaraan added to packages table.");
  } catch (err) {
    console.error("Database Error:", err);
  } finally {
    process.exit(0);
  }
}

main();
