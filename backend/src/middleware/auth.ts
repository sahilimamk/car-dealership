import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

export function authenticate(req: Request, res: Response, next: NextFunction) {
	const authorizationHeader = req.headers.authorization;

	if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Authentication required.' });
	}

	const token = authorizationHeader.slice('Bearer '.length);

	try {
		const payload = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: 'user' | 'admin' };
		req.user = {
			id: payload.id,
			username: payload.username,
			role: payload.role,
		};
		return next();
	} catch {
		return res.status(401).json({ error: 'Invalid or expired token.' });
	}
}
