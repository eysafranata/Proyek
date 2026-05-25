const postgres = require('postgres');
const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

const indonesianCities = [
  "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", 
  "Makassar", "Palembang", "Tangerang", "Depok", "Bekasi", 
  "Denpasar", "Malang", "Yogyakarta", "Balikpapan", "Banjarmasin"
];

async function main() {
  try {
    // 1. Add column if not exists
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS kota_asal VARCHAR(100)`;
    console.log("Column kota_asal added.");

    // 2. Fetch all users that have kota_asal as NULL
    const usersWithoutCity = await sql`SELECT id FROM users WHERE kota_asal IS NULL OR kota_asal = ''`;
    console.log(`Found ${usersWithoutCity.length} users without a city.`);

    // 3. Update them with random cities
    for (const user of usersWithoutCity) {
      const randomCity = indonesianCities[Math.floor(Math.random() * indonesianCities.length)];
      await sql`UPDATE users SET kota_asal = ${randomCity} WHERE id = ${user.id}`;
    }
    console.log("Existing users updated with random cities successfully.");

  } catch (err) {
    console.error("Database Error:", err);
  } finally {
    process.exit(0);
  }
}

main();
