import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Only create the Supabase client if we have valid credentials
let supabase: any = null;

if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn("Failed to create Supabase client:", error);
  }
} else {
    console.warn("Supabase credentials not set. Using mock client for development.");
    // Mock client for development
    supabase = {
        auth: {
            signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: (callback: any) => {
                // Call the callback with a mock user
                callback('SIGNED_IN', { user: { id: 'mock-user-id', email: 'mock@example.com' } });
                return { data: { subscription: { unsubscribe: () => {} } } };
            },
            getSession: () => Promise.resolve({ data: { session: null }, error: null })
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) })
        }),
        storage: {
            from: () => ({
                upload: () => Promise.resolve({ data: { path: '' }, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: '' } })
            })
        },
        rpc: () => Promise.resolve({ data: null, error: null })
    };
}

// Export the supabase client (mock or real)
export { supabase };

// Mock auth functions for development
const mockSignUp = async (email: string, password: string, name: string) => {
    console.warn("Using mock signUp function");
    return { data: { user: { id: 'mock-user-id', email, user_metadata: { full_name: name } }, session: null }, error: null };
};

const mockSignIn = async (email: string, password: string) => {
    console.warn("Using mock signIn function");
    return { data: { user: { id: 'mock-user-id', email }, session: null }, error: null };
};

const mockLogOut = async () => {
    console.warn("Using mock logOut function");
    return { error: null };
};

const mockOnAuthStateChange = (callback: (user: any) => void) => {
    console.warn("Using mock onAuthStateChange function");
    // Call the callback with a mock user
    callback({ id: 'mock-user-id', email: 'mock@example.com', user_metadata: { full_name: 'Mock User' } });
    return { data: { subscription: { unsubscribe: () => {} } } };
};

// Auth functions
export const signUp = supabase?.auth?.signUp ? 
    async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) {
            throw error;
        }

        return data;
    } : mockSignUp;

export const signIn = supabase?.auth?.signInWithPassword ? 
    async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return data;
    } : mockSignIn;

export const logOut = supabase?.auth?.signOut ? 
    async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
    } : mockLogOut;

export const onAuthStateChange = supabase?.auth?.onAuthStateChange ? 
    (callback: (user: any) => void) => {
        const { data } = supabase.auth.onAuthStateChange((event: string, session: any) => {
            callback(session?.user || null);
        });

        return data.subscription.unsubscribe;
    } : mockOnAuthStateChange;

// Mock blog functions for development
const mockCreateBlog = async (blogData: any) => {
    console.warn("Using mock createBlog function");
    return 'mock-blog-id';
};

const mockUpdateBlog = async (blogId: string, updates: any) => {
    console.warn("Using mock updateBlog function");
    return { id: blogId, ...updates };
};

const mockDeleteBlog = async (blogId: string) => {
    console.warn("Using mock deleteBlog function");
    return;
};

const mockGetBlog = async (blogId: string) => {
    console.warn("Using mock getBlog function");
    return {
        id: blogId,
        title: 'Mock Blog Title',
        content: 'Mock blog content',
        author_id: 'mock-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: '0'
    };
};

const mockGetUserBlogs = async (userId: string) => {
    console.warn("Using mock getUserBlogs function");
    return [];
};

const mockGetPublishedBlogs = async (limit = 20) => {
    console.warn("Using mock getPublishedBlogs function");
    return [];
};

const mockIncrementBlogViews = async (blogId: string) => {
    console.warn("Using mock incrementBlogViews function");
    return;
};

const mockUploadFile = async (file: File, path: string) => {
    console.warn("Using mock uploadFile function");
    return 'https://example.com/mock-file-url';
};

// Blog functions
export const createBlog = supabase ? 
    async (blogData: any) => {
        const { data, error } = await supabase
            .from('blogs')
            .insert({
                ...blogData,
                created_at: new Date(),
                updated_at: new Date(),
                views: 0,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data.id;
    } : mockCreateBlog;

export const updateBlog = supabase ? 
    async (blogId: string, updates: any) => {
        const { data, error } = await supabase
            .from('blogs')
            .update({
                ...updates,
                updated_at: new Date(),
            })
            .eq('id', blogId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    } : mockUpdateBlog;

export const deleteBlog = supabase ? 
    async (blogId: string) => {
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', blogId);

        if (error) {
            throw error;
        }
    } : mockDeleteBlog;

export const getBlog = supabase ? 
    async (blogId: string) => {
        const { data, error } = await supabase
            .from('blogs')
            .select(`
                *,
                author:users(*)
            `)
            .eq('id', blogId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    } : mockGetBlog;

export const getUserBlogs = supabase ? 
    async (userId: string) => {
        const { data, error } = await supabase
            .from('blogs')
            .select(`
                *,
                author:users(*)
            `)
            .eq('author_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data;
    } : mockGetUserBlogs;

export const getPublishedBlogs = supabase ? 
    async (limit = 20) => {
        const { data, error } = await supabase
            .from('blogs')
            .select(`
                *,
                author:users(*)
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return data;
    } : mockGetPublishedBlogs;

export const incrementBlogViews = supabase ? 
    async (blogId: string) => {
        const { data, error } = await supabase.rpc('increment_blog_views', {
            blog_id: blogId
        });

        if (error) {
            throw error;
        }

        return data;
    } : mockIncrementBlogViews;

// Storage functions
export const uploadFile = supabase ? 
    async (file: File, path: string) => {
        const { data, error } = await supabase.storage
            .from('blog-media')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('blog-media')
            .getPublicUrl(data.path);

        return publicUrl;
    } : mockUploadFile;