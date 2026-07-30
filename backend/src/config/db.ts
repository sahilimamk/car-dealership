import mongoose from 'mongoose';

let isConnected = false;

export async function connectDatabase() {
	if (isConnected || mongoose.connection.readyState === 1) {
		return mongoose.connection;
	}

	const mongoUri = process.env.MONGODB_URI;

	if (!mongoUri) {
		return null;
	}

	await mongoose.connect(mongoUri, {
		dbName: process.env.MONGODB_DB_NAME || 'car-dealership',
	});

	isConnected = true;
	return mongoose.connection;
}

export default mongoose;
