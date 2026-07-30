import { NextFunction, Request, Response } from 'express';

export function adminOnly(req: Request, res: Response, next: NextFunction) {
	if (req.user?.role !== 'admin') {
		return res.status(403).json({ error: 'Admin access required.' });
	}

	return next();
}
