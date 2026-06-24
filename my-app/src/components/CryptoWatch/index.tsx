import React from 'react';
import { Ticker } from './Ticker';

const assets = [
  { productId: 'BTC-USD', name: 'Bitcoin', symbol: 'BTC', accent: '#f59e0b' },
  { productId: 'ETH-USD', name: 'Ethereum', symbol: 'ETH', accent: '#8b5cf6' },
  { productId: 'SOL-USD', name: 'Solana', symbol: 'SOL', accent: '#14f195' },
  { productId: 'XRP-USD', name: 'XRP', symbol: 'XRP', accent: '#9ca3af' },
  { productId: 'ADA-USD', name: 'Cardano', symbol: 'ADA', accent: '#3b82f6' },
  { productId: 'DOGE-USD', name: 'Dogecoin', symbol: 'DOGE', accent: '#d6b85a' },
  { productId: 'AVAX-USD', name: 'Avalanche', symbol: 'AVAX', accent: '#ef4444' },
  { productId: 'LINK-USD', name: 'Chainlink', symbol: 'LINK', accent: '#2a5ada' },
  { productId: 'DOT-USD', name: 'Polkadot', symbol: 'DOT', accent: '#e6007a' },
  { productId: 'LTC-USD', name: 'Litecoin', symbol: 'LTC', accent: '#64748b' },
  { productId: 'XLM-USD', name: 'Stellar', symbol: 'XLM', accent: '#60a5fa' },
  { productId: 'UNI-USD', name: 'Uniswap', symbol: 'UNI', accent: '#ff007a' },
];

type TickerState = {
  changePercent?: string;
  price?: string;
};

type Tickers = Record<string, TickerState | undefined>;

type CoinbaseTickerMessage = {
  open_24h?: string;
  price?: string;
  product_id?: string;
  type?: string;
};

const productIds = assets.map((asset) => asset.productId);

const getChangePercent = (price?: string, open24h?: string) => {
  const currentPrice = Number(price);
  const openPrice = Number(open24h);

  if (!currentPrice || !openPrice) return undefined;

  return (((currentPrice - openPrice) / openPrice) * 100).toString();
};

export const CryptoWatch = () => {
  const [tickers, setTickers] = React.useState<Tickers>({});
  const [connectionStatus, setConnectionStatus] = React.useState<'connecting' | 'live' | 'error'>('connecting');

  React.useEffect(() => {
    const priceWs = new WebSocket('wss://ws-feed.exchange.coinbase.com');

    priceWs.onopen = () => {
      priceWs.send(
        JSON.stringify({
          type: 'subscribe',
          product_ids: productIds,
          channels: ['ticker'],
        }),
      );
      setConnectionStatus('live');
    };

    priceWs.onmessage = (event) => {
      const message = JSON.parse(event.data) as CoinbaseTickerMessage;

      if (message.type !== 'ticker' || !message.product_id || !message.price) return;

      setTickers((currentTickers) => ({
        ...currentTickers,
        [message.product_id as string]: {
          changePercent: getChangePercent(message.price, message.open_24h),
          price: message.price,
        },
      }));
    };
    priceWs.onerror = () => setConnectionStatus('error');

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
          <p>
            A quiet, real-time pulse on major cryptocurrency markets. Prices stream from Coinbase public market data.
          </p>
          <p className={`crypto-status crypto-status--${connectionStatus}`}>
            <span />
            {connectionStatus === 'live' && 'Live market stream connected'}
            {connectionStatus === 'connecting' && 'Connecting to market stream'}
            {connectionStatus === 'error' && 'Market stream connection issue'}
          </p>
        </div>
        <div className="crypto-grid" aria-label="Live cryptocurrency prices">
          {assets.map((asset) => (
            <Ticker
              accent={asset.accent}
              changePercent={tickers[asset.productId]?.changePercent}
              key={asset.productId}
              symbol={asset.symbol}
              title={asset.name}
              value={tickers[asset.productId]?.price}
            />
          ))}
        </div>
        <p className="crypto-disclaimer">
          Prices are quoted against USD on Coinbase Exchange markets. For observation only. This is not financial
          advice.
        </p>
      </main>
    </div>
  );
};
