export type Member = {
  id: string;
  name: string;
};

export type Trip = {
  currency: 'EUR';
  members: Member[];
  name: string;
};

type EntryBase = {
  createdAtMs: number;
  createdBy: string;
  id: string;
  occurredOn: string;
};

export type Expense = EntryBase & {
  amountCents: number;
  description: string;
  kind: 'expense';
  paidBy: string;
  participantIds: string[];
};

export type Settlement = EntryBase & {
  amountCents: number;
  fromMemberId: string;
  kind: 'settlement';
  toMemberId: string;
};

export type LedgerEntry = Expense | Settlement;

export type NewExpense = Omit<Expense, 'createdAtMs' | 'id'>;
export type NewSettlement = Omit<Settlement, 'createdAtMs' | 'id'>;

export type Transfer = {
  amountCents: number;
  fromMemberId: string;
  toMemberId: string;
};
