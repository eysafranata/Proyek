const postgres = require('postgres');

async function test() {
    console.log("Testing SQL connection to", process.env.POSTGRES_URL ? "(URL hidden)" : "MISSING URL");
    if (!process.env.POSTGRES_URL) return;
    
    const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require', connect_timeout: 10 });
    
    console.log("Running simple query...");
    const start = Date.now();
    try {
        const res = await sql`SELECT 1 as test`;
        const end = Date.now();
        console.log("Query successful in", end - start, "ms");
        console.log("Result:", res);
    } catch (err) {
        console.error("Query failed:", err.message);
    } finally {
        await sql.end();
    }
}

test().catch(console.error);
