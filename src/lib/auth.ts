import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbConnect } from './database';
import User, { IUser } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in your environment variables');
}

export class AuthService {
  static async register(name: string, email: string, password: string, role: string): Promise<IUser> {
    await dbConnect();

    const existing = await User.findOne({ email });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ name, email, password: hashedPassword, role });
    return await user.save();
  }

  static async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return { user, token };
  }

  static async verifyToken(token: string): Promise<IUser | null> {
    await dbConnect();

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return await User.findById(decoded.userId);
    } catch (err) {
      return null;
    }
  }
}
