# Blog Builder Platform

A full-stack blog platform built with React, Node.js, and Supabase.

## Features

- User authentication (Email/Password)
- Blog editor with rich text formatting
- Media uploads (images/videos) to Supabase Storage
- Blog CRUD operations
- Auto-save draft feature
- Themes/templates for blogs
- User dashboard to manage blogs

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel (Frontend), Render (Backend)

## Prerequisites

1. Node.js (v16 or higher)
2. Supabase account (free tier available)
3. Vercel account (for frontend deployment)
4. Render account (for backend deployment)

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/)
2. Get your project URL and API keys from the Supabase dashboard:
   - Project URL
   - Anonymous key (for frontend)
   - Service role key (for backend)

### 2. Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
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
```

### 3. Environment Variables

#### Frontend (.env file in client directory)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend (.env file in server directory)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_db_url
PORT=5000
```

### 4. Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 5. Run Locally

```bash
# Run frontend
cd client
npm run dev

# Run backend (in a separate terminal)
cd server
npm run dev
```

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to a GitHub repository
2. Create a new project on Vercel
3. Connect your GitHub repository
4. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Backend Deployment (Render)

1. Push your code to a GitHub repository
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set start command: `npm run start`
6. Set environment variables in Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `DATABASE_URL`
   - `PORT` (Render will set this automatically)
7. Deploy!

## Supabase Storage Setup

1. In your Supabase dashboard, go to Storage
2. Create a new bucket named `blog-media`
3. Set the bucket to public access
4. Your media uploads will now work!

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utility functions and Supabase client
│   │   ├── pages/       # Page components
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   └── index.html       # HTML template
├── server/              # Node.js backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   ├── db.ts            # Database connection
│   └── supabase-admin.ts # Supabase admin client
├── shared/              # Shared types and schemas
└── README.md            # This file
```

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Blogs
- `POST /blog` - Create blog
- `GET /blog` - Fetch all blogs
- `GET /blog/:id` - Fetch single blog
- `PUT /blog/:id` - Update blog
- `DELETE /blog/:id` - Delete blog

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.