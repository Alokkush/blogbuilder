# Deployment Checklist

## Prerequisites
- [ ] Node.js installed (v16 or higher)
- [ ] Supabase account
- [ ] Vercel account (for frontend)
- [ ] Render account (for backend)

## Supabase Setup
- [ ] Create a new Supabase project
- [ ] Get Project URL, Anonymous Key, and Service Role Key
- [ ] Run database migration script (`migrations/001_init.sql`)
- [ ] Create `blog-media` storage bucket
- [ ] Set storage bucket to public access

## Environment Variables
### Frontend (.env in client directory)
- [ ] `VITE_SUPABASE_URL`=your_supabase_project_url
- [ ] `VITE_SUPABASE_ANON_KEY`=your_supabase_anon_key

### Backend (.env in server directory)
- [ ] `SUPABASE_URL`=your_supabase_project_url
- [ ] `SUPABASE_SERVICE_KEY`=your_supabase_service_role_key
- [ ] `DATABASE_URL`=your_supabase_db_url
- [ ] `PORT`=5000

## Local Testing
- [ ] Install dependencies: `npm install`
- [ ] Run frontend: `cd client && npm run dev`
- [ ] Run backend: `cd server && npm run dev`
- [ ] Test user registration
- [ ] Test user login
- [ ] Test blog creation
- [ ] Test media upload
- [ ] Test blog publishing

## Frontend Deployment (Vercel)
- [ ] Push code to GitHub repository
- [ ] Create new project on Vercel
- [ ] Connect GitHub repository
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy application
- [ ] Test deployed frontend

## Backend Deployment (Render)
- [ ] Push code to GitHub repository
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `npm run build`
- [ ] Set start command: `npm run start`
- [ ] Set environment variables in Render dashboard
- [ ] Deploy application
- [ ] Test deployed backend

## Post-Deployment Testing
- [ ] Test end-to-end user flow
- [ ] Verify blog CRUD operations
- [ ] Verify media uploads
- [ ] Verify user authentication
- [ ] Test on different devices/browsers

## Security Considerations
- [ ] Review Supabase Row Level Security policies
- [ ] Verify storage bucket permissions
- [ ] Check API rate limiting
- [ ] Review authentication flows

## Monitoring & Maintenance
- [ ] Set up error tracking
- [ ] Configure performance monitoring
- [ ] Plan for database backups
- [ ] Schedule regular dependency updates