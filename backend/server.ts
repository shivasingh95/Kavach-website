import path from 'path';
import dotenv from 'dotenv';

// Must run BEFORE any other module loads — static imports are hoisted,
// so we use a dynamic import() inside an async IIFE to guarantee env is set first.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  // Dynamic import ensures the entire app module tree (including firebase-admin.ts)
  // loads AFTER dotenv has populated process.env
  const { default: app } = await import('./src/app');

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
