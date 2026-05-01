export async function fetchWithRetries(input: RequestInfo, init?: RequestInit, attempts = 3, backoff = 800) {
  let lastError = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(input, init);
      if (!res.ok) {
        // treat 5xx as retryable
        if (res.status >= 500 && res.status < 600) {
          lastError = new Error(`Server error ${res.status}`);
          // wait before retrying
          await new Promise(r => setTimeout(r, backoff * (i + 1)));
          continue;
        }
        // non-retryable error
        return res;
      }
      return res;
    } catch (err) {
      lastError = err;
      // network error — retry
      await new Promise(r => setTimeout(r, backoff * (i + 1)));
    }
  }
  throw lastError;
}
