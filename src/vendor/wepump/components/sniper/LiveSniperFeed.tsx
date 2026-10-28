import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, BarChart2, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { TradingViewChart } from '../tokens/TradingViewChart';
import { useSmoothWheelScroll } from '../../hooks/useSmoothWheelScroll';
import { findKol } from '../../data/kolWallets';

export interface SnipeToken {
  id: string;
  mint?: string;
  signature?: string;
  title: string;
  imageSrc: string;
  price: number;
  pnlPercent: number;
  wallet: string;
  timestamp: string;
  receivedAt?: number;
  // 'kol' rows are injected by a tracked-KOL buy instead of a launch-stream trade.
  source?: 'launch' | 'kol';
  kolBuySol?: number;
  // Roster label of the KOL who bought, resolved at row-build time.
  kolLabel?: string;
}

interface LiveSniperFeedProps {
  buyPrice: number;
}

const EASE = [0.22, 1, 0.36, 1];

// Tracked-KOL buys, joined client-side from the wallet_trade stream that already
// shares this socket. Buys only - a KOL sell is an exit signal, never a badge.
interface KolBuySignal {
  buyers: string[];
  lastBuyer: string;
  lastBuyAt: number; // epoch seconds
}

// A two-day-old KOL buy is not live conviction: the badge has a TTL.
const KOL_SIGNAL_TTL_SEC = 30 * 60;

interface KolTradeShape {
  id?: string;
  txType?: string;
  mint?: string | null;
  trader?: string | null;
  timestamp?: number;
  solAmount?: number;
  coin?: { name?: string | null; symbol?: string | null; image?: string | null } | null;
}

// Merge incoming tracked trades into the per-mint buy map. Returns the same object
// reference when nothing changed, so a burst of irrelevant traffic costs no re-render.
const mergeKolBuys = (prev: Record<string, KolBuySignal>, trades: KolTradeShape[]) => {
  const nowSec = Math.floor(Date.now() / 1000);
  let next: Record<string, KolBuySignal> | null = null;

  for (const t of trades) {
    if (!t || t.txType !== 'buy' || !t.mint || !t.trader) continue;
    if (!findKol(t.trader)) continue; // roster-only, same guarantee as the wallet feed

    const cur = (next || prev)[t.mint];
    const buyers = cur?.buyers.includes(t.trader) ? cur.buyers : [...(cur?.buyers || []), t.trader];
    const candidate: KolBuySignal = {
      buyers,
      lastBuyer: t.trader,
      lastBuyAt: Math.max(cur?.lastBuyAt || 0, t.timestamp || nowSec),
    };
    if (!next) next = { ...prev };
    next[t.mint] = candidate;
  }

  if (!next) return prev;
  for (const m of Object.keys(next)) {
    if (nowSec - next[m].lastBuyAt > KOL_SIGNAL_TTL_SEC) delete next[m];
  }
  return next;
};

// A tracked-KOL buy becomes its own feed row. Id is per-trade, not per-mint, so a coin
// bought again simply appears again as a fresh entry - no duplicate suppression.
const kolRowFromTrade = (t: KolTradeShape): SnipeToken | null => {
  if (!t.mint || !t.trader) return null;
  const shortMint = `${t.mint.slice(0, 4)}…${t.mint.slice(-4)}`;
  return {
    id: `kol-${t.id || `${t.mint}-${t.timestamp || Date.now()}`}`,
    mint: t.mint,
    title: t.coin?.name || shortMint,
    // Server always resolves an image from the mint; row-level onError still falls back.
    imageSrc: t.coin?.image || `https://thumbnails.padre.gg/SOLANA-${t.mint}`,
    price: 0, // dev-buy SOL is unknown here - never borrow the launch field
    pnlPercent: 0,
    wallet: t.trader,
    timestamp: String(t.timestamp || Math.floor(Date.now() / 1000)),
    receivedAt: Date.now(),
    source: 'kol',
    kolBuySol: Number(t.solAmount) || 0,
    kolLabel: findKol(t.trader)?.label,
  };
};

// Tracked-KOL interest on a launch row: buyer avatars only, so the coin name keeps its full
// width. Who they are and how long ago stays in the hover tooltip; the row is not interactive here.
const KolAvatars = ({ signal, nowMs }: { signal: KolBuySignal; nowMs: number }) => {
  const roster = signal.buyers
    .map((a) => findKol(a))
    .filter((w): w is NonNullable<typeof w> => !!w);
  if (!roster.length) return null;

  const ageSec = Math.max(0, Math.floor(nowMs / 1000) - signal.lastBuyAt);
  const age = ageSec < 60 ? `${ageSec}s` : ageSec < 3600 ? `${Math.floor(ageSec / 60)}m` : `${Math.floor(ageSec / 3600)}h`;
  const shown = roster.slice(0, 3);
  const extra = roster.length > shown.length ? ` +${roster.length - shown.length} more` : '';

  return (
    <span
      title={`Tracked KOL bought: ${shown.map((w) => w.label).join(', ')}${extra} · ${age} ago`}
      className="flex shrink-0 items-center -space-x-1.5"
    >
      {shown.map((w) => (
        <img
          key={w.addr}
          src={w.img}
          alt=""
          className="w-4 h-4 rounded-full object-cover bg-black ring-[1.5px] ring-[#0D0E10]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ))}
    </span>
  );
};

export const LiveSniperFeed: React.FC<LiveSniperFeedProps> = () => {
  const [tokens, setTokens] = useState<SnipeToken[]>([]);
  const [copiedMint, setCopiedMint] = useState<string | null>(null);
  const [hoveredMint, setHoveredMint] = useState<string | null>(null);
  const [selectedMint, setSelectedMint] = useState<string | null>(null);
  // Enlarged token image shown while hovering a row (anchored beside it).
  const [hoverPreview, setHoverPreview] = useState<{ src: string; mint?: string; x: number; y: number } | null>(null);
  const [activeChartToken, setActiveChartToken] = useState<SnipeToken | null>(null);
  // mint -> tracked KOL buys, rendered as the avatar stack on the row.
  const [kolBuys, setKolBuys] = useState<Record<string, KolBuySignal>>({});
  const isHoveringFeedRef = useRef(false);
  const queuedTokensRef = useRef<SnipeToken[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  const feedRef = useRef<HTMLDivElement>(null);
  useSmoothWheelScroll(feedRef);

  // Ticker so "age since seen" stays live; cheap 1s tick scoped to this feed.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    const wsApiUrl = import.meta.env.VITE_WEBSOCKET_API_URL;
    const wsUrl = import.meta.env.VITE_WEBSOCKET_WS_URL;

    // Fetch initial trades
    const fetchInitial = async () => {
      try {
        if (!wsApiUrl) return;
        const res = await fetch(`${wsApiUrl}/api/activity`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.trades && isMounted) {
            const stamped = data.trades.slice(0, 30).map((t: SnipeToken) => ({ ...t, receivedAt: Date.now() }));
            setTokens(stamped);
          }
        }
      } catch (e) {}
    };

    fetchInitial();

    // Connect WebSocket
    const connect = () => {
      try {
        if (!wsUrl) return;
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            // Same socket carries the KOL stream: seed from the snapshot, then merge live buys.
            if (data.type === 'wallet_trades_init' && Array.isArray(data.trades)) {
              setKolBuys((prev) => mergeKolBuys(prev, data.trades));
              return;
            }
            if (data.type === 'wallet_trade' && data.trade) {
              const trade = data.trade as KolTradeShape;
              setKolBuys((prev) => mergeKolBuys(prev, [trade]));

              // Live buys push the coin to the top. The connect snapshot is deliberately
              // NOT injected, otherwise a reconnect would flush ~30 old rows over the launches.
              if (trade.txType !== 'buy' || !findKol(trade.trader)) return;
              const kolRow = kolRowFromTrade(trade);
              if (!kolRow) return;

              if (isHoveringFeedRef.current) {
                queuedTokensRef.current.unshift(kolRow);
                return;
              }
              setTokens((prev) => [kolRow, ...prev].slice(0, 30));
              return;
            }

            if (data.type === 'init' && Array.isArray(data.trades)) {
              setTokens(data.trades.slice(0, 30).map((t: SnipeToken) => ({ ...t, receivedAt: Date.now() })));
            } else if (data.type === 'new_trade' && data.trade) {
              const item: SnipeToken = { ...data.trade, receivedAt: Date.now() };

              // If user is actively hovering over the feed, queue incoming tokens in buffer
              if (isHoveringFeedRef.current) {
                const isDup = queuedTokensRef.current.some(
                  (t) => (item.mint && t.mint === item.mint) || (t.title && t.title.toLowerCase() === item.title.toLowerCase())
                );
                if (!isDup) {
                  queuedTokensRef.current.unshift(item);
                }
                return;
              }

              setTokens((prev) => {
                const isDup = prev.some(
                  (t) => (item.mint && t.mint === item.mint) || (t.title && t.title.toLowerCase() === item.title.toLowerCase())
                );
                if (isDup) return prev;
                return [item, ...prev.slice(0, 29)];
              });
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          if (isMounted) setTimeout(connect, 3000);
        };
      } catch (e) {}
    };

    connect();

    return () => {
      isMounted = false;
      if (ws) ws.close();
    };
  }, []);

  const handleCopy = (mint?: string) => {
    if (!mint) return;
    navigator.clipboard.writeText(mint);
    setCopiedMint(mint);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  const handleMouseEnterToken = (token: SnipeToken, e: React.MouseEvent) => {
    // Hover previews the expanded token image + row highlight; it never opens the chart.
    if (token.mint && token.mint !== hoveredMint) {
      setHoveredMint(token.mint);
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoverPreview({ src: token.imageSrc, mint: token.mint, x: rect.left, y: rect.top + rect.height / 2 });
  };

  // Click/tap opens the chart popup; clicking the active row again closes it.
  const handleTokenClick = (token: SnipeToken) => {
    if (!token.mint) return;
    if (selectedMint === token.mint) {
      setSelectedMint(null);
      setActiveChartToken(null);
    } else {
      setSelectedMint(token.mint);
      setActiveChartToken(token);
    }
  };

  // Close the chart modal (backdrop tap or X).
  const closeChart = () => {
    setActiveChartToken(null);
    setSelectedMint(null);
  };

  const handleFeedMouseEnter = () => {
    isHoveringFeedRef.current = true;
  };

  const handleFeedMouseLeave = () => {
    isHoveringFeedRef.current = false;
    setHoveredMint(null);
    setHoverPreview(null);
    // Keep the clicked chart open — open/close is now click-driven, not hover.

    // Flush queued tokens into the main list instantly when mouse leaves
    if (queuedTokensRef.current.length > 0) {
      const buffer = [...queuedTokensRef.current];
      queuedTokensRef.current = [];

      setTokens((prev) => {
        let nextList = [...prev];
        for (const item of buffer) {
          // KOL entries are intentionally allowed to repeat a mint already listed.
          if (item.source === 'kol') {
            nextList = [item, ...nextList];
            continue;
          }
          const isDup = nextList.some(
            (t) => (item.mint && t.mint === item.mint) || (t.title && t.title.toLowerCase() === item.title.toLowerCase())
          );
          if (!isDup) {
            nextList = [item, ...nextList];
          }
        }
        return nextList.slice(0, 30);
      });
    }
  };

  return (
    <div className="select-none relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14F195]" />
          <h3 className="text-[10px] font-bold text-[#8A8F98] uppercase tracking-[0.16em] whitespace-nowrap">
            Live Launches
          </h3>
          <img src="/pumpfun.svg" alt="pump.fun" className="h-3.5 w-auto opacity-90" />
          <span className="ml-1 px-1.5 h-4 inline-flex items-center rounded border border-white/[0.08] bg-white/[0.03] text-[9px] font-mono text-[#74787F] tabular-nums">
            {tokens.length}
          </span>
        </div>
        <span className="hidden sm:inline text-[9px] uppercase tracking-[0.14em] text-[#8A8F98]">
          Click row for chart
        </span>
      </div>

      {/* Feed rows — compact, data-first, paused while hovering */}
      <div
        ref={feedRef}
        onMouseEnter={handleFeedMouseEnter}
        onMouseLeave={handleFeedMouseLeave}
        className="max-h-[650px] overflow-y-auto custom-scrollbar"
      >
        {tokens.length === 0 && (
          <div className="px-4 py-10 text-center text-[11px] text-[#8A8F98]">
            Waiting for launches on the live stream…
          </div>
        )}
        {tokens.map((token) => {
          const mint = token.mint || '';
          const shortMint = mint ? `${mint.slice(0, 4)}…${mint.slice(-4)}` : 'unindexed';
          const isSelected = !!token.mint && token.mint === selectedMint;
          const secs = Math.max(0, Math.floor((now - (token.receivedAt ?? now)) / 1000));
          const age = secs < 60 ? `${secs}s` : secs < 3600 ? `${Math.floor(secs / 60)}m` : `${Math.floor(secs / 3600)}h`;
          const devBuy = Number(token.price) || 0; // server maps dev-buy SOL onto the `price` field
          const isBigDev = devBuy >= 1;
          const isKolRow = token.source === 'kol';
          // Both a heavy dev buy and a KOL entry earn the row highlight.
          const isGlow = isBigDev || isKolRow;
          // Fresh tracked-KOL interest on this exact mint, if any.
          const kolSignal = mint ? kolBuys[mint] : undefined;
          const kolFresh = !!kolSignal && Math.floor(now / 1000) - kolSignal.lastBuyAt <= KOL_SIGNAL_TTL_SEC;

          return (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              onMouseEnter={(e) => handleMouseEnterToken(token, e)}
              onClick={() => handleTokenClick(token)}
              data-coin-row
              className={`relative grid grid-cols-12 items-center gap-3 h-16 border-b border-white/[0.05] transition-colors duration-200 group cursor-pointer ${
                isSelected ? 'bg-[#14F195]/[0.05]' : isGlow ? 'bg-[#14F195]/[0.07] hover:bg-[#14F195]/[0.1]' : 'hover:bg-white/[0.03]'
              }`}
            >
              {isGlow && <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#14F195]" />}
              {/* Token identity */}
              <div className="col-span-6 lg:col-span-7 flex items-center gap-3 min-w-0">
                <img
                  src={token.imageSrc}
                  alt={token.title}
                  className="w-16 h-16 object-cover bg-black shrink-0"
                  onError={(e) => {
                    if (token.mint) {
                      e.currentTarget.src = `https://thumbnails.padre.gg/SOLANA-${token.mint}`;
                    }
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate group-hover:text-[#14F195] transition-colors duration-200">
                      {token.title}
                    </span>
                    {mint.endsWith('pump') && (
                      <img src="/pumpfun.svg" alt="pump.fun" title="Live on pump.fun" className="w-3.5 h-3.5 shrink-0 opacity-90" />
                    )}
                    {kolFresh && kolSignal && <KolAvatars signal={kolSignal} nowMs={now} />}
                    <BarChart2 className={`w-3 h-3 text-[#14F195] shrink-0 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#74787F] tabular-nums">{shortMint}</span>
                    {token.mint && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(token.mint);
                        }}
                        title="Copy Mint Address"
                        className="text-[#74787F] hover:text-white transition-all duration-200 shrink-0"
                      >
                        {copiedMint === token.mint ? (
                          <Check className="w-3 h-3 text-[#14F195]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Age since seen — computed client-side */}
              <div className="col-span-2 text-right">
                <span className="font-mono text-[11px] text-[#8A8F98] tabular-nums">{age}</span>
              </div>

              {/* Status — flagged rows get deep analysis; the rest warn of thin dev liquidity */}
              <div className="col-span-4 lg:col-span-3 flex items-center justify-end gap-1.5 shrink-0 pr-4">
                {isKolRow ? (
                  // Two lines: who moved, then how much. A bare "0.11 SOL" reads like a
                  // price tick, and the whole signal is that a named wallet took a position.
                  // Launch liquidity stays out of this cell — it is unknown for a KOL row.
                  <span className="flex min-w-0 flex-col items-end leading-none">
                    <span className="max-w-[132px] truncate text-[9px] uppercase tracking-[0.14em] text-[#14F195]">
                      {token.kolLabel ? `${token.kolLabel} bought in` : 'KOL bought in'}
                    </span>
                    {!!token.kolBuySol && (
                      <span className="mt-1.5 font-mono text-[11px] tabular-nums text-[#8A8F98]">
                        {token.kolBuySol} SOL
                      </span>
                    )}
                  </span>
                ) : isBigDev ? (
                  <>
                    <motion.span
                      className="w-1 h-1 rounded-full bg-[#14F195]"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <span className="text-[9px] uppercase tracking-[0.14em] text-[#14F195]">Rescanning…</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 shrink-0 text-[#FF6B6B]" />
                    <span className="text-[9px] uppercase tracking-[0.14em] text-[#FF6B6B]">Low Liquidity</span>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hover: expanded token image, anchored just left of the row (fixed so the feed's overflow can't clip it) */}
      {hoverPreview && (
        <div
          className="pointer-events-none fixed z-50 hidden sm:block"
          style={{ top: hoverPreview.y, left: Math.max(8, hoverPreview.x - 176), transform: 'translateY(-50%)' }}
        >
          <img
            src={hoverPreview.src}
            alt=""
            className="w-40 h-40 rounded-xl object-cover border border-white/10 shadow-2xl shadow-black/60 bg-black"
            onError={(e) => {
              if (hoverPreview.mint) e.currentTarget.src = `https://thumbnails.padre.gg/SOLANA-${hoverPreview.mint}`;
            }}
          />
        </div>
      )}

      {/* CENTERED GMGN TERMINAL MODAL (desktop click) */}
      {activeChartToken && activeChartToken.mint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={closeChart}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[640px]"
          >
            {/* Identity row outside the chart: image, GMGN link, close */}
            <div className="flex items-center gap-3 mb-3 px-1">
              <img
                src={activeChartToken.imageSrc}
                alt={activeChartToken.title}
                className="w-16 h-16 rounded-xl object-cover bg-black ring-1 ring-white/10"
                onError={(e) => {
                  if (activeChartToken.mint) e.currentTarget.src = `https://thumbnails.padre.gg/SOLANA-${activeChartToken.mint}`;
                }}
              />
              <span className="min-w-0 text-[15px] font-bold text-white truncate">{activeChartToken.title}</span>
              <a
                href={`https://gmgn.ai/sol/token/${activeChartToken.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A8F98] hover:text-[#14F195] transition-colors duration-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open on GMGN
              </a>
              <button
                onClick={closeChart}
                title="Close"
                className="ml-auto grid place-items-center w-9 h-9 rounded-md bg-white/[0.04] border border-white/10 text-[#8A8F98] hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
            {/* GMGN terminal — clean card, nothing overlaid */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0D0F] shadow-2xl shadow-black/70">
              <TradingViewChart
                tokenAddress={activeChartToken.mint}
                tokenSymbol={activeChartToken.title}
                heightClass="h-[380px]"
                theme="dark"
                interval="1S"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
