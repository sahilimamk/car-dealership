/**
 * scripts/seed.ts
 *
 * CLI entrypoint for the seed script.
 * Run via:  npm run seed
 *
 * The script connects to MongoDB (when MONGODB_URI is set), runs the seed
 * function, then disconnects and exits cleanly.  When MONGODB_URI is absent
 * it falls back to the in-memory store — useful for local smoke-testing
 * without a running database.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db';
import { seed } from '../seeds/seed';

async function main(): Promise<void> {
  // Connect to MongoDB if a URI was provided
  const connection = await connectDatabase();

  if (connection) {
    console.log('[seed-script] Connected to MongoDB.');
  } else {
    console.warn('[seed-script] MONGODB_URI not set — running against in-memory store.');
  }

  try {
    await seed();
  } finally {
    // Always disconnect cleanly so the process can exit
    if (connection) {
      await mongoose.disconnect();
      console.log('[seed-script] Disconnected from MongoDB.');
    }
  }
}

main().catch((err) => {
  console.error('[seed-script] Fatal error:', err);
  process.exit(1);
});
