const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// Manually parse .env to get POSTGRES_URL
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

async function setupComplaintsTable() {
    if (!dbUrl) {
        console.error("Error: POSTGRES_URL is not defined in environment or .env file.");
        return;
    }
    const sql = postgres(dbUrl, { ssl: 'require' });
    try {
        console.log("Setting up complaints table...");
        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
        await sql`
            CREATE TABLE IF NOT EXISTS complaints (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("Table 'complaints' created successfully.");
    } catch (err) {
        console.error("Error creating table:", err.message);
    } finally {
        await sql.end();
    }
}

setupComplaintsTable().catch(console.error);
