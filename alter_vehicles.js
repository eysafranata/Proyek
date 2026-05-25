const postgres = require('postgres');
const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function main() {
  try {
    await sql`UPDATE vehicles SET nama_kendaraan = 'Cargo', jenis_kendaraan = 'Cargo' WHERE nama_kendaraan ILIKE '%fuso%'`;
    console.log("Vehicle updated successfully.");
  } catch (error) {
    console.error("Database Error:", error);
  } finally {
    process.exit(0);
  }
}

main();
