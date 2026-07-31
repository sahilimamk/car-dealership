import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/db';
import createApp from './app';
import { seed } from './seeds/seed';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  // Connect to MongoDB first — seed must run after the connection is ready
  if (process.env.MONGODB_URI) {
    await connectDatabase();
    console.log('[bootstrap] MongoDB connected.');
  }

  // Now seed — MongoDB is ready so writes go to the real database
  await seed().catch((err) => console.error('[seed] Failed:', err));

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

void bootstrap();
