import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' }, { status: 200 })

  // Most reliable: delete
  res.cookies.delete('muskan-token')

  // Extra safety: also overwrite with expired cookie at root path
  res.cookies.set('muskan-token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return res
}
