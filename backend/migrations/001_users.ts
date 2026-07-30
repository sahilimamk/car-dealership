import mongoose from 'mongoose';

function getUsersCollection() {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error('Mongo database connection is not available.');
  }

  return database.collection('users');
}

export async function up() {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error('Mongo database connection is not available.');
  }

  const collections = await database.listCollections({ name: 'users' }).toArray();

  if (collections.length === 0) {
    await database.createCollection('users');
  }

  const usersCollection = getUsersCollection();
  await usersCollection.createIndex({ username: 1 }, { unique: true });
  await usersCollection.createIndex({ email: 1 }, { unique: true });
}

export async function down() {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error('Mongo database connection is not available.');
  }

  await database.dropCollection('users').catch(() => undefined);
}
