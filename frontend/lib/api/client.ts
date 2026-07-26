class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> ?? {}),
    },
  });

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const payload = await res.clone().json();
      detail = payload.detail ?? payload.error ?? payload.message ?? "";
    } catch {
      try {
        detail = await res.text();
      } catch {
        detail = undefined;
      }
    }
    throw new ApiError(
      `Request failed: ${res.status} ${res.statusText}`,
      res.status,
      detail
    );
  }

  return res.json();
}

export { apiFetch, ApiError };