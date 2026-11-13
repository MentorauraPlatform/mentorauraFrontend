import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const backendApiUrl = getApiBaseUrl();
    const resolvedParams = await params;
    const pathStr = resolvedParams.path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;

    const targetUrl = `${backendApiUrl}/${pathStr}${queryString}`;

    const accessToken =
      request.cookies.get('accessToken')?.value ||
      request.cookies.get('access_token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const init: RequestInit = {
      method: request.method,
      headers,
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const bodyText = await request.text();
      if (bodyText) {
        init.body = bodyText;
      }
    }

    const backendRes = await fetch(targetUrl, {
      ...init,
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => ({}));

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Internal proxy error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
