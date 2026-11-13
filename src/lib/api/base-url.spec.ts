import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl } from './base-url';

describe('getApiBaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns NEXT_PUBLIC_API_URL or default in browser environment', () => {
    // In jsdom environment, window is defined
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getApiBaseUrl()).toBe('https://api.mentoraura.com/api/v1');

    process.env.NEXT_PUBLIC_API_URL = 'https://custom-api.mentoraura.com/api/v1';
    expect(getApiBaseUrl()).toBe('https://custom-api.mentoraura.com/api/v1');
  });
});
