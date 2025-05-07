import { formatDistanceToNow } from 'date-fns';

// Utility to format time from now
export const timeFromNow = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Utility to convert seconds to a readable format
export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0s';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};

// Status color mappings for consistent UI
export const statusColors = {
  success: {
    bg: 'bg-success/10 dark:bg-success/20',
    text: 'text-success',
    border: 'border-success/20',
    icon: 'check'
  },
  failed: {
    bg: 'bg-error/10 dark:bg-error/20',
    text: 'text-error',
    border: 'border-error/20',
    icon: 'times'
  },
  in_progress: {
    bg: 'bg-warning/10 dark:bg-warning/20',
    text: 'text-warning',
    border: 'border-warning/20',
    icon: 'spinner'
  },
  pending: {
    bg: 'bg-neutral-100 dark:bg-neutral-700',
    text: 'text-neutral-500 dark:text-neutral-400',
    border: 'border-neutral-200 dark:border-neutral-600',
    icon: 'circle'
  },
  cancelled: {
    bg: 'bg-neutral-100 dark:bg-neutral-700',
    text: 'text-neutral-500 dark:text-neutral-400',
    border: 'border-neutral-200 dark:border-neutral-600',
    icon: 'ban'
  }
};

// Format environment badges
export const environmentColors = {
  'Replit (Dev)': {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300'
  },
  'Replit (Staging)': {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-800 dark:text-purple-300'
  },
  'Replit (Production)': {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300'
  }
};

// Deployment statuses
export const deploymentStatusColors = {
  success: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300'
  },
  failed: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300'
  },
  in_progress: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300'
  },
  pending: {
    bg: 'bg-neutral-100 dark:bg-neutral-700',
    text: 'text-neutral-500 dark:text-neutral-400'
  }
};

// Sample build logs
export const getBuildLogs = (buildId: number): string => {
  return `[✓] Cloning repository...
Cloning into 'express-api-service'...
remote: Counting objects: 142, done.
remote: Compressing objects: 100% (98/98), done.

[✓] Installing dependencies...
npm WARN deprecated har-validator@5.1.5: this package will be deprecated
npm WARN deprecated uuid@3.4.0: uuid modules will no longer be bundled...
added 128 packages in 4.235s

[✓] Running tests...
> express-api-service@1.0.0 test
> jest

PASS tests/routes.test.js
PASS tests/middleware.test.js
PASS tests/auth.test.js

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        3.245s

[✓] Building Docker image...
Sending build context to Docker daemon  42.5MB
Step 1/10 : FROM node:16-alpine
 ---> b7a124c2992d
Step 2/10 : WORKDIR /app
 ---> Running in 6df45c47b9d5
 ---> a1c31ce40c9a
Step 3/10 : COPY package*.json ./
 ---> f9d17b1e8ae2
Step 4/10 : RUN npm ci --only=production
 ---> Running in 9f287e0627f8
 ---> e420a8e826db
Step 5/10 : COPY . .
 ---> 2d65bc8b91e0
Step 6/10 : EXPOSE 3000
 ---> Running in 97a4ce67e2df
 ---> b92b2f21eb96
Step 7/10 : CMD ["node", "index.js"]
 ---> Running in 3cd5ef315573
 ---> 53d8dace21b4
Successfully built 53d8dace21b4
Successfully tagged express-api:1.3.2

[✓] Deploying to Replit...
Connecting to Replit...
Authentication successful
Uploading image...
Deploying container...
Setting environment variables... done
Container started successfully!
Application available at: https://express-api-dev.username.repl.co

[✓] Build completed successfully in 3m 12s`;
};
