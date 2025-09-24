import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export interface UserJwtClaims {
  userId: string;
  name: string;
  isGuest?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const extractAuthUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('getting req', authHeader)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtClaims;

    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
