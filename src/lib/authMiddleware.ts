import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { AuthService } from './auth';

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    const user = await AuthService.verifyToken(token);

    if (!user) return res.status(401).json({ error: 'Invalid or expired token' });

    (req as any).user = user;
    return handler(req, res);
  };
}
