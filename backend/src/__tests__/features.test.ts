import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import createApp from '../app';
import { clearVehicles } from '../stores/vehicleStore';
import { clearUsers } from '../stores/userStore';

const app = createApp();

// ─── Seed / startup behaviour ───────────────────────────────────────────────

describe('Auto-seed on startup (TDD)', () => {
	/**
	 * RED: the seed is NOT called in app.ts yet, so the admin user only
	 * exists in memoryUsers (hard-coded at module load time).
	 * The test documents the desired behaviour: after a cold start the
	 * database must have at least one vehicle and a working admin account.
	 */
	it('admin user should exist and be loginnable at cold start', async () => {
		const res = await request(app)
			.post('/api/auth/login')
			.send({ username: 'admin', password: 'Admin123!' });

		expect(res.status).toBe(200);
		expect(res.body.user.role).toBe('admin');
		expect(res.body.token).toBeDefined();
	});

	it('GET /api/vehicles should return seeded vehicles after startup', async () => {
		// Login as admin to get a token
		const loginRes = await request(app)
			.post('/api/auth/login')
			.send({ username: 'admin', password: 'Admin123!' });

		const token = loginRes.body.token;

		const res = await request(app)
			.get('/api/vehicles')
			.set('Authorization', `Bearer ${token}`);

		// After seed, inventory must not be empty
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBeGreaterThan(0);
	});
});

// ─── Purchase flow ───────────────────────────────────────────────────────────

describe('Purchase flow (TDD)', () => {
	let userToken = '';
	let adminToken = '';
	let vehicleId = '';

	beforeAll(async () => {
		const adminLogin = await request(app)
			.post('/api/auth/login')
			.send({ username: 'admin', password: 'Admin123!' });
		adminToken = adminLogin.body.token;

		const userReg = await request(app)
			.post('/api/auth/register')
			.send({
				username: `purchase-user-${Date.now()}`,
				email: `purchase-${Date.now()}@test.com`,
				password: 'Password123!',
			});
		userToken = userReg.body.token;

		// Create a test vehicle with qty = 1
		const vehicleRes = await request(app)
			.post('/api/vehicles')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				make: 'PurchaseTest',
				model: 'OnlyOne',
				category: 'Sedan',
				year: 2024,
				price: 10000,
				quantity: 1,
			});
		vehicleId = vehicleRes.body.id;
	});

	it('POST /api/vehicles/:id/purchase - should decrement quantity from 1 to 0', async () => {
		const res = await request(app)
			.post(`/api/vehicles/${vehicleId}/purchase`)
			.set('Authorization', `Bearer ${userToken}`);

		expect(res.status).toBe(200);
		expect(res.body.vehicle.quantity).toBe(0);
	});

	it('POST /api/vehicles/:id/purchase - should fail with 400 when quantity is 0', async () => {
		// Second purchase attempt should fail (qty already 0)
		const res = await request(app)
			.post(`/api/vehicles/${vehicleId}/purchase`)
			.set('Authorization', `Bearer ${userToken}`);

		expect(res.status).toBe(400);
		expect(res.body.error).toBeDefined();
	});
});

// ─── Admin GET all vehicles (including out-of-stock) ─────────────────────────

describe('Admin inventory view (TDD)', () => {
	let adminToken = '';
	let userToken = '';

	beforeAll(async () => {
		const adminLogin = await request(app)
			.post('/api/auth/login')
			.send({ username: 'admin', password: 'Admin123!' });
		adminToken = adminLogin.body.token;

		const userReg = await request(app)
			.post('/api/auth/register')
			.send({
				username: `admin-view-user-${Date.now()}`,
				email: `admin-view-${Date.now()}@test.com`,
				password: 'Password123!',
			});
		userToken = userReg.body.token;

		// Create an out-of-stock vehicle
		await request(app)
			.post('/api/vehicles')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				make: 'OOS',
				model: 'ZeroQty',
				category: 'Truck',
				year: 2023,
				price: 50000,
				quantity: 0,
			});
	});

	it('GET /api/vehicles - regular user should NOT see out-of-stock vehicles', async () => {
		const res = await request(app)
			.get('/api/vehicles')
			.set('Authorization', `Bearer ${userToken}`);

		expect(res.status).toBe(200);
		const oosVehicles = res.body.filter((v: { quantity: number }) => v.quantity === 0);
		expect(oosVehicles.length).toBe(0);
	});

	it('GET /api/vehicles/admin - admin should see ALL vehicles including out-of-stock', async () => {
		const res = await request(app)
			.get('/api/vehicles/admin')
			.set('Authorization', `Bearer ${adminToken}`);

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		const oosVehicles = res.body.filter((v: { quantity: number }) => v.quantity === 0);
		expect(oosVehicles.length).toBeGreaterThan(0);
	});

	it('GET /api/vehicles/admin - should return 403 for regular users', async () => {
		const res = await request(app)
			.get('/api/vehicles/admin')
			.set('Authorization', `Bearer ${userToken}`);

		expect(res.status).toBe(403);
	});
});

// ─── Restock flow ────────────────────────────────────────────────────────────

describe('Restock flow (TDD)', () => {
	let adminToken = '';
	let userToken = '';
	let vehicleId = '';

	beforeAll(async () => {
		const adminLogin = await request(app)
			.post('/api/auth/login')
			.send({ username: 'admin', password: 'Admin123!' });
		adminToken = adminLogin.body.token;

		const userReg = await request(app)
			.post('/api/auth/register')
			.send({
				username: `restock-user-${Date.now()}`,
				email: `restock-${Date.now()}@test.com`,
				password: 'Password123!',
			});
		userToken = userReg.body.token;

		const vehicleRes = await request(app)
			.post('/api/vehicles')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				make: 'RestockTest',
				model: 'EmptyLot',
				category: 'SUV',
				year: 2024,
				price: 40000,
				quantity: 0,
			});
		vehicleId = vehicleRes.body.id;
	});

	it('POST /api/vehicles/:id/restock - should allow admin to restock an out-of-stock vehicle', async () => {
		const res = await request(app)
			.post(`/api/vehicles/${vehicleId}/restock`)
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ amount: 10 });

		expect(res.status).toBe(200);
		expect(res.body.vehicle.quantity).toBe(10);
	});

	it('POST /api/vehicles/:id/restock - should return 403 for regular users', async () => {
		const res = await request(app)
			.post(`/api/vehicles/${vehicleId}/restock`)
			.set('Authorization', `Bearer ${userToken}`)
			.send({ amount: 5 });

		expect(res.status).toBe(403);
	});

	it('POST /api/vehicles/:id/restock - should return 400 for invalid amount (0 or negative)', async () => {
		const res = await request(app)
			.post(`/api/vehicles/${vehicleId}/restock`)
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ amount: 0 });

		expect(res.status).toBe(400);
	});
});
