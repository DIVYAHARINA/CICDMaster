// Simple script to run drizzle-kit push:pg
import { execSync } from 'child_process';

try {
  console.log('Running database schema migration...');
  execSync('npx drizzle-kit push:pg', { stdio: 'inherit' });
  console.log('Database schema migration completed successfully.');
} catch (error) {
  console.error('Error running database schema migration:', error);
  process.exit(1);
}