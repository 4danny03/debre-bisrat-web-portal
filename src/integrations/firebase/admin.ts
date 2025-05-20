import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin if it hasn't been initialized yet
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();

// Helper functions for common operations
export const admin = {
  createUser: async (email: string, password: string, role: 'user' | 'admin' = 'user') => {
    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    await adminDb.collection('profiles').doc(userRecord.uid).set({
      role,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return userRecord;
  },

  setUserRole: async (uid: string, role: 'user' | 'admin') => {
    await adminDb.collection('profiles').doc(uid).update({
      role,
      updated_at: new Date().toISOString()
    });
  },

  verifyAdmin: async (uid: string) => {
    const profile = await adminDb.collection('profiles').doc(uid).get();
    return profile.exists && profile.data()?.role === 'admin';
  }
};
