const http = require('http');

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      console.log(`URL: ${url}`);
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      resolve();
    }).on('error', (err) => {
      console.error(`Error for ${url}:`, err.message);
      resolve();
    });
  });
}

async function main() {
  await checkUrl('http://localhost:3000/login');
  console.log('---');
  await checkUrl('http://localhost:3000/dashboard-admin');
  console.log('---');
  await checkUrl('http://localhost:3000/dashboard');
}

main();
