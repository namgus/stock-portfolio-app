import { useState } from 'react';

function Debug() {
  const [testResult, setTestResult] = useState('');

  const testImport = async () => {
    try {
      setTestResult('Testing imports...\n');

      // Test productRecommendation import
      const productRec = await import('../utils/productRecommendation');
      setTestResult(prev => prev + '✅ productRecommendation imported\n');
      setTestResult(prev => prev + 'Functions found: ' + Object.keys(productRec.default || productRec).join(', ') + '\n');

      // Test API call
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      setTestResult(prev => prev + '✅ Backend API: ' + data.status + '\n');

      setTestResult(prev => prev + '\n✅ All tests passed!');
    } catch (error) {
      setTestResult(prev => prev + '❌ Error: ' + error.message + '\n' + error.stack);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Page</h1>
      <button
        onClick={testImport}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Run Tests
      </button>
      <pre style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '10px' }}>
        {testResult || 'Click "Run Tests" to check imports and API'}
      </pre>
    </div>
  );
}

export default Debug;