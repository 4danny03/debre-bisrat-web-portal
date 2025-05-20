import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './config';
import type { 
  Profile, 
  Member, 
  Event, 
  Donation, 
  Announcement,
  SiteSettings 
} from './types';

export const api = {
  auth: {
    getCurrentUser: async () => {
      return new Promise<User | null>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, 
          (user) => {
            unsubscribe();
            resolve(user);
          },
          reject
        );
      });
    },

    getProfile: async (userId: string): Promise<Profile | null> => {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as Profile : null;
    },

    signOut: async () => {
      await signOut(auth);
    }
  },

  members: {
    getMembers: async (filters?: {
      status?: string;
      type?: string;
      search?: string;
    }): Promise<Member[]> => {
      let q = collection(db, 'members');
      const constraints: any[] = [];

      if (filters?.status) {
        constraints.push(where('membership_status', '==', filters.status));
      }
      if (filters?.type) {
        constraints.push(where('membership_type', '==', filters.type));
      }
      // Note: Full text search would require a separate service like Algolia
      // This is a simple solution that may not scale well
      if (filters?.search) {
        constraints.push(where('full_name', '>=', filters.search));
        constraints.push(where('full_name', '<=', filters.search + '\uf8ff'));
      }

      const querySnapshot = await getDocs(query(q, ...constraints));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Member);
    },

    createMember: async (memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
      const docRef = doc(collection(db, 'members'));
      const timestamp = Timestamp.now();
      const member = {
        ...memberData,
        created_at: timestamp.toDate().toISOString(),
        updated_at: timestamp.toDate().toISOString()
      };
      await setDoc(docRef, member);
      return { id: docRef.id, ...member };
    },
  },

  events: {
    getEvents: async (filters?: {
      status?: string;
      type?: string;
      from?: Date;
      to?: Date;
    }): Promise<Event[]> => {
      let q = collection(db, 'events');
      const constraints: any[] = [];

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters?.type) {
        constraints.push(where('event_type', '==', filters.type));
      }
      if (filters?.from) {
        constraints.push(where('date', '>=', filters.from));
      }
      if (filters?.to) {
        constraints.push(where('date', '<=', filters.to));
      }

      const querySnapshot = await getDocs(query(q, ...constraints, orderBy('date')));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Event);
    },

    createEvent: async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
      const docRef = doc(collection(db, 'events'));
      const timestamp = Timestamp.now();
      const event = {
        ...eventData,
        created_at: timestamp.toDate().toISOString(),
        updated_at: timestamp.toDate().toISOString()
      };
      await setDoc(docRef, event);
      return { id: docRef.id, ...event };
    },
  },

  donations: {
    getDonations: async (filters?: {
      status?: string;
      type?: string;
      from?: Date;
      to?: Date;
    }): Promise<Donation[]> => {
      let q = collection(db, 'donations');
      const constraints: any[] = [];

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters?.type) {
        constraints.push(where('donation_type', '==', filters.type));
      }
      if (filters?.from) {
        constraints.push(where('created_at', '>=', filters.from));
      }
      if (filters?.to) {
        constraints.push(where('created_at', '<=', filters.to));
      }

      const querySnapshot = await getDocs(query(q, ...constraints, orderBy('created_at', 'desc')));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Donation);
    },

    createDonation: async (donationData: Omit<Donation, 'id' | 'created_at' | 'updated_at'>) => {
      const docRef = doc(collection(db, 'donations'));
      const timestamp = Timestamp.now();
      const donation = {
        ...donationData,
        created_at: timestamp.toDate().toISOString(),
        updated_at: timestamp.toDate().toISOString()
      };
      await setDoc(docRef, donation);
      return { id: docRef.id, ...donation };
    },
  },

  announcements: {
    getAnnouncements: async (filters?: {
      type?: string;
      active?: boolean;
    }): Promise<Announcement[]> => {
      let q = collection(db, 'announcements');
      const constraints: any[] = [];

      if (filters?.type) {
        constraints.push(where('announcement_type', '==', filters.type));
      }
      if (filters?.active !== undefined) {
        constraints.push(where('is_active', '==', filters.active));
      }

      const querySnapshot = await getDocs(query(q, ...constraints, orderBy('created_at', 'desc')));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Announcement);
    },

    createAnnouncement: async (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
      const docRef = doc(collection(db, 'announcements'));
      const timestamp = Timestamp.now();
      const announcement = {
        ...announcementData,
        created_at: timestamp.toDate().toISOString(),
        updated_at: timestamp.toDate().toISOString()
      };
      await setDoc(docRef, announcement);
      return { id: docRef.id, ...announcement };
    },
  },

  storage: {
    uploadFile: async (bucket: string, path: string, file: File) => {
      const storageRef = ref(storage, `${bucket}/${path}`);
      const result = await uploadBytes(storageRef, file);
      return { path: result.metadata.fullPath };
    },

    getPublicUrl: async (bucket: string, path: string) => {
      const storageRef = ref(storage, `${bucket}/${path}`);
      return await getDownloadURL(storageRef);
    },
  },

  settings: {
    getSiteSettings: async (): Promise<SiteSettings | null> => {
      const docRef = doc(db, 'site_settings', '1');
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as SiteSettings : null;
    },

    updateSiteSettings: async (settings: Partial<SiteSettings>) => {
      const docRef = doc(db, 'site_settings', '1');
      const timestamp = Timestamp.now();
      await updateDoc(docRef, {
        ...settings,
        updated_at: timestamp.toDate().toISOString()
      });
    },
  },
};
