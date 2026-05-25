const postgres = require('postgres');

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function main() {
  try {
    // Add new columns to packages
    await sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS status_barang VARCHAR(50) DEFAULT 'Aman'`;
    await sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS status_transaksi VARCHAR(50) DEFAULT 'Belum Lunas'`;

    // Create vehicles table
    await sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        nama_kendaraan VARCHAR(255) NOT NULL,
        jenis_kendaraan VARCHAR(100) NOT NULL,
        kode_kendaraan VARCHAR(50) NOT NULL,
        kapasitas_muatan FLOAT NOT NULL,
        status_kendaraan VARCHAR(50) DEFAULT 'Tersedia',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log("Database altered successfully");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
