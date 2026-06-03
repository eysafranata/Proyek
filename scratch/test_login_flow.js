const http = require('http');

// Helper to make a POST request
function postRequest(url, data, cookies = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Helper to make a GET request
function getRequest(url, cookies = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });

    req.on('error', reject);
    req.end();
  });
}

// Helper to extract cookies from Set-Cookie headers
function parseCookies(setCookieHeaders) {
  if (!setCookieHeaders) return '';
  return setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
}

async function main() {
  console.log("Starting diagnostic login test...");
  
  // Since authenticateUser is a Next.js Server Action, calling POST /login directly as JSON might not execute it.
  // Next.js Server Actions are called by sending a POST to the current route with 'Next-Action' header.
  // Let's first scan the login page to see if we can find the Server Action ID!
  const loginPage = await getRequest('http://localhost:3000/login');
  
  // Search for the Next-Action ID inside the login page source code
  // Server action IDs are typically hex strings (e.g. 40-character strings) in the JS code or inputs.
  const actionMatch = loginPage.body.match(/&quot;[a-f0-9]{40}&quot;/i) || loginPage.body.match(/"action":"([a-f0-9]{40})"/);
  
  console.log("Action ID search:", actionMatch ? actionMatch[0] : "Not found in raw search");
  
  // Instead of server action POST, let's write a direct DB simulation cookie setter for testing
  // We can test the middleware directly by manually setting the session cookies to see how the middleware behaves!
  console.log("\n--- Testing Middleware with Valid Admin Cookies ---");
  const adminCookie = "session_user_id=c2a3fb28-215d-448a-9ccc-c91af2937d09; session_user_role=Admin";
  
  const adminDash = await getRequest('http://localhost:3000/dashboard-admin', adminCookie);
  console.log("Accessing /dashboard-admin with Admin cookies:");
  console.log("Status Code:", adminDash.statusCode);
  console.log("Headers x-middleware-rewrite:", adminDash.headers['x-middleware-rewrite']);
  console.log("Location (if redirect):", adminDash.headers['location']);

  console.log("\n--- Testing Middleware with Valid Pelanggan Cookies ---");
  const userCookie = "session_user_id=516e4521-5c0a-49b2-8d08-54f91a6c6ac8; session_user_role=Pelanggan";
  
  const userDash = await getRequest('http://localhost:3000/dashboard', userCookie);
  console.log("Accessing /dashboard with Pelanggan cookies:");
  console.log("Status Code:", userDash.statusCode);
  console.log("Headers x-middleware-rewrite:", userDash.headers['x-middleware-rewrite']);
  console.log("Location (if redirect):", userDash.headers['location']);
  
  console.log("\n--- Testing Middleware with Invalid Role Cookies ---");
  const badCookie = "session_user_id=516e4521-5c0a-49b2-8d08-54f91a6c6ac8; session_user_role=Admin";
  const badDash = await getRequest('http://localhost:3000/dashboard-admin', badCookie);
  console.log("Accessing /dashboard-admin with Pelanggan ID but Admin role cookie:");
  console.log("Status Code:", badDash.statusCode);
  console.log("Headers x-middleware-rewrite:", badDash.headers['x-middleware-rewrite']);
}

main().catch(console.error);
