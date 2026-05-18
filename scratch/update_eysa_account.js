const postgres = require('postgres');
const bcrypt = require('bcrypt');

async function updateEysaAccount() {
    const url = "postgresql://neondb_owner:npg_NBmkgR30Ihuw@ep-round-wind-ann0jvgu-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
    const sql = postgres(url, { ssl: 'require' });

    const name = "eysa";
    const password = "tiara1710";
    const email = "sera@gmail.com";
    const phone = "082117103007";

    try {
        console.log("Hashing new password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Updating account for 'eysa'...");
        const result = await sql`
            UPDATE users 
            SET email = ${email}, password = ${hashedPassword}, phone = ${phone}
            WHERE name = ${name}
            RETURNING id;
        `;

        if (result.length === 0) {
            console.log("User 'eysa' not found, creating new account...");
            await sql`
                INSERT INTO users (name, email, password, phone, role)
                VALUES (${name}, ${email}, ${hashedPassword}, ${phone}, 'Pelanggan')
            `;
            console.log("Success! Account 'eysa' created.");
        } else {
            console.log("Success! Account 'eysa' updated.");
        }

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await sql.end();
    }
}

updateEysaAccount();
