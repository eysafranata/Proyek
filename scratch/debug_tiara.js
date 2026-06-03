const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const bcrypt = require('bcrypt');

// Load .env manually if process.env.POSTGRES_URL is not set
if (!process.env.POSTGRES_URL) {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (err) {
    console.error("Error reading .env file", err);
  }
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function checkTiara() {
  try {
    console.log("Checking user 'tiara' in database...");
    const users = await sql`SELECT * FROM users WHERE name = 'tiara'`;
    if (users.length === 0) {
      console.log("User 'tiara' not found!");
      return;
    }
    const user = users[0];
    console.log("User found:");
    console.log("ID:", user.id);
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Password Hash Length:", user.password.length);
    console.log("Password Hash:", user.password);

    console.log("\nAttempting bcrypt compare with 'tiaracantik'...");
    try {
      const match = await bcrypt.compare('tiaracantik', user.password);
      console.log("Result match:", match);
    } catch (err) {
      console.error("Bcrypt compare threw error:", err.message);
    }
  } catch (err) {
    console.error("Database query failed:", err.message);
  } finally {
    await sql.end();
  }
}

checkTiara();
