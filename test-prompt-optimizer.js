// 简单的Node.js测试脚本
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testAnalyze() {
  console.log('🧪 测试分析功能...');
  try {
    const response = await fetch(`${API_BASE}/api/optimize-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: '一只可爱的小猫',
        action: 'analyze'
      })
    });

    const data = await response.json();
    console.log('✅ 分析结果:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  }
}

async function testOptimize() {
  console.log('\n🔧 测试优化功能...');
  try {
    const response = await fetch(`${API_BASE}/api/optimize-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: '一只可爱的小猫',
        action: 'optimize',
        sessionId: 'test-session-123'
      })
    });

    const data = await response.json();
    console.log('✅ 优化结果:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ 优化失败:', error.message);
  }
}

async function testLimitInfo() {
  console.log('\n📊 测试限制信息...');
  try {
    const response = await fetch(`${API_BASE}/api/optimize-prompt?sessionId=test-session-123`);
    const data = await response.json();
    console.log('✅ 限制信息:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ 获取限制信息失败:', error.message);
  }
}

async function runTests() {
  console.log('🚀 开始测试提示词优化API...\n');
  
  await testAnalyze();
  await testOptimize();
  await testLimitInfo();
  
  console.log('\n✨ 测试完成！');
}

runTests();
