"use client";

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSave = async () => {
    setLoading(true);
    try {
      const testData = {
        key: 'test',
        value: { message: 'Hello World', timestamp: Date.now() }
      };

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      setResult(`Save result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`Save error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLoad = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`);
      const result = await response.json();
      setResult(`Load result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`Load error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDebug = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/settings/debug?t=${Date.now()}`);
      const result = await response.json();
      setResult(`Debug result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setResult(`Debug error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Test Settings API</h1>
      
      <div className="space-y-4 mb-8">
        <button 
          onClick={testSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded mr-4"
        >
          Test Save
        </button>
        
        <button 
          onClick={testLoad}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded mr-4"
        >
          Test Load
        </button>
        
        <button 
          onClick={testDebug}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          Test Debug
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">{result}</pre>
        </div>
      )}
    </div>
  );
}