import { NextRequest, NextResponse } from 'next/server';
import sql from '../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const users = await sql`SELECT * FROM users LIMIT 1`;
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 