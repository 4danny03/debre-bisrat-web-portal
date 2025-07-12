# Ethiopian Orthodox Church - Debre Bisrat Dagimawi Kulibi St. Gabriel

## 🏛️ Project Overview

A comprehensive church management system built for the Ethiopian Orthodox Church community. This platform serves as a digital hub for church members, visitors, and administrators, providing features for community engagement, event management, donations, and administrative oversight.

### ✨ Key Features

- **Bilingual Support**: Full English and Amharic language support
- **Member Management**: Complete membership registration and management system
- **Event Management**: Create, manage, and track church events
- **Donation Portal**: Secure online giving with Stripe integration
- **Gallery Management**: Photo galleries for church activities and events
- **Prayer Requests**: Community prayer submission and management
- **Testimonials**: Member testimony sharing and approval system
- **Appointment Booking**: Service appointment request and management
- **Admin Dashboard**: Comprehensive administrative tools and analytics
- **Real-time Sync**: Live data synchronization across all components

## 🛠️ Technology Stack

### Frontend

- **React 18.3.1** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling with custom church theme
- **Radix UI** primitives with shadcn/ui components
- **React Router v6** for client-side routing
- **React Hook Form** with Zod validation
- **Lucide React** for icons
- **date-fns** for date handling

### Backend & Database

- **Supabase** (PostgreSQL) for database and authentication
- **Supabase Edge Functions** for serverless functions
- **Supabase Storage** for file and image management
- **Stripe** integration for payment processing

### Development & Deployment

- **GitHub Actions** for CI/CD
- **GitHub Pages** for hosting
- **ESLint** for code linting
- **TypeScript** for type safety

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account
- Stripe account (for payments)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   The project requires the following environment variables to be set in your deployment environment:

   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_PROJECT_ID` - Your Supabase project ID
   - `SUPABASE_URL` - Your Supabase project URL (server-side)
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key (server-side)
   - `SUPABASE_SERVICE_KEY` - Your Supabase service role key

4. **Start development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

## 📦 Deployment to GitHub Pages

### Automatic Deployment (Recommended)

The project includes GitHub Actions workflow for automatic deployment to GitHub Pages.

#### Setup Steps:

1. **Enable GitHub Pages**

   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as the source

2. **Configure Repository Secrets**

   Add the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy**

   Push to the `main` or `master` branch to trigger automatic deployment:

   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **Access Your Site**

   Your site will be available at: `https://yourusername.github.io/your-repository-name`

### Manual Deployment

If you prefer manual deployment:

1. **Build the project**

   ```bash
   npm run build:gh-pages
   ```

2. **Deploy using gh-pages**
   ```bash
   npm run deploy
   ```

## 🔧 Configuration

### Supabase Setup

1. **Create a Supabase project**

   - Visit [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Run database migrations**

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link to your project
   supabase link --project-ref YOUR_PROJECT_ID

   # Run migrations
   supabase db push
   ```

3. **Set up authentication**
   - Configure authentication providers in Supabase dashboard
   - Set up Row Level Security (RLS) policies as needed

### Stripe Configuration

1. **Create Stripe account**

   - Visit [stripe.com](https://stripe.com)
   - Create account and get API keys

2. **Configure webhooks**
   - Set up webhook endpoint in Stripe dashboard
   - Point to your Supabase Edge Function for payment processing

### Admin Setup

To create the first admin user:

1. **Run the admin setup script**

   ```bash
   npm run setup-admin
   ```

2. **Or manually create admin in Supabase**
   - Go to Supabase dashboard
   - Navigate to Authentication → Users
   - Create a new user
   - Add a record in the `profiles` table with `role: 'admin'`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and API
├── lib/                # Utility libraries
├── pages/              # Page components
│   ├── admin/          # Admin panel pages
│   └── ...             # Public pages
├── services/           # Business logic services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

supabase/
├── functions/          # Edge functions
├── migrations/         # Database migrations
└── config.toml         # Supabase configuration

public/
├── images/             # Static images
└── ...                 # Other static assets
```

## 🎨 Customization

### Theme Colors

The project uses a custom color scheme reflecting Ethiopian Orthodox traditions:

- **Church Burgundy**: Primary brand color
- **Church Gold**: Accent color
- **Church Cream**: Background color
- **Ethiopian Flag Colors**: Green, Gold, Red

Colors are defined in `tailwind.config.ts` and can be customized as needed.

### Language Support

The application supports English and Amharic languages:

- Language files are located in the `LanguageContext`
- Add new translations by extending the translation objects
- Switch languages using the language toggle in the header

## 🔒 Security

### Authentication

- Supabase Auth handles user authentication
- Role-based access control (RBAC) for admin features
- Row Level Security (RLS) policies protect data

### Data Protection

- All sensitive data is encrypted
- HTTPS enforced for all communications
- Payment processing through Stripe (PCI DSS compliant)

## 📊 Analytics & Monitoring

### Built-in Analytics

- Member registration tracking
- Donation analytics
- Event attendance tracking
- System health monitoring

### Error Handling

- Comprehensive error boundaries
- Automatic error reporting
- User-friendly error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Test thoroughly before submitting PRs
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**

   - Ensure all environment variables are set
   - Check for TypeScript errors
   - Verify all dependencies are installed

2. **Deployment Issues**

   - Verify GitHub Pages is enabled
   - Check GitHub Actions logs
   - Ensure repository secrets are configured

3. **Database Connection**

   - Verify Supabase credentials
   - Check network connectivity
   - Ensure RLS policies allow access

4. **Payment Processing**
   - Verify Stripe configuration
   - Check webhook endpoints
   - Ensure SSL certificates are valid

### Getting Help

- Check the GitHub Issues for known problems
- Review Supabase documentation
- Consult Stripe documentation for payment issues

## Running & Writing Tests

- Run all tests in watch mode:
  ```bash
  npm test
  ```
- Run tests once for CI:
  ```bash
  npm run test:ci
  ```
- Run with coverage:
  ```bash
  npm run test:coverage
  ```
- Test utilities are in `src/test/test-utils.tsx` for rendering components with context.

## Continuous Integration

This project uses GitHub Actions for CI. On every push or PR to `main`, the workflow will:

- Install dependencies
- Run type checks
- Lint the code
- Run the test suite

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Ethiopian Orthodox Tewahedo Church community
- Supabase for backend infrastructure
- Stripe for payment processing
- All contributors and community members

---

**Built with ❤️ for the Ethiopian Orthodox Church community**

For support or questions, please open an issue in the GitHub repository.
