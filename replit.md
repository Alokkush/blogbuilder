# BlogBuilder Platform

## Overview

BlogBuilder is a full-stack blog creation and publishing platform that allows users to create, manage, and publish beautiful blogs with multiple themes and rich content features. The application provides a complete blogging solution with user authentication, rich text editing, media upload capabilities, and customizable blog themes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Components**: Radix UI primitives wrapped with custom styling for accessibility
- **Design System**: Custom CSS variables for theming with support for light/dark modes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development Setup**: Custom Vite integration for full-stack development experience
- **API Design**: RESTful APIs with JSON responses
- **Middleware**: Custom logging, error handling, and authentication middleware
- **Build Process**: ESBuild for production bundling with platform-specific optimizations

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schema definitions between client and server
- **Validation**: Zod for runtime type validation and schema generation
- **Migrations**: Drizzle Kit for database schema migrations
- **Storage Interface**: Abstracted storage layer supporting both in-memory (development) and database implementations

### Authentication & Authorization
- **Provider**: Firebase Authentication for user management
- **Strategy**: JWT-based authentication with session management
- **User Context**: React Context API for client-side authentication state
- **Protected Routes**: Middleware-based route protection on both client and server
- **User Management**: Custom user profile storage with Firebase integration

### File Storage & Media
- **Storage**: Firebase Cloud Storage for media file uploads
- **Upload Features**: Drag-and-drop file upload with progress tracking
- **Media Types**: Support for images and videos with type validation
- **Integration**: Seamless media embedding in blog content

### Content Management
- **Rich Text Editor**: Custom implementation with formatting toolbar (extensible for Quill.js integration)
- **Auto-save**: Automatic content saving with debouncing to prevent data loss
- **Theme System**: Multiple blog themes (Modern, Dark, Professional, Creative) with customizable styling
- **Content Structure**: Structured blog data with title, content, excerpt, categories, and tags
- **Draft/Publish Workflow**: Blog status management with preview capabilities

### Development Features
- **Hot Reload**: Vite-powered development with instant updates
- **Error Handling**: Runtime error overlay and comprehensive error boundaries
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Path Aliases**: Organized import structure with @ aliases for clean code organization

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and context
- **Express.js**: Backend web framework
- **TypeScript**: Type safety across the entire application
- **Vite**: Build tool and development server

### Database & ORM
- **Drizzle ORM**: Type-safe database operations
- **Drizzle Kit**: Database migration management
- **@neondatabase/serverless**: PostgreSQL serverless connection

### Authentication & Storage
- **Firebase**: Authentication, Firestore database, and Cloud Storage
- **Firebase Auth**: User authentication and management
- **Firebase Storage**: File upload and media storage

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### State Management & Data Fetching
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Development Tools
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### Additional Libraries
- **date-fns**: Date manipulation utilities
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional CSS class management
- **react-dropzone**: File upload interface
- **wouter**: Lightweight routing solution