const postgres = require('postgres');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });

async function debugRegister() {
    const url = "postgresql://neondb_owner:npg_NBmkgR30Ihuw@ep-round-wind-ann0jvgu-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
    const sql = postgres(url, { ssl: 'require' });

    const name = "Debug User";
    const email = "debug@test.com";
    const password = "password123";
    const phone = "08123456789";

    try {
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed:", hashedPassword);

        console.log("Inserting user...");
        await sql`
            INSERT INTO users (name, email, password, phone, role)
            VALUES (${name}, ${email}, ${hashedPassword}, ${phone}, 'Pelanggan')
        `;
        console.log("Success! User registered.");

        console.log("Verifying login...");
        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length === 0) {
            console.error("User not found after insert!");
            return;
        }
        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        console.log("Password match:", match);

    } catch (err) {
        console.error("Error during registration:", err.message);
        if (err.message.includes("duplicate key")) {
            console.log("User already exists, checking password...");
            const users = await sql`SELECT * FROM users WHERE email = ${email}`;
            const match = await bcrypt.compare(password, users[0].password);
            console.log("Existing user password match:", match);
        }
    } finally {
        await sql.end();
    }
}

debugRegister();
