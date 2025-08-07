'use client';

export default function EnvCheck() {
  // Log to console for debugging
  console.log('All process.env:', process.env);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  const envVars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>
      <div className="space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="p-2 border rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-sm">{key}</span>
              <span className={`px-2 py-1 rounded text-sm ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {value ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            {value && (
              <div className="text-xs text-gray-600 font-mono bg-gray-50 p-1 rounded">
                {value.substring(0, 20)}...
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Troubleshooting:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Make sure your .env file is in the root directory</li>
          <li>Restart your development server after adding environment variables</li>
          <li>Environment variables must start with NEXT_PUBLIC_ to be accessible in the browser</li>
          <li>Check that there are no syntax errors in your .env file</li>
        </ul>
      </div>
    </div>
  );
}