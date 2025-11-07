# 📌 Quick Reference Guide

## 🎯 Most Important Files

### Start Here
- **`START_HERE.md`** - 5-minute setup guide
- **`SETUP_COMPLETE.md`** - Complete documentation
- **`DEPLOYMENT.md`** - Production deployment

### Configuration
- **`backend/.env`** - Backend environment variables
- **`backend/.env.example`** - Environment template
- **`.gitignore`** - Files to ignore

### Code
- **`backend/server.js`** - Backend entry point
- **`src/main.jsx`** - Frontend entry point
- **`src/App.jsx`** - Main React app
- **`src/services/api.js`** - API integration

## 🔑 Important Commands

### Development
```bash
# Start Backend
cd backend && npm run dev

# Start Frontend  
npm run dev

# Both together (use 2 terminals)
```

### Production
```bash
# Build Frontend
npm run build

# Start Backend (production)
cd backend && npm start
```

### Database
```bash
# Seed database with sample data
cd backend && npm run seed

# Create admin user manually
cd backend && npm run create-admin
```

## 🔐 Default Credentials

**PIN**: 1234

(Auto-created on first login if no users exist)

## 📡 API Endpoints Quick List

### Auth
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get profile
- PUT `/api/auth/pin` - Change PIN

### Products
- GET `/api/products` - List
- POST `/api/products` - Create
- PUT `/api/products/:id` - Update
- DELETE `/api/products/:id` - Delete
- GET `/api/products/stats` - Statistics

### Categories
- GET `/api/categories` - List
- POST `/api/categories` - Create
- PUT `/api/categories/:id` - Update
- DELETE `/api/categories/:id` - Delete

### Sales
- GET `/api/sales` - List
- POST `/api/sales` - Create
- PUT `/api/sales/:id` - Update

### Returns
- GET `/api/returns` - List
- GET `/api/returns/stats` - Statistics

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check MongoDB URI, run `npm install` |
| Frontend can't connect | Ensure backend is running on port 5000 |
| Can't login | Check backend logs, verify PIN is 1234 |
| Database errors | Verify MongoDB connection string |
| CORS errors | Check FRONTEND_URL in backend .env |

## 📁 Folder Structure

```
ProjectX/
├── backend/           # Node.js API
│   ├── controllers/   # Business logic
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Auth, validation
│   └── server.js     # Entry point
├── src/              # React app
│   ├── pages/        # All pages
│   ├── components/   # Reusable components
│   ├── services/     # API integration
│   └── App.jsx       # Main app
└── Documentation/    # All .md files
```

## 🎨 UI Pages

1. **Dashboard** - `/dashboard` - Overview statistics
2. **Products** - `/products` - Manage inventory
3. **Categories** - `/categories` - Manage categories
4. **Sales** - `/orders` - Sales history
5. **Returns** - `/returns` - Returned items
6. **Search** - `/search` - Date range search
7. **Reports** - `/reports` - Analytics
8. **Settings** - `/settings` - Profile & PIN

## 📊 Data Flow

```
User → Frontend (React) → API Service (Axios) 
  → Backend (Express) → MongoDB Atlas → Response
```

## 🔄 Update Workflow

1. User performs action (add/edit/delete)
2. Loading state shows (shimmer/spinner)
3. API call made to backend
4. Backend validates and processes
5. MongoDB updated
6. Response sent back
7. Frontend updates UI
8. Loading state hides

## 💾 Data Storage

- **Authentication**: JWT in localStorage
- **User data**: MongoDB Atlas
- **Products**: MongoDB collection
- **Categories**: MongoDB collection
- **Sales**: MongoDB collection
- **Returns**: MongoDB collection

## 🚀 Deployment Platforms

### Free Tier Options
- **Backend**: Render.com, Railway.app
- **Frontend**: Vercel, Netlify
- **Database**: MongoDB Atlas (512MB free)

## 📞 Support

- Backend API: Check `backend/README.md`
- Deployment: Check `DEPLOYMENT.md`
- Complete Setup: Check `SETUP_COMPLETE.md`

---

**Quick Start**: Open [`START_HERE.md`](START_HERE.md) for step-by-step setup!


