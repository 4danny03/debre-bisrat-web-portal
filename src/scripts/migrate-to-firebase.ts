import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = getFirestore(app);
const storage = getStorage(app);

async function migrateProfiles() {
  console.log('Migrating profiles...');
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  
  if (error) throw error;
  
  for (const profile of profiles) {
    await db.collection('profiles').doc(profile.id).set({
      ...profile,
      created_at: new Date(profile.created_at).toISOString(),
      updated_at: new Date(profile.updated_at).toISOString()
    });
  }
  
  console.log(`Migrated ${profiles.length} profiles`);
}

async function migrateEvents() {
  console.log('Migrating events...');
  const { data: events, error } = await supabase.from('events').select('*');
  
  if (error) throw error;
  
  for (const event of events) {
    await db.collection('events').doc(event.id).set({
      ...event,
      created_at: new Date(event.created_at).toISOString(),
      updated_at: new Date(event.updated_at).toISOString()
    });
  }
  
  console.log(`Migrated ${events.length} events`);
}

async function migrateGallery() {
  console.log('Migrating gallery...');
  const { data: images, error } = await supabase.from('gallery').select('*');
  
  if (error) throw error;
  
  for (const image of images) {
    // Download from Supabase
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('public')
      .download(image.url.replace('public/', ''));
      
    if (downloadError) {
      console.error(`Error downloading ${image.url}:`, downloadError);
      continue;
    }

    // Upload to Firebase Storage
    const fileName = image.url.split('/').pop();
    const file = storage.bucket().file(`gallery/${fileName}`);
    await file.save(fileData);
    
    // Get the new URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });

    // Save metadata to Firestore
    await db.collection('gallery').doc(image.id).set({
      ...image,
      url,
      created_at: new Date(image.created_at).toISOString(),
      updated_at: new Date(image.updated_at).toISOString()
    });
  }
  
  console.log(`Migrated ${images.length} gallery images`);
}

async function migrateMembers() {
  console.log('Migrating members...');
  const { data: members, error } = await supabase.from('members').select('*');
  
  if (error) throw error;
  
  for (const member of members) {
    await db.collection('members').doc(member.id).set({
      ...member,
      created_at: new Date(member.created_at).toISOString(),
      updated_at: new Date(member.updated_at).toISOString()
    });
  }
  
  console.log(`Migrated ${members.length} members`);
}

async function migrateDonations() {
  console.log('Migrating donations...');
  const { data: donations, error } = await supabase.from('donations').select('*');
  
  if (error) throw error;
  
  for (const donation of donations) {
    await db.collection('donations').doc(donation.id).set({
      ...donation,
      created_at: new Date(donation.created_at).toISOString(),
      updated_at: new Date(donation.updated_at).toISOString()
    });
  }
  
  console.log(`Migrated ${donations.length} donations`);
}

async function migrateAnnouncements() {
  console.log('Migrating announcements...');
  const { data: announcements, error } = await supabase.from('announcements').select('*');
  
  if (error) throw error;
  
  for (const announcement of announcements) {
    await db.collection('announcements').doc(announcement.id).set({
      ...announcement,
      created_at: new Date(announcement.created_at).toISOString(),
      updated_at: new Date(announcement.updated_at).toISOString()
    });
  }
  
  console.log(`Migrated ${announcements.length} announcements`);
}

async function migrateSiteSettings() {
  console.log('Migrating site settings...');
  const { data: settings, error } = await supabase.from('site_settings').select('*');
  
  if (error) throw error;
  
  if (settings?.[0]) {
    await db.collection('site_settings').doc('1').set({
      ...settings[0],
      created_at: new Date(settings[0].created_at).toISOString(),
      updated_at: new Date(settings[0].updated_at).toISOString()
    });
  }
  
  console.log('Migrated site settings');
}

async function main() {
  try {
    await migrateProfiles();
    await migrateEvents();
    await migrateGallery();
    await migrateMembers();
    await migrateDonations();
    await migrateAnnouncements();
    await migrateSiteSettings();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

main();
