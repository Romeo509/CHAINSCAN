import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { TRACKED_WALLETS } from '@wepump/data/kolWallets';

// Annotated as a 4-tuple, which is what motion's cubic-bezier easing expects.
// A bare array literal infers as number[] and `as const` would make it readonly.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Two synthesized WebAudio cues, so no audio assets ship with the page.
   Both are created lazily and resumed on demand, which self-heals past the
   browser autoplay-gesture rule once the user has interacted with the page.
   Each kind carries its own throttle: a burst of launches must not swallow a
   KOL alert, and vice versa. */
type ToneKind = 'kol' | 'launch';
type Note = readonly [freq: number, offset: number, type: OscillatorType, peak: number];

let audioCtx: AudioContext | null = null;
const lastPlayedAt: Record<ToneKind, number> = { kol: 0, launch: 0 };

const playNotes = (kind: ToneKind, notes: readonly Note[], throttleMs: number) => {
  try {
    const now = Date.now();
    if (now - lastPlayedAt[kind] < throttleMs) return;
    lastPlayedAt[kind] = now;

    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === 'suspended') void audioCtx.resume();

    const t0 = audioCtx.currentTime;
    notes.forEach(([freq, offset, type, peak]) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const start = t0 + offset;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      osc.connect(gain).connect(audioCtx!.destination);
      osc.start(start);
      osc.stop(start + 0.14);
    });
  } catch {
    // Never let audio break the feed.
  }
};

// KOL trade: the two-sine rising blip WePump already uses, unchanged.
const playKolTone = () =>
  playNotes('kol', [[880, 0, 'sine', 0.12], [1320, 0.09, 'sine', 0.12]], 1200);

// New launch: a brighter three-note triangle arpeggio. Different waveform and
// contour on purpose, so the two are tellable apart with the screen off.
const playLaunchTone = () =>
  playNotes(
    'launch',
    [[523.25, 0, 'triangle', 0.09], [659.25, 0.055, 'triangle', 0.09], [783.99, 0.11, 'triangle', 0.1]],
    1000
  );

interface Toast {
  key: number;
  addr: string;
  label: string;
  mint: string;
  txType: string;
  coinName: string | null;
  coinImage: string | null;
}

interface TradeShape {
  trader?: string | null;
  txType?: string;
  mint?: string | null;
  coin?: { name?: string | null; image?: string | null } | null;
}

// Reuse WePump's roster as the single source of truth, so this page can never
// alert on a wallet WePump stopped tracking.
const findWallet = (addr?: string | null) =>
  addr ? TRACKED_WALLETS.find((w) => w.addr === addr) : undefined;

export const Alerts: React.FC = () => {
  const [toast, setToast] = useState<Toast | null>(null);
  // Mute governs both cues and is persisted; mirrored into a ref so the
  // once-mounted socket closure reads the live value, not a stale first render.
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('wepump_tone_muted') !== '1');
  const soundOnRef = useRef(soundOn);

  const toggleSound = () => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (next) localStorage.removeItem('wepump_tone_muted');
    else localStorage.setItem('wepump_tone_muted', '1');
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;
    const wsUrl = import.meta.env.VITE_WEBSOCKET_WS_URL;

    const connect = () => {
      try {
        if (!wsUrl) return;
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            // Launches: sound only. The row itself is drawn by the feed panel,
            // so a toast here would duplicate what the user is already watching.
            // `init` is ignored on purpose — a connect snapshot is history, not
            // an event, and would fire the moment the page loads.
            if (data.type === 'new_trade') {
              if (data.trade?.mint && soundOnRef.current) playLaunchTone();
              return;
            }

            // KOL trades: sound plus the toast. `wallet_trades_init` is ignored
            // for the same reason, so the whole cache doesn't flush as alerts on
            // every reload or reconnect.
            if (data.type !== 'wallet_trade' || !data.trade) return;
            const trade = data.trade as TradeShape;

            const wallet = findWallet(trade.trader);
            if (!wallet) return; // roster-only, same guarantee as WePump
            if (trade.txType !== 'buy' && trade.txType !== 'sell') return;
            if (!trade.mint) return;

            setToast({
              key: Date.now(),
              addr: wallet.addr,
              label: wallet.label,
              mint: trade.mint,
              txType: trade.txType,
              coinName: trade.coin?.name ?? null,
              coinImage: trade.coin?.image ?? null,
            });
            if (soundOnRef.current) playKolTone();
          } catch {}
        };

        // Same resilience as WePump: keep retrying, 3s apart.
        ws.onclose = () => {
          if (isMounted) setTimeout(connect, 3000);
        };
      } catch {}
    };

    connect();
    return () => {
      isMounted = false;
      if (ws) ws.close();
    };
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  const isSell = toast?.txType === 'sell';

  return (
    <>
      {/* Alert-sound control. In WePump this lived in the KOL panel header; with
          no panel here, it gets its own fixed corner. Mutes both cues. */}
      <button
        type="button"
        onClick={toggleSound}
        title={soundOn ? 'Mute alert sounds' : 'Unmute alert sounds'}
        aria-label={soundOn ? 'Mute alert sounds' : 'Unmute alert sounds'}
        aria-pressed={!soundOn}
        className={`fixed right-3 top-3 z-[61] flex h-8 w-8 items-center justify-center border bg-panel transition-colors ${
          soundOn ? 'border-brand/60 text-brand' : 'border-[#2A2A2A] text-faint hover:text-muted'
        }`}
      >
        {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed left-1/2 top-3 z-[60] -translate-x-1/2"
          >
            {/* Outer div paints the 1px stair outline: green on buys, red on sells. */}
            <div className={`cs-frame p-px ${isSell ? 'bg-danger' : 'bg-brand'}`}>
              <div className="cs-frame flex h-16 items-center gap-3 bg-panel pl-3 pr-3">
                <div className="relative shrink-0">
                  <img
                    src={toast.coinImage || `https://thumbnails.padre.gg/SOLANA-${toast.mint}`}
                    alt={toast.coinName || toast.label}
                    onError={(e) => {
                      const t = e.currentTarget;
                      if (!t.dataset.fb) {
                        t.dataset.fb = '1';
                        t.src = `https://thumbnails.padre.gg/SOLANA-${toast.mint}`;
                      } else {
                        t.style.opacity = '0';
                      }
                    }}
                    className="h-12 w-12 rounded-none border border-white/[0.08] bg-white/[0.06] object-cover"
                  />
                  {toast.mint?.endsWith('pump') && (
                    <img
                      src="/pumpfun.svg"
                      alt="pump.fun"
                      className="absolute -bottom-1.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-none border border-brand/50 bg-panel p-[3px]"
                    />
                  )}
                </div>
                <motion.span
                  className={`h-1.5 w-1.5 rounded-none ${isSell ? 'bg-danger' : 'bg-brand'}`}
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="flex min-w-0 flex-col gap-1.5">
                  {/* KOL name in the arcade face; the verb stays mono so the
                      sentence still reads at a glance. */}
                  <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="font-pixel text-[8px] leading-none text-ink">{toast.label}</span>
                    <span className="text-[11px] text-muted">{isSell ? 'sold' : 'bought'}</span>
                    <span className={`max-w-[220px] truncate text-[12px] font-bold ${isSell ? 'text-danger' : 'text-brand'}`}>
                      {toast.coinName || `${toast.mint.slice(0, 4)}…${toast.mint.slice(-4)}`}
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-mono text-[10px] text-faint">
                    {`${toast.mint.slice(0, 4)}…${toast.mint.slice(-4)}`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
