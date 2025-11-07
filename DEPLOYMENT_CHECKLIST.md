# 📋 Production Deployment Checklist

## Pre-Deployment

### Backend
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0 for development, specific IPs for production)
- [ ] Connection string tested locally
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables set:
  - [ ] `MONGODB_URI` - MongoDB connection string
  - [ ] `JWT_SECRET` - Strong random string (32+ characters)
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` - Your frontend domain
  - [ ] `PORT` - Server port (5000)

### Frontend
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variable set:
  - [ ] `VITE_API_URL` - Backend API URL
- [ ] Build tested locally (`npm run build`)
- [ ] Preview tested (`npm run preview`)

## Deployment Steps

### 1. Deploy Backend

#### Using Render.com (Free Tier)
- [ ] Sign up at [Render.com](https://render.com)
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select `backend` folder as root
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Add all environment variables
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (3-5 minutes)
- [ ] Test: `https://your-app.onrender.com/api/health`
- [ ] Copy backend URL

#### Using Railway.app
- [ ] Sign up at [Railway.app](https://railway.app)
- [ ] Create new project from GitHub
- [ ] Select backend directory
- [ ] Add environment variables
- [ ] Deploy
- [ ] Copy backend URL

### 2. Deploy Frontend

#### Using Vercel (Recommended)
- [ ] Sign up at [Vercel.com](https://vercel.com)
- [ ] Click "Add New Project"
- [ ] Import from GitHub
- [ ] Framework: Vite
- [ ] Add environment variable:
  - `VITE_API_URL` = your backend URL + `/api`
- [ ] Deploy
- [ ] Test the deployed site

#### Using Netlify
- [ ] Sign up at [Netlify.com](https://netlify.com)
- [ ] Drag & drop `dist` folder OR connect GitHub
- [ ] Add environment variable:
  - `VITE_API_URL` = your backend URL + `/api`
- [ ] Deploy
- [ ] Test the deployed site

## Post-Deployment Verification

### Backend Testing
- [ ] Health endpoint works: `/api/health`
- [ ] Can login with PIN: POST `/api/auth/login`
- [ ] Products API works: GET `/api/products`
- [ ] Categories API works: GET `/api/categories`
- [ ] Database connected (check logs)
- [ ] CORS allows frontend domain

### Frontend Testing
- [ ] Site loads without errors
- [ ] Can login with PIN 1234
- [ ] Dashboard loads with data
- [ ] Can create product
- [ ] Can create category
- [ ] All pages accessible
- [ ] Mobile view works
- [ ] Accordions expand/collapse

### Integration Testing
- [ ] Login flow works end-to-end
- [ ] Products CRUD operations work
- [ ] Categories CRUD operations work
- [ ] Sales can be created
- [ ] Returns can be tracked
- [ ] Dashboard shows real data
- [ ] Search functionality works

## Security Checklist

### Backend
- [ ] JWT_SECRET is strong and unique (not default)
- [ ] NODE_ENV set to "production"
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] CORS restricted to frontend domain only
- [ ] MongoDB password is strong
- [ ] No sensitive data in logs
- [ ] Environment variables not in code

### Frontend
- [ ] API URL uses HTTPS in production
- [ ] No API keys in client code
- [ ] Build artifacts don't contain .env
- [ ] CSP headers configured (if needed)

### Database
- [ ] Strong database password
- [ ] IP whitelist configured (not 0.0.0.0/0 in production)
- [ ] Backups enabled in MongoDB Atlas
- [ ] Database encryption at rest (automatic in Atlas)
- [ ] User has minimum required permissions

## Performance Checklist

- [ ] Frontend build optimized (code splitting enabled)
- [ ] Images optimized (if any)
- [ ] Backend compression enabled
- [ ] Database indexes created (if needed)
- [ ] API responses are fast (< 200ms)
- [ ] Frontend loads quickly (< 3s)

## Monitoring Setup

### MongoDB Atlas
- [ ] Alerts configured for:
  - High connection count
  - High disk usage
  - Slow queries
- [ ] Regular backup schedule confirmed

### Backend
- [ ] Error logging configured
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Performance monitoring

### Frontend
- [ ] Error tracking (Sentry, etc.) - optional
- [ ] Analytics (Google Analytics, etc.) - optional

## First-Time User Setup

- [ ] Login with PIN 1234
- [ ] Create initial categories
- [ ] Add first products
- [ ] Test all features
- [ ] Change PIN from default (Settings → Security)

## Documentation

- [ ] README.md updated with production URLs
- [ ] API documentation available
- [ ] User guide created (optional)
- [ ] Deployment process documented

## Backup Strategy

- [ ] MongoDB automatic backups enabled (Atlas)
- [ ] Export data periodically
- [ ] Test restore process

## Cost Tracking

### Free Tier Limits
- **MongoDB Atlas M0**: 512 MB storage
- **Render.com**: Spins down after 15min inactivity
- **Vercel**: 100 GB bandwidth/month
- **Netlify**: 100 GB bandwidth/month

### When to Upgrade
- [ ] Monitor database size (upgrade at 400 MB)
- [ ] Track API requests (upgrade at 50K/month)
- [ ] Monitor bandwidth usage

## Rollback Plan

In case of issues:
1. **Backend**: Redeploy previous version
2. **Frontend**: Revert deployment in Vercel/Netlify
3. **Database**: Restore from MongoDB Atlas backup

## Support Contacts

- **MongoDB Atlas**: support.mongodb.com
- **Render.com**: Render support
- **Vercel**: Vercel support

## Success Criteria

✅ All checkboxes above are checked  
✅ Can login and use all features  
✅ Data persists across sessions  
✅ No console errors  
✅ Mobile responsive works  
✅ Loading states show properly  

---

## 🎉 Congratulations!

Once all items are checked, your Soni Traders Inventory Management System is **LIVE and PRODUCTION-READY**!

**Remember**:
- Change default PIN immediately
- Monitor database usage
- Keep dependencies updated
- Regular backups
- Monitor error logs

**You're all set!** 🚀


