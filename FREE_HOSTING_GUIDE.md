# 🆓 FREE Hosting Guide - Complete Setup

## 🎯 What You'll Get (100% FREE)

- ✅ **Frontend**: Hosted on Vercel (FREE forever)
- ✅ **Backend**: Hosted on Render.com (FREE tier)
- ✅ **Database**: MongoDB Atlas (512MB FREE forever)

**Total Cost**: $0.00/month 🎉

---

## 📚 Table of Contents

1. [MongoDB Atlas Setup](#1-mongodb-atlas-database-free)
2. [Backend Hosting (Render.com)](#2-backend-hosting-rendercom-free)
3. [Frontend Hosting (Vercel)](#3-frontend-hosting-vercel-free)
4. [Final Testing](#4-final-testing)

---

## 1️⃣ MongoDB Atlas (Database - FREE)

### Time: 5 minutes

1. **Sign Up**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google/GitHub or email (FREE account)

2. **Create Cluster**
   - Click "Build a Database"
   - Select **"M0 FREE"** (512MB storage)
   - Choose any cloud provider (AWS/Google/Azure)
   - Choose region closest to you
   - Cluster name: `Cluster0` (default is fine)
   - Click **"Create"**

3. **Create Database User**
   - Click "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `inventoryuser` (or anything you like)
   - Click "Autogenerate Secure Password" (SAVE THIS PASSWORD!)
   - Or create your own password
   - Select "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Click "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" (left sidebar)
   - Click **"Connect"** button on your cluster
   - Select **"Connect your application"**
   - Copy the connection string
   - It looks like: `mongodb+srv://inventoryuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - **Replace** `<password>` with your actual password
   - **Add database name**: Change it to:
     ```
     mongodb+srv://inventoryuser:YOURPASSWORD@cluster0.xxxxx.mongodb.net/inventory?retryWrites=true&w=majority
     ```

**SAVE THIS CONNECTION STRING!** You'll need it in next steps.

---

## 2️⃣ Backend Hosting (Render.com - FREE)

### Time: 10 minutes

1. **Sign Up**
   - Go to https://render.com
   - Sign up with GitHub (recommended) or email

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository (or create one first)
   - OR use "Deploy from GitHub"

3. **Configure Service**
   - **Name**: `hardware-inventory-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main` or `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** (select this!)

4. **Add Environment Variables**
   Click "Environment" tab and add:
   
   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `MONGODB_URI` | Your MongoDB connection string from Step 1 |
   | `JWT_SECRET` | Any random string (e.g., `my_super_secret_key_production_123`) |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://your-app-name.vercel.app` (we'll update this after frontend deployment) |

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait 3-5 minutes for deployment
   - Once deployed, you'll see a URL like: `https://hardware-inventory-backend.onrender.com`
   - **SAVE THIS URL!**

6. **Test Backend**
   - Open: `https://your-backend-url.onrender.com/api/health`
   - Should see: `{"status":"OK","message":"Server is running","environment":"production"}`
   - ✅ If you see this, backend is working!

7. **Create Admin User**
   - We'll do this after everything is deployed
   - Keep your backend URL handy

---

## 3️⃣ Frontend Hosting (Vercel - FREE)

### Time: 5 minutes

1. **Sign Up**
   - Go to https://vercel.com/signup
   - Sign up with GitHub (recommended)

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Click "Import Git Repository"
   - Select your inventory management repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://your-backend-url.onrender.com/api`
     - (Use the backend URL from Step 2)
   - Click "Add"

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Once done, you'll get a URL like: `https://your-app-name.vercel.app`
   - **SAVE THIS URL!**

6. **Update Backend CORS**
   - Go back to Render.com
   - Open your backend service
   - Click "Environment"
   - Edit `FRONTEND_URL` variable
   - Change value to: `https://your-app-name.vercel.app` (your Vercel URL)
   - Save changes
   - Backend will redeploy automatically

---

## 4️⃣ Create Admin User

### Time: 2 minutes

Now that everything is deployed, create your admin user:

**Option A: Using MongoDB Compass (Recommended)**
1. Download MongoDB Compass (free)
2. Connect using your MongoDB URI
3. Database: `inventory`
4. Collection: `users`
5. Insert document:
```json
{
  "name": "Admin User",
  "pin": "$2a$10$XqK7qG7QYxQQH7RQYqK7qG...", 
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```
(The pin will be hashed automatically by backend on first use)

**Option B: Temporary Local Script**
1. Update `backend/.env` with production MongoDB URI
2. Run: `npm run setup` in backend folder
3. This creates admin with PIN 1234
4. Change back to development URI if needed

---

## 5️⃣ Final Testing

### Test Your Live App! 🎉

1. **Open your Vercel URL**: `https://your-app-name.vercel.app`
2. **Login with PIN**: `1234`
3. **Add a category**: Electronics, Tools, etc.
4. **Add a product**: Test product with price and stock
5. **Check Dashboard**: Should show statistics
6. **Test on mobile**: Open on your phone!

### Verify Everything Works

- ✅ Can login
- ✅ Dashboard loads
- ✅ Can create category
- ✅ Can create product
- ✅ Data persists (refresh page, still there!)
- ✅ Works on mobile
- ✅ All pages accessible

---

## 📊 Free Tier Limits

### MongoDB Atlas (FREE M0)
- **Storage**: 512 MB
- **RAM**: 512 MB
- **Backups**: Manual only
- **Good for**: ~5,000-10,000 products

### Render.com (FREE)
- **RAM**: 512 MB
- **Spins down after 15 min inactivity** (restarts in ~30 seconds)
- **750 hours/month** runtime
- **Good for**: Low to medium traffic

### Vercel (FREE Hobby)
- **Bandwidth**: 100 GB/month
- **Builds**: Unlimited
- **Sites**: Unlimited
- **Good for**: Most use cases

---

## 🔄 Auto-Deployment (CI/CD)

Once connected to GitHub:

### Frontend (Vercel)
- Push to GitHub → Auto-deploys ✨
- Each push triggers new build
- Preview deployments for branches

### Backend (Render.com)
- Push to GitHub → Auto-deploys ✨
- Manual deploy option available
- Auto-deploy can be disabled

---

## 🎯 Important URLs to Save

After deployment, save these:

```
Frontend URL: https://your-app-name.vercel.app
Backend URL: https://your-backend.onrender.com
MongoDB URI: mongodb+srv://...
Admin PIN: 1234
```

---

## ⚠️ Important Notes

### Render.com Free Tier
- **Spins down after 15 minutes** of inactivity
- First request after sleep takes ~30 seconds to wake up
- Subsequent requests are fast
- Solution: Upgrade to paid tier ($7/month) for 24/7 uptime

### MongoDB Atlas
- **512MB limit** on free tier
- Monitor usage in Atlas dashboard
- Good for ~5,000-10,000 products
- Can upgrade when needed

### Change Default PIN
- After first login, go to Settings
- Change PIN from 1234 to your own
- This is **IMPORTANT** for security!

---

## 🔒 Security Checklist

Before going live:

- [ ] Changed default PIN from 1234
- [ ] Strong JWT_SECRET in production
- [ ] CORS configured (FRONTEND_URL set correctly)
- [ ] MongoDB password is strong
- [ ] IP whitelist configured (can restrict after testing)

---

## 🚀 Alternative Free Options

### Backend Alternatives
1. **Railway.app** - 500 hours/month free
2. **Fly.io** - 3 small VMs free
3. **Cyclic.sh** - Unlimited free tier

### Frontend Alternatives
1. **Netlify** - Similar to Vercel
2. **GitHub Pages** - Free (static only)
3. **Cloudflare Pages** - Free unlimited

---

## 💰 Cost to Upgrade (Optional)

If you outgrow free tiers:

- **MongoDB Atlas M10**: $9/month (2GB storage, backups)
- **Render.com Starter**: $7/month (24/7 uptime)
- **Vercel Pro**: $20/month (more bandwidth)

**Total**: ~$16-30/month for professional hosting

---

## 📞 Support

### Render.com
- Docs: https://render.com/docs
- Community: https://community.render.com

### Vercel
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### MongoDB Atlas
- Docs: https://www.mongodb.com/docs/atlas
- Support: https://support.mongodb.com

---

## 🎉 Congratulations!

Your Soni Traders Inventory Management System is now:
- ✅ **Live on the internet**
- ✅ **Accessible from anywhere**
- ✅ **Completely FREE**
- ✅ **Production-ready**
- ✅ **Auto-deploying on Git push**

### Share Your App!
Send the Vercel URL to anyone:
`https://your-app-name.vercel.app`

They can access it from:
- 📱 Mobile phones
- 💻 Laptops
- 🖥️ Desktops
- 📲 Tablets

**Your Soni Traders is now online!** 🛠️🎊

---

## 📝 Quick Reference

```bash
# Local Development
npm run dev                 # Frontend
cd backend && npm run dev   # Backend

# Production URLs
Frontend: https://your-app.vercel.app
Backend:  https://your-backend.onrender.com
Health:   https://your-backend.onrender.com/api/health
```

**Need more help?** Check `DEPLOYMENT_CHECKLIST.md` for detailed verification steps!

