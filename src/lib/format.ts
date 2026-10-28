/* Display helpers. Nothing here guesses: an unparseable number renders as an
   em dash instead of a zero, so a broken field is visible rather than plausible. */

export const usd = (n: number): string => {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (abs >= 1) return `$${n.toFixed(2)}`;
  if (abs >= 1e-6) return `$${n.toFixed(8).replace(/0+$/, '')}`;
  return n === 0 ? '—' : `$${n.toExponential(2)}`;
};

export const count = (n: number): string => {
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
};

export const pct = (n: number): string => {
  if (!Number.isFinite(n)) return '—';
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
};

// 'ABC…wXyZ' — long enough to disambiguate, short enough to fit a row.
export const shortAddr = (a: string): string =>
  a.length > 12 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a;

export const secondsSince = (ms: number, now: number = Date.now()): string => {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
};
