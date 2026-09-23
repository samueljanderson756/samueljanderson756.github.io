export type Member = {
  id: string;
  name: string;
};

export type Trip = {
  currency: 'USD';
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

export type LedgerEntry = Expense;

export type NewExpense = Omit<Expense, 'createdAtMs' | 'id'>;

export type Transfer = {
  amountCents: number;
  fromMemberId: string;
  toMemberId: string;
};
