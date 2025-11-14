type FetchOptions<TBody> = {
  body: TBody;
  signal?: AbortSignal;
};

export async function postJson<TBody extends Record<string, unknown>, TResult>(
  url: string,
  options: FetchOptions<TBody>,
): Promise<TResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options.body),
    signal: options.signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  const json = (await response.json()) as { data: TResult };
  return json.data;
}

