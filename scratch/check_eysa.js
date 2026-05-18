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

async function checkEysa() {
    if (!process.env.POSTGRES_URL) {
        console.error("POSTGRES_URL is missing");
        return;
    }
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
    try {
        console.log("Fetching user eysa...");
        const users = await sql`SELECT * FROM users WHERE LOWER(name) = LOWER('eysa')`;
        if (users.length === 0) {
            console.log("No user named 'eysa' found.");
        } else {
            console.log("User found:", users[0].id, users[0].name, users[0].email, users[0].role);
            const match = await bcrypt.compare('tiara1710', users[0].password);
            console.log("Password 'tiara1710' match:", match);
            console.log("Hash in DB:", users[0].password);
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await sql.end();
    }
}

checkEysa();
