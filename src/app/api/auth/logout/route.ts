import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    statusCode: 200,
    message: 'Logged out successfully',
  });

  // Clear HttpOnly cookies
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');

  return response;
}
