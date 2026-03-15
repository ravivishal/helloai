const VAPI_BASE_URL = "https://api.vapi.ai";

export function vapiHeaders() {
  return {
    Authorization: `Bearer ${process.env.VAPI_API_KEY!}`,
    "Content-Type": "application/json",
  };
}

export async function vapiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${VAPI_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...vapiHeaders(),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vapi API error (${response.status}): ${text}`);
  }
  return response.json();
}
