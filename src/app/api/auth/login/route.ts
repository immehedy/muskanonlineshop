import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { user, token } = await AuthService.login(email, password);

    const response = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
    }, { status: 200 });

    // Set token cookie — secure, httpOnly, sameSite strict, maxAge 7 days
    response.cookies.set('muskan-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return response;

  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
