import React from 'react';
import {
  calculateBalances,
  formatCurrency,
  includePayer,
  parseAmount,
  simplifyBalances,
  totalSpent,
} from './calculations';
import {
  addEntry,
  createTrip,
  isFirebaseConfigured,
  logInToTrip,
  logOutOfTrip,
  removeEntry,
  subscribeToAuth,
  subscribeToEntries,
  subscribeToTrip,
  tripId,
  updateExpense,
} from './firebaseTripStore';
import type { Expense, LedgerEntry, Member, NewExpense, Transfer, Trip } from './types';
import './EuroTripPage.css';

type Tab = 'expenses' | 'balances' | 'settle';

const selectedMemberStorageKey = `euro-trip-member:${tripId}`;

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const memberById = (members: Member[], memberId: string) => members.find((member) => member.id === memberId);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message === 'Firebase is not configured.') return error.message;
  return fallback;
};

const LoadingScreen = () => (
  <div className="euro-gate">
    <div className="euro-gate__card euro-gate__card--loading" aria-live="polite">
      <span className="euro-loader" aria-hidden="true" />
      <p>Opening the trip ledger…</p>
    </div>
  </div>
);

const BackHome = () => (
  <a className="euro-back" href="#/">
    <span aria-hidden="true">←</span> Back home
  </a>
);

const ConfigurationScreen = () => (
  <div className="euro-gate">
    <div className="euro-gate__topbar">
      <BackHome />
    </div>
    <main className="euro-gate__card">
      <p className="euro-kicker">Euro Trip · Owner setup</p>
      <h1>Connect the shared ledger</h1>
      <p>
        The trip interface is ready, but Firebase needs to be connected before friends can save and share expenses.
        Follow the Firebase section in the project README, then rebuild the site.
      </p>
      <code>my-app/.env.local</code>
    </main>
  </div>
);

const LoginScreen = ({ error, onLogin }: { error: string; onLogin: (password: string) => Promise<void> }) => {
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) return;
    setSubmitting(true);
    await onLogin(password);
    setSubmitting(false);
  };

  return (
    <div className="euro-gate">
      <div className="euro-gate__topbar">
        <BackHome />
      </div>
      <main className="euro-gate__card">
        <div className="euro-stamp" aria-hidden="true">
          EU
          <span>26</span>
        </div>
        <p className="euro-kicker">Six friends · One ledger</p>
        <h1>Euro Trip</h1>
        <p>Enter the shared trip password to add expenses and see who owes what.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="trip-password">Trip password</label>
          <input
            autoComplete="current-password"
            autoFocus
            id="trip-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            type="password"
            value={password}
          />
          {error && (
            <p className="euro-form-error" role="alert">
              {error}
            </p>
          )}
          <button className="euro-primary-button" disabled={!password || submitting} type="submit">
            {submitting ? 'Unlocking…' : 'Open trip'}
          </button>
        </form>
      </main>
    </div>
  );
};

const TripSetup = ({ onCreated }: { onCreated: (trip: Trip) => Promise<void> }) => {
  const [tripName, setTripName] = React.useState('Euro Trip 2026');
  const [names, setNames] = React.useState(Array.from({ length: 6 }, () => ''));
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanNames = names.map((name) => name.trim());
    const uniqueNames = new Set(cleanNames.map((name) => name.toLocaleLowerCase()));
    if (!tripName.trim() || cleanNames.some((name) => !name) || uniqueNames.size !== 6) {
      setError('Add a trip name and six different traveler names.');
      return;
    }

    const members = cleanNames.map((name, index) => ({ id: `traveler-${index + 1}`, name }));
    setSubmitting(true);
    setError('');
    try {
      await onCreated({ currency: 'USD', members, name: tripName.trim() });
    } catch (setupError) {
      setError(getErrorMessage(setupError, 'Could not create the trip. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="euro-gate euro-gate--setup">
      <main className="euro-gate__card euro-setup-card">
        <p className="euro-kicker">One-time setup</p>
        <h1>Name the crew</h1>
        <p>The first person here sets up the trip. Names can be first names or nicknames.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="trip-name">Trip name</label>
          <input id="trip-name" onChange={(event) => setTripName(event.target.value)} value={tripName} />
          <fieldset>
            <legend>Six travelers</legend>
            <div className="euro-name-grid">
              {names.map((name, index) => (
                <label key={index}>
                  <span>Traveler {index + 1}</span>
                  <input
                    aria-label={`Traveler ${index + 1}`}
                    onChange={(event) => {
                      const nextNames = [...names];
                      nextNames[index] = event.target.value;
                      setNames(nextNames);
                    }}
                    placeholder={index === 0 ? 'Your name' : 'Name'}
                    value={name}
                  />
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="euro-form-error" role="alert">
              {error}
            </p>
          )}
          <button className="euro-primary-button" disabled={submitting} type="submit">
            {submitting ? 'Creating trip…' : 'Start the trip'}
          </button>
        </form>
      </main>
    </div>
  );
};

const IdentityPicker = ({
  members,
  onSelect,
  tripName,
}: {
  members: Member[];
  onSelect: (memberId: string) => void;
  tripName: string;
}) => (
  <div className="euro-gate">
    <main className="euro-gate__card euro-identity-card">
      <p className="euro-kicker">{tripName}</p>
      <h1>Who are you?</h1>
      <p>We’ll remember your choice on this device and use it as the default payer.</p>
      <div className="euro-identity-list">
        {members.map((member, index) => (
          <button key={member.id} onClick={() => onSelect(member.id)} type="button">
            <span className={`euro-avatar euro-avatar--${(index % 6) + 1}`}>{initials(member.name)}</span>
            <span>{member.name}</span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </main>
  </div>
);

type ExpenseEditorProps = {
  currentMember: Member;
  expense?: Expense;
  members: Member[];
  onClose: () => void;
  onSaved: () => void;
};

const ExpenseEditor = ({ currentMember, expense, members, onClose, onSaved }: ExpenseEditorProps) => {
  React.useLayoutEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  const [description, setDescription] = React.useState(expense?.description ?? '');
  const [amount, setAmount] = React.useState(expense ? (expense.amountCents / 100).toFixed(2) : '');
  const [paidBy, setPaidBy] = React.useState(expense?.paidBy ?? currentMember.id);
  const [participantIds, setParticipantIds] = React.useState(
    expense?.participantIds ?? members.map((member) => member.id),
  );
  const [occurredOn, setOccurredOn] = React.useState(expense?.occurredOn ?? today());
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const everyoneSelected = participantIds.length === members.length;

  const handlePayerChange = (nextPayer: string) => {
    setPaidBy(nextPayer);
    setParticipantIds((current) => includePayer(current, nextPayer));
  };

  const toggleParticipant = (memberId: string) => {
    if (memberId === paidBy) return;
    setParticipantIds((current) =>
      current.includes(memberId)
        ? current.filter((participantId) => participantId !== memberId)
        : [...current, memberId],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmount(amount);
    if (!description.trim() || !amountCents) {
      setError('Add a description, valid amount, payer, and at least one person.');
      return;
    }

    const participantsWithPayer = includePayer(participantIds, paidBy);
    const orderedParticipantIds = members
      .map((member) => member.id)
      .filter((memberId) => participantsWithPayer.includes(memberId));
    const nextExpense: NewExpense = {
      amountCents,
      createdBy: expense?.createdBy ?? currentMember.id,
      description: description.trim(),
      kind: 'expense',
      occurredOn,
      paidBy,
      participantIds: orderedParticipantIds,
    };

    setSubmitting(true);
    setError('');
    try {
      if (expense) await updateExpense(expense.id, nextExpense);
      else await addEntry(nextExpense);
      onSaved();
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Could not save the expense. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="euro-modal" role="presentation">
      <div className="euro-modal__scrim" onClick={onClose} />
      <section aria-labelledby="expense-editor-title" aria-modal="true" className="euro-sheet" role="dialog">
        <header className="euro-sheet__header">
          <div>
            <p className="euro-kicker">{expense ? 'Update entry' : 'New expense'}</p>
            <h2 id="expense-editor-title">{expense ? 'Edit expense' : 'Add an expense'}</h2>
          </div>
          <button aria-label="Close expense form" className="euro-close-button" onClick={onClose} type="button">
            ×
          </button>
        </header>

        <form className="euro-editor-form" onSubmit={handleSubmit}>
          <label>
            <span>What was it?</span>
            <input
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Dinner in Rome"
              value={description}
            />
          </label>
          <div className="euro-form-row">
            <label>
              <span>Amount</span>
              <div className="euro-money-input">
                <span>$</span>
                <input
                  inputMode="decimal"
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  value={amount}
                />
              </div>
            </label>
            <label>
              <span>Date</span>
              <input
                max={today()}
                onChange={(event) => setOccurredOn(event.target.value)}
                type="date"
                value={occurredOn}
              />
            </label>
          </div>
          <label>
            <span>Who paid?</span>
            <select onChange={(event) => handlePayerChange(event.target.value)} value={paidBy}>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="euro-split-fieldset">
            <div className="euro-fieldset-heading">
              <legend>Split among</legend>
              <button onClick={() => setParticipantIds(members.map((member) => member.id))} type="button">
                {everyoneSelected ? 'Everyone selected' : 'Select everyone'}
              </button>
            </div>
            <p>The payer is always included in the split.</p>
            <div className="euro-participant-grid">
              {members.map((member) => {
                const checked = participantIds.includes(member.id);
                const payer = member.id === paidBy;
                return (
                  <label className={checked ? 'is-selected' : ''} key={member.id}>
                    <input
                      checked={checked}
                      disabled={payer}
                      onChange={() => toggleParticipant(member.id)}
                      type="checkbox"
                    />
                    <span className="euro-check" aria-hidden="true">
                      {checked ? '✓' : ''}
                    </span>
                    <span>{member.name}</span>
                    {payer && <small>Payer</small>}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <p className="euro-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="euro-sheet__actions">
            <button className="euro-secondary-button" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="euro-primary-button" disabled={submitting} type="submit">
              {submitting ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const EmptyState = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div className="euro-empty-state">
    <span aria-hidden="true">$</span>
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
);

const ExpenseList = ({
  entries,
  members,
  onAdd,
  onDelete,
  onEdit,
}: {
  entries: LedgerEntry[];
  members: Member[];
  onAdd: () => void;
  onDelete: (entry: LedgerEntry) => void;
  onEdit: (expense: Expense) => void;
}) => (
  <section aria-labelledby="expenses-title" className="euro-panel">
    <div className="euro-panel__heading">
      <div>
        <p className="euro-kicker">Shared activity</p>
        <h2 id="expenses-title">Expenses</h2>
      </div>
      <button className="euro-add-button" onClick={onAdd} type="button">
        <span aria-hidden="true">＋</span> Add expense
      </button>
    </div>
    {entries.length === 0 ? (
      <EmptyState title="Nothing here yet">Add the first expense when the trip begins.</EmptyState>
    ) : (
      <div className="euro-entry-list">
        {entries.map((entry) => {
          const actor = memberById(members, entry.paidBy);
          const participants = entry.participantIds.flatMap((memberId) => {
            const member = memberById(members, memberId);
            return member ? [member] : [];
          });
          const actorIndex = Math.max(
            0,
            members.findIndex((member) => member.id === actor?.id),
          );
          return (
            <article className="euro-entry" key={entry.id}>
              <span className={`euro-avatar euro-avatar--${(actorIndex % 6) + 1}`}>{initials(actor?.name ?? '?')}</span>
              <div className="euro-entry__body">
                <div className="euro-entry__title-row">
                  <h3>{entry.description}</h3>
                  <strong>{formatCurrency(entry.amountCents)}</strong>
                </div>
                <p>
                  {`${actor?.name ?? 'Unknown'} paid · split ${entry.participantIds.length} ${entry.participantIds.length === 1 ? 'way' : 'ways'}`}
                  <span> · {formatDate(entry.occurredOn)}</span>
                </p>
                <div
                  aria-label={`Split between ${participants.map((member) => member.name).join(', ')}`}
                  className="euro-entry__participants"
                >
                  {participants.map((member) => (
                    <span className="euro-split-badge" key={member.id}>
                      <span aria-hidden="true">{initials(member.name)}</span>
                      {member.name}
                    </span>
                  ))}
                </div>
                <div className="euro-entry__actions">
                  <button onClick={() => onEdit(entry)} type="button">
                    Edit
                  </button>
                  <button onClick={() => onDelete(entry)} type="button">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    )}
  </section>
);

const BalanceList = ({ balances, members }: { balances: Map<string, number>; members: Member[] }) => {
  const maxBalance = Math.max(...[...balances.values()].map(Math.abs), 1);

  return (
    <section aria-labelledby="balances-title" className="euro-panel">
      <div className="euro-panel__heading">
        <div>
          <p className="euro-kicker">Running totals</p>
          <h2 id="balances-title">Balances</h2>
        </div>
        <p className="euro-panel__note">Positive gets money back. Negative owes.</p>
      </div>
      <div className="euro-balance-list">
        {members.map((member, index) => {
          const balance = balances.get(member.id) ?? 0;
          const status = balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'settled';
          return (
            <article className="euro-balance" key={member.id}>
              <span className={`euro-avatar euro-avatar--${(index % 6) + 1}`}>{initials(member.name)}</span>
              <div className="euro-balance__main">
                <div>
                  <h3>{member.name}</h3>
                  <span>{status}</span>
                </div>
                <strong className={balance > 0 ? 'is-positive' : balance < 0 ? 'is-negative' : ''}>
                  {balance > 0 ? '+' : ''}
                  {formatCurrency(balance)}
                </strong>
                <div className="euro-balance__track" aria-hidden="true">
                  <span style={{ width: `${Math.max(2, (Math.abs(balance) / maxBalance) * 100)}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

const SettlementPlan = ({
  entries,
  members,
  transfers,
}: {
  entries: LedgerEntry[];
  members: Member[];
  transfers: Transfer[];
}) => (
  <section aria-labelledby="settle-title" className="euro-panel">
    <div className="euro-panel__heading">
      <div>
        <p className="euro-kicker">End-of-trip plan</p>
        <h2 id="settle-title">Who pays whom</h2>
      </div>
    </div>
    {transfers.length === 0 ? (
      <EmptyState title={entries.length === 0 ? 'No balances yet' : 'Everyone is settled'}>
        {entries.length === 0
          ? 'The payment plan will appear after expenses are added.'
          : 'There is nothing left to pay right now.'}
      </EmptyState>
    ) : (
      <>
        <div className="euro-settle-summary">
          <strong>{transfers.length}</strong>
          <span>{transfers.length === 1 ? 'payment settles' : 'payments settle'} everything at the end</span>
        </div>
        <div className="euro-transfer-list">
          {transfers.map((transfer, index) => {
            const from = memberById(members, transfer.fromMemberId);
            const to = memberById(members, transfer.toMemberId);
            return (
              <article className="euro-transfer" key={`${transfer.fromMemberId}-${transfer.toMemberId}-${index}`}>
                <div className="euro-transfer__route">
                  <span>{from?.name}</span>
                  <span aria-hidden="true">→</span>
                  <span>{to?.name}</span>
                </div>
                <strong>{formatCurrency(transfer.amountCents)}</strong>
              </article>
            );
          })}
        </div>
      </>
    )}
  </section>
);

const EuroTripApp = ({
  currentMember,
  entries,
  error,
  onChangeIdentity,
  onSignOut,
  trip,
}: {
  currentMember: Member;
  entries: LedgerEntry[];
  error: string;
  onChangeIdentity: () => void;
  onSignOut: () => void;
  trip: Trip;
}) => {
  const [tab, setTab] = React.useState<Tab>('expenses');
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);
  const [addingExpense, setAddingExpense] = React.useState(false);
  const balances = React.useMemo(() => calculateBalances(trip.members, entries), [entries, trip.members]);
  const transfers = React.useMemo(() => simplifyBalances(balances), [balances]);

  const handleDelete = async (entry: LedgerEntry) => {
    if (!window.confirm(`Delete ${entry.description}? This changes everyone's balances.`)) return;
    await removeEntry(entry.id);
  };

  return (
    <div className="euro-app">
      <header className="euro-app-header">
        <BackHome />
        <div className="euro-app-header__actions">
          <button className="euro-profile-button" onClick={onChangeIdentity} type="button">
            <span className="euro-avatar euro-avatar--compact">{initials(currentMember.name)}</span>
            <span>{currentMember.name}</span>
          </button>
          <button className="euro-signout-button" onClick={onSignOut} type="button">
            Lock
          </button>
        </div>
      </header>

      <main className="euro-main">
        <section className="euro-overview">
          <div>
            <p className="euro-kicker">Live trip ledger</p>
            <h1>{trip.name}</h1>
            <p>One running tab for the whole crew.</p>
          </div>
          <div className="euro-total-card">
            <span>Total group spend</span>
            <strong>{formatCurrency(totalSpent(entries))}</strong>
            <small>
              <span aria-hidden="true" /> Synced for all six travelers
            </small>
          </div>
        </section>

        {error && (
          <div className="euro-sync-error" role="alert">
            {error}
          </div>
        )}

        <nav aria-label="Trip ledger sections" className="euro-tabs">
          {(['expenses', 'balances', 'settle'] as Tab[]).map((item) => (
            <button
              aria-current={tab === item ? 'page' : undefined}
              className={tab === item ? 'is-active' : ''}
              key={item}
              onClick={() => setTab(item)}
              type="button"
            >
              {item === 'settle' ? 'Final plan' : item[0].toUpperCase() + item.slice(1)}
              {item === 'expenses' && <span>{entries.length}</span>}
              {item === 'settle' && transfers.length > 0 && <span>{transfers.length}</span>}
            </button>
          ))}
        </nav>

        {tab === 'expenses' && (
          <ExpenseList
            entries={entries}
            members={trip.members}
            onAdd={() => setAddingExpense(true)}
            onDelete={handleDelete}
            onEdit={setEditingExpense}
          />
        )}
        {tab === 'balances' && <BalanceList balances={balances} members={trip.members} />}
        {tab === 'settle' && <SettlementPlan entries={entries} members={trip.members} transfers={transfers} />}
      </main>

      <button className="euro-mobile-add" onClick={() => setAddingExpense(true)} type="button">
        <span aria-hidden="true">＋</span>
        <span>Add expense</span>
      </button>

      {(addingExpense || editingExpense) && (
        <ExpenseEditor
          currentMember={currentMember}
          expense={editingExpense ?? undefined}
          members={trip.members}
          onClose={() => {
            setAddingExpense(false);
            setEditingExpense(null);
          }}
          onSaved={() => {
            setAddingExpense(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
};

export const EuroTripPage = () => {
  const [authReady, setAuthReady] = React.useState(!isFirebaseConfigured);
  const [signedIn, setSignedIn] = React.useState(false);
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [tripReady, setTripReady] = React.useState(false);
  const [entries, setEntries] = React.useState<LedgerEntry[]>([]);
  const [selectedMemberId, setSelectedMemberId] = React.useState(
    () => window.localStorage.getItem(selectedMemberStorageKey) ?? '',
  );
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Euro Trip Splitter · Samuel John';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  React.useEffect(
    () =>
      subscribeToAuth((user) => {
        setSignedIn(Boolean(user));
        setAuthReady(true);
        if (!user) {
          setTrip(null);
          setEntries([]);
          setTripReady(false);
        }
      }),
    [],
  );

  React.useEffect(() => {
    if (!signedIn) return;
    const handleError = () => setError('Live sync is unavailable. Check the connection and try again.');
    const unsubscribeTrip = subscribeToTrip((nextTrip) => {
      setTrip(nextTrip);
      setTripReady(true);
      setError('');
    }, handleError);
    const unsubscribeEntries = subscribeToEntries(setEntries, handleError);
    return () => {
      unsubscribeTrip();
      unsubscribeEntries();
    };
  }, [signedIn]);

  const selectMember = (memberId: string) => {
    window.localStorage.setItem(selectedMemberStorageKey, memberId);
    setSelectedMemberId(memberId);
  };

  const handleLogin = async (password: string) => {
    setError('');
    try {
      await logInToTrip(password);
    } catch {
      setError('That password did not work. Check it and try again.');
    }
  };

  const handleSignOut = async () => {
    await logOutOfTrip();
    setError('');
  };

  if (!isFirebaseConfigured) return <ConfigurationScreen />;
  if (!authReady) return <LoadingScreen />;
  if (!signedIn) return <LoginScreen error={error} onLogin={handleLogin} />;
  if (!tripReady) return <LoadingScreen />;
  if (!trip) return <TripSetup onCreated={createTrip} />;

  const currentMember = memberById(trip.members, selectedMemberId);
  if (!currentMember) {
    return <IdentityPicker members={trip.members} onSelect={selectMember} tripName={trip.name} />;
  }

  return (
    <EuroTripApp
      currentMember={currentMember}
      entries={entries}
      error={error}
      onChangeIdentity={() => {
        window.localStorage.removeItem(selectedMemberStorageKey);
        setSelectedMemberId('');
      }}
      onSignOut={handleSignOut}
      trip={trip}
    />
  );
};
