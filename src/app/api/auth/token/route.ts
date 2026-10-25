import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const accessToken =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { statusCode: 401, message: 'No active session token' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    statusCode: 200,
    token: accessToken,
  });
}
