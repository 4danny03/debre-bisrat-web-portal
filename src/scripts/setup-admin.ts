import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const supabaseUrl = 'https://nvigfdxosyqhnoljtfld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aWdmZHhvc3lxaG5vbGp0ZmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNjU0MjMsImV4cCI6MjA2Mjc0MTQyM30.3fkZqIajZVAg__YHUr7rbBMOxXwVSjKBgcoQkKCqAPY';

async function setupAdmin() {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  
  try {
    // First, sign in with the existing account
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'khaliddawit7546@gmail.com',
      password: '12345678'
    });

    if (signInError) {
      // If sign in fails, try to sign up
      console.log('Attempting to create new user...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'khaliddawit7546@gmail.com',
        password: '12345678'
      });

      if (signUpError) {
        throw new Error(`Sign up failed: ${signUpError.message}`);
      }

      if (!signUpData.user) {
        throw new Error('No user data returned from sign up');
      }

      console.log('User created successfully');
      console.log('User ID:', signUpData.user.id);

      // Create admin profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        role: 'admin'
      });

      if (profileError) {
        console.error('Profile Error:', profileError);
        throw profileError;
      }

      console.log('=================================');
      console.log('Admin user created successfully!');
      console.log('=================================');
      console.log('Email: khaliddawit7546@gmail.com');
      console.log('Password: 12345678');
      console.log('=================================');
      console.log('Please check your email to confirm your account');
      console.log('After confirmation, you can login at /admin/login');
    } else {
      // User exists, update their role to admin
      console.log('User already exists, updating role to admin...');
      
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: signInData.user.id,
        role: 'admin'
      });

      if (profileError) {
        console.error('Profile Error:', profileError);
        throw profileError;
      }

      console.log('=================================');
      console.log('User role updated to admin!');
      console.log('=================================');
      console.log('Email: khaliddawit7546@gmail.com');
      console.log('Password: 12345678');
      console.log('=================================');
      console.log('You can now login at /admin/login');
    }
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

setupAdmin().catch(console.error);
