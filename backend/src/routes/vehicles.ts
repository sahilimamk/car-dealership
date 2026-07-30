import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { createVehicle, deleteVehicle, findVehicleById, purchaseVehicle, restockVehicle, searchVehicles, updateVehicle, listVehicles } from '../stores/vehicleStore';

const router = Router();

router.post('/', authenticate, async (req, res) => {
	const { make, model, category, year, price, quantity, imageUrl, description } = req.body as {
		make?: string;
		model?: string;
		category?: string;
		year?: number;
		price?: number;
		quantity?: number;
		imageUrl?: string | null;
		description?: string | null;
	};

	if (!make || !model || !category || typeof year !== 'number' || typeof price !== 'number' || typeof quantity !== 'number') {
		return res.status(400).json({ error: 'Invalid vehicle payload.' });
	}

	const vehicle = await createVehicle({ make, model, category, year, price, quantity, imageUrl: imageUrl || null, description: description || null });
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
	const updated = await updateVehicle(req.params.id, req.body);

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
	const amount = Number(req.body?.amount);

	if (!Number.isInteger(amount) || amount <= 0) {
		return res.status(400).json({ error: 'Restock amount must be a positive integer.' });
	}

	const updated = await restockVehicle(req.params.id, amount);

	if (!updated) {
		return res.status(404).json({ error: 'Vehicle not found.' });
	}

	return res.status(200).json({ vehicle: updated });
});

export default router;