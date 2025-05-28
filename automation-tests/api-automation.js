// tests/api-automation.js - בדיקות API אוטומטיות

const fetch = require('node-fetch');

class APITester {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.token = null;
    this.results = [];
  }

  // בדיקה בסיסית של endpoint
  async testEndpoint(method, endpoint, data = null, expectedStatus = 200) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      const responseData = await response.json().catch(() => null);

      const result = {
        endpoint: `${method} ${endpoint}`,
        status: response.status,
        expectedStatus,
        success: response.status === expectedStatus,
        data: responseData,
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      
      if (result.success) {
        console.log(`✅ ${result.endpoint} - SUCCESS`);
      } else {
        console.log(`❌ ${result.endpoint} - FAILED (${response.status})`);
      }

      return result;
    } catch (error) {
      const result = {
        endpoint: `${method} ${endpoint}`,
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      console.log(`❌ ${result.endpoint} - ERROR: ${error.message}`);
      return result;
    }
  }

  // התחברות לקבלת token
  async login() {
    console.log('🔐 מתחבר לקבלת טוקן...');
    
    const result = await this.testEndpoint('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    if (result.success && result.data.accessToken) {
      this.token = result.data.accessToken;
      console.log('✅ התחברות הצליחה');
      return true;
    }
    
    console.log('❌ התחברות נכשלה');
    return false;
  }

  // בדיקות כלליות
  async runAllTests() {
    console.log('🚀 מתחיל בדיקות API אוטומטיות...\n');

    // בדיקות בסיסיות (בלי auth)
    await this.testBasicEndpoints();
    
    // התחברות
    const loginSuccess = await this.login();
    
    if (loginSuccess) {
      // בדיקות עם auth
      await this.testAuthenticatedEndpoints();
      await this.testSearchEndpoints();
      await this.testFriendsEndpoints();
      await this.testPostsEndpoints();
    }

    // דוח סיכום
    this.generateReport();
  }

  // בדיקות endpoints בסיסיים
  async testBasicEndpoints() {
    console.log('\n📡 בודק endpoints בסיסיים...');
    
    // בדיקות שלא דורשות auth
    await this.testEndpoint('GET', '/api/fixtures', null, 200);
    await this.testEndpoint('POST', '/api/auth/login', {
      email: 'wrong@email.com',
      password: 'wrongpassword'
    }, 401);
  }

  // בדיקות endpoints עם authentication
  async testAuthenticatedEndpoints() {
    console.log('\n🔒 בודק endpoints מאומתים...');
    
    await this.testEndpoint('GET', '/api/users/profile');
    await this.testEndpoint('GET', '/api/friends');
    await this.testEndpoint('GET', '/api/messages/recent');
    await this.testEndpoint('GET', '/api/tickets');
  }

  // בדיקות חיפוש
  async testSearchEndpoints() {
    console.log('\n🔍 בודק מערכת חיפוש...');
    
    await this.testEndpoint('GET', '/api/search/quick?q=א');
    await this.testEndpoint('GET', '/api/search/full?q=הפועל');
    await this.testEndpoint('GET', '/api/search/quick?q='); // חיפוש ריק
  }

  // בדיקות חברים
  async testFriendsEndpoints() {
    console.log('\n👥 בודק מערכת חברים...');
    
    await this.testEndpoint('GET', '/api/friends/requests/received');
    await this.testEndpoint('GET', '/api/friends/requests/sent');
    
    // בדיקה עם ID לא קיים
    await this.testEndpoint('POST', '/api/friends/send-request', {
      receiverId: '507f1f77bcf86cd799439011'
    }, 404);
  }

  // בדיקות פוסטים
  async testPostsEndpoints() {
    console.log('\n📝 בודק מערכת פוסטים...');
    
    await this.testEndpoint('GET', '/api/posts/friends');
    await this.testEndpoint('GET', '/api/posts/team');
    
    // יצירת פוסט בדיקה
    const createResult = await this.testEndpoint('POST', '/api/posts', {
      content: 'פוסט בדיקה אוטומטית',
      communityId: '25'
    }, 201);

    // אם הפוסט נוצר, נסה למחוק אותו
    if (createResult.success && createResult.data._id) {
      await this.testEndpoint('DELETE', `/api/posts/${createResult.data._id}`);
    }
  }

  // בדיקות עומס (Load Testing)
  async performLoadTest(endpoint, requests = 10) {
    console.log(`\n⚡ בדיקת עומס: ${requests} בקשות ל-${endpoint}`);
    
    const promises = [];
    const startTime = Date.now();

    for (let i = 0; i < requests; i++) {
      promises.push(
        fetch(`${this.baseURL}${endpoint}`, {
          headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
        })
      );
    }

    try {
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / requests;

      const successCount = responses.filter(r => r.status < 400).length;
      const successRate = (successCount / requests) * 100;

      console.log(`📊 תוצאות עומס:`);
      console.log(`   זמן כולל: ${totalTime}ms`);
      console.log(`   זמן ממוצע: ${avgTime.toFixed(2)}ms`);
      console.log(`   שיעור הצלחה: ${successRate.toFixed(1)}%`);

      return { totalTime, avgTime, successRate };
    } catch (error) {
      console.log(`❌ בדיקת עומס נכשלה: ${error.message}`);
    }
  }

  // דוח סיכום
  generateReport() {
    console.log('\n📊 דוח סיכום בדיקות API:');
    console.log('================================');
    
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    const successRate = ((successful / total) * 100).toFixed(1);

    console.log(`📈 סך הכל בדיקות: ${total}`);
    console.log(`✅ הצליחו: ${successful}`);
    console.log(`❌ נכשלו: ${failed}`);
    console.log(`📊 שיעור הצלחה: ${successRate}%`);

    // רשימת כשלונות
    const failures = this.results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('\n❌ בדיקות שנכשלו:');
      failures.forEach(failure => {
        console.log(`   ${failure.endpoint} - ${failure.error || `Status: ${failure.status}`}`);
      });
    }

    // שמירת דוח לקובץ
    const report = {
      timestamp: new Date().toISOString(),
      summary: { total, successful, failed, successRate: parseFloat(successRate) },
      results: this.results
    };

    require('fs').writeFileSync(
      'test-results/api-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n💾 דוח נשמר ל-test-results/api-report.json');
  }
}

// הפעלה
async function runAPITests() {
  const tester = new APITester();
  await tester.runAllTests();
  
  // בדיקת עומס נוספת
  await tester.performLoadTest('/api/search/quick?q=א', 20);
}

// יצוא לשימוש
module.exports = { APITester, runAPITests };

// הפעלה ישירה אם הקובץ מורץ לבד
if (require.main === module) {
  runAPITests().catch(console.error);
}