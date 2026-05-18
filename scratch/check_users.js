const postgres = require('postgres');

async function checkUsers() {
    if (!process.env.POSTGRES_URL) {
        console.error("POSTGRES_URL is missing");
        return;
    }
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
    try {
        console.log("Fetching users...");
        const users = await sql`SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC LIMIT 5`;
        console.table(users);
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await sql.end();
    }
}

checkUsers();
