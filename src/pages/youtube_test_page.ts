/**
 * @file YouTubeTestPage.tsx
 * @description Test page for YouTube embed troubleshooting
 * @author Development
 * @filepath csvlasik/src/pages/YouTubeTestPage.tsx
 * @category Page
 * @pattern Testing
 * @version 1.0.0
 * @last_updated 2025-10-17
 * 
 * @dependencies
 * - react: Component framework
 * 
 * @features
 * - Tests multiple embed methods
 * - Shows detailed error messages
 * - Provides diagnostic information
 * 
 * @usage
 * Add to router: <Route path="/test-youtube" element={<YouTubeTestPage />} />
 */

import React, { useState } from 'react';

const YouTubeTestPage: React.FC = () => {
  const [iframeError, setIframeError] = useState<string | null>(null);
  const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (always embeddable)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">YouTube Embed Test</h1>

        {/* Test 1: Direct iframe with minimal config */}
        <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Test 1: Minimal iframe</h2>
          <p className="text-gray-600 mb-4">
            This is the simplest possible YouTube embed. If this doesn't work, 
            there's a CSP or network issue.
          </p>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded"
              src={`https://www.youtube-nocookie.com/embed/${testVideoId}`}
              title="Test Video 1"
              allowFullScreen
              style={{ border: 0 }}
            />
          </div>
        </section>

        {/* Test 2: iframe with allow attributes */}
        <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Test 2: Full allow attributes</h2>
          <p className="text-gray-600 mb-4">
            With all recommended allow attributes.
          </p>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded"
              src={`https://www.youtube-nocookie.com/embed/${testVideoId}?rel=0`}
              title="Test Video 2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ border: 0 }}
              onError={(e) => {
                console.error('Iframe error:', e);
                setIframeError('Iframe failed to load');
              }}
            />
          </div>
        </section>

        {/* Test 3: Standard youtube.com (not nocookie) */}
        <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Test 3: Standard YouTube domain</h2>
          <p className="text-gray-600 mb-4">
            Using www.youtube.com instead of youtube-nocookie.com
          </p>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded"
              src={`https://www.youtube.com/embed/${testVideoId}`}
              title="Test Video 3"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
            />
          </div>
        </section>

        {/* Test 4: With autoplay parameter */}
        <section className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Test 4: With autoplay</h2>
          <p className="text-gray-600 mb-4">
            Tests if autoplay parameter causes issues (note: autoplay may be blocked by browser)
          </p>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded"
              src={`https://www.youtube-nocookie.com/embed/${testVideoId}?autoplay=1&mute=1`}
              title="Test Video 4"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
            />
          </div>
        </section>

        {/* Diagnostic Info */}
        <section className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Information</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>Browser:</strong> {navigator.userAgent}</p>
            <p><strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}</p>
            <p><strong>Cookies Enabled:</strong> {navigator.cookieEnabled ? 'Yes' : 'No'}</p>
            <p><strong>Protocol:</strong> {window.location.protocol}</p>
            <p><strong>Host:</strong> {window.location.host}</p>
          </div>
        </section>

        {/* Error Display */}
        {iframeError && (
          <section className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Detected</h2>
            <p className="text-red-700">{iframeError}</p>
          </section>
        )}

        {/* Instructions */}
        <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Open Browser DevTools</strong> (Press F12) and check the Console tab for errors</li>
            <li><strong>Look for these error types:</strong>
              <ul className="list-disc list-inside ml-6 mt-2">
                <li>"Refused to connect" - CSP or X-Frame-Options issue</li>
                <li>"net::ERR_BLOCKED_BY_CLIENT" - Ad blocker or extension blocking</li>
                <li>"CSP violation" - Content Security Policy blocking YouTube</li>
                <li>"Mixed Content" - HTTP page trying to load HTTPS iframe</li>
              </ul>
            </li>
            <li><strong>Try in Incognito Mode</strong> to rule out extensions</li>
            <li><strong>Check Network Tab</strong> to see if requests to YouTube are being blocked</li>
            <li><strong>Verify video exists</strong> by opening https://youtube.com/watch?v={testVideoId} in a new tab</li>
          </ol>
        </section>

        {/* Quick Fixes */}
        <section className="bg-green-50 border-l-4 border-green-500 p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Common Fixes</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold">If you see CSP errors:</h3>
              <p className="mt-1">Add to your vite.config.ts or index.html:</p>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">
{`<meta http-equiv="Content-Security-Policy" 
  content="frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;" />`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold">If videos work here but not in your component:</h3>
              <p className="mt-1">The issue is in your component code, not YouTube or CSP</p>
            </div>
            
            <div>
              <h3 className="font-semibold">If NO videos work anywhere:</h3>
              <p className="mt-1">Check if YouTube is accessible in your region or if your network blocks it</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default YouTubeTestPage;