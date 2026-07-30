import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import { ensureDefaultAdminUser } from './stores/userStore';

export function createApp() {
	const app = express();

	// Allow requests from any origin in production (tighten to your Vercel URL if needed)
	app.use(cors({
		origin: process.env.CORS_ORIGIN || '*',
		credentials: true,
	}));

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