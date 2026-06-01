const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

let dbUrl = process.env.POSTGRES_URL;
if (!dbUrl) {
    try {
        const envPath = path.join(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/^POSTGRES_URL=(.+)$/m);
            if (match) {
                dbUrl = match[1].trim();
            }
        }
    } catch (e) {
        console.error("Error reading .env:", e);
    }
}

async function main() {
    if (!dbUrl) {
        console.error("Error: POSTGRES_URL is not defined in environment or .env file.");
        return;
    }
    const sql = postgres(dbUrl, { ssl: 'require' });
    try {
        console.log("Altering complaints table to add reply fields...");
        await sql`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS admin_reply TEXT`;
        await sql`ALTER TABLE complaints ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP`;
        console.log("Database altered successfully");
    } catch (err) {
        console.error(err);
    } finally {
        await sql.end();
    }
}

main().catch(console.error);
