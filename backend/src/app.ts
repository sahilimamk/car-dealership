import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import { ensureDefaultAdminUser } from './stores/userStore';

function getAllowedOrigins() {
	const configured = process.env.CORS_ORIGIN || '';
	return configured
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
}

export function createApp() {
	const app = express();
	const allowedOrigins = getAllowedOrigins();

	app.use(cors({
		origin: (origin, callback) => {
			if (!origin) {
				return callback(null, true);
			}

			if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(new Error('CORS origin not allowed'));
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}));

	app.use(express.json());
	app.get('/health', (_req, res) => {
		res.json({ ok: true });
	});

	app.use('/api/auth', authRoutes);
	app.use('/api/vehicles', vehicleRoutes);

	// In-memory fallback admin — only matters when MongoDB is not connected
	void ensureDefaultAdminUser();

	return app;
}

export default createApp;
