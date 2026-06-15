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
  symbol,
  title,
  value,
}: {
  accent: string;
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
    <p className="ticker__status">
      <span />
      Live price
    </p>
  </article>
);
