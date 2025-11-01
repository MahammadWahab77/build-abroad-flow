export type ApiRequestOptions = RequestInit & {
  json?: unknown;
};

import { mockApiRequest } from './mockApi';

export async function apiRequest<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;
  const { method: methodOption, body: bodyOption, ...restOptions } = rest;
  const method = (methodOption ?? (json ? 'POST' : 'GET')).toString().toUpperCase();
  const resolvedBody = json ? JSON.stringify(json) : bodyOption;

  const requestHeaders: HeadersInit = {
    'Accept': 'application/json',
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  const mockResult = await mockApiRequest<T>(path, {
    method,
    jsonBody: json,
    rawBody: bodyOption ?? null,
  });

  if (mockResult.handled) {
    return mockResult.data as T;
  }

  const response = await fetch(path, {
    method,
    headers: requestHeaders,
    body: resolvedBody as BodyInit | null | undefined,
    ...restOptions,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  // @ts-expect-error allow text return when not json
  return (await response.text()) as T;
}



