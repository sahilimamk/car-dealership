import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import createApp from '../app';

process.env.CORS_ORIGIN = 'https://example.com';
const app = createApp();

beforeAll(() => undefined);

describe('Auth Endpoints (TDD)', () => {
	it('POST /api/auth/register - should create a new user and return token', async () => {
		const res = await request(app)
			.post('/api/auth/register')
			.send({
				username: 'testuser',
				email: 'test@dealership.com',
				password: 'Password123!'
			});

		expect(res.status).toBe(201);
		expect(res.body.user).toBeDefined();
		expect(res.body.user.username).toBe('testuser');
		expect(res.body.user.role).toBe('user');
		expect(res.body.token).toBeDefined();
	});

	it('POST /api/auth/register - should reject duplicate username with 409', async () => {
		const res = await request(app)
			.post('/api/auth/register')
			.send({
				username: 'testuser',
				email: 'another@dealership.com',
				password: 'Password123!'
			});

		expect(res.status).toBe(409);
		expect(res.body.error).toBe('Username already taken.');
	});

	it('POST /api/auth/login - should authenticate valid user and return JWT', async () => {
		const res = await request(app)
			.post('/api/auth/login')
			.send({
				username: 'testuser',
				password: 'Password123!'
			});

		expect(res.status).toBe(200);
		expect(res.body.token).toBeDefined();
		expect(res.body.user.username).toBe('testuser');
	});

	it('POST /api/auth/login - should reject invalid password with 401', async () => {
		const res = await request(app)
			.post('/api/auth/login')
			.send({
				username: 'testuser',
				password: 'WrongPassword'
			});

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('Invalid credentials.');
	});
});

describe('Vehicle Endpoints (RED)', () => {
	let userToken = '';
	let adminToken = '';
	let createdVehicleId = '';
	const uniqueUsername = `vehicle-user-${Date.now()}`;

	beforeAll(async () => {
		const userResponse = await request(app).post('/api/auth/register').send({
			username: uniqueUsername,
			email: `${uniqueUsername}@dealership.com`,
			password: 'Password123!'
		});

		userToken = userResponse.body.token;

		const adminResponse = await request(app).post('/api/auth/login').send({
			username: 'admin',
			password: 'Admin123!'
		});

		adminToken = adminResponse.body.token;

		const vehicleResponse = await request(app)
			.post('/api/vehicles')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				make: 'Toyota',
				model: 'Supra',
				category: 'Coupe',
				year: 2024,
				price: 250000,
				quantity: 3,
			});

		createdVehicleId = vehicleResponse.body.id;
	});

	it('OPTIONS /api/vehicles - should return valid CORS headers for preflight requests', async () => {
		const res = await request(app)
			.options('/api/vehicles')
			.set('Origin', 'https://example.com')
			.set('Access-Control-Request-Method', 'POST')
			.set('Access-Control-Request-Headers', 'Content-Type, Authorization');

		expect(res.status).toBe(204);
		expect(res.headers['access-control-allow-origin']).toBe('https://example.com');
		expect(res.headers['access-control-allow-credentials']).toBe('true');
		expect(res.headers['access-control-allow-methods']).toContain('POST');
		expect(res.headers['access-control-allow-headers']).toContain('Authorization');
	});

	it('POST /api/vehicles - should allow unauthenticated visitors to create a vehicle record', async () => {
		const res = await request(app)
			.post('/api/vehicles')
			.send({
				make: 'Lexus',
				model: 'IS 300',
				category: 'Sedan',
				year: 2023,
				price: 43000,
				quantity: 3,
			});

		expect(res.status).toBe(201);
		expect(res.body.id).toBeDefined();
	});

	it('POST /api/vehicles/:id/purchase - should allow unauthenticated visitors to purchase a vehicle', async () => {
		const created = await request(app)
			.post('/api/vehicles')
			.send({
				make: 'Subaru',
				model: 'Impreza',
				category: 'Sedan',
				year: 2022,
				price: 28000,
				quantity: 2,
			});

		const res = await request(app).post(`/api/vehicles/${created.body.id}/purchase`);

		expect(res.status).toBe(200);
		expect(res.body.vehicle.quantity).toBe(1);
	});

	it('GET /api/vehicles - should allow unauthenticated visitors to browse inventory', async () => {
		const res = await request(app).get('/api/vehicles');

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});

	it('POST /api/vehicles - should create a vehicle record for admin users', async () => {
		const res = await request(app)
			.post('/api/vehicles')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				make: 'Porsche',
				model: '911 GT3',
				category: 'Coupe',
				year: 2024,
				price: 182900,
				quantity: 3,
			});

		expect(res.status).toBe(201);
		expect(res.body.id).toBeDefined();
		expect(res.body.make).toBe('Porsche');
	});

	it('POST /api/vehicles - should reject invalid payloads with Zod validation details', async () => {
		const res = await request(app)
			.post('/api/vehicles')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({
				make: '',
				model: 'Model X'
			});

		expect(res.status).toBe(422);
		expect(Array.isArray(res.body.errors)).toBe(true);
		expect(res.body.errors.length).toBeGreaterThan(0);
	});

	it('GET /api/vehicles/search - should filter vehicles by category and price range', async () => {
		const res = await request(app)
			.get('/api/vehicles/search?category=Coupe&minPrice=100000&maxPrice=300000')
			.set('Authorization', `Bearer ${userToken}`);

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0].category).toBe('Coupe');
	});

	it('PUT /api/vehicles/:id - should update a vehicle record', async () => {
		const res = await request(app)
			.put(`/api/vehicles/${createdVehicleId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.send({ price: 260000 });

		expect(res.status).toBe(200);
		expect(res.body.price).toBe(260000);
	});

	it('DELETE /api/vehicles/:id - should allow deleting a vehicle without admin checks', async () => {
		const res = await request(app)
			.delete(`/api/vehicles/${createdVehicleId}`)
			.set('Authorization', `Bearer ${userToken}`);

		expect(res.status).toBe(200);
		expect(res.body.message).toContain('deleted');
	});

	it('POST /api/vehicles/:id/purchase - should decrease quantity by one', async () => {
		const created = await request(app)
			.post('/api/vehicles')
			.send({
				make: 'Mazda',
				model: 'MX-5',
				category: 'Coupe',
				year: 2024,
				price: 32000,
				quantity: 3,
			});

		const res = await request(app)
			.post(`/api/vehicles/${created.body.id}/purchase`)
			.set('Authorization', `Bearer ${userToken}`);

		expect(res.status).toBe(200);
		expect(res.body.vehicle.quantity).toBe(2);
	});

	it('POST /api/vehicles/:id/restock - should allow increasing quantity', async () => {
		const created = await request(app)
			.post('/api/vehicles')
			.send({
				make: 'Audi',
				model: 'A3',
				category: 'Sedan',
				year: 2024,
				price: 36000,
				quantity: 0,
			});

		const res = await request(app)
			.post(`/api/vehicles/${created.body.id}/restock`)
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ amount: 5 });

		expect(res.status).toBe(200);
		expect(res.body.vehicle.quantity).toBe(5);
	});
});
