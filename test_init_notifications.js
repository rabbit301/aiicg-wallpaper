// 测试初始化用户通知状态的Node.js脚本
const http = require('http');

// 先登录获取token
async function login() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'rabbitc',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200 && jsonData.data && jsonData.data.access_token) {
            resolve(jsonData.data.access_token);
          } else {
            reject(new Error(`Login failed: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// 初始化用户通知状态
async function initUserNotifications(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/notifications/init',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`\n=== 初始化用户通知状态 ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response:`, data);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// 测试获取通知列表
async function getNotifications(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/notifications',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`\n=== 获取通知列表 ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response:`, data);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// 测试获取通知统计
async function getNotificationStats(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/notifications/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`\n=== 获取通知统计 ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response:`, data);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// 主函数
async function main() {
  try {
    console.log('🔐 正在登录...');
    const token = await login();
    console.log('✅ 登录成功，获得token:', token.substring(0, 20) + '...');

    console.log('\n🔧 初始化用户通知状态...');
    await initUserNotifications(token);

    console.log('\n📋 测试获取通知列表...');
    await getNotifications(token);

    console.log('\n📈 测试获取通知统计...');
    await getNotificationStats(token);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

main();
