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

async function checkUsers() {
    if (!process.env.POSTGRES_URL) {
        console.error("POSTGRES_URL is missing");
        return;
    }
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
    try {
        console.log("Fetching all users...");
        const users = await sql`SELECT id, name, email, role FROM users`;
        console.table(users);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sql.end();
    }
}

checkUsers();
