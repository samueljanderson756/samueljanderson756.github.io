import React from 'react';
import { Ticker } from './Ticker';

const assets = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', accent: '#f59e0b' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', accent: '#8b5cf6' },
  { id: 'monero', name: 'Monero', symbol: 'XMR', accent: '#f97316' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', accent: '#64748b' },
];

type Prices = Record<string, string | undefined>;

export const CryptoWatch = () => {
  const [prices, setPrices] = React.useState<Prices>({});

  React.useEffect(() => {
    const priceWs = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,monero,litecoin');
    priceWs.onmessage = (event) => {
      const nextPrices = JSON.parse(event.data) as Prices;
      setPrices((currentPrices) => ({ ...currentPrices, ...nextPrices }));
    };

    return () => priceWs.close();
  }, []);

  return (
    <div className="crypto-page">
      <header className="site-header crypto-header">
        <a className="wordmark" href="#/" aria-label="Samuel John home">
          SJ<span>.</span>
        </a>
        <a className="back-link" href="#/">
          <span aria-hidden="true">←</span>
          Back home
        </a>
      </header>

      <main className="crypto-main">
        <div className="crypto-heading">
          <p className="section-heading__eyebrow">Live experiment</p>
          <h1>Crypto Watch</h1>
          <p>A quiet, real-time pulse on four cryptocurrencies. Prices stream live from CoinCap.</p>
        </div>
        <div className="crypto-grid" aria-label="Live cryptocurrency prices">
          {assets.map((asset) => (
            <Ticker
              accent={asset.accent}
              key={asset.id}
              symbol={asset.symbol}
              title={asset.name}
              value={prices[asset.id]}
            />
          ))}
        </div>
        <p className="crypto-disclaimer">For observation only. This is not financial advice.</p>
      </main>
    </div>
  );
};
