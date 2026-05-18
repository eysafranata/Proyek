const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)/);
    if (match) {
        process.env[match[1].trim()] = match[2].trim();
    }
});

async function checkPackages() {
    if (!process.env.POSTGRES_URL) {
        console.error("POSTGRES_URL is missing");
        return;
    }
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
    try {
        console.log("Checking packages table schema...");
        const result = await sql`
            SELECT column_name, data_type, character_maximum_length, column_default
            FROM information_schema.columns
            WHERE table_name = 'packages';
        `;
        console.table(result);
        
        console.log("Checking constraints...");
        const constraints = await sql`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'packages'::regclass;
        `;
        console.table(constraints);
        
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sql.end();
    }
}

checkPackages();
