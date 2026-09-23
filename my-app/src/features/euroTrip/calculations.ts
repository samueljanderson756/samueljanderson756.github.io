import type { LedgerEntry, Member, Transfer } from './types';

const euroFormatter = new Intl.NumberFormat('en-US', {
  currency: 'EUR',
  style: 'currency',
});

export const formatEuros = (amountCents: number) => euroFormatter.format(amountCents / 100);

export const parseEuros = (value: string) => {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) return null;

  const [euros, cents = ''] = normalized.split('.');
  const amountCents = Number(euros) * 100 + Number(cents.padEnd(2, '0'));
  return Number.isSafeInteger(amountCents) && amountCents > 0 ? amountCents : null;
};

export const includePayer = (participantIds: string[], payerId: string) =>
  participantIds.includes(payerId) ? participantIds : [...participantIds, payerId];

export const splitEvenly = (amountCents: number, participantIds: string[]) => {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new Error('The amount must be a non-negative number of cents.');
  }
  if (participantIds.length === 0) {
    throw new Error('At least one participant is required.');
  }

  const baseShare = Math.floor(amountCents / participantIds.length);
  let remainder = amountCents % participantIds.length;

  return new Map(
    participantIds.map((memberId) => {
      const share = baseShare + (remainder > 0 ? 1 : 0);
      remainder -= remainder > 0 ? 1 : 0;
      return [memberId, share];
    }),
  );
};

export const calculateBalances = (members: Member[], entries: LedgerEntry[]) => {
  const balances = new Map(members.map((member) => [member.id, 0]));

  for (const entry of entries) {
    if (entry.kind === 'expense') {
      if (!balances.has(entry.paidBy) || !entry.participantIds.includes(entry.paidBy)) continue;

      const shares = splitEvenly(entry.amountCents, entry.participantIds);
      balances.set(entry.paidBy, (balances.get(entry.paidBy) ?? 0) + entry.amountCents);
      for (const [memberId, share] of shares) {
        if (!balances.has(memberId)) continue;
        balances.set(memberId, (balances.get(memberId) ?? 0) - share);
      }
    } else {
      if (!balances.has(entry.fromMemberId) || !balances.has(entry.toMemberId)) continue;
      balances.set(entry.fromMemberId, (balances.get(entry.fromMemberId) ?? 0) + entry.amountCents);
      balances.set(entry.toMemberId, (balances.get(entry.toMemberId) ?? 0) - entry.amountCents);
    }
  }

  return balances;
};

type OpenBalance = {
  amountCents: number;
  memberId: string;
};

const compareTransfers = (left: Transfer[], right: Transfer[]) => {
  const leftKey = left.map((transfer) => `${transfer.fromMemberId}:${transfer.toMemberId}`).join('|');
  const rightKey = right.map((transfer) => `${transfer.fromMemberId}:${transfer.toMemberId}`).join('|');
  return leftKey.localeCompare(rightKey);
};

/**
 * Finds the fewest direct debtor-to-creditor payments. With six travelers the
 * complete search is tiny, while deterministic ordering keeps results stable.
 */
export const simplifyBalances = (balances: Map<string, number>): Transfer[] => {
  const debtors: OpenBalance[] = [];
  const creditors: OpenBalance[] = [];

  for (const [memberId, amountCents] of balances) {
    if (amountCents < 0) debtors.push({ amountCents: -amountCents, memberId });
    if (amountCents > 0) creditors.push({ amountCents, memberId });
  }

  const totalDebt = debtors.reduce((sum, balance) => sum + balance.amountCents, 0);
  const totalCredit = creditors.reduce((sum, balance) => sum + balance.amountCents, 0);
  if (totalDebt !== totalCredit) throw new Error('Balances must sum to zero.');

  debtors.sort((a, b) => b.amountCents - a.amountCents || a.memberId.localeCompare(b.memberId));
  creditors.sort((a, b) => b.amountCents - a.amountCents || a.memberId.localeCompare(b.memberId));

  let best: Transfer[] | null = null;

  const search = (openDebtors: OpenBalance[], openCreditors: OpenBalance[], transfers: Transfer[]) => {
    if (best && transfers.length >= best.length) return;
    if (openDebtors.length === 0) {
      if (!best || transfers.length < best.length || compareTransfers(transfers, best) < 0) {
        best = transfers;
      }
      return;
    }

    const [debtor, ...remainingDebtors] = openDebtors;
    const seenCredits = new Set<number>();

    for (let index = 0; index < openCreditors.length; index += 1) {
      const creditor = openCreditors[index];
      if (seenCredits.has(creditor.amountCents)) continue;
      seenCredits.add(creditor.amountCents);

      const amountCents = Math.min(debtor.amountCents, creditor.amountCents);
      const nextDebtors = [...remainingDebtors];
      const nextCreditors = openCreditors
        .filter((_, creditorIndex) => creditorIndex !== index)
        .map((balance) => ({ ...balance }));

      if (debtor.amountCents > amountCents) {
        nextDebtors.unshift({ ...debtor, amountCents: debtor.amountCents - amountCents });
      }
      if (creditor.amountCents > amountCents) {
        nextCreditors.push({ ...creditor, amountCents: creditor.amountCents - amountCents });
      }

      nextDebtors.sort((a, b) => b.amountCents - a.amountCents || a.memberId.localeCompare(b.memberId));
      nextCreditors.sort((a, b) => b.amountCents - a.amountCents || a.memberId.localeCompare(b.memberId));

      search(nextDebtors, nextCreditors, [
        ...transfers,
        {
          amountCents,
          fromMemberId: debtor.memberId,
          toMemberId: creditor.memberId,
        },
      ]);
    }
  };

  search(debtors, creditors, []);
  return best ?? [];
};

export const totalSpent = (entries: LedgerEntry[]) =>
  entries.reduce((sum, entry) => sum + (entry.kind === 'expense' ? entry.amountCents : 0), 0);
