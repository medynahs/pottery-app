/** True when fetch failed before an HTTP response (offline, DNS, timeout, etc.). */
export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    message.includes('network request failed')
    || message.includes('failed to fetch')
    || message.includes('network error')
    || message.includes('internet connection appears to be offline')
    || message.includes('the request timed out')
  );
}

export function networkFailureMessage(context: 'post' | 'upload' | 'generic' = 'generic'): string {
  switch (context) {
    case 'upload':
      return 'Could not upload your photo. Check your connection and try again.';
    case 'post':
      return 'Could not publish your post. Check your connection and try again.';
    default:
      return 'No connection right now. Check Wi‑Fi or mobile data, then try again.';
  }
}
