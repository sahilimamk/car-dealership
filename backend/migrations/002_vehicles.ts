import mongoose from 'mongoose';

function getVehiclesCollection() {
	const database = mongoose.connection.db;

	if (!database) {
		throw new Error('Mongo database connection is not available.');
	}

	return database.collection('vehicles');
}

export async function up() {
	const database = mongoose.connection.db;

	if (!database) {
		throw new Error('Mongo database connection is not available.');
	}

	const collections = await database.listCollections({ name: 'vehicles' }).toArray();

	if (collections.length === 0) {
		await database.createCollection('vehicles');
	}

	const vehiclesCollection = getVehiclesCollection();
	await vehiclesCollection.createIndex({ make: 1 });
	await vehiclesCollection.createIndex({ model: 1 });
	await vehiclesCollection.createIndex({ category: 1 });
	await vehiclesCollection.createIndex({ price: 1 });
}

export async function down() {
	const database = mongoose.connection.db;

	if (!database) {
		throw new Error('Mongo database connection is not available.');
	}

	await database.dropCollection('vehicles').catch(() => undefined);
}