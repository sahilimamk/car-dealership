import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/db';
import createApp from './app';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = createApp();

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  if (process.env.MONGODB_URI) {
    await connectDatabase();
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

void bootstrap();
