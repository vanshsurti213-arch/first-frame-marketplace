import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set('firstframe_brand_session', '', {
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[BRAND LOGOUT ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
