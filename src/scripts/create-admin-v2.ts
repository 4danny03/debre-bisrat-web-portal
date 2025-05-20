import { supabase } from '../integrations/supabase/client';

async function createAdminUser() {
  const email = 'khaliddawit7546@gmail.com';
  const password = '12345678';

  try {
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', email)
      .single();

    if (existingUser) {
      console.log('User already exists. You can login at /admin/login');
      return;
    }

    // Create new user
    console.log('Creating new admin user...');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Error creating user:', signUpError.message);
      return;
    }

    if (!data.user) {
      console.error('No user data returned');
      return;
    }

    // Create admin profile
    console.log('Creating admin profile...');
    console.log('User ID:', data.user.id);
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            role: 'admin'
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Profile Error:', profileError);
        console.error('Error Details:', JSON.stringify(profileError, null, 2));
        return;
      }

      if (!profileData) {
        console.error('No profile data returned');
        return;
      }

      console.log('Profile Data:', JSON.stringify(profileData, null, 2));
    } catch (e) {
      console.error('Exception creating profile:', e);
      if (e instanceof Error) {
        console.error('Error message:', e.message);
        console.error('Error stack:', e.stack);
      }
      return;
    }

    console.log('=================================');
    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('=================================');
    console.log('Please check your email to confirm your account');
    console.log('After confirmation, you can login at /admin/login');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();
