import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { createVehicle, deleteVehicle, purchaseVehicle, restockVehicle, searchVehicles, updateVehicle, listVehicles } from '../stores/vehicleStore';

const router = Router();

// Base schema for vehicle creation
const vehicleSchema = z.object({
	make: z.string().min(1, 'Make is required'),
	model: z.string().min(1, 'Model is required'),
	category: z.string().min(1, 'Category is required'),
	year: z.number().int().min(1886).max(new Date().getFullYear() + 1),
	price: z.number().positive('Price must be positive'),
	quantity: z.number().int().min(0, 'Quantity cannot be negative'),
	imageUrl: z.string().url().nullable().optional(),
	description: z.string().nullable().optional(),
});

// Schema for partial updates
const updateSchema = vehicleSchema.partial();

// Schema for restocking inventory
const restockSchema = z.object({
	amount: z.number().int().positive('Amount must be a positive integer'),
});

router.post('/', authenticate, async (req, res) => {
	const parsed = vehicleSchema.safeParse(req.body);

	if (!parsed.success) {
		return res.status(422).json({
			errors: parsed.error.issues.map((issue) => ({
				path: issue.path.join('.'),
				message: issue.message,
			})),
		});
	}

	const { make, model, category, year, price, quantity, imageUrl, description } = parsed.data;
	const vehicle = await createVehicle({
		make,
		model,
		category,
		year,
		price,
		quantity,
		imageUrl: imageUrl ?? null,
		description: description ?? null,
	});

	return res.status(201).json(vehicle);
});

router.get('/', authenticate, async (_req, res) => {
	const vehicles = await listVehicles();
	return res.status(200).json(vehicles.filter((vehicle) => vehicle.quantity > 0));
});

router.get('/search', authenticate, async (req, res) => {
	const { make, model, category, minPrice, maxPrice } = req.query as {
		make?: string;
		model?: string;
		category?: string;
		minPrice?: string;
		maxPrice?: string;
	};

	const vehicles = await searchVehicles({
		make,
		model,
		category,
		minPrice: minPrice ? Number(minPrice) : undefined,
		maxPrice: maxPrice ? Number(maxPrice) : undefined,
	});

	return res.status(200).json(vehicles);
});

router.put('/:id', authenticate, async (req, res) => {
	const parsed = updateSchema.safeParse(req.body);

	if (!parsed.success) {
		return res.status(422).json({
			errors: parsed.error.issues.map((issue) => ({
				path: issue.path.join('.'),
				message: issue.message,
			})),
		});
	}

	const updated = await updateVehicle(req.params.id, parsed.data);

	if (!updated) {
		return res.status(404).json({ error: 'Vehicle not found.' });
	}

	return res.status(200).json(updated);
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
	const deleted = await deleteVehicle(req.params.id);

	if (!deleted) {
		return res.status(404).json({ error: 'Vehicle not found.' });
	}

	return res.status(200).json({ message: 'Vehicle deleted successfully.' });
});

router.post('/:id/purchase', authenticate, async (req, res) => {
	const updated = await purchaseVehicle(req.params.id);

	if (!updated) {
		return res.status(400).json({ error: 'Vehicle not available or out of stock.' });
	}

	return res.status(200).json({ vehicle: updated });
});

router.post('/:id/restock', authenticate, adminOnly, async (req, res) => {
	const parsed = restockSchema.safeParse(req.body);

	if (!parsed.success) {
		return res.status(400).json({ error: 'Restock amount must be a positive integer.' });
	}

	const amount = parsed.data.amount;

	const updated = await restockVehicle(req.params.id, amount);

	if (!updated) {
		return res.status(404).json({ error: 'Vehicle not found.' });
	}

	return res.status(200).json({ vehicle: updated });
});

export default router;