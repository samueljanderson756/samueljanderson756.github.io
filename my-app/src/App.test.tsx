import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { App } from './App';

class MockWebSocket {
  close = vi.fn();
  onerror: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onopen: (() => void) | null = null;
}

beforeEach(() => {
  window.location.hash = '';
  window.WebSocket = MockWebSocket as unknown as typeof WebSocket;
});

test('renders the portfolio homepage and project links', () => {
  render(<App />);

  expect(screen.getByText(/I’m a musician and software engineer/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Samuel John Band/i })).toHaveAttribute(
    'href',
    'https://www.samueljohnband.com',
  );
  expect(screen.getByRole('link', { name: /JohnsPocket/i })).toHaveAttribute(
    'href',
    'https://d27kbz92cmt76g.cloudfront.net/',
  );
  expect(screen.getByRole('link', { name: /Stage Plot Alpha/i })).toHaveAttribute(
    'href',
    'https://centering-rex-464821-q4.web.app/',
  );
  expect(screen.getByRole('link', { name: /Crypto Watch/i })).toHaveAttribute('href', '#/crypto');
  expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
});

test('renders Crypto Watch from its hash route and returns home', async () => {
  window.location.hash = '#/crypto';
  render(<App />);

  expect(screen.getByRole('heading', { level: 1, name: 'Crypto Watch' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Ethereum' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Solana' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'XRP' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Litecoin' })).toBeInTheDocument();
  expect(screen.getByText(/Coinbase public market data/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: /Back home/i }));
  window.location.hash = '#/';
  window.dispatchEvent(new HashChangeEvent('hashchange'));

  expect(await screen.findByRole('heading', { name: 'Samuel John' })).toBeInTheDocument();
});
