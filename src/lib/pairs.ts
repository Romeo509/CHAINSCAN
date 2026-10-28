/* Boosted pairs, straight from DexScreener's public endpoints (no API key).
   A "boost" is paid promotion on DexScreener, so this list measures how much
   visibility a token bought — it says nothing about the token being safe. */

export const POLL_MS = 15000;
const BOOST_ADDRS = 30; // how far down the boost leaderboard we look
export const MAX_ROWS = 20; // rows rendered

const BOOSTS_URL = 'https://api.dexscreener.com/token-boosts/top/v1';
const TOKENS_URL = 'https://api.dexscreener.com/tokens/v1/solana/';

export interface Pair {
  address: string;
  symbol: string;
  name: string;
  image: string;
  priceUsd: number;
  liq: number;
  mcap: number;
  vol24: number;
  chg1h: number;
  chg24h: number;
  created: number; // epoch ms of pair creation
  boost: number; // boost amount paid for that token
}

interface BoostRow {
  chainId?: string;
  tokenAddress?: string;
  totalAmount?: number | string;
}

interface PairRow {
  chainId?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  priceUsd?: string | number;
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  marketCap?: number;
  fdv?: number;
  priceChange?: { h1?: number; h24?: number };
  pairCreatedAt?: number;
  info?: { imageUrl?: string };
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Feed answered ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchTrending(): Promise<Pair[]> {
  const boosts = await getJson<BoostRow[]>(BOOSTS_URL);

  // Keep Solana only, dedupe on first appearance, and remember how much was
  // paid for each token so the row can show it. Map preserves that order.
  const ranked = new Map<string, number>();
  for (const b of Array.isArray(boosts) ? boosts : []) {
    if (!b || b.chainId !== 'solana' || !b.tokenAddress) continue;
    if (!ranked.has(b.tokenAddress)) ranked.set(b.tokenAddress, Number(b.totalAmount) || 0);
  }

  const addrs = Array.from(ranked.keys()).slice(0, BOOST_ADDRS);
  if (!addrs.length) return [];

  const raw = await getJson<PairRow[]>(TOKENS_URL + addrs.join(','));

  // One token can span many pools; the deepest pool is the one worth quoting.
  const best = new Map<string, Pair>();
  for (const p of Array.isArray(raw) ? raw : []) {
    const addr = String(p?.baseToken?.address ?? '');
    if (!addr) continue;
    const pair: Pair = {
      address: addr,
      symbol: String(p.baseToken?.symbol ?? '—'),
      name: String(p.baseToken?.name ?? ''),
      image: String(p.info?.imageUrl ?? ''),
      priceUsd: Number(p.priceUsd) || 0,
      liq: Number(p.liquidity?.usd) || 0,
      // DexScreener fills marketCap only for circulating supplies; fdv is the
      // fallback, and the two are identical for fully-distributed mints.
      mcap: Number(p.marketCap) || Number(p.fdv) || 0,
      vol24: Number(p.volume?.h24) || 0,
      chg1h: Number(p.priceChange?.h1) || 0,
      chg24h: Number(p.priceChange?.h24) || 0,
      created: Number(p.pairCreatedAt) || 0,
      boost: ranked.get(addr) ?? 0,
    };
    const cur = best.get(addr);
    if (!cur || pair.liq > cur.liq) best.set(addr, pair);
  }

  return Array.from(best.values()).sort((a, b) => b.vol24 - a.vol24).slice(0, MAX_ROWS);
}
