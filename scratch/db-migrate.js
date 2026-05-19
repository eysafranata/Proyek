
const postgres = require('postgres');

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function migrate() {
  try {
    // 1. Check current structure
    const tables = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'packages';
    `;
    console.log("Current packages schema:", tables);

    if (tables.length === 0) {
      // create it if not exists (though createPackage works so it must exist)
      console.log("Table packages does not exist?");
    } else {
      const hasUserId = tables.some(c => c.column_name === 'user_id');
      if (!hasUserId) {
        console.log("Adding user_id to packages...");
        await sql`ALTER TABLE packages ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL`;
        console.log("Added user_id successfully.");
      } else {
        console.log("user_id already exists.");
      }
    }
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
