/**
 * @file YouTubeDebug.tsx
 * @description Diagnostic component to identify YouTube embed issues
 * @author Development
 * @filepath csvlasik/src/components/YouTubeDebug.tsx
 * @category Component
 * @pattern Diagnostic/Debug
 * @version 1.0.0
 * @last_updated 2025-10-17
 * 
 * @dependencies
 * - react: Component framework
 * 
 * @features
 * - Tests multiple YouTube embed methods
 * - Shows detailed error information
 * - Helps identify CSP or network issues
 * 
 * @usage
 * import YouTubeDebug from '@/components/YouTubeDebug'
 * <YouTubeDebug videoId="dQw4w9WgXcQ" />
 */

import React, { useState, useEffect } from 'react';

interface YouTubeDebugProps {
  videoId: string;
}

const YouTubeDebug: React.FC<YouTubeDebugProps> = ({ videoId }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [cspError, setCspError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Component mounted');
    
    // Check for CSP violations
    const cspHandler = (e: SecurityPolicyViolationEvent) => {
      setCspError(`CSP Violation: ${e.violatedDirective} - ${e.blockedURI}`);
      addLog(`CSP BLOCKED: ${e.violatedDirective}`);
    };
    
    document.addEventListener('securitypolicyviolation', cspHandler as EventListener);
    
    return () => {
      document.removeEventListener('securitypolicyviolation', cspHandler as EventListener);
    };
  }, []);

  const testUrls = [
    {
      label: 'Standard Embed',
      url: `https://www.youtube.com/embed/${videoId}`,
    },
    {
      label: 'Privacy-Enhanced Embed',
      url: `https://www.youtube-nocookie.com/embed/${videoId}`,
    },
    {
      label: 'With Parameters',
      url: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`,
    },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">YouTube Embed Diagnostic</h1>
        
        {cspError && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <h3 className="font-bold text-red-800">Content Security Policy Error!</h3>
            <p className="text-red-700">{cspError}</p>
            <p className="text-sm text-red-600 mt-2">
              This means your Vite config or server is blocking YouTube. Check vite.config.ts or server headers.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>Video ID:</strong> {videoId}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 80)}...</p>
            <p><strong>Browser:</strong> {navigator.vendor}</p>
            <p><strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {testUrls.map((test, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2">{test.label}</h3>
            <p className="text-sm text-gray-600 mb-4 break-all">{test.url}</p>
            
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={test.url}
                title={`Test ${index + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => addLog(`${test.label} loaded successfully`)}
                onError={(e) => {
                  addLog(`${test.label} ERROR: ${e.type}`);
                  console.error('Iframe error:', e);
                }}
              />
            </div>
          </div>
        ))}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Event Log</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p>No events logged yet...</p>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
          <h3 className="font-bold text-blue-800 mb-2">Browser Console Check</h3>
          <p className="text-blue-700 text-sm">
            Press <kbd className="bg-blue-200 px-2 py-1 rounded">F12</kbd> to open Developer Tools and check the Console tab for errors.
            Look for messages containing "Refused to connect", "CSP", or "X-Frame-Options".
          </p>
        </div>

        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <h3 className="font-bold text-yellow-800 mb-2">Common Issues</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• <strong>CSP Error:</strong> Check vite.config.ts for Content-Security-Policy settings</li>
            <li>• <strong>Network Error:</strong> Check if YouTube is accessible in your region</li>
            <li>• <strong>CORS Error:</strong> Usually not an issue with YouTube embeds</li>
            <li>• <strong>X-Frame-Options:</strong> YouTube allows embedding, so this shouldn't be the issue</li>
            <li>• <strong>Invalid Video ID:</strong> Verify the video exists and is embeddable</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default YouTubeDebug;