# Blog Builder Platform

A full-stack blog platform built with React, Node.js, and Supabase that allows users to create, manage, and publish blog content with a modern UI.

![Blog Builder Platform](https://placehold.co/800x400?text=Blog+Builder+Platform+Preview)

## 🚀 Features

- **User Authentication**: Secure email/password authentication with Supabase Auth
- **Rich Text Editor**: Create engaging content with our powerful blog editor
- **Media Management**: Upload and manage images/videos directly to Supabase Storage
- **Content Management**: Full CRUD operations for blog posts
- **Auto-save Drafts**: Never lose your work with automatic draft saving
- **Customizable Themes**: Multiple blog themes and templates
- **User Dashboard**: Personalized dashboard to manage all your blogs
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **React Query** - Server state management
- **Supabase JS Client** - Supabase integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **Supabase** - Backend-as-a-Service (Database, Auth, Storage)

### Database & Services
- **Supabase PostgreSQL** - Database
- **Supabase Auth** - Authentication
- **Supabase Storage** - File storage

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm, yarn, or pnpm package manager
- Supabase account (free tier available at [supabase.com](https://supabase.com/))

## 🚀 Getting Started

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

### 3. Environment Configuration

#### Frontend Environment Variables
Create a `.env` file in the `client` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend Environment Variables
Create a `.env` file in the `server` directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_db_url
PORT=5000
```

### Render Deployment with Environment Files

For easier deployment to Render, you can use the provided environment template files:
1. `render-frontend.env` - For the frontend static site
2. `render-backend.env` - For the backend web service
3. `render-all.env` - Combined file with all environment variables (can be used for either service)

To use these files:
1. Download the appropriate file
2. Replace the placeholder values with your actual Supabase credentials
3. In Render, when creating your service, go to the "Advanced" section
4. Use the "Import from .env" option to upload your configured file

Note: You only need to import the variables relevant to each service. The combined `render-all.env` file contains variables for both services, but Render will only use the ones that are relevant to each specific service.

### 4. Installation

```bash
# Install all dependencies
npm install --legacy-peer-deps

# Or if using yarn
yarn install

# Or if using pnpm
pnpm install
```

### 5. Development

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:5000
```

## 🌐 Deployment

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
4. **Important**: Make sure the start command is set to `npm run start` (not `npm run dev`)
5. Set build command: `npm install --legacy-peer-deps`
6. Set start command: `npm run start`
7. Set environment variables in Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `DATABASE_URL`
   - `NODE_ENV` = `production`
8. Deploy!

### Frontend Deployment (Render)

1. Create a new Static Site on Render
2. Connect the same GitHub repository
3. **Important**: Make sure the start command is set to `npm run start` (not `npm run dev`)
4. Set build command: `npm install --legacy-peer-deps && npm run build`
5. Set start command: `npm run start`
6. Set publish directory: `dist/public`
7. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
8. Deploy!

### Automated Deployment with render.yaml

Alternatively, you can use the provided `render.yaml` file for automated deployment:
1. Push your code to GitHub
2. Create a new project on Render
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and configure both services
5. Make sure to set your environment variables in the Render dashboard after creation

**Note**: If you're experiencing issues with Render still running `npm run dev`, please check your service configuration in the Render dashboard and ensure the start command is set to `npm run start`.

## ☁️ Supabase Storage Setup

1. In your Supabase dashboard, go to Storage
2. Create a new bucket named `blog-media`
3. Set the bucket to public access
4. Your media uploads will now work!

## 📁 Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utility functions and Supabase client
│   │   ├── pages/            # Page components
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── index.html            # HTML template
│   └── .env                  # Frontend environment variables
├── server/                   # Node.js backend
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Database operations
│   ├── db.ts                 # Database connection
│   ├── supabase-admin.ts     # Supabase admin client
│   └── .env                  # Backend environment variables
├── shared/                   # Shared types and schemas
├── migrations/               # Database migration scripts
├── package.json              # Project dependencies and scripts
└── README.md                 # This file
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Blogs
- `POST /api/blog` - Create blog
- `GET /api/blog` - Fetch all blogs
- `GET /api/blog/:id` - Fetch single blog
- `PUT /api/blog/:id` - Update blog
- `DELETE /api/blog/:id` - Delete blog

## 🧪 Testing

To run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📖 Contributing

We welcome contributions to the Blog Builder Platform! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

Please ensure your code follows our coding standards and includes appropriate tests.

## 🛡️ Security

- Never commit sensitive information like API keys or passwords
- Always use environment variables for secrets
- Keep dependencies up to date
- Follow the principle of least privilege for database access

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend-as-a-service
- [React](https://reactjs.org/) for the frontend library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Vite](https://vitejs.dev/) for the build tool
- All the open-source libraries that made this project possible

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the existing issues on GitHub
2. Create a new issue if your problem hasn't been reported
3. Contact the maintainers directly

---

<p align="center">Made with ❤️ by the Blog Builder Platform Team</p>