import express from 'express';
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import { ensureDefaultAdminUser } from './stores/userStore';

export function createApp() {
	const app = express();

	app.use(express.json());
	app.get('/health', (_req, res) => {
		res.json({ ok: true });
	});

	app.use('/api/auth', authRoutes);
	app.use('/api/vehicles', vehicleRoutes);

	void ensureDefaultAdminUser();

	return app;
}

export default createApp;