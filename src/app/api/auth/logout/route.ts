import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: 'Successfully logged out' }, { status: 200 });

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
