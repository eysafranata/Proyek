const bcrypt = require('bcrypt');

async function test() {
    console.log("Starting bcrypt test...");
    const start = Date.now();
    const hash = await bcrypt.hash("test", 10);
    const end = Date.now();
    console.log("Bcrypt hashed in", end - start, "ms");
    console.log("Hash:", hash);
}

test().catch(console.error);
