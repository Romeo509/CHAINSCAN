# Vendored WePump source

Copied verbatim from the private `wepump/` frontend, same directory shape, so the
relative imports inside these files keep working:

| File | Why chainscan needs it |
| --- | --- |
| `components/sniper/LiveSniperFeed.tsx` | the New Pairs tab |
| `components/tokens/TradingViewChart.tsx` | GMGN kline embed inside the chart modal |
| `data/kolWallets.ts` | tracked-KOL roster (KOLs tab + alert filtering) |
| `hooks/useSmoothWheelScroll.ts` | used by the feed |

Chainscan aliases these as `@wepump/*` (see `vite.config.ts` and `tsconfig.json`).
They are vendored rather than imported from `../wepump/src` because deployment
clones this repo on its own — the sibling directory does not exist there.

## Drift

These copies do NOT update themselves. WePump is the upstream owner of all four
files; chainscan only ever reads them. To pull the current versions:

```sh
cp ../wepump/src/components/sniper/LiveSniperFeed.tsx src/vendor/wepump/components/sniper/
cp ../wepump/src/components/tokens/TradingViewChart.tsx src/vendor/wepump/components/tokens/
cp ../wepump/src/data/kolWallets.ts src/vendor/wepump/data/
cp ../wepump/src/hooks/useSmoothWheelScroll.ts src/vendor/wepump/hooks/
```

Do not edit them in place here — the change would apply to only one app and be
silently overwritten on the next sync. Anything chainscan-specific (palette
remap, hiding the feed's mint-copy button) lives as unlayered `.cs-board` rules
in `src/index.css` instead.
