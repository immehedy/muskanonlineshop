import { NextResponse } from 'next/server';
import { OrderDatabase } from '@/lib/database';

export async function GET() {
  try {
    const stats = await OrderDatabase.getOrderStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Stats retrieval error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}