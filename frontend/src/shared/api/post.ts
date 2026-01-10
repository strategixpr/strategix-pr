export type LeaveRequestField = {
  text: string;
  response: string;
};

export type LeaveRequestPayload = {
  name: LeaveRequestField;
  phone: LeaveRequestField;
  question: LeaveRequestField;
  question2: LeaveRequestField;
};

export type LeaveRequestResponse = {
  'send-data': boolean;
  error: string;
};

export type PostPayload<TBody extends Record<string, unknown> = Record<string, unknown>> = TBody & {
  endpoint: string;
};

const BASE_URL = 'https://d5duk9lecjq24mdnd4nk.sk0vql13.apigw.yandexcloud.net/api';

const resolveUrl = (endpoint: string) => {
  const trimmed = endpoint.trim();
  if (!trimmed) {
    throw new Error('Endpoint is required');
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const base = BASE_URL.replace(/\/+$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
};

export const postJson = async <
  TResponse = unknown,
  TBody extends Record<string, unknown> = Record<string, unknown>
>(
  payload: PostPayload<TBody>,
) => {
  const { endpoint, ...body } = payload;
  const response = await fetch(resolveUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed (${response.status})`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<TResponse>;
  }

  return response.text() as Promise<TResponse>;
};

export const postLeaveRequest = (payload: PostPayload<LeaveRequestPayload>) =>
  postJson<LeaveRequestResponse>(payload);
