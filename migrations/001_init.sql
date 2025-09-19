-- Create users table
create table users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text not null,
  created_at timestamp with time zone default now() not null
);

-- Create blogs table
create table blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  excerpt text,
  author_id uuid references users(id) on delete cascade not null,
  category text,
  tags text[],
  theme text default 'modern',
  is_published boolean default false,
  views integer default 0,
  media_urls jsonb default '[]',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create a function to increment blog views
create or replace function increment_blog_views(blog_id uuid)
returns void as $$
begin
  update blogs set views = views + 1 where id = blog_id;
end;
$$ language plpgsql;

-- Set up Row Level Security (RLS)
alter table users enable row level security;
alter table blogs enable row level security;

-- Create policies
create policy "Users can view their own blogs" on blogs
  for select using (author_id = auth.uid());

create policy "Users can insert their own blogs" on blogs
  for insert with check (author_id = auth.uid());

create policy "Users can update their own blogs" on blogs
  for update using (author_id = auth.uid());

create policy "Users can delete their own blogs" on blogs
  for delete using (author_id = auth.uid());

-- Create a trigger to automatically create a user profile when they sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();