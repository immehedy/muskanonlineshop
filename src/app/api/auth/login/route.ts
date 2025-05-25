import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { user, token } = await AuthService.login(email, password);

    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    }, { status: 200 });

  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
