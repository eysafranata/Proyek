const postgres = require('postgres');

async function test() {
    if (!process.env.POSTGRES_URL) {
        console.log("MISSING URL");
        return;
    }
    
    // Try without SSL require if it fails, or keep it standard
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });
    
    try {
        console.log("Checking users table structure...");
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `;
        console.log("Columns in 'users' table:");
        columns.forEach(c => console.log(`- ${c.column_name}: ${c.data_type}`));
        
        const count = await sql`SELECT COUNT(*) FROM users`;
        console.log("Total users:", count[0].count);

    } catch (err) {
        console.error("Query failed:", err.message);
    } finally {
        await sql.end();
    }
}

test().catch(console.error);
