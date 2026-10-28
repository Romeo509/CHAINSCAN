import React from 'react';

interface TradingViewChartProps {
  tokenAddress: string;
  tokenSymbol?: string;
  heightClass?: string;
  /** GMGN accepts "light" | "dark". */
  theme?: 'light' | 'dark';
  /** GMGN accepts "1S", "1", "5", "15", "60", "240", "720", "1D" — minutes unless suffixed. */
  interval?: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  tokenAddress,
  tokenSymbol = 'MEME',
  heightClass = 'h-[260px] sm:h-[340px] md:h-[400px]',
  theme = 'dark',
  interval = '1',
}) => {
  const gmgnEmbedUrl = `https://www.gmgn.cc/kline/sol/${tokenAddress}?theme=${theme}&interval=${interval}`;

  return (
    <div className={`relative w-full ${heightClass} bg-[#050505] overflow-hidden`}>
      <iframe
        src={gmgnEmbedUrl}
        title={`${tokenSymbol} GMGN Chart`}
        className="w-full h-full border-0"
        allow="clipboard-write"
        loading="lazy"
      />
    </div>
  );
};
