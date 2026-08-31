import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const { accessToken, refreshToken } = data.tokens || data.data?.tokens || {};

    const response = NextResponse.json({
      statusCode: 200,
      message: 'Login successful',
      data: data.data || data,
      tokens: { accessToken, refreshToken },
    });

    // Set HttpOnly Cookies for Security
    if (accessToken) {
      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15, // 15 minutes
      });
    }

    if (refreshToken) {
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { statusCode: 500, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
