import path from 'path';
import dotenv from 'dotenv';

// Load env from the monorepo root .env before any other imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './src/app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
