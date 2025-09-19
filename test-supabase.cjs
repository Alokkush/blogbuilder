const { createClient } = require('@supabase/supabase-js');

// Test the Supabase connection with hardcoded values
const supabaseUrl = 'https://qaixsjxygomnnosfdngw.supabase.co';
const supabaseAnonKey = 'sb_secret_rImQYwu8slU6VmBsAKPMDA_4H5NsCe6';

console.log('Testing Supabase connection...');
console.log('Supabase URL:', supabaseUrl);

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client created successfully!');
  
  // Test a simple query
  supabase.from('users').select('*', { count: 'exact' }).limit(1)
    .then(response => {
      console.log('Query executed successfully!');
      console.log('Data:', response.data);
      console.log('Count:', response.count);
    })
    .catch(error => {
      console.error('Query failed:');
      console.error('Error:', error.message);
    });
} catch (error) {
  console.error('Failed to create Supabase client:');
  console.error('Error:', error.message);
}