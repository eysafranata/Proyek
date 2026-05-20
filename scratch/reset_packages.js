const postgres = require("postgres");
const fs = require("fs");
const env = fs.readFileSync(".env", "utf8");
const match = env.match(/^POSTGRES_URL=(.+)$/m);
const url = match[1].trim();
const sql = postgres(url, { ssl: "require" });

async function reset() {
  await sql`DELETE FROM packages`;
  console.log("Reset berhasil. Semua data paket telah dihapus.");
  await sql.end();
}

reset().catch(e => { console.error(e); process.exit(1); });
