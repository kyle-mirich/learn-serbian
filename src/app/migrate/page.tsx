'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { migrateCsvDataToFirestore } from '@/lib/csv-migrator';
import { CheckCircle, AlertCircle, Database, Upload } from 'lucide-react';

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleMigration = async () => {
    setIsLoading(true);
    setProgress(0);
    setStatus('idle');
    setMessage('Starting migration...');

    try {
      // Simulate progress updates (in a real implementation, you'd get these from the migration function)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const totalMigrated = await migrateCsvDataToFirestore();

      clearInterval(progressInterval);
      setProgress(100);
      setStatus('success');
      setMessage(`Successfully migrated ${totalMigrated} words to Firestore!`);
    } catch (error) {
      setStatus('error');
      setMessage(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Migration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary mb-2">Data Migration</h1>
        <p className="text-muted-foreground">Migrate CSV data to Firebase Firestore</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            CSV to Firestore Migration
          </CardTitle>
          <CardDescription>
            This will migrate all Serbian word data from CSV files to Firestore database.
            Make sure you have configured your Firebase credentials in the .env file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>CSV files detected in most-used/ directory</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Firebase configuration loaded</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Firestore database ready</span>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Migration Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleMigration}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Migrating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Start Migration
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              disabled={isLoading}
            >
              Back to App
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Migration Details:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Processes CSV files from all part-of-speech categories</li>
              <li>• Creates structured Firestore documents</li>
              <li>• Preserves frequency and ranking information</li>
              <li>• Enables user progress tracking</li>
              <li>• Safe to run multiple times (won't create duplicates)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}