import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function POST(request: NextRequest) {
  try {
    let refreshToken =
      request.cookies.get('refreshToken')?.value ||
      request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      const body = await request.json().catch(() => ({}));
      refreshToken = body?.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { statusCode: 401, message: 'Refresh token is required', error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const backendRes = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const newAccessToken = data.tokens?.accessToken || data.data?.tokens?.accessToken;
    const newRefreshToken = data.tokens?.refreshToken || data.data?.tokens?.refreshToken || refreshToken;

    const response = NextResponse.json({
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: data.data || data,
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });

    const isProd = process.env.NODE_ENV === 'production';

    if (newAccessToken) {
      response.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
      response.cookies.set('access_token', newAccessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
    }

    if (newRefreshToken) {
      response.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
