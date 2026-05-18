const postgres = require('postgres');

async function setupPackagesTable() {
    if (!process.env.POSTGRES_URL) {
        console.log("MISSING URL");
        return;
    }
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
    try {
        console.log("Setting up packages table...");
        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
        await sql`
            CREATE TABLE IF NOT EXISTS packages (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                resi VARCHAR(255) NOT NULL UNIQUE,
                sender_name VARCHAR(255) NOT NULL,
                receiver_name VARCHAR(255) NOT NULL,
                origin VARCHAR(255) NOT NULL,
                destination VARCHAR(255) NOT NULL,
                weight DECIMAL NOT NULL,
                type VARCHAR(50) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                total_price INT NOT NULL,
                status VARCHAR(50) DEFAULT 'Dalam Pengiriman',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("Table 'packages' created successfully.");
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await sql.end();
    }
}

setupPackagesTable().catch(console.error);
