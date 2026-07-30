import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByUsername } from '../stores/userStore';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

router.post('/register', async (req, res) => {
	const { username, email, password } = req.body as {
		username?: string;
		email?: string;
		password?: string;
	};

	if (!username || !email || !password) {
		return res.status(400).json({ error: 'Username, email, and password are required.' });
	}

	const existingUser = await findUserByUsername(username);
	if (existingUser) {
		return res.status(409).json({ error: 'Username already taken.' });
	}

	const passwordHash = await bcrypt.hash(password, 10);
	const user = await createUser({ username, email, passwordHash, role: 'user' });
	const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

	return res.status(201).json({
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
		},
		token,
	});
});

router.post('/login', async (req, res) => {
	const { username, password } = req.body as {
		username?: string;
		password?: string;
	};

	if (!username || !password) {
		return res.status(400).json({ error: 'Username and password are required.' });
	}

	const user = await findUserByUsername(username);
	if (!user) {
		return res.status(401).json({ error: 'Invalid credentials.' });
	}

	const isValidPassword = await bcrypt.compare(password, user.passwordHash);
	if (!isValidPassword) {
		return res.status(401).json({ error: 'Invalid credentials.' });
	}

	const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

	return res.status(200).json({
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
		},
		token,
	});
});

export default router;