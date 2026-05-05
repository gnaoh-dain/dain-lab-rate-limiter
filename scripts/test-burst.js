const axios = require('axios');

const URL = 'http://localhost:3000/public';
const TOTAL = 200;

async function run() {
  const results = {
    success: 0,
    limited: 0,
    error: 0,
  };

  const requests = Array.from({ length: TOTAL }).map(() =>
    axios.get(URL).then(
      (res) => {
        if (res.status === 200) results.success++;
      },
      (err) => {
        if (err.response?.status === 429) {
          results.limited++;
        } else {
          results.error++;
        }
      }
    )
  );

  await Promise.all(requests);

  console.log('=== BURST TEST ===');
  console.log(results);
}

run();
