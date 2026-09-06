import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { statusCode: 401, message: 'Unauthorized session' },
        { status: 401 }
      );
    }

    const backendRes = await fetch(`${BACKEND_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { statusCode: 500, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
