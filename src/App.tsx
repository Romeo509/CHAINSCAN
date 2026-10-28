import { useState } from 'react';
import { LiveSniperFeed } from '@wepump/components/sniper/LiveSniperFeed';
import { Alerts } from './components/Alerts';
import { BoostedPage } from './components/BoostedPage';
import { DisclaimerModal } from './components/DisclaimerModal';
import { KolsPage } from './components/KolsPage';

const TABS = [
  { id: 'boosted', label: 'Boosted' },
  { id: 'pairs', label: 'New Pairs' },
  { id: 'kols', label: 'KOLs' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<TabId>('boosted');

  return (
    <div className="min-h-screen bg-black">
      {/* Identity + nav stay pinned while the board scrolls. Solid black, not a
          blurred panel — rows sliding through a translucent bar reads as noise.
          z-40 keeps this under the KOL toast (z-60) and the notice modal (z-70).
          pr-16 reserves the corner the fixed mute button (top-3 right-3) sits in,
          otherwise it would overlap the tagline permanently. */}
      <div className="sticky top-0 z-40 bg-black">
        <header className="flex items-end justify-between pb-3 pl-4 pr-16 pt-4">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-brand">&laquo;</span>
            <h1 className="font-pixel text-[15px] leading-none text-ink">CHAINSCAN</h1>
            <span className="font-pixel text-[10px] text-brand">&raquo;</span>
          </div>
          <span className="font-pixel text-[7px] leading-none text-danger">LIVE SOLANA FEED</span>
        </header>

        {/* Three views, one hairline. The active tab sits on a 1px brand rule that
            overlaps the nav border, so the choice reads without any box chrome. */}
        <nav className="flex items-center gap-1 border-b border-white/[0.07] px-4">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={active}
                className={`-mb-px flex h-9 items-center gap-1.5 border-b px-2 font-pixel text-[8px] uppercase leading-none transition-colors ${
                  active ? 'border-brand text-brand' : 'border-transparent text-faint hover:text-muted'
                }`}
              >
                {active && <span className="h-1 w-1 rounded-none bg-brand" />}
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* No card, no frame, no max-width — full-bleed, content on the background.
          `cs-board` is a style hook only: it scopes the palette + type remap over
          the borrowed feed and owns the pixel section labels. It renders no chrome.
          Switching tabs unmounts the launch feed, so its socket closes; alerts and
          sound live in <Alerts />, which never unmounts, so cues keep firing. */}
      <div className="cs-board">
        {tab === 'boosted' && <BoostedPage />}
        {tab === 'pairs' && <LiveSniperFeed buyPrice={0} />}
        {tab === 'kols' && <KolsPage />}
      </div>

      <Alerts />
      <DisclaimerModal />
    </div>
  );
}
