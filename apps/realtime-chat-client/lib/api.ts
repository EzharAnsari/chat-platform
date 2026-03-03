let accessToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

async function refreshToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) {
        setAccessToken(null);
        throw new Error("Session expired");
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    })
    .finally(() => {
      isRefreshing = false;
    });

  return refreshPromise;
}

async function request(
  path: string,
  options: RequestInit = {},
  retry = true
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`,
      }),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    await refreshToken();
    return request(path, options, false);
  }

  if (!res.ok) {
    throw new Error(await res.text());
  }

  if (res.status === 204) return null;

  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: any) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  patch: (path: string, body: any) =>
    request(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  refreshToken,
};