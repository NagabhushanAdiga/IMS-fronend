# 🚀 Setup Steps - Soni Traders Inventory

## Step 1: Install Dependencies (1 minute)

```bash
npm run install:all
```

This installs dependencies for both frontend and backend.

## Step 2: MongoDB Setup (3 minutes)

### Get MongoDB URI

**Option A: MongoDB Atlas (Cloud - Free)**
1. Go to https://cloud.mongodb.com
2. Sign up for FREE
3. Create new cluster (FREE M0)
4. Click "Database Access" → "Add New User"
   - Username: `admin` (or anything)
   - Password: (create strong password)
   - Set permissions to "Read and write"
5. Click "Network Access" → "Add IP Address" → "Allow from Anywhere" (0.0.0.0/0)
6. Click "Database" → "Connect" → "Connect your application"
7. Copy connection string
   - It looks like: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://admin:yourpass@cluster0.xxxxx.mongodb.net/inventory?retryWrites=true&w=majority`

**Option B: Local MongoDB**
- Connection string: `mongodb://localhost:27017/inventory`

## Step 3: Configure Backend (1 minute)

Create `backend/.env` file:

```bash
cd backend
```

Create a file named `.env` with this content:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_random_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**IMPORTANT**: Replace:
- `MONGODB_URI` with your actual MongoDB connection string from Step 2
- `JWT_SECRET` with any random string (e.g., `my_super_secret_key_123`)

## Step 4: Create Admin User (30 seconds)

```bash
# Still in backend folder
npm run setup
```

You should see:
```
✅ Connected to MongoDB
🎉 Admin user created successfully!
📌 PIN: 1234
```

## Step 5: Start Backend (30 seconds)

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Server running in development mode on port 5000
```

**Keep this terminal running!**

## Step 6: Start Frontend (30 seconds)

Open **NEW terminal**:

```bash
# Go to project root
cd ..

npm run dev
```

Browser opens at `http://localhost:3000`

## Step 7: Login! 🎉

1. Enter PIN: **1234**
2. Click "Sign In"
3. You're in!

## First Time Use

### 1. Create Categories
- Go to "Categories" page
- Click "Add Category" button
- Add your product categories (e.g., Electronics, Tools, Hardware)

### 2. Add Products
- Go to "Products" page
- Click "Add Product" button
- Fill in product details
- Select category
- Set price and stock levels

### 3. Start Managing!
- Record sales by updating "Items Sold"
- Track returns by updating "Items Returned"
- View analytics on Dashboard
- Use Search for date range reports

## Troubleshooting

### "Cannot connect to MongoDB"
- Check your MongoDB URI in `backend/.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify database user credentials

### "Backend won't start"
- Check port 5000 is not in use
- Run `npm install` in backend folder
- Check .env file exists and is formatted correctly

### "Frontend can't connect to backend"
- Ensure backend is running (should see "Server running..." message)
- Check `http://localhost:5000/api/health` in browser
- Should return: `{"status":"OK",...}`

### "Can't login"
- Ensure you ran `npm run setup` in backend
- Check backend console for errors
- Try PIN: 1234

## Next Steps

✅ Add your categories
✅ Add your products
✅ Record your first sale
✅ Explore all features
✅ Read `DEPLOYMENT.md` when ready for production

---

**That's it! You're ready to manage your inventory!** 📦

