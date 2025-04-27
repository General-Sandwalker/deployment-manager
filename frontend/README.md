# Deployment Manager Frontend

A modern web interface for the Deployment Manager application built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- User authentication and session management
- Dashboard for website deployment management
- Administrative interface for system management
- Responsive design for optimal viewing on various devices
- Real-time status updates
- Intuitive website creation, deployment, and management

## Architecture

The frontend follows a modern React architecture:

- **Next.js App Router**: Page-based routing system with server and client components
- **Context API**: State management using React Context
- **TypeScript**: Static type checking for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn UI**: Component library providing accessible UI elements

## Directory Structure

- `src/`
  - `app/`: Next.js app router pages
    - `dashboard/`: User dashboard pages
    - `admin/`: Admin pages (accessible only to admins)
    - `login/` & `register/`: Authentication pages
  - `components/`: Reusable React components
    - `shared/`: Shared components used across the application
    - `admin/`: Admin-specific components
    - `ui/`: UI components based on shadcn/ui
  - `context/`: React Context providers
  - `lib/`: Utility functions
  - `services/`: API service functions
  - `types/`: TypeScript type definitions
  - `styles/`: Global styles

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Development Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Configure environment variables by creating a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
# or
yarn build
```

## User Guide

### Normal User Workflow

1. **Register/Login**: Create an account or log in
2. **Dashboard**: View all your deployed websites
3. **Create Website**: Click "Create Website" to deploy a new static site from a Git repository
4. **Manage Websites**: 
   - Start/Stop websites
   - Redeploy websites when you update the source code
   - View website status and access deployed sites
   - Delete websites when no longer needed

### Admin Workflow

1. **Admin Dashboard**: Access the admin area to view all user websites
2. **User Management**: View and manage user accounts
3. **Website Management**: 
   - View all websites across all users
   - Filter by status or search for specific websites
   - Perform administrative actions (start, stop, delete) on any website

## Deployment

The frontend is containerized using Docker and can be deployed using the provided Dockerfile. For production deployment, use Docker Compose as described in the main README.
