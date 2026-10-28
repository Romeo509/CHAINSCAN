import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { TradingViewChart } from '@wepump/components/tokens/TradingViewChart';
import { count, pct, usd } from '../lib/format';

export interface ChartTarget {
  address: string;
  symbol: string;
  name: string;
  image: string;
  priceUsd: number;
  liq: number;
  vol24: number;
  chg24h: number;
}

interface ChartModalProps {
  target: ChartTarget | null;
  onClose: () => void;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** The GMGN terminal, embedded — same component and settings the launch feed's
 *  popup uses, so both tabs open the identical chart. Nothing here navigates
 *  away: backdrop click, the X and Esc are the only ways out.
 *
 *  z-[65] sits above the KOL toast (z-60/61) so an alert can't cover a chart
 *  the user deliberately opened, and below the notice modal (z-70). */
export const ChartModal = ({ target, onClose }: ChartModalProps) => {
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [target, onClose]);

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          key="chart-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${target.symbol} chart`}
          className="fixed inset-0 z-[65] flex items-center justify-center bg-black/80 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.34, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px]"
          >
            {/* Identity + live stats above the chart, so the numbers stay readable
                while the terminal loads its own. */}
            <div className="mb-3 flex items-center gap-3 px-1">
              {target.image ? (
                <img
                  src={target.image}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-none border border-white/[0.08] bg-white/[0.05] object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                />
              ) : (
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-none border border-white/[0.08] bg-white/[0.05] font-pixel text-[9px] text-muted">
                  {target.symbol.slice(0, 2).toUpperCase() || '--'}
                </span>
              )}

              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold leading-none text-ink">{target.symbol || 'UNNAMED'}</p>
                <p className="mt-1.5 truncate text-[11px] leading-none text-faint">{target.name || target.address}</p>
              </div>

              <div className="ml-auto hidden shrink-0 items-baseline gap-4 font-mono tabular-nums sm:flex">
                <span className="text-[13px] text-ink">{usd(target.priceUsd)}</span>
                <span className={`text-[12px] ${target.chg24h < 0 ? 'text-danger' : 'text-brand'}`}>{pct(target.chg24h)}</span>
                <span className="text-[12px] text-muted">{`LIQ ${count(target.liq)}`}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                title="Close (Esc)"
                aria-label="Close chart"
                className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-none border border-[#2A2A2A] text-muted transition-colors hover:border-brand/60 hover:text-brand sm:ml-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-none border border-white/[0.08] bg-[#050505]">
              <TradingViewChart
                tokenAddress={target.address}
                tokenSymbol={target.symbol}
                heightClass="h-[380px]"
                theme="dark"
                interval="1S"
              />
            </div>

            <p className="mt-2 px-1 text-center font-mono text-[9px] uppercase leading-normal tracking-[0.14em] text-faint">
              GMGN terminal · embedded in page · 24h vol {count(target.vol24)}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
