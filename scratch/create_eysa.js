const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const bcrypt = require('bcrypt');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)/);
    if (match) {
        process.env[match[1].trim()] = match[2].trim();
    }
});

async function createEysa() {
    if (!process.env.POSTGRES_URL) {
        console.error("POSTGRES_URL is missing");
        return;
    }
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
    try {
        console.log("Checking if user eysa already exists...");
        const existing = await sql`SELECT * FROM users WHERE LOWER(name) = 'eysa'`;
        
        if (existing.length > 0) {
            console.log("User 'eysa' already exists. Updating password to tiara1710...");
            const hashedPassword = await bcrypt.hash('tiara1710', 10);
            await sql`UPDATE users SET password = ${hashedPassword} WHERE LOWER(name) = 'eysa'`;
            console.log("Password updated successfully.");
        } else {
            console.log("User 'eysa' doesn't exist. Creating...");
            const hashedPassword = await bcrypt.hash('tiara1710', 10);
            await sql`
                INSERT INTO users (name, email, password, phone, role) 
                VALUES ('eysa', 'eysa@example.com', ${hashedPassword}, '081234567890', 'Pelanggan')
            `;
            console.log("User eysa created successfully.");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sql.end();
    }
}

createEysa();
