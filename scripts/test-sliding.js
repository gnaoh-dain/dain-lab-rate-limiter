const axios = require('axios');

const URL = 'http://localhost:3000/user/profile';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Step 1: gửi 50 request');

  for (let i = 0; i < 50; i++) {
    await axios.get(URL).catch(() => {});
  }

  console.log('Wait 30s...');
  await sleep(30000);

  console.log('Step 2: gửi thêm 60 request');

  let success = 0;
  let limited = 0;

  for (let i = 0; i < 60; i++) {
    try {
      await axios.get(URL);
      success++;
    } catch (err) {
      if (err.response?.status === 429) {
        limited++;
      }
    }
  }

  console.log('=== SLIDING TEST ===');
  console.log({ success, limited });
}

run();
