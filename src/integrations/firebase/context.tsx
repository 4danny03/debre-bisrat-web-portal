import { createContext, useContext, useEffect, useState } from 'react';
import { Auth, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Storage } from 'firebase/storage';
import { Analytics } from 'firebase/analytics';
import { Performance } from 'firebase/performance';
import { auth, db, storage, analytics, perf, logAnalyticsEvent } from './config';

interface FirebaseContextType {
  auth: Auth;
  db: Firestore;
  storage: Storage;
  analytics: Analytics | null;
  perf: Performance | null;
  user: User | null;
  loading: boolean;
  logEvent: (eventName: string, eventParams?: Record<string, any>) => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    auth,
    db,
    storage,
    analytics,
    perf,
    user,
    loading,
    logEvent: logAnalyticsEvent
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
