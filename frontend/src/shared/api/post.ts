export type LeaveRequestField = {
  text: string;
  response: string;
};

export type LeaveRequestPayload = Array<LeaveRequestField | string>;

export type LeaveRequestResponse = {
  'send-data': boolean;
  error: string;
  [channel: string]: boolean | string;
};

export type RequestError = Error & {
  statusCode?: number;
};

export type PostPayload<TBody = unknown> = {
  rpcUrl: string;
  body: TBody;
};

const BASE_URL = ""; //У нас нет как такого бэкенда, потому что используются удалённый вызов конкретной функции, отправляющей письма и сообщения в тг 

const resolveUrl = (rpcUrl: string) => {
  const trimmed = rpcUrl.trim();
  if (!trimmed) {
    throw new Error('RPC URL is required');
  }
  return trimmed;
};

export const postJson = async <
  TResponse = unknown,
  TBody = unknown
>(
  payload: PostPayload<TBody>,
) => {
  const { rpcUrl, body } = payload;
  const response = await fetch(resolveUrl(rpcUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let errorMessage = '';

    if (contentType.includes('application/json')) {
      const data = await response.json().catch(() => null) as { error?: unknown } | null;
      errorMessage = typeof data?.error === 'string' ? data.error.trim() : '';
    } else {
      const text = await response.text().catch(() => '');
      errorMessage = text.trim();
    }

    const requestError = new Error(errorMessage || `Request failed (${response.status})`) as RequestError;
    requestError.statusCode = response.status;
    throw requestError;
  }

  if (contentType.includes('application/json')) {
    return response.json() as Promise<TResponse>;
  }

  return response.text() as Promise<TResponse>;
};

export const postLeaveRequest = (rpcUrl: string, requestItems: LeaveRequestPayload) =>
  postJson<LeaveRequestResponse, LeaveRequestPayload>({ rpcUrl, body: requestItems });
