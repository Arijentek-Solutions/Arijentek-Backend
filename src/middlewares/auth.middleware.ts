import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
    adminId?: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { adminId: string };
        req.adminId = decoded.adminId;
        next();
    } catch {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
