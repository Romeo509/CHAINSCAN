import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { TRACKED_WALLETS, type KolWallet } from '@wepump/data/kolWallets';
import { shortAddr } from '../lib/format';

/* The roster WePump's sniper tracks, straight from its single source of truth
   (@wepump/data/kolWallets). Identity only — no balances, no PnL, nothing
   invented. Live activity for these wallets arrives as the toast alert. */
export const KolsPage: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (addr: string) => {
    // Clipboard can reject (insecure context, denied permission). Fail quietly
    // but never claim a copy that did not happen.
    navigator.clipboard
      ?.writeText(addr)
      .then(() => {
        setCopied(addr);
        setTimeout(() => setCopied((c) => (c === addr ? null : c)), 2000);
      })
      .catch(() => {});
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 h-11">
        <div className="flex items-center gap-2.5">
          <h3 className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Tracked KOLs
          </h3>
          <span className="inline-flex h-4 items-center rounded border border-white/[0.08] bg-white/[0.03] px-1.5 font-mono text-[9px] tabular-nums text-[#74787F]">
            {TRACKED_WALLETS.length}
          </span>
        </div>
        <span className="hidden text-[9px] uppercase tracking-[0.14em] text-muted sm:inline">
          their buys &amp; sells surface as a toast
        </span>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3">
        {TRACKED_WALLETS.map((w) => (
          <WalletRow key={w.addr} wallet={w} copied={copied === w.addr} onCopy={copy} />
        ))}
      </div>

      <p className="px-4 py-3 text-[9px] uppercase tracking-[0.14em] text-faint">
        roster shared with wepump · edit at the source, not here
      </p>
    </div>
  );
};

const WalletRow: React.FC<{
  wallet: KolWallet;
  copied: boolean;
  onCopy: (addr: string) => void;
}> = ({ wallet, copied, onCopy }) => (
  <div className="flex h-16 items-center gap-3.5 border-b border-white/[0.04] px-4">
    <Avatar wallet={wallet} />

    <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
      <span className="truncate text-[15px] font-bold leading-none text-ink">{wallet.label}</span>
      <span className="truncate font-mono text-[12px] leading-none text-faint">
        {shortAddr(wallet.addr)}
      </span>
    </span>

    <button
      type="button"
      onClick={() => onCopy(wallet.addr)}
      title={copied ? 'Copied' : 'Copy full address'}
      aria-label={`Copy address for ${wallet.label}`}
      className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#2A2A2A] text-muted transition-colors hover:border-brand/60 hover:text-brand"
    >
      {copied ? <Check className="h-4 w-4 text-brand" /> : <Copy className="h-4 w-4" />}
    </button>
  </div>
);

// kolscan avatars 404 for wallets that never set one, so fall back to the
// wallet's initials rather than shipping a broken image icon.
const Avatar: React.FC<{ wallet: KolWallet }> = ({ wallet }) => {
  const [broken, setBroken] = useState(!wallet.img);
  if (broken) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-none border border-white/[0.08] bg-white/[0.05] font-pixel text-[9px] text-muted">
        {wallet.label.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={wallet.img}
      alt=""
      loading="lazy"
      onError={() => setBroken(true)}
      className="h-11 w-11 shrink-0 rounded-none border border-white/[0.08] bg-white/[0.05] object-cover"
    />
  );
};
