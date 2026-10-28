import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Flame, RefreshCw } from 'lucide-react';
import { fetchTrending, MAX_ROWS, POLL_MS, type Pair } from '../lib/pairs';
import { count, pct, secondsSince, usd } from '../lib/format';
import { ChartModal } from './ChartModal';

// One shared column template keeps the header labels aligned with the rows.
// Widths are fixed so digits stay in vertical columns; the strip scrolls
// horizontally on narrow screens instead of collapsing into a stacked mess.
const COLS =
  'grid grid-cols-[20px_70px_36px_minmax(0,1fr)_96px_84px_84px_96px_66px_66px] items-center gap-3';

type Status = 'loading' | 'ready' | 'error';

export const BoostedPage: React.FC = () => {
  const [rows, setRows] = useState<Pair[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [fetchedAt, setFetchedAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const mounted = useRef(true);
  const hasData = useRef(false);

  // Only setters and refs inside, so this callback stays stable and the
  // interval below is never torn down and rebuilt by a re-render.
  const load = useCallback(async () => {
    try {
      const next = await fetchTrending();
      if (!mounted.current) return;
      hasData.current = next.length > 0;
      setRows(next);
      setFetchedAt(Date.now());
      setError('');
      setStatus('ready');
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : 'Feed unreachable');
      // Keep the last good list on screen, but declare it stale — silently
      // reusing old prices on a trading board is worse than an honest red tag.
      if (!hasData.current) setStatus('error');
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    const poll = setInterval(load, POLL_MS);
    // 1s tick just for the "x s ago" counter, so the freshness is readable
    // without making the data itself look more alive than it is.
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      mounted.current = false;
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [load]);

  const stale = status === 'ready' && !!error;

  // A row click opens the embedded GMGN terminal instead of leaving the page.
  // Kept as an address rather than a row object so an open modal keeps tracking
  // live numbers as the 15s poll replaces `rows`, and closes on its own if the
  // token drops off the boosted list.
  const [chartAddr, setChartAddr] = useState<string | null>(null);
  const chartPair = chartAddr ? (rows.find((r) => r.address === chartAddr) ?? null) : null;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[860px]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 h-11">
          <div className="flex items-center gap-2.5">
            <h3 className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              Boosted Pairs
            </h3>
            <span className="inline-flex h-4 items-center rounded border border-white/[0.08] bg-white/[0.03] px-1.5 font-mono text-[9px] tabular-nums text-[#74787F]">
              {rows.length}/{MAX_ROWS}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.14em]">
            {status === 'loading' && <span className="text-muted">Reading DexScreener…</span>}
            {status === 'ready' && !stale && (
              <span className="flex items-center gap-1.5 text-brand">
                <span className="h-1.5 w-1.5 rounded-none bg-brand" />
                live &middot; {secondsSince(fetchedAt, now)} ago
              </span>
            )}
            {stale && (
              <span title={error} className="flex items-center gap-1.5 text-danger">
                <span className="h-1.5 w-1.5 animate-pulse rounded-none bg-danger" />
                stale &middot; {secondsSince(fetchedAt, now)} ago
              </span>
            )}
            {status === 'error' && <span className="text-danger">{error}</span>}
            <button
              type="button"
              onClick={load}
              title="Refresh now"
              aria-label="Refresh now"
              className="flex h-7 w-7 items-center justify-center border border-[#2A2A2A] text-muted transition-colors hover:border-brand/60 hover:text-brand"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className={`${COLS} border-b border-white/[0.07] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-faint`}>
          <span>#</span>
          <span>boost</span>
          <span />
          <span>pair</span>
          <span className="text-right">price</span>
          <span className="text-right">liq</span>
          <span className="text-right">mcap</span>
          <span className="text-right">vol 24h</span>
          <span className="text-right">1h</span>
          <span className="text-right">24h</span>
        </div>

        {status === 'loading' && (
          <div className="px-4 py-10 text-center text-[11px] uppercase tracking-[0.16em] text-faint">
            reading dexscreener…
          </div>
        )}

        {status === 'error' && (
          <div className="px-4 py-10 text-center text-[11px] text-danger">
            {error || 'Feed unreachable'}
          </div>
        )}

        {status === 'ready' && rows.length === 0 && (
          <div className="px-4 py-10 text-center text-[11px] uppercase tracking-[0.16em] text-faint">
            no boosted solana pairs right now
          </div>
        )}

        {rows.map((p, i) => (
          <div
            key={p.address}
            role="button"
            tabIndex={0}
            onClick={() => setChartAddr(p.address)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setChartAddr(p.address);
              }
            }}
            title={`${p.name || p.symbol} · ${p.address} · open chart`}
            className={`${COLS} h-14 cursor-pointer border-b border-white/[0.04] px-4 text-[13px] transition-colors hover:bg-white/[0.03] focus-visible:bg-white/[0.05] focus-visible:outline-none`}
          >
            <span className="font-mono text-[12px] tabular-nums text-faint">{i + 1}</span>

            <span className="flex items-center gap-1.5 font-mono text-[12px] tabular-nums text-muted">
              <Flame className="h-4 w-4 shrink-0 text-brand" />
              {count(p.boost)}
            </span>

            <img
              src={p.image || `https://thumbnails.padre.gg/SOLANA-${p.address}`}
              alt=""
              loading="lazy"
              onError={(e) => {
                const t = e.currentTarget;
                if (!t.dataset.fb) {
                  t.dataset.fb = '1';
                  t.src = `https://thumbnails.padre.gg/SOLANA-${p.address}`;
                } else {
                  t.style.opacity = '0';
                }
              }}
              className="h-9 w-9 rounded-none border border-white/[0.08] bg-white/[0.05] object-cover"
            />

            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-[15px] font-bold text-ink">{p.symbol}</span>
              <span className="hidden truncate text-[12px] text-faint lg:inline">{p.name}</span>
            </span>

            <span className="text-right font-mono tabular-nums text-muted">{usd(p.priceUsd)}</span>
            <span className="text-right font-mono tabular-nums text-muted">{usd(p.liq)}</span>
            <span className="text-right font-mono tabular-nums text-muted">{usd(p.mcap)}</span>
            <span className="text-right font-mono tabular-nums text-muted">{usd(p.vol24)}</span>
            <span className={`text-right font-mono tabular-nums ${p.chg1h >= 0 ? 'text-brand' : 'text-danger'}`}>
              {pct(p.chg1h)}
            </span>
            <span className={`text-right font-mono tabular-nums ${p.chg24h >= 0 ? 'text-brand' : 'text-danger'}`}>
              {pct(p.chg24h)}
            </span>
          </div>
        ))}

        <p className="px-4 py-3 text-[9px] uppercase tracking-[0.14em] text-faint">
          boost = paid dexscreener promotion · ranked by 24h volume · click row for chart · every 15s
        </p>
      </div>

      <ChartModal target={chartPair} onClose={() => setChartAddr(null)} />
    </div>
  );
};
