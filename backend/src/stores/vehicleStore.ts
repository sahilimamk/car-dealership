import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { createVehicle as createMongoVehicle, deleteVehicleById as deleteMongoVehicleById, findVehicleById as findMongoVehicleById, listVehicles as listMongoVehicles, updateVehicleById as updateMongoVehicleById } from '../models/vehicle';

export interface StoredVehicle {
	id: string;
	make: string;
	model: string;
	category: string;
	year: number;
	price: number;
	quantity: number;
	imageUrl?: string | null;
	description?: string | null;
	// Optional descriptive fields
	transmission?: string | null;
	fuelType?: string | null;
	mileage?: number | null;
	bodyType?: string | null;
	color?: string | null;
	createdAt: string;
	updatedAt: string;
}

const memoryVehicles = new Map<string, StoredVehicle>();

function isMongoReady() {
	return Boolean(process.env.MONGODB_URI) && mongoose.connection.readyState === 1;
}

function toStoredVehicle(vehicle: {
	_id?: { toString(): string };
	id?: string;
	make: string;
	model: string;
	category: string;
	year: number;
	price: number;
	quantity: number;
	imageUrl?: string | null;
	description?: string | null;
	transmission?: string | null;
	fuelType?: string | null;
	mileage?: number | null;
	bodyType?: string | null;
	color?: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}): StoredVehicle {
	return {
		id: vehicle._id?.toString() || vehicle.id || randomUUID(),
		make: vehicle.make,
		model: vehicle.model,
		category: vehicle.category,
		year: vehicle.year,
		price: vehicle.price,
		quantity: vehicle.quantity,
		imageUrl: vehicle.imageUrl || null,
		description: vehicle.description || null,
		transmission: vehicle.transmission || null,
		fuelType: vehicle.fuelType || null,
		mileage: vehicle.mileage ?? null,
		bodyType: vehicle.bodyType || null,
		color: vehicle.color || null,
		createdAt: vehicle.createdAt?.toISOString() || new Date().toISOString(),
		updatedAt: vehicle.updatedAt?.toISOString() || new Date().toISOString(),
	};
}

export async function createVehicle(data: Omit<StoredVehicle, 'id' | 'createdAt' | 'updatedAt'>) {
	if (isMongoReady()) {
		const vehicle = await createMongoVehicle(data);
		return toStoredVehicle(vehicle.toObject());
	}

	const now = new Date().toISOString();
	const storedVehicle: StoredVehicle = {
		id: randomUUID(),
		...data,
		createdAt: now,
		updatedAt: now,
	};
	memoryVehicles.set(storedVehicle.id, storedVehicle);
	return storedVehicle;
}

export async function listVehicles() {
	if (isMongoReady()) {
		const vehicles = await listMongoVehicles();
		return vehicles.map((vehicle) => toStoredVehicle(vehicle.toObject()));
	}

	return Array.from(memoryVehicles.values()).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function findVehicleById(id: string) {
	if (isMongoReady()) {
		const vehicle = await findMongoVehicleById(id);
		return vehicle ? toStoredVehicle(vehicle.toObject()) : null;
	}

	return memoryVehicles.get(id) || null;
}

export async function updateVehicle(id: string, updates: Partial<Omit<StoredVehicle, 'id' | 'createdAt' | 'updatedAt'>>) {
	if (isMongoReady()) {
		const vehicle = await updateMongoVehicleById(id, updates as any);
		return vehicle ? toStoredVehicle(vehicle.toObject()) : null;
	}

	const current = memoryVehicles.get(id);
	if (!current) {
		return null;
	}

	const next = {
		...current,
		...updates,
		updatedAt: new Date().toISOString(),
	};
	memoryVehicles.set(id, next);
	return next;
}

export async function deleteVehicle(id: string) {
	if (isMongoReady()) {
		const deleted = await deleteMongoVehicleById(id);
		return Boolean(deleted);
	}

	return memoryVehicles.delete(id);
}

export async function searchVehicles(filters: {
	make?: string;
	model?: string;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
}) {
	const vehicles = await listVehicles();
	return vehicles.filter((vehicle) => {
		const matchesMake = !filters.make || vehicle.make.toLowerCase().includes(filters.make.toLowerCase());
		const matchesModel = !filters.model || vehicle.model.toLowerCase().includes(filters.model.toLowerCase());
		const matchesCategory = !filters.category || vehicle.category.toLowerCase().includes(filters.category.toLowerCase());
		const matchesMin = filters.minPrice === undefined || vehicle.price >= filters.minPrice;
		const matchesMax = filters.maxPrice === undefined || vehicle.price <= filters.maxPrice;
		return matchesMake && matchesModel && matchesCategory && matchesMin && matchesMax;
	});
}

export async function purchaseVehicle(id: string) {
	const vehicle = await findVehicleById(id);
	if (!vehicle || vehicle.quantity <= 0) {
		return null;
	}

	return updateVehicle(id, { quantity: vehicle.quantity - 1 });
}

export async function restockVehicle(id: string, amount: number) {
	const vehicle = await findVehicleById(id);
	if (!vehicle) {
		return null;
	}

	return updateVehicle(id, { quantity: vehicle.quantity + amount });
}

export async function clearVehicles() {
	memoryVehicles.clear();
}