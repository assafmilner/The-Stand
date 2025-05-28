 
const fetch = require('node-fetch');

async function quickTest() {
  console.log('⚡ בדיקה מהירה...');
  
  const tests = [
    { name: 'Frontend', url: 'http://localhost:3000' },
    { name: 'Backend', url: 'http://localhost:3001' },
    { name: 'Search API', url: 'http://localhost:3001/api/search/quick?q=test' }
  ];

  let allGood = true;

  for (const test of tests) {
    try {
      const response = await fetch(test.url, { timeout: 3000 });
      if (response.status < 400) {
        console.log(`✅ ${test.name}: OK (${response.status})`);
      } else {
        console.log(`❌ ${test.name}: ${response.status}`);
        allGood = false;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      allGood = false;
    }
  }

  console.log(allGood ? '\n🎉 הכל עובד!' : '\n⚠️ יש בעיות');
  return allGood;
}

if (require.main === module) {
  quickTest();
}

module.exports = { quickTest };