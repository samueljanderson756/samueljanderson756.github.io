import React from 'react';

const formatPrice = (value: string) => {
  const price = Number(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  }).format(price);
};

export const Ticker = ({
  accent,
  changePercent,
  symbol,
  title,
  value,
}: {
  accent: string;
  changePercent: string | undefined;
  symbol: string;
  title: string;
  value: string | undefined;
}) => (
  <article className="ticker" style={{ '--ticker-accent': accent } as React.CSSProperties}>
    <div className="ticker__header">
      <span className="ticker__dot" />
      <span>{symbol}</span>
    </div>
    <h2>{title}</h2>
    {value ? (
      <p className="ticker__price">{formatPrice(value)}</p>
    ) : (
      <div className="ticker__loading" aria-label={`Loading ${title} price`}>
        <span />
        <span />
        <span />
      </div>
    )}
    {changePercent && (
      <p className={Number(changePercent) >= 0 ? 'ticker__change ticker__change--up' : 'ticker__change'}>
        {Number(changePercent) >= 0 ? '+' : ''}
        {Number(changePercent).toFixed(2)}% 24h
      </p>
    )}
    <p className="ticker__status">
      <span />
      Live price
    </p>
  </article>
);
