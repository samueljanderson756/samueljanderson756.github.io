import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import type { LedgerEntry, NewExpense, NewSettlement, Trip } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

export const tripId = import.meta.env.VITE_EURO_TRIP_ID || 'euro-trip-2026';
const accountEmail = import.meta.env.VITE_EURO_TRIP_ACCOUNT_EMAIL;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.appId &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  accountEmail,
);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const requireFirebase = () => {
  if (!auth || !db || !accountEmail) throw new Error('Firebase is not configured.');
  return { auth, db };
};

export const subscribeToAuth = (callback: (user: User | null) => void): Unsubscribe => {
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
};

export const logInToTrip = async (password: string) => {
  const clients = requireFirebase();
  await setPersistence(clients.auth, browserLocalPersistence);
  await signInWithEmailAndPassword(clients.auth, accountEmail, password);
};

export const logOutOfTrip = async () => {
  const clients = requireFirebase();
  await signOut(clients.auth);
};

export const subscribeToTrip = (onTrip: (trip: Trip | null) => void, onError: (error: Error) => void) => {
  const clients = requireFirebase();
  return onSnapshot(
    doc(clients.db, 'trips', tripId),
    (snapshot) => onTrip(snapshot.exists() ? (snapshot.data() as Trip) : null),
    onError,
  );
};

const isLedgerEntry = (id: string, data: DocumentData): data is Omit<LedgerEntry, 'id'> =>
  typeof data.amountCents === 'number' &&
  typeof data.createdAtMs === 'number' &&
  typeof data.createdBy === 'string' &&
  typeof data.occurredOn === 'string' &&
  (data.kind === 'expense' || data.kind === 'settlement') &&
  Boolean(id);

export const subscribeToEntries = (onEntries: (entries: LedgerEntry[]) => void, onError: (error: Error) => void) => {
  const clients = requireFirebase();
  return onSnapshot(
    collection(clients.db, 'trips', tripId, 'entries'),
    (snapshot) => {
      const entries = snapshot.docs
        .flatMap((entryDocument) => {
          const data = entryDocument.data();
          return isLedgerEntry(entryDocument.id, data) ? [{ ...data, id: entryDocument.id } as LedgerEntry] : [];
        })
        .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAtMs - a.createdAtMs);
      onEntries(entries);
    },
    onError,
  );
};

export const createTrip = async (trip: Trip) => {
  const clients = requireFirebase();
  await setDoc(doc(clients.db, 'trips', tripId), trip);
};

export const addEntry = async (entry: NewExpense | NewSettlement) => {
  const clients = requireFirebase();
  await addDoc(collection(clients.db, 'trips', tripId, 'entries'), {
    ...entry,
    createdAtMs: Date.now(),
  });
};

export const updateExpense = async (id: string, expense: NewExpense) => {
  const clients = requireFirebase();
  await updateDoc(doc(clients.db, 'trips', tripId, 'entries', id), expense);
};

export const removeEntry = async (id: string) => {
  const clients = requireFirebase();
  await deleteDoc(doc(clients.db, 'trips', tripId, 'entries', id));
};
