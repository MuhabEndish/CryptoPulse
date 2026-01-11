# CryptoPulse 📈

A comprehensive cryptocurrency tracking and social platform that combines real-time market data with community engagement features. Track your favorite coins, set price alerts, share insights, and connect with other crypto enthusiasts.

## ✨ Features

### 📊 Market Tracking

- **Real-time cryptocurrency prices** using CoinGecko API
- **Fear & Greed Index** for market sentiment analysis
- **Interactive price charts** with historical data visualization
- **Favorites system** to track your preferred cryptocurrencies
- **Detailed coin information** including market cap, volume, and price changes

### 🔔 Price Alerts

- Set custom price alerts for any cryptocurrency
- Receive notifications when target prices are reached
- Manage multiple alerts across different coins
- Real-time alert monitoring system

### 💬 Social Features

- **Create and share posts** about crypto topics
- **Comment and engage** with the community
- **User profiles** with customizable information
- **Search functionality** to find users, posts, and content
- **Content moderation** system for safe community interaction

### 🛡️ Admin Dashboard

- Comprehensive admin panel for platform management
- User management (ban/unban, view activity)
- Post and comment moderation
- Report system for handling user-reported content
- Admin action logging and audit trail
- Multi-admin support with role management

### 🔐 Security & Privacy

- Secure authentication with Supabase
- Password reset functionality
- Privacy settings for user accounts
- Content reporting system
- Admin verification and access control

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account for database and authentication
- CoinGecko API access (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/crypto-social-tracker.git
   cd crypto-social-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   - Create a Supabase project
   - Run the SQL schema from `database.sql` in your Supabase SQL editor
   - Configure Row Level Security (RLS) policies as needed

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🧪 Testing

The project includes comprehensive test coverage using Vitest and React Testing Library.

### Run tests

```bash
npm test
```

### Run tests with UI

```bash
npm run test:ui
```

### Generate coverage report

```bash
npm run test:coverage
```

## 📁 Project Structure

```
CryptoPulse/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── __tests__/     # Component tests
│   │   ├── AdminHeader.tsx
│   │   ├── AlertMonitor.tsx
│   │   ├── CommentCard.tsx
│   │   ├── FearGreedGauge.tsx
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── PostCard.tsx
│   │   └── ...
│   ├── pages/            # Application pages/routes
│   │   ├── admin/        # Admin panel pages
│   │   ├── Home.tsx
│   │   ├── Market.tsx
│   │   ├── Feed.tsx
│   │   ├── Profile.tsx
│   │   └── ...
│   ├── services/         # API services and integrations
│   │   ├── __tests__/
│   │   ├── cryptoApi.ts
│   │   ├── priceAlertService.ts
│   │   └── supabase.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.ts
│   ├── utils/            # Utility functions
│   │   ├── __tests__/
│   │   └── contentModeration.ts
│   ├── main.tsx          # Application entry point
│   └── styles.css        # Global styles
├── public/               # Static assets
├── database.sql          # Database schema
└── package.json          # Project dependencies
```

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation and routing
- **Tailwind CSS** - Styling framework
- **Chart.js** - Data visualization
- **React Icons** - Icon library

### Backend & Services

- **Supabase** - Authentication and database (PostgreSQL)
- **CoinGecko API** - Cryptocurrency market data
- **Axios** - HTTP client

### Testing

- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **jsdom** - DOM simulation
- **@vitest/ui** - Test visualization interface

## 📊 Database Schema

The application uses a PostgreSQL database with the following main tables:

- **users** - User accounts and profiles
- **posts** - User-created posts
- **comments** - Post comments
- **likes** - Post and comment likes
- **favorites** - Saved cryptocurrencies
- **price_alerts** - User-defined price alerts
- **admins** - Admin user roles
- **admin_actions_log** - Audit trail for admin actions
- **reports** - Content reports from users

See [database.sql](database.sql) for the complete schema.

## 🎨 Key Components

- **Layout** - Main application layout with navigation
- **Navbar** - Top navigation bar
- **Sidebar** - Side navigation with market overview
- **FearGreedGauge** - Market sentiment indicator
- **PostCard** - Social post display
- **AlertMonitor** - Price alert monitoring system
- **AdminDashboard** - Admin control panel

## 🔑 Authentication

The app uses Supabase authentication with:

- Email/password login
- Secure password reset flow
- Protected routes
- Admin role verification
- Session management

## 🌐 API Integration

### CoinGecko API

- Real-time cryptocurrency prices
- Historical price data
- Market statistics
- Trending coins
- Global market data

### Supabase API

- User authentication
- Database operations
- Real-time subscriptions
- File storage (if implemented)

## 📝 Environment Variables

Required environment variables:

| Variable                 | Description                        |
| ------------------------ | ---------------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL          |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for cryptocurrency data
- [Supabase](https://supabase.com/) for backend services
- [Alternative.me](https://alternative.me/) for Fear & Greed Index
- The React and Vite communities

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

Built with ❤️ for the crypto community
