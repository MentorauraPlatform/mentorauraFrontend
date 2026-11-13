/**
 * Universal API Base URL resolver.
 * - Server-side (running in Node / Docker network): returns internal Docker backend URL ('http://backend:4000/api/v1')
 * - Client-side (running in browser): returns public backend URL ('https://api.mentoraura.com/api/v1')
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || 'http://backend:4000/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.mentoraura.com/api/v1';
}
