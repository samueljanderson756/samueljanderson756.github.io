import { describe, expect, test } from 'vitest';
import {
  calculateBalances,
  formatCurrency,
  includePayer,
  parseAmount,
  simplifyBalances,
  splitEvenly,
} from './calculations';
import type { LedgerEntry, Member } from './types';

const members: Member[] = [
  { id: 'sam', name: 'Sam' },
  { id: 'alex', name: 'Alex' },
  { id: 'jo', name: 'Jo' },
];

describe('money helpers', () => {
  test('parses dollar input without floating-point math', () => {
    expect(parseAmount('12.34')).toBe(1234);
    expect(parseAmount('8,5')).toBe(850);
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('4.999')).toBeNull();
    expect(formatCurrency(1234)).toBe('$12.34');
  });

  test('distributes remainder cents deterministically', () => {
    expect([...splitEvenly(1000, ['sam', 'alex', 'jo'])]).toEqual([
      ['sam', 334],
      ['alex', 333],
      ['jo', 333],
    ]);
  });

  test('always includes the payer without creating a duplicate', () => {
    expect(includePayer(['alex', 'jo'], 'sam')).toEqual(['alex', 'jo', 'sam']);
    expect(includePayer(['sam', 'alex'], 'sam')).toEqual(['sam', 'alex']);
  });
});

describe('balances', () => {
  test('includes the payer in their own split', () => {
    const entries: LedgerEntry[] = [
      {
        amountCents: 6000,
        createdAtMs: 1,
        createdBy: 'sam',
        description: 'Dinner',
        id: 'dinner',
        kind: 'expense',
        occurredOn: '2026-09-23',
        paidBy: 'sam',
        participantIds: ['sam', 'alex', 'jo'],
      },
    ];

    expect([...calculateBalances(members, entries)]).toEqual([
      ['sam', 4000],
      ['alex', -2000],
      ['jo', -2000],
    ]);
  });
});

describe('settlement simplification', () => {
  test('finds the minimum number of direct payments', () => {
    const balances = new Map([
      ['a', 1000],
      ['b', 800],
      ['c', 700],
      ['d', -1000],
      ['e', -800],
      ['f', -700],
    ]);

    expect(simplifyBalances(balances)).toEqual([
      { amountCents: 1000, fromMemberId: 'd', toMemberId: 'a' },
      { amountCents: 800, fromMemberId: 'e', toMemberId: 'b' },
      { amountCents: 700, fromMemberId: 'f', toMemberId: 'c' },
    ]);
  });

  test('rejects an unbalanced ledger', () => {
    expect(() => simplifyBalances(new Map([['sam', 1]]))).toThrow(/sum to zero/i);
  });
});
