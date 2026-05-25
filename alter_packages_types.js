const postgres = require('postgres');
const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function main() {
  try {
    await sql`UPDATE packages SET type = 'Reguler' WHERE type = 'Biasa'`;
    await sql`UPDATE packages SET type = 'Express' WHERE type = 'Cepat'`;
    await sql`UPDATE packages SET type = 'Cargo' WHERE type = 'VVIP'`;
    console.log("Packages types updated successfully.");
  } catch (error) {
    console.error("Database Error:", error);
  } finally {
    process.exit(0);
  }
}

main();
