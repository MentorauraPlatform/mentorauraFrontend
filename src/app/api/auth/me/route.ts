import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const backendApiUrl = getApiBaseUrl();
    const accessToken =
      request.cookies.get('accessToken')?.value ||
      request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { statusCode: 401, message: 'Unauthorized session' },
        { status: 401 }
      );
    }

    const backendRes = await fetch(`${backendApiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
