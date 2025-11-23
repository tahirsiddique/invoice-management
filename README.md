# 📄 Invoice Management System (IMS)

A comprehensive, full-stack invoice management system built with modern technologies. Create, manage, and export professional invoices with ease.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### Core Features
- 🔐 **User Authentication** - JWT-based auth with email/password and Google OAuth
- 📝 **Invoice Management** - Complete CRUD operations for invoices
- 👥 **Customer Management** - Organize and manage customer information
- 💰 **Advanced Calculations** - Automatic tax, discount, and total calculations
- 📊 **Analytics Dashboard** - Real-time insights and reporting
- 🎨 **Customizable Themes** - Multiple templates and branding options
- 📤 **Multi-Format Export** - Export invoices as PDF, Excel, or Word documents
- ☁️ **Cloud Backup** - Google Drive integration for automatic backups
- 🔍 **Audit Logging** - Track all system activities
- 📱 **Responsive Design** - Works seamlessly on all devices

### Technical Features
- ⚡ **High Performance** - Optimized for speed and efficiency
- 🔒 **Security** - Industry-standard encryption and authentication
- 📈 **Scalable** - Designed to handle thousands of invoices
- 🌐 **RESTful API** - Well-documented API endpoints
- 🐳 **Docker Support** - Easy deployment with Docker Compose
- 📖 **Comprehensive Documentation** - Detailed guides and API docs

## 🛠 Technology Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT, OAuth 2.0
- **File Generation:** PDFKit, XLSX, DOCX
- **Cloud Integration:** Google Drive API

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd invoice-management
```

### 2. Environment Setup

Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and configure:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/invoice_db?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# ... other variables
```

**Frontend `.env`:**
```bash
cp frontend/.env.example frontend/.env
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

### 4. Database Setup

```bash
# Run database migrations
cd backend
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Run the Application

**Option A: Run Both Services Together**
```bash
npm run dev
```

**Option B: Run Separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health

### 6. Default Credentials

After seeding the database:

**Admin Account:**
- Email: `admin@invoicemanagement.com`
- Password: `admin123`

**Demo Business User:**
- Email: `demo@business.com`
- Password: `demo123`

## 🐳 Docker Deployment

Run the entire stack with Docker Compose:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

## 📁 Project Structure

```
invoice-management/
├── backend/                  # Backend API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Entry point
│   ├── prisma/              # Database schema & migrations
│   └── uploads/             # File uploads
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # API client & utilities
│   │   ├── store/           # State management
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── public/              # Static assets
│
└── docs/                     # Documentation
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST `/api/auth/login`
Login with email and password

### Invoice Endpoints

#### GET `/api/invoices`
Get all invoices (paginated, filterable)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status
- `search` - Search by invoice number or customer name

#### POST `/api/invoices`
Create a new invoice

#### PUT `/api/invoices/:id`
Update invoice

#### DELETE `/api/invoices/:id`
Delete invoice

### Export Endpoints

#### GET `/api/export/:id/pdf`
Export invoice as PDF

#### GET `/api/export/:id/excel`
Export invoice as Excel

#### GET `/api/export/:id/word`
Export invoice as Word document

#### POST `/api/export/:id/email`
Email invoice to customer

## 🔧 Configuration

### Environment Variables

See `.env.example` files in backend and frontend directories for all available configuration options.

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Data encryption at rest

## 📈 Performance

- Dashboard loads in < 3 seconds
- Supports 10,000+ invoices per user
- Optimized database queries with Prisma
- Efficient pagination and filtering

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@invoicemanagement.com or open an issue in the repository.

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Multi-currency support with auto-conversion
- [ ] Recurring invoices
- [ ] Mobile app (React Native)
- [ ] QR code generation for invoices
- [ ] Online payment integration (Stripe, PayPal)

### Version 2.0 (Future)
- [ ] Machine learning for fraud detection
- [ ] Advanced analytics with ML insights
- [ ] Multi-tenant architecture
- [ ] WhatsApp/SMS notifications

## 🔗 Useful Links

- [Deployment Guide](docs/DEPLOYMENT.md)
- [SRS Document](SRS.md)

---

Made with ❤️ using modern web technologies