const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Load .env manually if process.env.POSTGRES_URL is not set
if (!process.env.POSTGRES_URL) {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (err) {
    console.error("Error reading .env file", err);
  }
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function main() {
  try {
    await sql`ALTER TABLE packages ADD COLUMN IF NOT EXISTS alamat TEXT`;
    console.log("Column 'alamat' added to packages table.");
  } catch (err) {
    console.error("Database Error:", err);
  } finally {
    process.exit(0);
  }
}

main();
