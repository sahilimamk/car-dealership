import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { createUser as createMongoUser, findUserByEmail as findMongoUserByEmail, findUserByUsername as findMongoUserByUsername, updateUserById as updateMongoUserById } from '../models/user';

export type UserRole = 'user' | 'admin';

export interface StoredUser {
	id: string;
	username: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	createdAt: string;
	updatedAt: string;
}

const memoryUsers = new Map<string, StoredUser>();

const defaultAdminPasswordHash = bcrypt.hashSync('Admin123!', 10);

memoryUsers.set('admin', {
	id: randomUUID(),
	username: 'admin',
	email: 'admin@car-dealership.com',
	passwordHash: defaultAdminPasswordHash,
	role: 'admin',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
});

function isMongoReady() {
	return Boolean(process.env.MONGODB_URI) && mongoose.connection.readyState === 1;
}

function toStoredUser(user: {
	_id?: { toString(): string };
	id?: string;
	username: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	createdAt?: Date;
	updatedAt?: Date;
}): StoredUser {
	return {
		id: user._id?.toString() || user.id || randomUUID(),
		username: user.username,
		email: user.email,
		passwordHash: user.passwordHash,
		role: user.role,
		createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
		updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
	};
}

export async function ensureDefaultAdminUser() {
	const username = 'admin';
	const email = 'admin@car-dealership.com';
	const passwordHash = await bcrypt.hash('Admin123!', 10);

	// MongoDB path is handled by seed() in index.ts — this only covers in-memory
	if (isMongoReady()) {
		return;
	}

	const existing = Array.from(memoryUsers.values()).find((user) => user.username === username);
	if (!existing) {
		const now = new Date().toISOString();
		memoryUsers.set(username, {
			id: randomUUID(),
			username,
			email,
			passwordHash,
			role: 'admin',
			createdAt: now,
			updatedAt: now,
		});
	}
}

export async function findUserByUsername(username: string) {
	if (isMongoReady()) {
		const user = await findMongoUserByUsername(username);
		return user ? toStoredUser(user.toObject()) : null;
	}

	return Array.from(memoryUsers.values()).find((user) => user.username === username) || null;
}

export async function findUserByEmail(email: string) {
	if (isMongoReady()) {
		const user = await findMongoUserByEmail(email);
		return user ? toStoredUser(user.toObject()) : null;
	}

	return Array.from(memoryUsers.values()).find((user) => user.email === email) || null;
}

export async function createUser(data: {
	username: string;
	email: string;
	passwordHash: string;
	role?: UserRole;
}) {
	if (isMongoReady()) {
		const user = await createMongoUser(data);
		return toStoredUser(user.toObject());
	}

	const now = new Date().toISOString();
	const storedUser: StoredUser = {
		id: randomUUID(),
		username: data.username,
		email: data.email,
		passwordHash: data.passwordHash,
		role: data.role || 'user',
		createdAt: now,
		updatedAt: now,
	};

	memoryUsers.set(storedUser.username, storedUser);
	return storedUser;
}

export async function updateUser(id: string, updates: Partial<StoredUser>) {
	if (isMongoReady()) {
		const updated = await updateMongoUserById(id, updates as any);
		return updated ? toStoredUser(updated.toObject()) : null;
	}

	const current = Array.from(memoryUsers.values()).find((user) => user.id === id);
	if (!current) {
		return null;
	}

	const next = {
		...current,
		...updates,
		updatedAt: new Date().toISOString(),
	};
	memoryUsers.set(next.username, next);
	return next;
}

export async function clearUsers() {
	memoryUsers.clear();
}