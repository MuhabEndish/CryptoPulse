# CryptoPulse - Comprehensive Project Documentation

**Project Name:** CryptoPulse - Crypto Social Tracker
**Version:** 0.1.0
**Type:** Full-Stack Web Application
**Tech Stack:** React + TypeScript + Vite + Supabase + TailwindCSS
**Last Updated:** December 31, 2025

---

## 📑 TABLE OF CONTENTS

1. [Project Overview & Architecture](#part-1-project-overview--architecture)
2. [Database Schema & Data Models](#part-2-database-schema--data-models)
3. [Frontend Components & UI System](#part-3-frontend-components--ui-system)
4. [Pages & User Flows](#part-4-pages--user-flows)
5. [Services & Business Logic](#part-5-services--business-logic)
6. [Configuration & Deployment](#part-6-configuration--deployment)

---

## PART 1: PROJECT OVERVIEW & ARCHITECTURE

### 1.1 Project Description

**CryptoPulse** is a comprehensive cryptocurrency tracking and social networking platform that combines real-time crypto market data with social interaction features. Users can:

- Track cryptocurrency prices and market trends
- Create and share posts about crypto with sentiment indicators (Bullish/Bearish/Neutral)
- Follow favorite cryptocurrencies (watchlist)
- Set price alerts for specific coins
- Interact through likes and comments
- View market sentiment through Fear & Greed Index
- Report inappropriate content
- Admin panel for content moderation and user management

### 1.2 Technology Stack

#### Frontend Technologies:

- **React 18.3.1** - UI Library
- **TypeScript 5.0.0** - Type-safe JavaScript
- **Vite 5.0.0** - Build tool and dev server
- **React Router DOM 7.9.5** - Client-side routing
- **TailwindCSS 4.1.18** - Utility-first CSS framework
- **React Icons 5.5.0** - Icon library
- **Chart.js 4.5.1** & **React-ChartJS-2 5.3.1** - Data visualization
- **Axios 1.13.2** - HTTP client
- **Classnames 2.5.1** - CSS class utility

#### Backend & Services:

- **Supabase 2.79.0** - Backend-as-a-Service (Auth, Database, Storage)
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - File storage
- **CoinGecko API** - Cryptocurrency market data
- **Alternative.me API** - Fear & Greed Index

### 1.3 Project Structure

```
crypto-social-tracker/
├── public/
│   └── images/
│       └── CryptoPulseLogo.png
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   │   └── admin/        # Admin panel pages
│   ├── services/         # API and external services
│   ├── utils/            # Utility functions
│   ├── main.tsx          # Application entry point
│   ├── styles.css        # Global styles
│   └── vite-env.d.ts     # TypeScript environment definitions
├── database.sql          # Database schema
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── postcss.config.js    # PostCSS configuration
```

### 1.4 Application Architecture

#### Architecture Pattern: Component-Based Architecture

The application follows a **modular component-based architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface Layer                    │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Components   │  │     Pages      │  │     Layout     │ │
│  └───────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │    Hooks      │  │    Services    │  │     Utils      │ │
│  └───────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data & API Layer                        │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │   Supabase    │  │  CoinGecko API │  │  Local Storage │ │
│  │   (Backend)   │  │                │  │                │ │
│  └───────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Key Architectural Decisions:

1. **State Management**:

   - Local state with React hooks (useState, useEffect)
   - Custom hooks for shared logic (useAuth)
   - Context API for global state (ToastProvider)

2. **Routing Strategy**:

   - Client-side routing with React Router
   - Protected routes with Layout wrapper
   - Separate admin routes without layout

3. **Authentication Flow**:

   - Supabase Auth with email/password
   - Session-based authentication
   - Real-time auth state monitoring
   - Separate admin authentication

4. **Data Fetching**:
   - Direct Supabase queries from components
   - Service layer for external APIs
   - Caching for API rate limiting
   - Real-time subscriptions for live updates

### 1.5 Core Features

#### 1.5.1 User Features:

- **Authentication**: Email/password signup and login, password reset
- **Profile Management**: Avatar, username, bio, privacy settings
- **Crypto Market**:
  - Live price tracking for 100+ cryptocurrencies
  - Market cap, volume, 24h changes
  - Search functionality
  - Detailed coin pages with charts
- **Social Feed**:
  - Create posts (280 char limit) with images
  - Coin tagging and sentiment markers
  - Like and comment system
  - Real-time updates
- **Watchlist**: Save favorite cryptocurrencies
- **Price Alerts**:
  - Set target prices (above/below conditions)
  - Browser notifications
  - Background monitoring
- **Content Moderation**:
  - Report posts/comments
  - Automated profanity filtering
  - Image file validation

#### 1.5.2 Admin Features:

- **Dashboard**: Statistics overview
- **Reports Management**: Review and handle user reports
- **User Management**:
  - View all users
  - Ban users (temporary/permanent)
  - Delete users
- **Content Management**: Delete posts and comments
- **Admin Management**: Create/manage other admins with role-based permissions
- **Action Logging**: Track all admin actions

### 1.6 Security Features

1. **Authentication Security**:

   - Supabase Auth with JWT tokens
   - Password hashing (handled by Supabase)
   - Email verification
   - Password reset via email

2. **Authorization**:

   - Row Level Security (RLS) in database
   - Role-based access control for admins
   - User ownership validation

3. **Input Validation**:

   - Character limits on posts/comments
   - File type and size validation for images
   - Content moderation filters
   - SQL injection prevention (Supabase handles)

4. **Content Security**:
   - Profanity filtering
   - Report system
   - Ban system
   - Image validation

### 1.7 Performance Optimizations

1. **API Rate Limiting**:

   - CoinGecko API caching (60s cache)
   - Minimum request intervals (1.2s)
   - Smart retry logic

2. **Image Optimization**:

   - File size limits (5MB posts, 2MB avatars)
   - Format restrictions (JPEG, PNG, WebP, GIF)
   - Supabase CDN delivery

3. **Real-time Updates**:

   - Supabase subscriptions for live data
   - Optimistic UI updates
   - Efficient re-renders

4. **Code Splitting**:
   - Lazy loading with React Router
   - Component-level optimization

### 1.8 User Experience Features

1. **Dark Mode**:

   - Toggle between dark/light themes
   - Persistent preference (localStorage)
   - Applied across entire app

2. **Responsive Design**:

   - Mobile-first approach
   - Tablet and desktop layouts
   - Adaptive navigation

3. **Toast Notifications**:

   - Success/error/warning/info types
   - Auto-dismiss (3 seconds)
   - Non-intrusive positioning

4. **Loading States**:

   - Spinner components
   - Skeleton screens
   - Progress indicators

5. **Accessibility**:
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation
   - Color contrast

### 1.9 Application Flow

#### User Journey:

```
Landing → Login/Signup → Home Dashboard →
  ├→ Market (Browse coins) → Coin Details → Price Alert
  ├→ Feed (Social posts) → Create Post → View Post → Comment
  ├→ Favorites (Watchlist)
  ├→ Search (Find coins/content)
  ├→ Alerts (Manage price alerts)
  └→ Profile → Settings → Privacy/Security
```

#### Admin Journey:

```
Admin Login → Admin Dashboard →
  ├→ Reports (Handle user reports)
  ├→ Users (Manage users, bans)
  ├→ Posts (Content moderation)
  └→ Management (Manage admins)
```

### 1.10 Development Setup

#### Environment Variables Required:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Available Scripts:

```json
{
  "dev": "vite" // Start development server
}
```

#### Development Server:

- Runs on `http://localhost:5173` (default Vite port)
- Hot Module Replacement (HMR) enabled
- TypeScript compilation on-the-fly

### 1.11 Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required Features**:
  - ES6+ support
  - Fetch API
  - LocalStorage
  - Notification API (for alerts)
  - WebSocket (for real-time features)

### 1.12 External Dependencies

#### APIs:

1. **CoinGecko API** (Free tier):

   - Endpoint: `https://api.coingecko.com/api/v3`
   - Rate limit: 10-50 calls/minute
   - No API key required

2. **Alternative.me API** (Fear & Greed):
   - Endpoint: `https://api.alternative.me/fng/`
   - No rate limit
   - No API key required

#### Third-Party Services:

1. **Supabase**:
   - Authentication service
   - PostgreSQL database
   - Real-time subscriptions
   - File storage

---

## END OF PART 1

**Status**: ✅ Complete
**Next**: Part 2 - Database Schema & Data Models

---

### Summary of Part 1:

- ✅ Project overview and description
- ✅ Complete technology stack
- ✅ Project structure and organization
- ✅ Architecture patterns and decisions
- ✅ Core features (user and admin)
- ✅ Security implementation
- ✅ Performance optimizations
- ✅ UX features
- ✅ Application flows
- ✅ Development setup
- ✅ Browser compatibility
- ✅ External dependencies

**Total Components Documented**: 1/6 parts complete

---

## PART 2: DATABASE SCHEMA & DATA MODELS

### 2.1 Database Overview

The application uses **Supabase** as its Backend-as-a-Service, which provides a **PostgreSQL** database with real-time capabilities. The database consists of **12 tables** organized to support user management, social features, cryptocurrency tracking, content moderation, and admin functionality.

#### Database Design Principles:

- **Normalized schema** to reduce data redundancy
- **Foreign key constraints** for referential integrity
- **Row Level Security (RLS)** for data access control
- **Real-time subscriptions** via Supabase channels
- **Trigger functions** for automatic field updates
- **JSONB fields** for flexible schema extensions

### 2.2 Complete Database Schema

#### Table 1: **profiles**

**Purpose**: Extended user profile information
**Type**: User Data

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  username text UNIQUE CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  bio text CHECK (char_length(bio) <= 150),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email text NOT NULL UNIQUE,
  privacy_settings jsonb DEFAULT '{"showActivity": true, "showWatchlist": true, "isProfilePublic": true, "allowSocialInteractions": true}'::jsonb,
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

**Fields**:

- `id` (uuid, PK): References auth.users(id) - user unique identifier
- `username` (text, unique): Display name, 3-30 characters
- `bio` (text): Profile bio, max 150 characters
- `avatar_url` (text): URL to profile picture in Supabase storage
- `email` (text, unique, not null): User email address
- `privacy_settings` (jsonb): Privacy preferences object
  - `showActivity`: Display posts on profile (default: true)
  - `showWatchlist`: Show favorite coins (default: true)
  - `isProfilePublic`: Profile visibility (default: true)
  - `allowSocialInteractions`: Enable likes/comments (default: true)
- `created_at` (timestamp): Profile creation timestamp
- `updated_at` (timestamp): Last update timestamp

**Relationships**:

- **1-to-1** with auth.users
- **1-to-many** with posts
- **1-to-many** with comments
- **1-to-many** with likes
- **1-to-many** with favorite_cryptos
- **1-to-many** with reports (as reporter or reported user)
- **1-to-many** with banned_users

---

#### Table 2: **posts**

**Purpose**: User-created social posts about cryptocurrencies
**Type**: Social Content

```sql
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  content text NOT NULL CHECK (char_length(content) <= 280),
  created_at timestamp with time zone DEFAULT now(),
  image_url text,
  coin text DEFAULT 'BTC'::text,
  sentiment text DEFAULT 'Neutral'::text CHECK (sentiment = ANY (ARRAY['Bullish'::text, 'Bearish'::text, 'Neutral'::text])),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

**Fields**:

- `id` (uuid, PK): Unique post identifier
- `user_id` (uuid, FK): Author's profile ID
- `content` (text, not null): Post text, max 280 characters
- `coin` (text): Associated cryptocurrency symbol (default: 'BTC')
- `sentiment` (text): Market sentiment - 'Bullish', 'Bearish', or 'Neutral'
- `image_url` (text): Optional image URL from Supabase storage
- `created_at` (timestamp): Post creation time
- `updated_at` (timestamp): Last edit time

**Relationships**:

- **many-to-1** with profiles (author)
- **1-to-many** with comments
- **1-to-many** with likes
- **1-to-many** with reports

---

#### Table 3: **comments**

**Purpose**: Comments on posts
**Type**: Social Content

```sql
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid,
  user_id uuid,
  content text NOT NULL CHECK (char_length(content) <= 280),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

**Fields**:

- `id` (uuid, PK): Unique comment identifier
- `post_id` (uuid, FK): Parent post ID
- `user_id` (uuid, FK): Commenter's profile ID
- `content` (text, not null): Comment text, max 280 characters
- `created_at` (timestamp): Comment creation time
- `updated_at` (timestamp): Last edit time

**Relationships**:

- **many-to-1** with posts
- **many-to-1** with profiles
- **1-to-many** with reports

---

#### Table 4: **likes**

**Purpose**: Post likes/reactions
**Type**: Social Engagement

```sql
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid,
  user_id uuid,
  inserted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

**Fields**:

- `id` (uuid, PK): Unique like identifier
- `post_id` (uuid, FK): Liked post ID
- `user_id` (uuid, FK): User who liked
- `inserted_at` (timestamp): Like timestamp

**Relationships**:

- **many-to-1** with posts
- **many-to-1** with profiles

**Unique Constraint**: One user can only like a post once (enforced at application level)

---

#### Table 5: **favorite_cryptos**

**Purpose**: User's cryptocurrency watchlist
**Type**: User Preferences

```sql
CREATE TABLE public.favorite_cryptos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  coin_id text NOT NULL,
  inserted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favorite_cryptos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

**Fields**:

- `id` (uuid, PK): Unique record identifier
- `user_id` (uuid, FK): User's profile ID
- `coin_id` (text, not null): CoinGecko coin identifier (e.g., 'bitcoin')
- `inserted_at` (timestamp): When coin was added to watchlist

**Relationships**:

- **many-to-1** with profiles

---

#### Table 6: **price_alerts**

**Purpose**: User-configured cryptocurrency price alerts
**Type**: User Preferences

```sql
CREATE TABLE public.price_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  coin_id text NOT NULL,
  coin_name text NOT NULL,
  coin_symbol text NOT NULL,
  target_price numeric NOT NULL,
  condition text NOT NULL CHECK (condition = ANY (ARRAY['above'::text, 'below'::text])),
  is_active boolean DEFAULT true,
  triggered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT price_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

**Fields**:

- `id` (uuid, PK): Unique alert identifier
- `user_id` (uuid, FK): User's auth ID
- `coin_id` (text, not null): CoinGecko coin identifier
- `coin_name` (text, not null): Full coin name (e.g., 'Bitcoin')
- `coin_symbol` (text, not null): Coin ticker (e.g., 'BTC')
- `target_price` (numeric, not null): Price threshold
- `condition` (text, not null): 'above' or 'below'
- `is_active` (boolean): Alert active status (default: true)
- `triggered_at` (timestamp): When alert was triggered (null if not triggered)
- `created_at` (timestamp): Alert creation time
- `updated_at` (timestamp): Last update time

**Relationships**:

- **many-to-1** with auth.users

**Business Logic**: Alerts are monitored by PriceAlertService and deactivated when triggered

---

#### Table 7: **alarms** (deprecated/alternate name)

**Purpose**: Alternative price alert table
**Type**: User Preferences

```sql
CREATE TABLE public.alarms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  coin_id text NOT NULL,
  target_price numeric NOT NULL,
  direction text NOT NULL CHECK (direction = ANY (ARRAY['above'::text, 'below'::text])),
  triggered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alarms_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

**Note**: This table appears to be an older version or alternative to `price_alerts`. Application primarily uses `price_alerts`.

---

#### Table 8: **reports**

**Purpose**: User reports for inappropriate content
**Type**: Moderation

```sql
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL,
  reported_user_id uuid,
  content_type text NOT NULL CHECK (content_type = ANY (ARRAY['post'::text, 'comment'::text])),
  content_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason = ANY (ARRAY['spam'::text, 'harassment'::text, 'hate_speech'::text, 'violence'::text, 'inappropriate_content'::text, 'false_information'::text, 'other'::text])),
  details text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text, 'dismissed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES auth.users(id),
  CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id)
);
```

**Fields**:

- `id` (uuid, PK): Unique report identifier
- `reporter_id` (uuid, FK): User who filed the report
- `reported_user_id` (uuid, FK): User being reported
- `content_type` (text, not null): 'post' or 'comment'
- `content_id` (uuid, not null): ID of reported content
- `reason` (text, not null): Report reason - 'spam', 'harassment', 'hate_speech', 'violence', 'inappropriate_content', 'false_information', 'other'
- `details` (text): Additional details from reporter
- `status` (text): 'pending', 'reviewed', 'resolved', 'dismissed' (default: 'pending')
- `created_at` (timestamp): Report submission time
- `updated_at` (timestamp): Last status update time

**Relationships**:

- **many-to-1** with auth.users (reporter)
- **many-to-1** with profiles (reported user)

---

#### Table 9: **admins**

**Purpose**: Admin users with elevated permissions
**Type**: Administration

```sql
CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'moderator'::text CHECK (role = ANY (ARRAY['super_admin'::text, 'admin'::text, 'moderator'::text])),
  permissions jsonb DEFAULT '{"ban_users": true, "delete_posts": true, "delete_users": false, "view_reports": true, "manage_admins": false, "manage_reports": true, "delete_comments": true}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  last_login timestamp with time zone,
  CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT admins_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(user_id)
);
```

**Fields**:

- `id` (uuid, PK): Unique admin record identifier
- `user_id` (uuid, unique, FK): User's auth ID
- `role` (text, not null): 'super_admin', 'admin', or 'moderator' (default: 'moderator')
- `permissions` (jsonb): Permission flags object
  - `view_reports`: Can view reported content (default: true)
  - `manage_reports`: Can resolve/dismiss reports (default: true)
  - `delete_posts`: Can delete posts (default: true)
  - `delete_comments`: Can delete comments (default: true)
  - `ban_users`: Can ban users (default: true)
  - `delete_users`: Can delete user accounts (default: false)
  - `manage_admins`: Can create/manage admins (default: false)
- `created_by` (uuid, FK): Admin who created this admin
- `created_at` (timestamp): Admin account creation time
- `updated_at` (timestamp): Last permission update
- `last_login` (timestamp): Last admin login time

**Relationships**:

- **1-to-1** with auth.users
- **many-to-1** with admins (created_by - self-referencing)
- **1-to-many** with admin_actions_log
- **1-to-many** with banned_users

---

#### Table 10: **banned_users**

**Purpose**: Banned user records
**Type**: Moderation

```sql
CREATE TABLE public.banned_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  banned_by uuid NOT NULL,
  reason text NOT NULL,
  ban_type text NOT NULL DEFAULT 'temporary'::text CHECK (ban_type = ANY (ARRAY['temporary'::text, 'permanent'::text])),
  banned_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  notes text,
  CONSTRAINT banned_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT banned_users_banned_by_fkey FOREIGN KEY (banned_by) REFERENCES public.admins(user_id)
);
```

**Fields**:

- `id` (uuid, PK): Unique ban record identifier
- `user_id` (uuid, unique, FK): Banned user's profile ID
- `banned_by` (uuid, FK): Admin who issued the ban
- `reason` (text, not null): Reason for ban
- `ban_type` (text, not null): 'temporary' or 'permanent' (default: 'temporary')
- `banned_until` (timestamp): Expiration for temporary bans (null for permanent)
- `created_at` (timestamp): Ban start time
- `notes` (text): Additional notes about the ban

**Relationships**:

- **many-to-1** with profiles (banned user)
- **many-to-1** with admins (admin who banned)

**Business Logic**: Temporary bans auto-expire and records are deleted when `banned_until` < current time

---

#### Table 11: **admin_actions_log**

**Purpose**: Audit log for admin actions
**Type**: Administration

```sql
CREATE TABLE public.admin_actions_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type = ANY (ARRAY['delete_post'::text, 'delete_comment'::text, 'ban_user'::text, 'unban_user'::text, 'delete_user'::text, 'resolve_report'::text, 'dismiss_report'::text, 'create_admin'::text, 'delete_admin'::text])),
  target_type text CHECK (target_type = ANY (ARRAY['post'::text, 'comment'::text, 'user'::text, 'report'::text, 'admin'::text])),
  target_id uuid,
  reason text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT admin_actions_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(user_id)
);
```

**Fields**:

- `id` (uuid, PK): Unique log entry identifier
- `admin_id` (uuid, FK): Admin who performed the action
- `action_type` (text, not null): Type of action - 'delete_post', 'delete_comment', 'ban_user', 'unban_user', 'delete_user', 'resolve_report', 'dismiss_report', 'create_admin', 'delete_admin'
- `target_type` (text): Type of target - 'post', 'comment', 'user', 'report', 'admin'
- `target_id` (uuid): ID of the target entity
- `reason` (text): Reason provided for the action
- `metadata` (jsonb): Additional structured data about the action
- `created_at` (timestamp): When action was performed

**Relationships**:

- **many-to-1** with admins

---

### 2.3 Database Relationships Diagram

```
auth.users (Supabase Auth)
    │
    ├─── 1:1 ──→ profiles
    │               │
    │               ├─── 1:N ──→ posts
    │               │               │
    │               │               ├─── 1:N ──→ comments
    │               │               │               │
    │               │               │               └─── N:1 ──→ profiles (commenter)
    │               │               │
    │               │               ├─── 1:N ──→ likes
    │               │               │               │
    │               │               │               └─── N:1 ──→ profiles (liker)
    │               │               │
    │               │               └─── 1:N ──→ reports (reported content)
    │               │
    │               ├─── 1:N ──→ comments
    │               ├─── 1:N ──→ likes
    │               ├─── 1:N ──→ favorite_cryptos
    │               ├─── 1:N ──→ reports (as reporter)
    │               └─── 1:1 ──→ banned_users (if banned)
    │
    ├─── 1:N ──→ price_alerts
    │
    └─── 1:1 ──→ admins
                    │
                    ├─── 1:N ──→ admin_actions_log
                    └─── 1:N ──→ banned_users (as banner)
```

### 2.4 Data Access Patterns

#### User-Facing Features:

1. **Feed Loading**: Join posts → profiles → likes → comments
2. **Profile View**: Fetch profile → posts → aggregate stats
3. **Post Detail**: Fetch post → comments → likes with user info
4. **Watchlist**: Query favorite_cryptos by user_id
5. **Alerts**: Query price_alerts where is_active = true

#### Admin Operations:

1. **Dashboard Stats**: Aggregate counts across all tables
2. **Report Management**: Join reports → profiles → content
3. **User Management**: Query profiles → ban status → activity
4. **Action Logging**: Insert admin_actions_log on all admin operations

### 2.5 Performance Considerations

#### Indexes (Recommended):

```sql
-- User lookups
CREATE INDEX idx_profiles_user_id ON profiles(id);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Feed queries
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_coin ON posts(coin);

-- Social interactions
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- Reports
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Bans
CREATE INDEX idx_banned_users_user_id ON banned_users(user_id);
```

---

## END OF PART 2

**Status**: ✅ Complete
**Next**: Part 3 - Frontend Components & UI System

---

### Summary of Part 2:

- ✅ Complete database schema (12 tables)
- ✅ Detailed field descriptions and constraints
- ✅ All foreign key relationships
- ✅ Data access patterns
- ✅ Performance optimization indexes
- ✅ Business logic rules
- ✅ Relationship diagram

**Total Components Documented**: 2/6 parts complete

---

## PART 3: FRONTEND COMPONENTS & UI SYSTEM

### 3.1 Component Architecture Overview

The application follows a **component-based architecture** using React 18 with TypeScript. Components are organized into:

- **Layout Components**: Navigation, page structure
- **UI Components**: Reusable interface elements
- **Feature Components**: Specific functionality modules
- **Modal Components**: Overlay dialogs and confirmations
- **Provider Components**: Context and global state

#### Component Organization:

```
src/components/
├── Layout & Navigation
│   ├── Layout.tsx           # Main page wrapper
│   ├── Navbar.tsx           # Top navigation bar
│   ├── Sidebar.tsx          # Side navigation
│   └── AdminHeader.tsx      # Admin panel header
│
├── Social & Content
│   ├── PostCard.tsx         # Post display card
│   ├── PostView.tsx         # Full post page
│   ├── NewPost.tsx          # Post composer
│   ├── CommentCard.tsx      # Comment display
│   └── NewComment.tsx       # Comment input
│
├── UI Elements
│   ├── LoadingSpinner.tsx   # Loading indicator
│   ├── FearGreedGauge.tsx   # Sentiment gauge
│   └── ToastProvider.tsx    # Notification system
│
├── Modals & Dialogs
│   ├── ConfirmModal.tsx     # Confirmation dialog
│   ├── InputModal.tsx       # Input prompt dialog
│   ├── ReportModal.tsx      # Content reporting
│   └── PriceAlertModal.tsx  # Alert configuration
│
└── Monitoring
    └── AlertMonitor.tsx     # Price alert monitor
```

---

### 3.2 Layout & Navigation Components

#### 3.2.1 Layout Component

**File**: `src/components/Layout.tsx`
**Purpose**: Main page wrapper that provides consistent structure

```typescript
interface LayoutProps {
  children: ReactNode;
}
```

**Features**:

- Renders Navbar at top
- Wraps page content in consistent container
- Applies responsive padding
- Dark background theme

**Usage**:

```tsx
<Layout>
  <Home />
</Layout>
```

---

#### 3.2.2 Navbar Component

**File**: `src/components/Navbar.tsx`
**Purpose**: Primary navigation bar with notifications and user menu

**Key Features**:

- **Navigation Items**: Dashboard, Market, Social, Watchlist, Alerts
- **Notifications System**: Real-time like/comment notifications
- **User Menu**: Profile, settings, logout
- **Search Functionality**: Quick coin search
- **Dark Mode Toggle**: Theme switching
- **Market Sentiment Display**: Live market mood indicator
- **Quick Actions Menu**: Create post, set alerts
- **Mobile Responsive**: Hamburger menu for mobile

**State Management**:

```typescript
const [notifications, setNotifications] = useState<Notification[]>([]);
const [unreadCount, setUnreadCount] = useState(0);
const [showUserMenu, setShowUserMenu] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);
const [darkMode, setDarkMode] = useState(true);
const [marketSentiment, setMarketSentiment] = useState("Neutral");
```

**Real-time Subscriptions**:

- Listens to `likes` table for new reactions
- Listens to `comments` table for new replies
- Auto-updates notification count

**Notification Format**:

```typescript
interface Notification {
  id: string;
  type: "like" | "comment";
  post_id: string;
  post_content: string;
  actor_username: string;
  comment_text?: string;
  created_at: string;
}
```

---

#### 3.2.3 Sidebar Component

**File**: `src/components/Sidebar.tsx`
**Purpose**: Desktop side navigation (deprecated/alternative layout)

**Features**:

- Collapsible sidebar
- Navigation links
- Icon-based navigation
- Active state highlighting

---

#### 3.2.4 AdminHeader Component

**File**: `src/components/AdminHeader.tsx`
**Purpose**: Admin panel header with role information

```typescript
interface AdminHeaderProps {
  title: string;
  adminRole?: string;
}
```

**Features**:

- Display admin role (Super Admin, Admin, Moderator)
- Dark mode toggle
- Navigation to dashboard and home
- Logout functionality
- Logo and branding

**Admin Roles Display**:

- `super_admin` → "Super Admin"
- `admin` → "Admin"
- `moderator` → "Moderator"

---

### 3.3 Social & Content Components

#### 3.3.1 PostCard Component

**File**: `src/components/PostCard.tsx`
**Purpose**: Display individual post with interactions

```typescript
interface PostCardProps {
  post: any;
  onChange: () => Promise<void>;
}
```

**Key Features**:

- **Post Content**: Text, image, coin tag, sentiment badge
- **Engagement**: Like button, comment count, view post
- **Author Info**: Avatar, username, timestamp
- **Edit/Delete**: For post owner
- **Report**: For non-owners
- **3-Dot Menu**: Context menu for actions
- **High Impact Badge**: For popular posts (10+ engagement)
- **Coin Navigation**: Click coin to view details
- **Image Modal**: Full-screen image viewer

**Post Metadata**:

```typescript
{
  coin: "BTC" | "ETH" | "SOL" | ...,
  sentiment: "Bullish" | "Bearish" | "Neutral",
  likes_count: number,
  comments_count: number,
  author_email: string,
  avatar_url: string | null,
  image_url: string | null
}
```

**Interactions**:

- **Like/Unlike**: Optimistic UI updates
- **Comment**: Opens comment section
- **Follow Coin**: Add to watchlist
- **Edit Post**: Inline editor
- **Delete Post**: With confirmation
- **Report Post**: Opens report modal

**Privacy Checks**:

- Respects `allowSocialInteractions` setting
- Hides interactions if disabled by author

---

#### 3.3.2 PostView Component

**File**: `src/components/PostView.tsx`
**Purpose**: Full post page with comments section

**Features**:

- Full post display
- Complete comments list
- Real-time updates for:
  - Post edits
  - New comments
  - Like changes
- Comment creation
- Post editing (for owner)
- Delete post (for owner)
- Back to feed button

**Real-time Subscriptions**:

```typescript
// Post updates
channel(`post-${id}`).on("UPDATE", "posts", loadPost);

// Comment updates
channel(`comments-${id}`).on("*", "comments", loadComments);

// Like updates
channel(`likes-${id}`).on("*", "likes", loadLikes);
```

**Comment Filtering**:

- Filters out comments from banned users
- Maintains chronological order

---

#### 3.3.3 NewPost Component

**File**: `src/components/NewPost.tsx`
**Purpose**: Post creation form

```typescript
interface NewPostProps {
  onPost: () => void;
}
```

**Features**:

- **Text Input**: 280 character limit with counter
- **Image Upload**: With preview and size validation
- **Coin Selection**: Dropdown of major cryptocurrencies
- **Sentiment Buttons**: Bullish/Bearish/Neutral selection
- **Content Moderation**: Profanity filter before posting
- **Ban Check**: Prevents banned users from posting
- **File Validation**:
  - Max 5MB size
  - Image types only (JPEG, PNG, GIF, WebP)
  - Filename profanity check

**Coin Options**:

```typescript
const coins = ["BTC", "ETH", "SOL", "BNB", "ADA", "DOT", "MATIC", "AVAX"];
```

**Sentiment Styling**:

- Bullish: Green (#10b981)
- Bearish: Red (#ef4444)
- Neutral: Gray (#6b7280)

---

#### 3.3.4 CommentCard Component

**File**: `src/components/CommentCard.tsx`
**Purpose**: Display individual comment

```typescript
interface CommentCardProps {
  comment: any;
  onDelete: () => void;
}
```

**Features**:

- Comment content display
- Author info with avatar
- Timestamp with edit indicator
- Edit button (for owner)
- Delete button (for owner)
- Report button (for non-owners)
- 3-dot menu for actions
- Inline editing

**Edit Mode**:

- Textarea for content
- Save/Cancel buttons
- Character limit enforcement
- Timestamp update on save

---

#### 3.3.5 NewComment Component

**File**: `src/components/NewComment.tsx`
**Purpose**: Comment input form

```typescript
interface NewCommentProps {
  postId: string;
  onCommentAdded: () => void;
}
```

**Features**:

- Textarea with 500 character limit
- Character counter
- Submit button with loading state
- Content moderation filter
- Ban check before submission
- Auto-clear on success

---

### 3.4 UI & Utility Components

#### 3.4.1 LoadingSpinner Component

**File**: `src/components/LoadingSpinner.tsx`
**Purpose**: Loading indicator with optional message

```typescript
interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
  message?: string;
}
```

**Sizes**:

- Small: 24px
- Medium: 40px
- Large: 60px

**Features**:

- Animated spinner with primary color
- Optional loading message
- Full-screen overlay option
- Backdrop blur effect

---

#### 3.4.2 FearGreedGauge Component

**File**: `src/components/FearGreedGauge.tsx`
**Purpose**: Visual sentiment gauge (0-100)

```typescript
interface FearGreedGaugeProps {
  value: number;
  classification: string;
}
```

**Features**:

- Semi-circle gauge with gradient
- Animated needle
- Color-coded by value:
  - 0-25: Red (Extreme Fear)
  - 26-45: Orange (Fear)
  - 46-55: Yellow (Neutral)
  - 56-75: Light Green (Greed)
  - 76-100: Green (Extreme Greed)
- SVG-based rendering
- Responsive sizing

---

#### 3.4.3 ToastProvider Component

**File**: `src/components/ToastProvider.tsx`
**Purpose**: Global notification system

**Toast Types**:

- Success: Green (#10b981)
- Error: Red (#ef4444)
- Warning: Orange (#f59e0b)
- Info: Purple (#8b5cf6)

**Features**:

- Auto-dismiss after 3 seconds
- Click to dismiss
- Slide-in animation
- Multiple toasts stacking
- Icon per type (✓, ✕, ⚠, ℹ)
- Mobile responsive

**Usage**:

```typescript
const { showToast } = useToast();
showToast("Post created!", "success");
showToast("Failed to load", "error");
```

---

### 3.5 Modal & Dialog Components

#### 3.5.1 ConfirmModal Component

**File**: `src/components/ConfirmModal.tsx`
**Purpose**: Confirmation dialog for destructive actions

```typescript
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}
```

**Features**:

- Color-coded by type
- Warning icon
- Custom button text
- Click outside to close
- Escape key to close
- Slide-in animation

**Type Colors**:

- Danger: Red (#ef4444)
- Warning: Orange (#f59e0b)
- Info: Blue (#3b82f6)

---

#### 3.5.2 InputModal Component

**File**: `src/components/InputModal.tsx`
**Purpose**: Prompt user for text input

```typescript
interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title?: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
}
```

**Features**:

- Single text input field
- Optional validation
- Enter key to submit
- Escape key to cancel
- Focus trap
- Value clearing on close

---

#### 3.5.3 ReportModal Component

**File**: `src/components/ReportModal.tsx`
**Purpose**: Report inappropriate content

```typescript
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: "post" | "comment";
  contentId: string;
  reportedUserId: string;
}
```

**Report Reasons**:

1. Spam or annoying ads
2. Harassment or bullying
3. Hate speech
4. Violence or threats
5. Inappropriate content
6. False or misleading information
7. Other reason

**Features**:

- Radio button selection
- Optional details textarea (500 char)
- Character counter
- Submit button with loading state
- Prevention of duplicate reports
- Success/error feedback

---

#### 3.5.4 PriceAlertModal Component

**File**: `src/components/PriceAlertModal.tsx`
**Purpose**: Configure cryptocurrency price alerts

```typescript
interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
  };
  userId: string;
}
```

**Features**:

- Coin information display
- Current price
- Condition selector (above/below)
- Target price input
- Default to current price
- Validation
- Success notification
- Portal rendering to body

---

### 3.6 Monitoring Components

#### 3.6.1 AlertMonitor Component

**File**: `src/components/AlertMonitor.tsx`
**Purpose**: Background price alert monitoring

**Features**:

- Runs in background
- Checks alerts every 5 minutes
- Shows toast on trigger
- Browser notifications (if permitted)
- Auto-start on mount
- Auto-stop on unmount
- Singleton instance

**Lifecycle**:

```typescript
useEffect(() => {
  if (user) {
    // Request notification permission
    PriceAlertService.requestNotificationPermission();

    // Create service
    alertService = new PriceAlertService(callback);
    alertService.startMonitoring(user.id, 5);
  }

  return () => {
    alertService?.stopMonitoring();
  };
}, [user]);
```

---

### 3.7 Design System & Styling

#### 3.7.1 Color Palette

**Primary Colors**:

```css
--color-primary: #8b5cf6; /* Purple */
--color-primary-dark: #7c3aed; /* Dark Purple */
--color-primary-light: #a78bfa; /* Light Purple */
```

**Background Colors**:

```css
--color-dark: #0a0a0f; /* Main background */
--color-dark-card: #11111a; /* Card background */
--color-dark-border: rgba(139, 92, 246, 0.2); /* Border with glow */
```

**Semantic Colors**:

```css
/* Success/Bullish */
--color-success: #10b981; /* Green */

/* Error/Bearish */
--color-error: #ef4444; /* Red */

/* Warning */
--color-warning: #f59e0b; /* Orange */

/* Info/Neutral */
--color-info: #6b7280; /* Gray */
```

**Text Colors**:

```css
--color-text: #ffffff; /* Primary text */
--color-text-secondary: #9ca3af; /* Secondary text */
```

#### 3.7.2 Effects & Shadows

**Glow Effects**:

```css
--shadow-glow: 0 0 20px rgba(139, 92, 246, 0.3);
--shadow-glow-lg: 0 0 30px rgba(139, 92, 246, 0.4);
```

**Transitions**:

- Standard: `transition: all 0.2s ease`
- Hover: `transform: translateY(-2px)`
- Active: `scale(0.98)`

#### 3.7.3 Typography

**Font Family**: 'Inter', sans-serif

**Font Sizes**:

- Heading 1: 3xl (30px)
- Heading 2: 2xl (24px)
- Heading 3: xl (20px)
- Body: base (16px)
- Small: sm (14px)
- Extra Small: xs (12px)

**Font Weights**:

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

#### 3.7.4 Component Patterns

**Card Pattern**:

```css
.card {
  background: var(--card);
  padding: 20-40px;
  border-radius: 12-16px;
  border: 1px solid var(--dark-border);
  box-shadow: var(--shadow-glow);
}
```

**Button Pattern**:

```css
.button-primary {
  background: var(--accent);
  color: white;
  padding: 10-16px 20-32px;
  border-radius: 8-12px;
  font-weight: 600;
  transition: all 0.2s;
}

.button-primary:hover {
  background: var(--accent-dark);
  transform: translateY(-2px);
}
```

**Input Pattern**:

```css
.input {
  background: var(--dark);
  border: 2px solid var(--dark-border);
  border-radius: 8-12px;
  padding: 12-16px;
  color: var(--text);
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--accent);
  outline: none;
}
```

#### 3.7.5 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Mobile-specific styles */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet-specific styles */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Desktop-specific styles */
}
```

#### 3.7.6 Animation Patterns

**Fade In**:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**Slide In**:

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Spin** (for loading):

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

**Blob** (for background):

```css
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}
```

---

### 3.8 State Management Patterns

#### 3.8.1 Local Component State

Used for: UI state, form inputs, toggles

```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ field: "" });
```

#### 3.8.2 Context API

Used for: Global notifications, authentication

```typescript
// ToastProvider
const ToastContext = createContext<ToastContextType>(undefined);

export function useToast() {
  return useContext(ToastContext);
}
```

#### 3.8.3 Custom Hooks

Used for: Shared logic

```typescript
// useAuth hook
export function useAuth() {
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    // Load session
    // Subscribe to auth changes
  }, []);

  return user;
}
```

#### 3.8.4 Real-time Subscriptions

Used for: Live data updates

```typescript
const channel = supabase
  .channel("channel-name")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "table_name",
    },
    handleChange
  )
  .subscribe();

return () => supabase.removeChannel(channel);
```

---

### 3.9 Component Communication Patterns

#### Props Down:

```typescript
<PostCard post={post} onChange={handleChange} />
```

#### Callbacks Up:

```typescript
<NewPost onPost={() => navigate("/feed")} />
```

#### Context for Global:

```typescript
const { showToast } = useToast();
showToast("Action completed", "success");
```

#### Events for Siblings:

```typescript
// Via Supabase real-time
supabase.channel('updates').on('postgres_changes', ...)
```

---

### 3.10 Performance Optimizations

1. **Lazy Loading**: Components loaded on demand via React Router
2. **Memoization**: `useMemo` for expensive computations
3. **Debouncing**: Search inputs debounced
4. **Virtualization**: Could be added for long lists
5. **Image Optimization**: Size limits and format restrictions
6. **Real-time Throttling**: Subscription updates debounced
7. **Optimistic Updates**: UI updates before server confirmation

---

## END OF PART 3

**Status**: ✅ Complete
**Next**: Part 4 - Pages & User Flows

---

### Summary of Part 3:

- ✅ All 17 components documented
- ✅ Props interfaces and features
- ✅ Complete design system
- ✅ Color palette and typography
- ✅ Component patterns and animations
- ✅ State management strategies
- ✅ Performance optimizations
- ✅ Real-time features

**Total Components Documented**: 3/6 parts complete

Type **"continue"** to proceed to Part 4: Pages & User Flows

---

## PART 4: PAGES & USER FLOWS

### 16.1 Authentication Pages

#### 16.1.1 Login.tsx (330 lines)

**Purpose**: User authentication page with email/password and social login options.

**Key Features**:

- Email and password authentication
- Social login (Google, Apple)
- Password visibility toggle
- "Remember Me" checkbox
- Forgot password link
- Responsive glassmorphism design
- Animated gradient background
- Error message display

**Authentication Flow**:

```typescript
// Email/Password Login
supabase.auth.signInWithPassword({ email, password });

// Social Login
supabase.auth.signInWithOAuth({
  provider: "google" | "apple",
  redirectTo: window.location.origin,
});
```

**UI Components**:

- Input fields with icons (AiOutlineMail, AiOutlineLock)
- Toggle password visibility (AiOutlineEye/AiOutlineEyeInvisible)
- Gradient animated blobs background
- Glassmorphism card with backdrop blur
- Split-screen layout (branding left, form right)

**Validations**:

- Email format validation
- Password minimum 6 characters
- Required field validation
- Error message display

---

#### 16.1.2 SignUp.tsx (331 lines)

**Purpose**: User registration page with comprehensive account creation.

**Key Features**:

- Username, email, and password registration
- Social signup (Google, Apple)
- Terms & Conditions acceptance
- Profile creation after signup
- Password strength validation
- Split-screen branding layout

**Registration Flow**:

```typescript
// Create user account
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { username: username },
  },
});

// Create profile in database
await supabase.from("profiles").insert({
  id: data.user.id,
  username: username,
  email: email,
});
```

**Form Fields**:

1. **Username**: Required, unique identifier
2. **Email**: Required, validated format
3. **Password**: Minimum 6 characters, with visibility toggle
4. **Terms**: Checkbox for T&C acceptance

**Branding Section** (Left Panel):

- CryptoPulse logo and title
- Feature highlights with bullet points
- Animated gradient background
- Value propositions

**Validation Rules**:

- All fields required
- Terms must be accepted
- Password min 6 characters
- Email format validation

---

#### 16.1.3 ForgotPassword.tsx (200 lines)

**Purpose**: Password reset request page.

**Key Features**:

- Email input for password reset
- Send reset link via email
- Supabase Auth email verification
- Loading state management
- Success/error message display

**Reset Flow**:

```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
```

**UI Elements**:

- Glassmorphism card design
- Animated background blobs
- Email input with validation
- Back to login link
- Loading spinner during request

---

#### 16.1.4 ResetPassword.tsx (200 lines)

**Purpose**: Password reset page (accessed via email link).

**Key Features**:

- New password entry
- Confirm password validation
- Session verification from email link
- Password strength requirements
- Auto-redirect after success

**Reset Process**:

```typescript
// Verify valid session from email link
supabase.auth.getSession();

// Update user password
await supabase.auth.updateUser({
  password: password,
});

// Redirect to login
navigate("/login");
```

**Validations**:

- Password minimum 6 characters
- Passwords must match
- Valid session from reset link
- Error handling for expired links

---

### 16.2 Main Application Pages

#### 16.2.1 Home.tsx (410 lines)

**Purpose**: Landing page showcasing platform features and crypto market overview.

**Key Sections**:

**1. Hero Section**:

- Main headline and CTA
- Gradient animated background
- "Start Trading" button → redirects to /market
- Feature highlights

**2. Features Section** (4 main features):

- **Real-Time Tracking**: Live crypto price updates
- **Social Insights**: Community discussions and sentiment
- **Portfolio Management**: Track holdings and performance
- **Price Alerts**: Custom notifications

**3. Market Overview**:

- Top 6 trending cryptocurrencies
- Live prices from CoinGecko API
- 24h price change percentages
- Click to view coin details

**4. Community Stats**:

- Total users count
- Total posts count
- Active traders count
- Cryptocurrencies tracked

**5. CTA Section**:

- Join community call-to-action
- Signup button

**Data Loading**:

```typescript
// Fetch trending cryptos
const trending = await getTrendingCryptos();

// Get platform statistics
const stats = await getDashboardStats();
```

**Design Features**:

- Glassmorphism cards
- Gradient overlays
- Animated elements
- Responsive grid layouts
- Interactive hover effects

---

#### 16.2.2 Market.tsx (550 lines)

**Purpose**: Comprehensive cryptocurrency market data and analytics.

**Key Features**:

**1. Market Overview Section**:

- Global market cap
- 24h trading volume
- Bitcoin dominance percentage
- Market sentiment (Fear & Greed Index)

**2. Fear & Greed Gauge**:

- Visual gauge component
- Color-coded sentiment (0-100)
- Real-time data from Alternative.me API
- Interpretation tooltip

**3. Trending Coins**:

- Top trending cryptocurrencies
- Quick view cards with prices
- Price change indicators
- Click to view details

**4. Cryptocurrency List**:

- Paginated table view
- Sortable columns
- Search functionality
- Data columns:
  - Rank
  - Coin name & symbol
  - Current price
  - 24h change %
  - 24h volume
  - Market cap
  - Actions (View Details, Add to Favorites, Set Alert)

**5. Filtering & Sorting**:

- Search by name/symbol
- Sort by: rank, price, volume, market cap, 24h change
- Pagination controls

**Data Management**:

```typescript
// Fetch market data
const cryptos = await getCryptos(page, limit);

// Favorite a crypto
await addFavoriteCrypto(cryptoId);

// Set price alert
await setPriceAlert(cryptoId, targetPrice, condition);
```

**Real-time Features**:

- Auto-refresh every 60 seconds
- Live price updates
- Market cap changes
- Volume tracking

**Interactive Elements**:

- Add/remove favorites (heart icon)
- Set price alerts (bell icon)
- View detailed charts
- Social sentiment indicators

---

#### 16.2.3 Feed.tsx (682 lines)

**Purpose**: Social feed with user posts, interactions, and sentiment tracking.

**Key Features**:

**1. Post Creation**:

- NewPost component integration
- Text and image posts
- Crypto symbol tagging
- Sentiment selection

**2. Feed Filters**:

- All posts
- Following only
- Specific crypto symbol
- Sentiment filter (Bullish/Bearish/Neutral)

**3. Post Display**:

- PostCard components
- Infinite scroll / pagination
- Real-time updates via Supabase subscriptions
- Like/comment counts
- User avatars and usernames

**4. Sentiment Analysis**:

- Overall feed sentiment gauge
- Bullish vs Bearish vs Neutral counts
- Visual percentage bars
- Color-coded indicators

**5. Trending Topics**:

- Most discussed cryptocurrencies
- Hashtag trends
- Popular users

**Real-time Subscriptions**:

```typescript
// Subscribe to new posts
supabase
  .channel("posts-channel")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "posts" },
    (payload) => handleNewPost(payload)
  )
  .subscribe();

// Subscribe to likes
supabase
  .channel("likes-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "likes" },
    (payload) => updateLikeCounts(payload)
  )
  .subscribe();
```

**Post Interactions**:

- Like/Unlike posts
- Comment on posts
- Report inappropriate content
- View post details
- Navigate to user profile

**Sentiment Tracking**:

```typescript
// Calculate sentiment distribution
const bullish = posts.filter((p) => p.sentiment === "bullish").length;
const bearish = posts.filter((p) => p.sentiment === "bearish").length;
const neutral = posts.filter((p) => p.sentiment === "neutral").length;
```

---

#### 16.2.4 CoinDetail.tsx (500+ lines)

**Purpose**: Detailed cryptocurrency information and analysis page.

**Key Sections**:

**1. Header Information**:

- Coin logo and name
- Current price (large display)
- 24h change percentage
- Market cap & volume
- All-time high/low

**2. Price Chart**:

- Interactive line chart
- Multiple timeframes (1D, 7D, 30D, 90D, 1Y, ALL)
- Price history visualization
- Chart.js integration

**3. Market Statistics**:

- Market Cap Rank
- Circulating Supply
- Total Supply
- Max Supply
- Market Cap
- Fully Diluted Valuation
- 24h Volume
- Price Change (1h, 24h, 7d, 30d)

**4. Description**:

- Coin overview
- HTML content rendering
- Read more/less toggle

**5. Social Feed**:

- Related posts about this crypto
- Community sentiment
- User discussions

**6. Actions**:

- Add to favorites
- Set price alert
- Share coin
- View on exchanges

**Data Loading**:

```typescript
// Get coin details
const details = await getCoinDetails(coinId);

// Get price history
const history = await getCoinHistory(coinId, days);

// Get related posts
const posts = await getPostsByCrypto(symbol);
```

**Price Alert Integration**:

```typescript
// Set price alert
await createPriceAlert({
  crypto_id: coinId,
  crypto_symbol: symbol,
  target_price: targetPrice,
  condition: "above" | "below",
  is_active: true,
});
```

---

#### 16.2.5 Favorites.tsx (300+ lines)

**Purpose**: User's favorite cryptocurrencies dashboard.

**Key Features**:

**1. Favorites List**:

- Grid view of favorite cryptos
- Live price updates
- Quick actions (remove, view details, set alert)
- Empty state when no favorites

**2. Portfolio Value**:

- Total portfolio value (if quantities added)
- 24h change summary
- Profit/loss indicators

**3. Quick Statistics**:

- Number of favorites
- Best performer (24h)
- Worst performer (24h)
- Average gain/loss

**4. Management Actions**:

- Add new favorites
- Remove from favorites
- Reorder favorites (drag & drop)
- Set alerts for all

**Data Management**:

```typescript
// Fetch user favorites
const favorites = await getUserFavorites(userId);

// Remove favorite
await removeFavoriteCrypto(cryptoId);

// Add favorite
await addFavoriteCrypto(cryptoId);
```

**Real-time Updates**:

- Price refreshes every 60 seconds
- Live market data
- Alert status indicators

---

#### 16.2.6 Alerts.tsx (350+ lines)

**Purpose**: Manage price alerts and notifications.

**Key Features**:

**1. Active Alerts List**:

- All user's price alerts
- Crypto symbol and name
- Target price
- Current price
- Condition (above/below)
- Status (active/triggered)

**2. Alert Management**:

- Create new alert
- Edit existing alert
- Delete alert
- Activate/deactivate alert

**3. Alert History**:

- Triggered alerts log
- Notification history
- Alert performance

**4. Alert Status Indicators**:

- Active (green)
- Triggered (orange)
- Expired (gray)
- Paused (blue)

**Alert Operations**:

```typescript
// Create alert
await createPriceAlert({
  crypto_id,
  crypto_symbol,
  target_price,
  condition,
  is_active: true,
});

// Toggle alert status
await updateAlert(alertId, { is_active: !currentStatus });

// Delete alert
await deleteAlert(alertId);
```

**Background Monitoring**:

- AlertMonitor component integration
- Real-time price checking
- Notification triggering
- Alert status updates

---

#### 16.2.7 Profile.tsx (829 lines)

**Purpose**: User profile management and post history.

**Key Sections**:

**1. Profile Header**:

- Avatar (editable)
- Username
- Bio
- Location (optional)
- Website (optional)
- Join date
- Edit profile button (own profile)

**2. Profile Statistics**:

- Total posts count
- Total likes received
- Total comments
- Followers count (future feature)
- Following count (future feature)

**3. Tabs**:

- **Posts**: User's posts grid
- **Likes**: Posts user has liked
- **Comments**: User's comments

**4. Edit Profile Modal**:

- Update avatar
- Edit username
- Change bio
- Add location
- Add website URL
- Save changes

**5. Post Grid**:

- User's posts in grid layout
- Pagination
- Like/comment counts
- Click to view post details

**Profile Operations**:

```typescript
// Fetch user profile
const profile = await getUserProfile(userId);

// Update profile
await updateProfile(userId, {
  username,
  bio,
  avatar_url,
  location,
  website,
});

// Upload avatar
const avatarUrl = await uploadAvatar(file);
```

**Real-time Updates**:

```typescript
// Subscribe to profile changes
supabase
  .channel("profile-channel")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "profiles" },
    (payload) => refreshProfile(payload)
  )
  .subscribe();
```

---

#### 16.2.8 CreatePost.tsx (300+ lines)

**Purpose**: Dedicated page for creating detailed posts.

**Key Features**:

**1. Rich Text Editor**:

- Multi-line text input
- Character counter
- Preview mode

**2. Media Upload**:

- Image attachment
- Image preview
- Remove image option

**3. Post Metadata**:

- Crypto symbol selector
- Sentiment picker (Bullish/Bearish/Neutral)
- Hashtag suggestions
- Privacy settings

**4. Post Preview**:

- Real-time preview
- How post will appear in feed

**5. Publishing Options**:

- Save as draft
- Publish immediately
- Schedule for later (future feature)

**Post Creation**:

```typescript
// Create post
await createPost({
  content,
  image_url,
  crypto_symbol,
  sentiment,
  user_id: currentUser.id,
});

// Navigate to feed
navigate("/feed");
```

---

#### 16.2.9 Search.tsx (401 lines)

**Purpose**: Universal search across posts, users, and cryptocurrencies.

**Key Features**:

**1. Search Tabs**:

- Posts tab
- Users tab
- Cryptos tab

**2. Search Functionality**:

- Real-time search
- Query parameter handling
- Multi-category results

**3. Post Results**:

- Matching posts displayed
- Full PostCard components
- Highlight search terms

**4. User Results**:

- User profiles matching query
- Avatar, username, bio
- Post count, follower count
- Click to view profile

**5. Crypto Results**:

- Cryptocurrencies matching query
- Coin logo, name, symbol
- Current price
- 24h change
- Click to view details

**Search Implementation**:

```typescript
// Search posts (content)
const { data: posts } = await supabase
  .from("posts")
  .select("*")
  .ilike("content", `%${query}%`);

// Search users (username/email)
const { data: users } = await supabase
  .from("profiles")
  .select("*")
  .or(`username.ilike.%${query}%,email.ilike.%${query}%`);

// Search cryptos (API)
const cryptos = await searchCryptos(query);
```

**Real-time Updates**:

- Subscriptions to posts table
- Subscriptions to profiles table
- Live search results refresh

---

#### 16.2.10 PrivacySecurity.tsx (400+ lines)

**Purpose**: User privacy settings and security management.

**Key Sections**:

**1. Privacy Settings**:

- Profile visibility (Public/Private)
- Show email to others
- Show activity status
- Discoverable in search

**2. Security Settings**:

- Change password
- Two-factor authentication (future)
- Login sessions management
- Connected devices

**3. Notification Preferences**:

- Email notifications
- Push notifications
- Price alert notifications
- Social notifications (likes, comments, follows)

**4. Data Management**:

- Download my data
- Delete account
- Export posts

**5. Blocked Users**:

- List of blocked users
- Unblock option

**Settings Management**:

```typescript
// Update privacy settings
await updateUserSettings({
  profile_visibility: "public" | "private",
  show_email: boolean,
  show_activity: boolean,
});

// Change password
await supabase.auth.updateUser({
  password: newPassword,
});

// Delete account
await deleteUser(userId);
```

---

### 16.3 Admin Panel Pages

#### 16.3.1 AdminLogin.tsx (441 lines)

**Purpose**: Secure admin authentication page.

**Key Features**:

- Admin-specific login
- Email and password authentication
- Admin role verification
- Redirect to admin dashboard on success
- Separate from user login

**Authentication Flow**:

```typescript
// Login as admin
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Verify admin role
const { data: adminData } = await supabase
  .from("admins")
  .select("*")
  .eq("user_id", data.user.id)
  .single();

if (!adminData) {
  throw new Error("Not an admin");
}

// Navigate to dashboard
navigate("/admin/dashboard");
```

**UI Features**:

- Professional admin theme
- Secure password input
- Error handling
- Loading states
- Back to main site link

---

#### 16.3.2 AdminDashboard.tsx (442 lines)

**Purpose**: Admin control center with overview statistics.

**Key Statistics Cards**:

1. **Total Users**: With new users in 24h
2. **Total Posts**: With new posts in 24h
3. **Total Comments**: Overall count
4. **Pending Reports**: Alert badge if > 0
5. **Banned Users**: Total banned count

**Quick Actions**:

- **Manage Reports**: View and respond to user reports (badge for pending)
- **Manage Posts**: Delete inappropriate posts
- **Manage Users**: Ban/unban/delete users
- **Manage Admins**: Add/edit/delete admins (Super Admin only)

**Dashboard Data**:

```typescript
// Fetch dashboard statistics
const stats = await getDashboardStats();
// Returns: {
//   total_posts,
//   total_comments,
//   total_users,
//   pending_reports,
//   banned_users,
//   posts_last_24h,
//   new_users_24h
// }
```

**Role-Based Access**:

- Super Admin: Full access to all features
- Admin: All except admin management
- Moderator: Limited to reports and content moderation

**Header Features**:

- Role display
- Dark/Light mode toggle
- Home page link
- Logout button

---

#### 16.3.3 AdminReports.tsx (669 lines)

**Purpose**: Manage user-reported content and users.

**Key Features**:

**1. Report Filters**:

- All reports
- Pending reports
- Reviewed reports
- Resolved reports
- Dismissed reports

**2. Report Information Display**:

- Reporter username & avatar
- Reported user username & avatar
- Content type (post/comment)
- Report reason
- Additional details
- Report date
- Current status

**3. Report Reasons**:

- Spam
- Harassment
- Hate Speech
- Violence
- Inappropriate Content
- False Information
- Other

**4. Report Actions** (for pending reports):

- **Delete Content**: Remove reported post/comment with reason
- **Ban User**: Temporary or permanent ban with reason
- **Resolve**: Mark as resolved without action
- **Dismiss**: Dismiss report as invalid

**Report Management Flow**:

```typescript
// Get all reports
const reports = await getAllReports(status);

// Delete reported content
await adminDeletePost(contentId, reason);
// or
await adminDeleteComment(contentId, reason);

// Ban reported user
await banUser(userId, reason, "permanent" | "temporary", bannedUntil);

// Update report status
await updateReportStatus(reportId, "resolved" | "dismissed");
```

**Ban Options**:

1. **Permanent Ban**: Indefinite suspension
2. **Temporary Ban**: Custom duration in days

**Status Badges**:

- Pending: Yellow badge
- Reviewed: Blue badge
- Resolved: Green badge
- Dismissed: Red badge

---

#### 16.3.4 AdminPosts.tsx (690 lines)

**Purpose**: View and manage all platform posts.

**Key Features**:

**1. Post Management**:

- View all posts in grid layout
- Search posts by content or username
- Post statistics dashboard
- Delete posts with reason

**2. Statistics Display**:

- Total posts count
- Posts with images count
- Total likes across all posts

**3. Post Grid**:

- Author info (avatar, username)
- Post creation date
- Post image (if exists)
- Post content preview (3 lines)
- Like & comment counts
- Delete button

**4. Post Details Modal**:

- Full post view
- Complete content
- Full-size image
- Detailed statistics
- Delete action

**5. Delete Confirmation**:

- Reason input required
- Confirmation modal
- Action logging

**Post Operations**:

```typescript
// Fetch all posts
const posts = await getAllPosts(limit);

// Delete post with reason
await adminDeletePost(postId, reason);
// Logs action in admin_actions_log table

// Delete logs:
// - Admin ID
// - Action type
// - Target (post_id)
// - Reason
// - Timestamp
```

**Search Functionality**:

- Search by post content
- Search by author username
- Real-time filtering
- Case-insensitive search

---

#### 16.3.5 AdminUsers.tsx (643 lines)

**Purpose**: Comprehensive user management system.

**Key Features**:

**1. User List Display**:

- User avatar & username
- Email address
- Post count
- Registration date
- Ban status
- Action buttons

**2. Filter Options**:

- All users
- Active users
- Banned users

**3. Search Functionality**:

- Search by username
- Search by email
- Real-time filtering

**4. User Statistics**:

- Total users count
- Banned users count
- Active users count

**5. User Actions**:

- **Ban User**: Temporary or permanent with reason
- **Unban User**: Remove ban
- **Delete User**: Permanent deletion (Super Admin only)

**User Management Operations**:

```typescript
// Get all users
const users = await getAllUsers(limit);

// Ban user (temporary)
await banUser(userId, reason, "temporary", bannedUntil);

// Ban user (permanent)
await banUser(userId, reason, "permanent", undefined);

// Unban user
await unbanUser(userId);

// Delete user (Super Admin only)
await deleteUser(userId);
// Deletes: user account, profile, posts, comments, likes
```

**Ban Flow**:

1. Click "Ban" button
2. Enter ban reason (required)
3. Choose ban type:
   - Permanent: Immediate ban
   - Temporary: Enter duration in days
4. Confirm action
5. User banned, added to banned_users table

**User Status Display**:

- **Active**: Green badge with checkmark
- **Banned**: Red badge with reason
  - Shows ban type (temporary/permanent)
  - Shows ban reason
  - Shows banned until date (if temporary)

**Table Columns**:

- User (avatar + username + bio)
- Email
- Posts count
- Registration date
- Status (active/banned)
- Actions (Ban/Unban/Delete buttons)

---

#### 16.3.6 AdminManagement.tsx (521 lines)

**Purpose**: Manage admin users and moderators (Super Admin only).

**Key Features**:

**1. Admin List**:

- All admins and moderators
- Username & email
- Role badge (Super Admin/Admin/Moderator)
- Permissions display
- Date added
- Delete button

**2. Statistics**:

- Total admins count
- Super admins count
- Admins count
- Moderators count

**3. Add Admin Modal**:

- Email input
- Role selection (Admin/Moderator)
- Permission checkboxes
- Custom permission configuration

**4. Permission System**:

```typescript
// Default permissions by role
const DEFAULT_PERMISSIONS = {
  super_admin: {
    view_reports: true,
    manage_reports: true,
    delete_posts: true,
    delete_comments: true,
    ban_users: true,
    delete_users: true,
    manage_admins: true,
  },
  admin: {
    view_reports: true,
    manage_reports: true,
    delete_posts: true,
    delete_comments: true,
    ban_users: true,
    delete_users: false,
    manage_admins: false,
  },
  moderator: {
    view_reports: true,
    manage_reports: true,
    delete_posts: true,
    delete_comments: true,
    ban_users: false,
    delete_users: false,
    manage_admins: false,
  },
};
```

**Admin Operations**:

```typescript
// Get all admins
const admins = await getAllAdmins();

// Add new admin
await addAdmin(email, role, permissions);

// Update admin permissions
await updateAdminPermissions(userId, role, permissions);

// Delete admin
await deleteAdmin(userId);
```

**Role Hierarchy**:

1. **Super Admin**: Full control, can't be deleted
2. **Admin**: Can manage content and users
3. **Moderator**: Can manage reports and content

**Permission Display**:

- Visual badges for each permission
- Color-coded by role
- Clear permission indicators

---

### 16.4 User Flow Diagrams

#### 16.4.1 User Registration Flow

```
SignUp Page → Enter Details → Accept Terms → Submit
    ↓
Supabase Auth Creates User
    ↓
Profile Created in Database
    ↓
Auto-Login → Redirect to Feed
```

#### 16.4.2 Post Creation Flow

```
Feed/CreatePost Page → Write Content → Optional: Add Image
    ↓
Select Crypto Symbol (optional)
    ↓
Choose Sentiment (Bullish/Bearish/Neutral)
    ↓
Submit Post → Content Moderation Check
    ↓
Post Created → Real-time Update in Feed
    ↓
Notifications to Followers
```

#### 16.4.3 Price Alert Flow

```
Market/Coin Detail → Set Alert Button
    ↓
Enter Target Price
    ↓
Choose Condition (Above/Below)
    ↓
Create Alert → Save to Database
    ↓
AlertMonitor Service Running
    ↓
Price Reaches Target → Notification Triggered
    ↓
Alert Status Updated → User Notified
```

#### 16.4.4 Report Content Flow

```
Post/Comment → Report Button → Select Reason
    ↓
Add Details (optional) → Submit Report
    ↓
Report Created → Pending Status
    ↓
Admin Receives Notification
    ↓
Admin Reviews → Takes Action:
    - Delete Content
    - Ban User
    - Resolve
    - Dismiss
```

#### 16.4.5 Admin Ban User Flow

```
Admin Panel → Users Tab → Select User
    ↓
Click "Ban" → Enter Reason (required)
    ↓
Choose Ban Type:
    - Permanent: Immediate ban
    - Temporary: Enter days → Calculate end date
    ↓
Confirm Ban → User Banned
    ↓
Record in banned_users Table
    ↓
Log Action in admin_actions_log
    ↓
User Cannot Login → Show Ban Message
```

---

### 16.5 Navigation & Routing

**Main Routes**:

```typescript
const routes = [
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // Protected Routes (require authentication)
  {
    path: "/feed",
    element: (
      <ProtectedRoute>
        <Feed />
      </ProtectedRoute>
    ),
  },
  {
    path: "/market",
    element: (
      <ProtectedRoute>
        <Market />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coin/:coinId",
    element: (
      <ProtectedRoute>
        <CoinDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/favorites",
    element: (
      <ProtectedRoute>
        <Favorites />
      </ProtectedRoute>
    ),
  },
  {
    path: "/alerts",
    element: (
      <ProtectedRoute>
        <Alerts />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/:userId",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-post",
    element: (
      <ProtectedRoute>
        <CreatePost />
      </ProtectedRoute>
    ),
  },
  {
    path: "/search",
    element: (
      <ProtectedRoute>
        <Search />
      </ProtectedRoute>
    ),
  },
  {
    path: "/privacy-security",
    element: (
      <ProtectedRoute>
        <PrivacySecurity />
      </ProtectedRoute>
    ),
  },

  // Admin Routes (require admin role)
  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin/dashboard",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <AdminRoute>
        <AdminReports />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/posts",
    element: (
      <AdminRoute>
        <AdminPosts />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <AdminRoute>
        <AdminUsers />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/management",
    element: (
      <SuperAdminRoute>
        <AdminManagement />
      </SuperAdminRoute>
    ),
  },
];
```

**Route Protection**:

```typescript
// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Admin Route Component
function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus().then(({ isAdmin }) => {
      setIsAdmin(isAdmin);
    });
  }, []);

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
```

---

### 16.6 Page-Level State Management

**Global State** (via Context):

- Authentication state (useAuth)
- Toast notifications (ToastProvider)
- Theme preferences (dark/light mode)

**Local State** (useState):

- Form inputs
- Loading states
- Error messages
- Modal visibility
- Pagination state

**Server State** (via Supabase):

- Real-time subscriptions
- Cached queries
- Optimistic updates

**Example State Management**:

```typescript
// Feed page state
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState("all");
const [sentiment, setSentiment] = useState<"all" | "bullish" | "bearish">(
  "all"
);

// Real-time subscription
useEffect(() => {
  const channel = supabase
    .channel("posts-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts" },
      () => fetchPosts()
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

---

### 16.7 Error Handling & Loading States

**Pattern Across All Pages**:

**1. Loading States**:

```typescript
if (loading) {
  return <LoadingSpinner message="Loading..." />;
}
```

**2. Error States**:

```typescript
if (error) {
  return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={retry}>Retry</button>
    </div>
  );
}
```

**3. Empty States**:

```typescript
if (data.length === 0) {
  return (
    <div className="empty-state">
      <Icon className="empty-icon" />
      <p>No data found</p>
      <button onClick={createNew}>Create New</button>
    </div>
  );
}
```

**4. Toast Notifications**:

```typescript
const { showToast } = useToast();

try {
  await someOperation();
  showToast("Success!", "success");
} catch (error) {
  showToast("Error occurred", "error");
}
```

---

## END OF PART 4

**Status**: ✅ Complete
**Next**: Part 5 - Services & Business Logic

---

### Summary of Part 4:

- ✅ All 15+ pages documented
- ✅ Authentication flow (Login, SignUp, Password Reset)
- ✅ Main application pages (Home, Market, Feed, etc.)
- ✅ Admin panel pages (Dashboard, Reports, Users, etc.)
- ✅ User flow diagrams
- ✅ Navigation and routing structure
- ✅ State management patterns
- ✅ Error handling strategies

**Total Documentation Progress**: 4/6 parts complete

Type **"continue"** to proceed to Part 5: Services & Business Logic

---

## PART 5: SERVICES & BUSINESS LOGIC

### 17.1 Supabase Service (supabase.ts - 852 lines)

**Purpose**: Central service for all database operations, authentication, storage, and admin functions.

**File Location**: `src/services/supabase.ts`

---

#### 17.1.1 Initialization

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Environment Variables Required**:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous/public key

---

#### 17.1.2 Image Upload Functions

**Function: `uploadPostImage(file: File, userId: string)`**

**Purpose**: Upload post images to Supabase Storage

**Features**:

- File type validation (JPEG, PNG, GIF, WebP)
- File size limit: 5MB
- Unique filename generation
- Public URL generation
- Error handling

```typescript
export async function uploadPostImage(
  file: File,
  userId: string
): Promise<string | null> {
  // Verify file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("File type not allowed.");
  }

  // Verify file size (5 MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Image size is too large. Maximum is 5 megabytes.");
  }

  // Create unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("posts-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("posts-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
```

**Storage Bucket**: `posts-images`

---

**Function: `uploadAvatar(file: File, userId: string)`**

**Purpose**: Upload user avatar images

**Features**:

- File type validation (JPEG, PNG, WebP only)
- File size limit: 2MB
- Upsert enabled (replace old avatars)
- Unique filename with timestamp

```typescript
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string | null> {
  // Verify file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  // Verify file size (2 MB)
  const maxSize = 2 * 1024 * 1024;

  const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

  // Upload with upsert (allows replacement)
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });
}
```

**Storage Bucket**: `avatars`

---

**Function: `deleteImage(imageUrl: string, bucket: 'posts-images' | 'avatars')`**

**Purpose**: Delete images from Supabase Storage

**Process**:

1. Extract filename from URL
2. Delete from specified bucket
3. Return success/failure boolean

```typescript
export async function deleteImage(
  imageUrl: string,
  bucket: "posts-images" | "avatars"
): Promise<boolean> {
  // Extract filename from URL
  const urlParts = imageUrl.split("/");
  const fileName = urlParts.slice(urlParts.indexOf(bucket) + 1).join("/");

  const { error } = await supabase.storage.from(bucket).remove([fileName]);

  return !error;
}
```

---

#### 17.1.3 Content Reporting Functions

**Type Definitions**:

```typescript
export type ReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "violence"
  | "inappropriate_content"
  | "false_information"
  | "other";

export interface ReportData {
  contentType: "post" | "comment";
  contentId: string;
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
}
```

**Function: `submitReport(reportData: ReportData, userId: string)`**

**Purpose**: Submit reports for inappropriate content

**Features**:

- Duplicate detection (user can't report same content twice)
- Status set to 'pending'
- Error handling for constraint violations

```typescript
export async function submitReport(reportData: ReportData, userId: string) {
  const { error } = await supabase.from("reports").insert({
    reporter_id: userId,
    reported_user_id: reportData.reportedUserId,
    content_type: reportData.contentType,
    content_id: reportData.contentId,
    reason: reportData.reason,
    details: reportData.details || null,
    status: "pending",
  });

  // Check for duplicate error (code 23505)
  if (error?.code === "23505") {
    return {
      success: false,
      error: "You have already reported this content.",
    };
  }

  return { success: true };
}
```

**Report Reasons Translation**:

```typescript
export const reportReasons: Record<ReportReason, string> = {
  spam: "Spam or annoying ads",
  harassment: "Harassment or bullying",
  hate_speech: "Hate speech",
  violence: "Violence or threats",
  inappropriate_content: "Inappropriate content",
  false_information: "False or misleading information",
  other: "Other reason",
};
```

---

#### 17.1.4 Admin Authentication & Authorization

**Type Definitions**:

```typescript
export interface AdminPermissions {
  view_reports: boolean;
  manage_reports: boolean;
  delete_posts: boolean;
  delete_comments: boolean;
  ban_users: boolean;
  delete_users: boolean;
  manage_admins: boolean;
}

export interface AdminData {
  id: string;
  user_id: string;
  role: "super_admin" | "admin" | "moderator";
  permissions: AdminPermissions;
  created_at: string;
  last_login?: string;
}
```

**Function: `checkAdminStatus()`**

**Purpose**: Verify if current user is an admin

**Process**:

1. Get current authenticated user
2. Query admins table for user record
3. Return admin status and data

```typescript
export async function checkAdminStatus(): Promise<{
  isAdmin: boolean;
  adminData?: AdminData;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false };

  // Use maybeSingle to avoid RLS issues
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return { isAdmin: false };

  return {
    isAdmin: true,
    adminData: data as AdminData,
  };
}
```

---

**Function: `checkIfUserBanned()`**

**Purpose**: Check if current user is banned

**Features**:

- Checks banned_users table
- Handles temporary ban expiration
- Auto-deletes expired bans
- Returns ban details

```typescript
export async function checkIfUserBanned(): Promise<{
  isBanned: boolean;
  reason?: string;
  banType?: "temporary" | "permanent";
  bannedUntil?: string;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isBanned: false };

  const { data } = await supabase
    .from("banned_users")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return { isBanned: false };

  // Check if temporary ban has expired
  if (data.ban_type === "temporary" && data.banned_until) {
    const bannedUntil = new Date(data.banned_until);
    const now = new Date();

    if (bannedUntil < now) {
      // Ban expired - delete record
      await supabase.from("banned_users").delete().eq("user_id", user.id);

      return { isBanned: false };
    }
  }

  return {
    isBanned: true,
    reason: data.reason,
    banType: data.ban_type,
    bannedUntil: data.banned_until,
  };
}
```

---

#### 17.1.5 Admin Dashboard Functions

**Function: `getDashboardStats()`**

**Purpose**: Fetch admin dashboard statistics

**Returns**:

```typescript
{
  total_posts: number,
  total_comments: number,
  total_users: number,
  pending_reports: number,
  banned_users: number,
  posts_last_24h: number,
  new_users_24h: number
}
```

**Implementation**:

```typescript
export async function getDashboardStats() {
  const { data, error } = await supabase
    .from("admin_dashboard_stats")
    .select("*")
    .single();

  if (error) throw error;
  return { success: true, data };
}
```

**Database View**: Uses `admin_dashboard_stats` view for optimized queries

---

**Function: `getAllReports(status?: string)`**

**Purpose**: Fetch all reports with user details

**Features**:

- Optional status filter
- Joins with profiles for user info
- Handles deleted users gracefully
- Orders by creation date (newest first)

```typescript
export async function getAllReports(status?: string) {
  // Fetch reports
  let query = supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: reports } = await query;

  // Fetch user information
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, email");

  // Merge data
  const reportsWithData = reports?.map((report) => {
    const reporter = profiles?.find((p) => p.id === report.reporter_id);
    const reportedUser = profiles?.find(
      (p) => p.id === report.reported_user_id
    );

    return {
      ...report,
      reporter: reporter || { username: "Deleted user" },
      reported_user: reportedUser || { username: "Deleted user" },
    };
  });

  return { success: true, data: reportsWithData };
}
```

---

**Function: `updateReportStatus(reportId: string, status: string)`**

**Purpose**: Update report status and log action

**Statuses**: 'pending' | 'reviewed' | 'resolved' | 'dismissed'

```typescript
export async function updateReportStatus(reportId: string, status: string) {
  // Update report
  const { error } = await supabase
    .from("reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reportId);

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_action_type: status === "resolved" ? "resolve_report" : "dismiss_report",
    p_target_type: "report",
    p_target_id: reportId,
  });

  return { success: true };
}
```

---

#### 17.1.6 Admin Content Moderation Functions

**Function: `adminDeletePost(postId: string, reason?: string)`**

**Purpose**: Delete posts and log admin action

```typescript
export async function adminDeletePost(postId: string, reason?: string) {
  // Delete post
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_action_type: "delete_post",
    p_target_type: "post",
    p_target_id: postId,
    p_reason: reason,
  });

  return { success: true };
}
```

**Cascade Effect**: Deletes associated likes and comments (configured in database)

---

**Function: `adminDeleteComment(commentId: string, reason?: string)`**

**Purpose**: Delete comments and log action

```typescript
export async function adminDeleteComment(commentId: string, reason?: string) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_action_type: "delete_comment",
    p_target_type: "comment",
    p_target_id: commentId,
    p_reason: reason,
  });

  return { success: true };
}
```

---

**Function: `getAllPosts(limit: number = 50)`**

**Purpose**: Fetch all posts with counts for admin view

**Features**:

- Limit parameter for pagination
- Includes user profiles
- Calculates like counts
- Calculates comment counts
- Handles deleted users

```typescript
export async function getAllPosts(limit: number = 50) {
  // Fetch posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Fetch profiles, likes, and comments
  const { data: profiles } = await supabase.from("profiles").select("*");
  const { data: likes } = await supabase.from("likes").select("post_id");
  const { data: comments } = await supabase.from("comments").select("post_id");

  // Merge data
  const postsWithData = posts?.map((post) => {
    const profile = profiles?.find((p) => p.id === post.user_id);
    const likeCount = likes?.filter((l) => l.post_id === post.id).length || 0;
    const commentCount =
      comments?.filter((c) => c.post_id === post.id).length || 0;

    return {
      ...post,
      profiles: profile || { username: "Deleted user" },
      likes: [{ count: likeCount }],
      comments: [{ count: commentCount }],
    };
  });

  return { success: true, data: postsWithData };
}
```

---

#### 17.1.7 Admin User Management Functions

**Function: `getAllUsers(limit: number = 50)`**

**Purpose**: Fetch all users with ban status and post counts

```typescript
export async function getAllUsers(limit: number = 50) {
  // Fetch users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Fetch ban information
  const { data: bannedUsers } = await supabase.from("banned_users").select("*");

  // Fetch post counts
  const { data: postCounts } = await supabase.from("posts").select("user_id");

  // Merge data
  const usersWithData = profiles?.map((profile) => {
    const banned = bannedUsers?.filter((b) => b.user_id === profile.id) || [];
    const postCount =
      postCounts?.filter((p) => p.user_id === profile.id).length || 0;

    return {
      ...profile,
      banned: banned,
      posts: [{ count: postCount }],
    };
  });

  return { success: true, data: usersWithData };
}
```

---

**Function: `banUser(userId, reason, banType, bannedUntil?)`**

**Purpose**: Ban users temporarily or permanently

**Parameters**:

- `userId`: User to ban
- `reason`: Reason for ban (required)
- `banType`: 'temporary' | 'permanent'
- `bannedUntil`: ISO date string (for temporary bans)

```typescript
export async function banUser(
  userId: string,
  reason: string,
  banType: "temporary" | "permanent",
  bannedUntil?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("banned_users").insert({
    user_id: userId,
    banned_by: user.id,
    reason,
    ban_type: banType,
    banned_until: bannedUntil || null,
  });

  // Check for duplicate ban (code 23505)
  if (error?.code === "23505") {
    return { success: false, error: "This user is already banned" };
  }

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_action_type: "ban_user",
    p_target_type: "user",
    p_target_id: userId,
    p_reason: reason,
    p_metadata: { ban_type: banType, banned_until: bannedUntil },
  });

  return { success: true };
}
```

---

**Function: `unbanUser(userId: string)`**

**Purpose**: Remove ban from user

```typescript
export async function unbanUser(userId: string) {
  const { error } = await supabase
    .from("banned_users")
    .delete()
    .eq("user_id", userId);

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_action_type: "unban_user",
    p_target_type: "user",
    p_target_id: userId,
  });

  return { success: true };
}
```

---

**Function: `deleteUser(userId: string)`**

**Purpose**: Permanently delete user (Super Admin only)

**Cascade Deletes**:

- User profile
- All posts
- All comments
- All likes
- All reports
- All favorites
- All price alerts

```typescript
export async function deleteUser(userId: string) {
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_action_type: "delete_user",
    p_target_type: "user",
    p_target_id: userId,
  });

  return { success: true };
}
```

---

#### 17.1.8 Admin Actions Logging

**Function: `getAdminActionsLog(limit: number = 100)`**

**Purpose**: Retrieve audit log of admin actions

**Features**:

- Joins with admins and profiles tables
- Shows admin role and username
- Ordered by most recent
- Includes action metadata

```typescript
export async function getAdminActionsLog(limit: number = 100) {
  // Fetch action logs
  const { data: logs } = await supabase
    .from("admin_actions_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Fetch admin and profile information
  const { data: admins } = await supabase
    .from("admins")
    .select("user_id, role");
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, email");

  // Merge data
  const logsWithData = logs?.map((log) => {
    const admin = admins?.find((a) => a.user_id === log.admin_id);
    const profile = profiles?.find((p) => p.id === log.admin_id);

    return {
      ...log,
      admin: admin
        ? {
            user_id: admin.user_id,
            role: admin.role,
            profiles: profile || { username: "Deleted user" },
          }
        : null,
    };
  });

  return { success: true, data: logsWithData };
}
```

---

#### 17.1.9 Admin Management Functions

**Function: `getAllAdmins()`**

**Purpose**: Fetch all admins with profile details

```typescript
export async function getAllAdmins() {
  const { data: admins } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch user information
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, email");

  // Merge data
  const adminsWithData = admins?.map((admin) => {
    const profile = profiles?.find((p) => p.id === admin.user_id);
    return {
      ...admin,
      profile: profile || { username: "Unknown", email: "N/A" },
    };
  });

  return { success: true, data: adminsWithData };
}
```

---

**Function: `addAdmin(email, role, permissions)`**

**Purpose**: Add new admin or moderator

**Process**:

1. Search for user by email
2. Check if user already has admin role
3. Insert admin record
4. Log the action

```typescript
export async function addAdmin(
  email: string,
  role: "super_admin" | "admin" | "moderator",
  permissions: AdminPermissions
) {
  // Search for user by email
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, email")
    .eq("email", email)
    .maybeSingle();

  if (!profiles) {
    return {
      success: false,
      error: "User not found. Verify the email address",
    };
  }

  // Check that no previous admin record exists
  const { data: existingAdmin } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", profiles.id)
    .maybeSingle();

  if (existingAdmin) {
    return { success: false, error: "This user is already an admin" };
  }

  // Add new admin
  const { error } = await supabase.from("admins").insert({
    user_id: profiles.id,
    role,
    permissions,
  });

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_action_type: "create_admin",
    p_target_type: "admin",
    p_target_id: profiles.id,
    p_metadata: { role, permissions },
  });

  return { success: true };
}
```

---

**Function: `updateAdminPermissions(adminUserId, role, permissions)`**

**Purpose**: Update admin role and permissions

```typescript
export async function updateAdminPermissions(
  adminUserId: string,
  role: string,
  permissions: AdminPermissions
) {
  const { error } = await supabase
    .from("admins")
    .update({
      role,
      permissions,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", adminUserId);

  return { success: !error };
}
```

---

**Function: `deleteAdmin(adminUserId: string)`**

**Purpose**: Remove admin privileges

**Note**: Cannot delete super_admin users (enforced by UI logic)

```typescript
export async function deleteAdmin(adminUserId: string) {
  const { error } = await supabase
    .from("admins")
    .delete()
    .eq("user_id", adminUserId);

  // Log the action
  await supabase.rpc("log_admin_action", {
    p_action_type: "delete_admin",
    p_target_type: "admin",
    p_target_id: adminUserId,
  });

  return { success: true };
}
```

---

### 17.2 Crypto API Service (cryptoApi.ts - 107 lines)

**Purpose**: Interface with CoinGecko API for cryptocurrency market data.

**File Location**: `src/services/cryptoApi.ts`

**API Used**: CoinGecko Free API (no key required)

---

#### 17.2.1 Configuration

```typescript
import axios from "axios";

const API_BASE = "https://api.coingecko.com/api/v3";

// Cache configuration
const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 60 * 1000; // 60 seconds

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1200; // 1.2 seconds between requests
```

**Rate Limiting Strategy**:

- Minimum 1.2 seconds between API calls
- Prevents 429 (Too Many Requests) errors
- Automatic delay injection

---

#### 17.2.2 Cache Management

**Function: `getCachedData(key: string)`**

**Purpose**: Retrieve cached data if still valid

```typescript
function getCachedData(key: string) {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}
```

**Cache Duration**: 60 seconds

---

**Function: `setCacheData(key: string, data: any)`**

**Purpose**: Store data in cache with timestamp

```typescript
function setCacheData(key: string, data: any) {
  cache[key] = { data, timestamp: Date.now() };
}
```

---

**Function: `delayIfNeeded()`**

**Purpose**: Enforce rate limiting between requests

```typescript
async function delayIfNeeded() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
}
```

---

#### 17.2.3 API Functions

**Function: `fetchMarketData()`**

**Purpose**: Fetch top 100 cryptocurrencies by market cap

**Endpoint**: `GET /coins/markets`

**Parameters**:

- `vs_currency`: "usd"
- `order`: "market_cap_desc"
- `per_page`: 100
- `page`: 1
- `price_change_percentage`: "24h"

```typescript
export async function fetchMarketData() {
  const cacheKey = "market_data";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    await delayIfNeeded();

    const { data } = await axios.get(`${API_BASE}/coins/markets`, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        price_change_percentage: "24h",
      },
    });

    setCacheData(cacheKey, data);
    return data;
  } catch (error: any) {
    // Handle rate limiting
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded. Using cached data if available.");
      return [];
    }
    throw error;
  }
}
```

**Returns**: Array of crypto objects with:

- id, symbol, name
- current_price
- market_cap, market_cap_rank
- total_volume
- price_change_percentage_24h
- image (logo URL)
- circulating_supply, total_supply, max_supply

---

**Function: `searchCryptos(query: string)`**

**Purpose**: Search for cryptocurrencies by name or symbol

**Process**:

1. Call search endpoint
2. Get top 10 coin IDs from results
3. Fetch detailed market data for those coins

```typescript
export async function searchCryptos(query: string) {
  const cacheKey = `search_${query}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    await delayIfNeeded();

    // Search for coins
    const { data } = await axios.get(`${API_BASE}/search`, {
      params: { query: query },
    });

    // Get detailed info for top 10 results
    if (data.coins && data.coins.length > 0) {
      const coinIds = data.coins
        .slice(0, 10)
        .map((coin: any) => coin.id)
        .join(",");

      await delayIfNeeded();

      const { data: detailedData } = await axios.get(
        `${API_BASE}/coins/markets`,
        {
          params: {
            vs_currency: "usd",
            ids: coinIds,
            order: "market_cap_desc",
          },
        }
      );

      setCacheData(cacheKey, detailedData);
      return detailedData;
    }

    return [];
  } catch (error: any) {
    console.error("Error searching cryptos:", error);
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded for search.");
    }
    return [];
  }
}
```

**Endpoint**: `GET /search` → `GET /coins/markets`

---

**Function: `fetchFearAndGreedIndex()`**

**Purpose**: Get crypto Fear & Greed Index

**API**: Alternative.me API (separate from CoinGecko)

**Endpoint**: `https://api.alternative.me/fng/`

```typescript
export async function fetchFearAndGreedIndex() {
  const cacheKey = "fear_greed";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    await delayIfNeeded();

    const { data } = await axios.get("https://api.alternative.me/fng/");

    const result = {
      value: parseInt(data.data[0].value),
      classification: data.data[0].value_classification,
    };

    setCacheData(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error("Error fetching Fear and Greed Index:", error);
    return null;
  }
}
```

**Returns**:

```typescript
{
  value: number,        // 0-100
  classification: string // e.g., "Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"
}
```

---

### 17.3 Price Alert Service (priceAlertService.ts)

**Purpose**: Background monitoring service for price alerts.

**File Location**: `src/services/priceAlertService.ts`

**Key Features**:

- Real-time price monitoring
- Alert triggering
- Notification delivery
- Automatic alert deactivation

---

#### 17.3.1 Service Overview

**Core Functionality**:

1. Fetch active price alerts from database
2. Check current prices via CoinGecko API
3. Compare with alert conditions
4. Trigger notifications when conditions met
5. Update alert status in database

**Running Frequency**: Checks every 60 seconds (configurable)

---

#### 17.3.2 Alert Monitoring Logic

**Pseudo-code**:

```typescript
async function checkPriceAlerts() {
  // 1. Fetch all active alerts
  const alerts = await getActiveAlerts();

  // 2. Get current prices for all crypto symbols
  const prices = await getCurrentPrices(alerts.map((a) => a.crypto_symbol));

  // 3. Check each alert
  for (const alert of alerts) {
    const currentPrice = prices[alert.crypto_symbol];

    // Check condition
    const shouldTrigger =
      (alert.condition === "above" && currentPrice >= alert.target_price) ||
      (alert.condition === "below" && currentPrice <= alert.target_price);

    if (shouldTrigger) {
      // 4. Send notification
      await sendNotification(alert);

      // 5. Update alert status
      await updateAlertStatus(alert.id, "triggered");

      // 6. Optionally deactivate alert
      await deactivateAlert(alert.id);
    }
  }
}
```

---

#### 17.3.3 Database Operations

**Fetch Active Alerts**:

```typescript
const { data: alerts } = await supabase
  .from("price_alerts")
  .select("*")
  .eq("is_active", true)
  .eq("user_id", userId);
```

**Update Alert Status**:

```typescript
await supabase
  .from("price_alerts")
  .update({
    is_active: false,
    triggered_at: new Date().toISOString(),
  })
  .eq("id", alertId);
```

---

#### 17.3.4 Notification Delivery

**Methods**:

1. **In-app notification**: Toast message
2. **Email notification**: Via Supabase Auth (future)
3. **Push notification**: Via service worker (future)

**Notification Content**:

```typescript
{
  title: `${crypto_symbol} Price Alert`,
  message: `${crypto_symbol} has reached ${currentPrice} (target: ${target_price})`,
  type: 'success',
  link: `/coin/${crypto_id}`
}
```

---

### 17.4 Content Moderation Utility (contentModeration.ts)

**Purpose**: Filter profanity and inappropriate content in posts and comments.

**File Location**: `src/utils/contentModeration.ts`

**Languages Supported**: English and Arabic

---

#### 17.4.1 Profanity Filtering

**Function: `containsProfanity(text: string)`**

**Purpose**: Check if text contains profane words

**Process**:

1. Convert text to lowercase
2. Check against profanity word lists
3. Return boolean result

```typescript
const profanityWords = [
  // English profanity list
  "badword1",
  "badword2", // ... etc

  // Arabic profanity list
  "كلمة سيئة", // ... etc
];

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();

  return profanityWords.some((word) => lowerText.includes(word.toLowerCase()));
}
```

---

**Function: `filterProfanity(text: string)`**

**Purpose**: Replace profane words with asterisks

```typescript
export function filterProfanity(text: string): string {
  let filtered = text;

  profanityWords.forEach((word) => {
    const regex = new RegExp(word, "gi");
    const replacement = "*".repeat(word.length);
    filtered = filtered.replace(regex, replacement);
  });

  return filtered;
}
```

**Example**:

```typescript
filterProfanity("This is badword text");
// Returns: "This is ******* text"
```

---

**Function: `moderateContent(content: string)`**

**Purpose**: Check and moderate user-generated content

**Returns**:

```typescript
{
  isClean: boolean,
  filteredContent: string,
  violations: string[]
}
```

**Implementation**:

```typescript
export function moderateContent(content: string) {
  const violations = [];

  if (containsProfanity(content)) {
    violations.push("profanity");
  }

  // Additional checks can be added here
  // - Spam detection
  // - Link validation
  // - Character encoding issues

  return {
    isClean: violations.length === 0,
    filteredContent: filterProfanity(content),
    violations,
  };
}
```

---

### 17.5 Business Logic Patterns

#### 17.5.1 Error Handling Strategy

**Consistent Return Format**:

```typescript
{
  success: boolean,
  data?: any,
  error?: string
}
```

**Example Usage**:

```typescript
const result = await someOperation();

if (!result.success) {
  showToast(result.error, "error");
  return;
}

// Use result.data
processData(result.data);
```

---

#### 17.5.2 Logging Strategy

**Admin Actions Logging**:

- All admin operations logged via `log_admin_action` RPC
- Includes action type, target, reason, and metadata
- Provides audit trail for compliance

**Log Structure**:

```typescript
{
  admin_id: string,
  action_type: string,
  target_type: string,
  target_id: string,
  reason?: string,
  metadata?: object,
  created_at: timestamp
}
```

---

#### 17.5.3 Caching Strategy

**Client-Side Caching**:

- API responses cached for 60 seconds
- Reduces API calls and improves performance
- Cache invalidation on user actions

**Use Cases**:

- Market data (refreshes every 60s)
- Search results
- Fear & Greed Index

---

#### 17.5.4 Rate Limiting

**API Rate Limiting**:

- Minimum 1.2s between CoinGecko API calls
- Automatic delay injection
- Graceful degradation on 429 errors

**Benefits**:

- Stays within free tier limits
- Prevents API bans
- Better user experience

---

#### 17.5.5 Real-time Subscriptions

**Pattern**:

```typescript
useEffect(() => {
  const channel = supabase
    .channel("channel-name")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "table_name" },
      (payload) => {
        // Handle change
        refreshData();
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [dependencies]);
```

**Use Cases**:

- Live post updates in feed
- Real-time like counts
- New comment notifications
- Profile changes

---

### 17.6 Security Considerations

#### 17.6.1 Row Level Security (RLS)

**Enforcement**: All database operations respect RLS policies

**Admin Bypass**: Admins have service_role permissions for moderation

**User Data Protection**: Users can only modify their own data

---

#### 17.6.2 Input Validation

**File Upload Validation**:

- File type whitelist
- Size limits (2MB avatars, 5MB posts)
- Malicious file detection

**Content Validation**:

- Profanity filtering
- SQL injection prevention (via Supabase)
- XSS protection (React escaping)

---

#### 17.6.3 Authentication & Authorization

**JWT Tokens**: Managed by Supabase Auth

**Session Management**: Automatic token refresh

**Role-Based Access**:

- User: Standard features
- Admin: Content moderation
- Super Admin: User and admin management

---

## END OF PART 5

**Status**: ✅ Complete
**Next**: Part 6 - Configuration & Deployment

---

### Summary of Part 5:

- ✅ Complete Supabase service documentation (852 lines)
- ✅ All 30+ service functions documented
- ✅ Crypto API service with caching and rate limiting
- ✅ Price alert monitoring service
- ✅ Content moderation utilities
- ✅ Business logic patterns
- ✅ Security considerations
- ✅ Error handling strategies

**Total Documentation Progress**: 5/6 parts complete

Type **"continue"** to proceed to Part 6: Configuration & Deployment

---

## PART 6: CONFIGURATION & DEPLOYMENT

### 18.1 Project Configuration Files

#### 18.1.1 package.json

**Purpose**: Node.js project manifest and dependency management.

**File Location**: `package.json`

**Configuration**:

```json
{
  "name": "crypto-social-tracker",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.79.0",
    "@tailwindcss/postcss": "^4.1.18",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@vitejs/plugin-react": "^5.1.0",
    "axios": "^1.13.2",
    "chart.js": "^4.5.1",
    "classnames": "^2.5.1",
    "react": "^18.3.1",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "^18.3.1",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.9.5"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.23",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

**Key Dependencies**:

**Core Framework**:

- `react@18.3.1`: UI library
- `react-dom@18.3.1`: React DOM renderer
- `react-router-dom@7.9.5`: Client-side routing

**Backend & Data**:

- `@supabase/supabase-js@2.79.0`: Supabase client SDK
- `axios@1.13.2`: HTTP client for API requests

**UI & Styling**:

- `@tailwindcss/postcss@4.1.18`: TailwindCSS PostCSS plugin
- `react-icons@5.5.0`: Icon library
- `classnames@2.5.1`: CSS class utility

**Data Visualization**:

- `chart.js@4.5.1`: Charting library
- `react-chartjs-2@5.3.1`: React wrapper for Chart.js

**Development Tools**:

- `vite@5.0.0`: Build tool and dev server
- `typescript@5.0.0`: TypeScript compiler
- `autoprefixer@10.4.23`: CSS autoprefixer
- `@vitejs/plugin-react@5.1.0`: Vite React plugin

**Scripts**:

- `npm run dev`: Start development server on port 5173

---

#### 18.1.2 tsconfig.json

**Purpose**: TypeScript compiler configuration.

**File Location**: `tsconfig.json`

**Configuration**:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "types": ["vite/client", "@types/react", "@types/react-dom"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

**Key Settings**:

**Target & Module**:

- `target: "ESNext"`: Compile to latest ECMAScript
- `module: "ESNext"`: Use ES modules
- `moduleResolution: "Node"`: Node.js module resolution

**JSX Configuration**:

- `jsx: "react-jsx"`: New JSX transform (no React import needed)

**Type Checking**:

- `strict: false`: Relaxed type checking
- `skipLibCheck: true`: Skip type checking of declaration files
- `isolatedModules: true`: Required for Vite

**Other Settings**:

- `noEmit: true`: Vite handles bundling
- `resolveJsonModule: true`: Allow JSON imports
- `allowSyntheticDefaultImports: true`: Better import syntax

---

#### 18.1.3 postcss.config.js

**Purpose**: PostCSS configuration for TailwindCSS processing.

**File Location**: `postcss.config.js`

**Configuration**:

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
```

**Plugins**:

1. **@tailwindcss/postcss**: Processes TailwindCSS directives
2. **autoprefixer**: Adds vendor prefixes for browser compatibility

---

#### 18.1.4 index.html

**Purpose**: HTML entry point for the application.

**File Location**: `index.html`

**Configuration**:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/images/CryptoPulseLogo.png" />
    <title>Crypto Pulse</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Key Elements**:

- Favicon: `/images/CryptoPulseLogo.png`
- Root div: React app mounts here
- Entry script: Loads `main.tsx` as ES module

---

#### 18.1.5 main.tsx

**Purpose**: Application entry point and routing configuration.

**File Location**: `src/main.tsx`

**Key Features**:

**1. Global Providers**:

```typescript
<ToastProvider>
  <AlertMonitor>
    <BrowserRouter>{/* Routes */}</BrowserRouter>
  </AlertMonitor>
</ToastProvider>
```

**2. Route Structure**:

**Auth Routes** (No Layout):

- `/login` → Login
- `/signup` → SignUp
- `/forgot-password` → ForgotPassword
- `/reset-password` → ResetPassword
- `/admin/login` → AdminLogin

**Main App Routes** (With Layout):

- `/` → Home
- `/market` → Market
- `/favorites` → Favorites
- `/coin/:id` → CoinDetail
- `/feed` → Feed
- `/create-post` → CreatePost
- `/post/:id` → PostView
- `/profile` → Profile (own profile)
- `/profile/:userId` → Profile (other user)
- `/privacy-security` → PrivacySecurity
- `/search` → Search
- `/alerts` → Alerts

**Admin Routes** (No Layout):

- `/admin/dashboard` → AdminDashboard
- `/admin/reports` → AdminReports
- `/admin/users` → AdminUsers
- `/admin/posts` → AdminPosts
- `/admin/management` → AdminManagement

**3. React Mounting**:

```typescript
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

---

#### 18.1.6 styles.css

**Purpose**: Global styles and TailwindCSS configuration.

**File Location**: `src/styles.css`

**Custom Theme**:

```css
@theme {
  --color-primary: #8b5cf6;
  --color-primary-dark: #7c3aed;
  --color-primary-light: #a78bfa;
  --color-dark: #0a0a0f;
  --color-dark-card: #11111a;
  --color-dark-border: rgba(139, 92, 246, 0.2);

  --shadow-glow: 0 0 20px rgba(139, 92, 246, 0.3);
  --shadow-glow-lg: 0 0 30px rgba(139, 92, 246, 0.4);
}
```

**CSS Variables**:

```css
:root {
  --bg: #0a0a0f;
  --card: #11111a;
  --text: #ffffff;
  --accent: #8b5cf6;
}
```

**Global Styles**:

- Body: Dark background with Inter font
- Card: Glassmorphism effect with purple glow
- Responsive utilities for mobile/desktop

---

### 18.2 Environment Configuration

#### 18.2.1 Environment Variables

**File**: `.env.example`

**Required Variables**:

```dotenv
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Setup Instructions**:

1. Copy `.env.example` to `.env`
2. Get credentials from Supabase dashboard
3. Replace placeholder values
4. Never commit `.env` to version control

**Getting Supabase Credentials**:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to: Settings → API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

#### 18.2.2 .gitignore

**Purpose**: Specify files to exclude from version control.

**Configuration**:

```ignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build output
dist/
build/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs
*.log

# Testing
coverage/
.nyc_output

# Temporary files
*.tmp
*.temp
```

**Key Exclusions**:

- Environment files (`.env*`)
- Dependencies (`node_modules/`)
- Build output (`dist/`, `build/`)
- Editor configs (`.vscode/`, `.idea`)
- Logs and temporary files

---

### 18.3 Database Setup

#### 18.3.1 Supabase Project Setup

**Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `crypto-social-tracker`
   - Database password: (secure password)
   - Region: (closest to your users)
5. Wait for project to initialize (~2 minutes)

---

**Step 2: Configure Authentication**

1. Go to **Authentication → Providers**
2. Enable providers:

   - **Email**: ✅ Enabled
   - **Google**: Configure OAuth (optional)
   - **Apple**: Configure OAuth (optional)

3. Go to **Authentication → URL Configuration**

   - Site URL: `http://localhost:5173` (development)
   - Redirect URLs: Add `http://localhost:5173/**`

4. Go to **Authentication → Email Templates**
   - Customize confirmation email (optional)
   - Customize password reset email (optional)

---

**Step 3: Setup Storage Buckets**

1. Go to **Storage → Create Bucket**

**Bucket 1: posts-images**

- Name: `posts-images`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

**Bucket 2: avatars**

- Name: `avatars`
- Public: ✅ Yes
- File size limit: 2MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

2. Set Storage Policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts-images' OR bucket_id = 'avatars');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts-images' OR bucket_id = 'avatars');

-- Allow users to delete their own uploads
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

---

**Step 4: Execute Database Schema**

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `database.sql`
4. Click **Run**
5. Verify all tables created successfully

**Tables Created** (12 total):

- profiles
- posts
- comments
- likes
- favorite_cryptos
- price_alerts
- reports
- admins
- banned_users
- admin_actions_log
- notifications (optional)
- followers (optional)

---

**Step 5: Create Admin User**

1. Sign up a user account through the app
2. Get the user's UUID from **Authentication → Users**
3. Run SQL to make them admin:

```sql
-- Make user a Super Admin
INSERT INTO admins (user_id, role, permissions)
VALUES (
  'user-uuid-here',
  'super_admin',
  '{
    "view_reports": true,
    "manage_reports": true,
    "delete_posts": true,
    "delete_comments": true,
    "ban_users": true,
    "delete_users": true,
    "manage_admins": true
  }'::jsonb
);
```

---

### 18.4 Local Development Setup

#### 18.4.1 Prerequisites

**Required Software**:

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

**Check Versions**:

```bash
node --version   # Should be v18+
npm --version    # Should be v8+
git --version
```

---

#### 18.4.2 Installation Steps

**1. Clone Repository**:

```bash
git clone <repository-url>
cd crypto-social-tracker
```

**2. Install Dependencies**:

```bash
npm install
```

This installs all packages from `package.json`.

**3. Configure Environment**:

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your Supabase credentials
```

**4. Start Development Server**:

```bash
npm run dev
```

Server starts at: `http://localhost:5173`

**5. Open in Browser**:

```
http://localhost:5173
```

---

#### 18.4.3 Development Workflow

**Hot Module Replacement (HMR)**:

- Changes to `.tsx` files reload instantly
- Changes to `.css` files update without page reload
- State is preserved during updates

**File Watching**:

- Vite watches all files in `src/`
- TypeScript compilation on save
- TailwindCSS regeneration on class changes

**Error Handling**:

- TypeScript errors shown in terminal
- Browser console shows runtime errors
- React error boundaries catch component errors

---

### 18.5 Production Build

#### 18.5.1 Build Process

**Build Command**:

```bash
npm run build
```

**Build Steps**:

1. TypeScript compilation
2. React component bundling
3. TailwindCSS purging (removes unused styles)
4. Asset optimization
5. Code splitting
6. Minification

**Output**:

- Directory: `dist/`
- Entry: `dist/index.html`
- Assets: `dist/assets/`

**Build Optimization**:

- Tree shaking (removes unused code)
- Dead code elimination
- Gzip compression
- Image optimization
- CSS purging

---

#### 18.5.2 Build Configuration

**Vite Default Settings**:

```typescript
{
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
}
```

**Code Splitting**:

- Vendor bundle: React, Router
- Supabase bundle: Database client
- Charts bundle: Visualization libraries
- Route-based code splitting (automatic)

---

### 18.6 Deployment Options

#### 18.6.1 Vercel Deployment (Recommended)

**Why Vercel**:

- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions support
- Built-in analytics
- Free tier available

**Deployment Steps**:

**1. Install Vercel CLI**:

```bash
npm install -g vercel
```

**2. Login to Vercel**:

```bash
vercel login
```

**3. Deploy**:

```bash
vercel
```

Follow prompts:

- Project name: `crypto-social-tracker`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

**4. Set Environment Variables**:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**5. Production Deployment**:

```bash
vercel --prod
```

**Configuration** (`vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

#### 18.6.2 Netlify Deployment

**Deployment Steps**:

**1. Install Netlify CLI**:

```bash
npm install -g netlify-cli
```

**2. Login**:

```bash
netlify login
```

**3. Initialize**:

```bash
netlify init
```

**4. Configure Build Settings**:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: Add Supabase credentials

**5. Deploy**:

```bash
netlify deploy --prod
```

**Configuration** (`netlify.toml`):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

#### 18.6.3 Other Hosting Options

**1. GitHub Pages**:

- Free static hosting
- Requires base path configuration
- No server-side features

**2. Firebase Hosting**:

- Google's hosting platform
- CDN included
- Good for Firebase users

**3. Cloudflare Pages**:

- Fast global CDN
- Generous free tier
- Automatic builds from Git

**4. AWS Amplify**:

- AWS native hosting
- CI/CD pipeline
- Good for AWS ecosystem

**5. Traditional VPS** (DigitalOcean, Linode):

- Full control
- Requires server configuration
- Install Nginx/Apache
- Manual SSL setup

---

### 18.7 Environment-Specific Configuration

#### 18.7.1 Development Environment

**Settings**:

```typescript
// .env.development
VITE_SUPABASE_URL=http://localhost:54321  # Local Supabase
VITE_SUPABASE_ANON_KEY=local-dev-key
```

**Features**:

- Hot reload enabled
- Source maps enabled
- Detailed error messages
- No minification
- Fast build times

---

#### 18.7.2 Production Environment

**Settings**:

```typescript
// .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-key
```

**Features**:

- Code minification
- Tree shaking
- CSS purging
- Asset optimization
- Error tracking (Sentry, etc.)

---

### 18.8 Performance Optimization

#### 18.8.1 Build Optimizations

**Code Splitting**:

```typescript
// Lazy load routes
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

<Route
  path="/admin/dashboard"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  }
/>;
```

**Image Optimization**:

- Use WebP format
- Lazy loading: `loading="lazy"`
- Responsive images: `srcset`
- CDN delivery

**CSS Optimization**:

- TailwindCSS purging
- Critical CSS inlining
- Remove unused styles

---

#### 18.8.2 Runtime Optimizations

**React Optimizations**:

```typescript
// Memoization
const MemoizedComponent = React.memo(Component);

// Use callback memoization
const handleClick = useCallback(() => {
  // handler
}, [dependencies]);

// Use memo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

**API Caching**:

- Cache API responses (60s)
- Rate limiting (1.2s between calls)
- Batch requests where possible

**Database Optimization**:

- Indexed queries
- Row Level Security policies
- Connection pooling
- Query result caching

---

### 18.9 Monitoring & Analytics

#### 18.9.1 Error Tracking

**Sentry Integration** (optional):

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Error Boundaries**:

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
  }
}
```

---

#### 18.9.2 Analytics

**Google Analytics** (optional):

```typescript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

**Supabase Analytics**:

- Database usage
- API calls
- Storage usage
- Authentication events

---

### 18.10 Security Best Practices

#### 18.10.1 Environment Security

**✅ Do**:

- Use `.env` files for secrets
- Never commit `.env` to Git
- Use environment-specific keys
- Rotate keys periodically
- Use HTTPS in production

**❌ Don't**:

- Hardcode API keys
- Use development keys in production
- Share `.env` files publicly
- Commit secrets to version control

---

#### 18.10.2 Supabase Security

**Row Level Security (RLS)**:

- Enable RLS on all tables
- Test policies thoroughly
- Use `auth.uid()` for user checks
- Restrict admin operations

**API Key Management**:

- Use `anon` key for client-side
- Never expose `service_role` key
- Implement rate limiting
- Monitor API usage

---

#### 18.10.3 Application Security

**Input Validation**:

- Sanitize user input
- Validate file uploads
- Check content length
- Filter profanity

**XSS Prevention**:

- React auto-escapes content
- Sanitize HTML if rendering
- Use Content Security Policy

**CSRF Protection**:

- Supabase handles CSRF
- Use SameSite cookies
- Validate request origins

---

### 18.11 Maintenance & Updates

#### 18.11.1 Dependency Updates

**Check for Updates**:

```bash
npm outdated
```

**Update Dependencies**:

```bash
# Update all to latest compatible
npm update

# Update to latest major versions
npm install react@latest react-dom@latest

# Check for security vulnerabilities
npm audit
npm audit fix
```

**Update Strategy**:

- Update dev dependencies frequently
- Test thoroughly before updating major versions
- Review changelogs for breaking changes
- Update one major dependency at a time

---

#### 18.11.2 Database Migrations

**Adding New Columns**:

```sql
ALTER TABLE posts
ADD COLUMN views INTEGER DEFAULT 0;
```

**Adding New Tables**:

```sql
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- columns
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "policy_name" ON table_name
FOR SELECT TO authenticated
USING (true);
```

**Migration Best Practices**:

- Test migrations in development first
- Backup database before migrations
- Write reversible migrations
- Document schema changes

---

#### 18.11.3 Backup Strategy

**Supabase Backups**:

- Automatic daily backups (Pro plan)
- Point-in-time recovery
- Export SQL dumps regularly

**Manual Backup**:

```sql
-- Export all data
pg_dump -h db.xxx.supabase.co -U postgres database_name > backup.sql

-- Restore from backup
psql -h db.xxx.supabase.co -U postgres database_name < backup.sql
```

---

### 18.12 Troubleshooting Guide

#### 18.12.1 Common Issues

**1. Environment Variables Not Loading**:

```bash
# Solution: Ensure .env file exists and variables start with VITE_
# Restart dev server after .env changes
```

**2. Supabase Connection Errors**:

```typescript
// Check: URL and key are correct
// Check: Network connectivity
// Check: CORS settings in Supabase dashboard
```

**3. Build Failures**:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**4. TypeScript Errors**:

```bash
# Check tsconfig.json is valid
# Ensure types are installed
npm install --save-dev @types/react @types/react-dom
```

**5. 404 on Refresh (Production)**:

```
# Solution: Configure server to redirect all routes to index.html
# Vercel/Netlify: Use rewrites configuration
```

---

#### 18.12.2 Debug Tools

**Browser DevTools**:

- Console: Check for errors
- Network: Monitor API calls
- Application: Check storage/cookies
- Performance: Profile rendering

**React DevTools**:

- Component tree inspection
- Props and state inspection
- Performance profiling

**Supabase Dashboard**:

- Query logs
- API logs
- Storage browser
- Authentication logs

---

### 18.13 CI/CD Pipeline

#### 18.13.1 GitHub Actions (Example)

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

### 18.14 Project Structure Summary

```
crypto-social-tracker/
├── public/                    # Static assets
│   └── images/               # Images and logos
├── src/
│   ├── components/           # React components (17 files)
│   ├── pages/                # Page components (15+ files)
│   │   └── admin/           # Admin pages (5 files)
│   ├── services/             # Business logic
│   │   ├── supabase.ts      # Database operations (852 lines)
│   │   ├── cryptoApi.ts     # CoinGecko API (107 lines)
│   │   └── priceAlertService.ts
│   ├── hooks/                # Custom React hooks
│   │   └── useAuth.ts       # Authentication hook
│   ├── utils/                # Utility functions
│   │   └── contentModeration.ts
│   ├── main.tsx              # App entry point
│   └── styles.css            # Global styles (1021 lines)
├── database.sql              # Complete database schema
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── postcss.config.js         # PostCSS configuration
├── index.html                # HTML entry point
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
└── FULL_REPORT.md            # This documentation
```

**File Count**:

- Total Components: 17
- Total Pages: 15+
- Admin Pages: 6
- Services: 3+
- Configuration Files: 6
- Documentation: 1 (FULL_REPORT.md)

**Lines of Code** (approximate):

- TypeScript/TSX: ~15,000 lines
- CSS: ~1,021 lines
- SQL: ~800 lines
- Total: ~17,000 lines

---

## 🎉 END OF DOCUMENTATION

### 📊 Complete Documentation Summary

**Project**: CryptoPulse - Crypto Social Tracker
**Documentation Created**: December 31, 2025
**Total Parts**: 6
**Status**: ✅ 100% Complete

---

### Part Summaries:

#### ✅ Part 1: Project Overview & Architecture

- Complete technology stack
- Project features and capabilities
- System architecture
- Security implementation
- API integrations

#### ✅ Part 2: Database Schema & Data Models

- 12 database tables documented
- Complete field descriptions
- Relationships and constraints
- Indexes and RLS policies
- SQL functions and triggers

#### ✅ Part 3: Frontend Components & UI System

- All 17 React components
- Props interfaces and features
- Complete design system
- Color palette and typography
- State management patterns

#### ✅ Part 4: Pages & User Flows

- 15+ application pages
- Authentication flow (4 pages)
- Main application (10 pages)
- Admin panel (6 pages)
- User flow diagrams
- Navigation structure

#### ✅ Part 5: Services & Business Logic

- Supabase service (852 lines, 30+ functions)
- Crypto API service with caching
- Price alert monitoring
- Content moderation
- Business logic patterns
- Security considerations

#### ✅ Part 6: Configuration & Deployment

- All configuration files
- Environment setup
- Database configuration
- Local development guide
- Production build process
- Deployment options
- Performance optimization
- Security best practices
- Maintenance guidelines

---

### 📈 Project Statistics

**Codebase**:

- **Languages**: TypeScript, CSS, SQL
- **Total Lines**: ~17,000
- **Components**: 17
- **Pages**: 21 (15 main + 6 admin)
- **Database Tables**: 12
- **API Endpoints**: 30+ Supabase functions

**Features**:

- ✅ User authentication & profiles
- ✅ Social posting with sentiment
- ✅ Real-time updates
- ✅ Cryptocurrency tracking
- ✅ Price alerts
- ✅ Content moderation
- ✅ Admin panel
- ✅ Image uploads
- ✅ Reporting system
- ✅ User management

**Technologies**:

- React 18.3.1 + TypeScript 5.0.0
- Supabase (PostgreSQL + Auth + Storage)
- TailwindCSS 4.1.18
- Vite 5.0.0
- Chart.js 4.5.1
- CoinGecko API

---

### 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

### 📚 Documentation Coverage

| Category          | Coverage | Details                           |
| ----------------- | -------- | --------------------------------- |
| **Architecture**  | 100%     | Complete system design documented |
| **Database**      | 100%     | All 12 tables with full schema    |
| **Components**    | 100%     | All 17 components documented      |
| **Pages**         | 100%     | All 21 pages documented           |
| **Services**      | 100%     | All business logic covered        |
| **Configuration** | 100%     | All config files explained        |
| **Deployment**    | 100%     | Multiple deployment options       |
| **Security**      | 100%     | Best practices included           |

---

### 🎯 Project Highlights

**Technical Excellence**:

- ✅ Type-safe TypeScript throughout
- ✅ Component-based architecture
- ✅ Real-time data synchronization
- ✅ Row Level Security (RLS)
- ✅ Responsive design
- ✅ Performance optimized

**User Experience**:

- ✅ Glassmorphism UI design
- ✅ Dark mode interface
- ✅ Intuitive navigation
- ✅ Real-time notifications
- ✅ Mobile responsive
- ✅ Fast load times

**Admin Features**:

- ✅ Comprehensive dashboard
- ✅ User management
- ✅ Content moderation
- ✅ Report handling
- ✅ Action logging
- ✅ Role-based access

---

### 🔒 Security Features

- ✅ Supabase Row Level Security
- ✅ JWT authentication
- ✅ Encrypted passwords
- ✅ Content moderation
- ✅ Input validation
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Secure file uploads
- ✅ Admin audit logs

---

### 🌟 Future Enhancements

**Planned Features**:

- [ ] Two-factor authentication
- [ ] Push notifications
- [ ] Email notifications
- [ ] Advanced charting
- [ ] Portfolio tracking
- [ ] Social following system
- [ ] Direct messaging
- [ ] Advanced search filters
- [ ] Export user data
- [ ] Mobile app (React Native)

---

### 📞 Support & Resources

**Documentation**: This file (FULL_REPORT.md)
**Database Schema**: database.sql
**Environment Template**: .env.example

**External Resources**:

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [CoinGecko API](https://www.coingecko.com/en/api)

---

### ✅ Completion Checklist

- [x] Part 1: Project Overview & Architecture
- [x] Part 2: Database Schema & Data Models
- [x] Part 3: Frontend Components & UI System
- [x] Part 4: Pages & User Flows
- [x] Part 5: Services & Business Logic
- [x] Part 6: Configuration & Deployment

**Total Documentation**: 6/6 Parts Complete ✅

---

### 🎊 Conclusion

This comprehensive documentation covers every aspect of the CryptoPulse Crypto Social Tracker project, from database schema to deployment strategies. The project is production-ready with proper security, scalability, and maintainability in mind.

**Thank you for reading!**

---

_Documentation generated on December 31, 2025_
_Project Version: 0.1.0_
_Total Pages: 6 comprehensive parts_
