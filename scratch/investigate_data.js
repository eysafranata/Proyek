const postgres = require('postgres');

async function test() {
    if (!process.env.POSTGRES_URL) {
        console.log("MISSING URL");
        return;
    }
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
    try {
        console.log("--- USERS TABLE ---");
        const users = await sql`SELECT * FROM users`;
        console.log(JSON.stringify(users, null, 2));

        console.log("\n--- INVOICES TABLE (checking for Evil Rabbit) ---");
        const invoices = await sql`
            SELECT invoices.amount, customers.name 
            FROM invoices 
            JOIN customers ON invoices.customer_id = customers.id 
            LIMIT 5
        `;
        console.log(JSON.stringify(invoices, null, 2));

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await sql.end();
    }
}

test().catch(console.error);
