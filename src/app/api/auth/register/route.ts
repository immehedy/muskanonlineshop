import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await AuthService.register(name, email, password, role);

    return NextResponse.json({
      message: 'User registered',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }, { status: 201 });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
