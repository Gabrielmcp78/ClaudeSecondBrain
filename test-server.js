import { fetch } from 'undici';

async function test() {
  console.log('Testing fixed MCP server...\n');
  
  // Test 1: Health check
  try {
    const health1 = await fetch('https://gabrielsmini.tail26536d.ts.net/health');
    console.log('1. Health check:', health1.status, health1.ok ? '✓' : '✗');
  } catch (err) {
    console.log('1. Health check: ✗', err.message);
  }
  
  // Test 2: Root endpoint
  try {
    const root = await fetch('https://gabrielsmini.tail26536d.ts.net/');
    console.log('2. Root endpoint:', root.status, root.ok ? '✓' : '✗');
  } catch (err) {
    console.log('2. Root endpoint: ✗', err.message);
  }
  
  // Test 3: Multiple rapid requests
  console.log('3. Stress test - 5 rapid requests:');
  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push(fetch('https://gabrielsmini.tail26536d.ts.net/health').catch(() => null));
  }
  
  const results = await Promise.allSettled(requests);
  let ok = 0, failed = 0;
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value && r.value.ok) {
      ok++;
    } else {
      failed++;
    }
  });
  console.log(`   ${ok} succeeded, ${failed} failed`);
  
  // Test 4: Final health check
  try {
    const health2 = await fetch('https://gabrielsmini.tail26536d.ts.net/health');
    const data = await health2.json();
    console.log('4. Final status:', data.status);
    console.log('   Streamable sessions:', data.streamableSessions || 0);
    console.log('   SSE sessions:', data.sseSessions || 0);
    
    if (ok === 5 && data.status === 'ok') {
      console.log('\n✅ ALL TESTS PASSED - Server is stable!');
      return true;
    } else {
      console.log('\n❌ Some tests failed');
      return false;
    }
  } catch (err) {
    console.log('4. Final check: ✗', err.message);
    return false;
  }
}

test().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
