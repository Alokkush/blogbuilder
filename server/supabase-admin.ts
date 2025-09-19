import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY);

// Only create the Supabase client if we have valid credentials
let supabaseAdmin: any = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  try {
    console.log("Creating real Supabase admin client");
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.warn("Failed to create Supabase admin client:", error);
  }
} else {
  console.warn("Supabase credentials not set. Using mock client for development.");
  // Mock client for development
  supabaseAdmin = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  };
}

export { supabaseAdmin };

export async function verifyAuthToken(authToken: string) {
  // If we don't have a real Supabase client, return a mock user
  if (!supabaseAdmin || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.warn("Using mock authentication for development");
    return { id: "mock-user-id", email: "mock@example.com" };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(authToken);
    
    if (error) {
      console.error("Error verifying auth token:", error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return null;
  }
}