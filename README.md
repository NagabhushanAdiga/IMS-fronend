# 📦 Soni Traders Inventory Management System

A **production-ready**, full-stack inventory management web application built with React, Material-UI, Node.js, Express, and MongoDB. Specifically designed for Soni Traderss to track products, sales, stock levels, and returns.

## Features

- 🔐 **PIN Authentication** - Simple 4-digit PIN login system
- 📊 **Dashboard** - Comprehensive overview with key metrics (Total Stock, Items Sold, Returns, Items Remaining)
- 📦 **Product Management** - Track total stock, items sold, returns, and remaining inventory
- 🏷️ **Category Management** - Organize products into categories
- 🛒 **Sales Management** - Track and manage customer sales
- 🔄 **Returns Management** - Track returned items and restock automatically
- 🔍 **Date Range Search** - Search and analyze data by date range
- 📈 **Reports & Analytics** - View sales data and performance metrics
- ⚙️ **Settings** - Customize profile and notification preferences
- 📱 **Fully Responsive** - Card-based design that works perfectly on all devices
- ✅ **Confirmation Dialogs** - Safe delete and logout confirmations

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Material-UI (MUI) v5** - Component library
- **MUI X Charts** - Data visualization
- **React Router v6** - Client-side routing
- **Vite** - Fast build tool
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - PIN hashing
- **Helmet** - Security headers
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting

## 🚀 Quick Start (Development)

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free) OR local MongoDB
- npm or yarn

### 5-Minute Setup

**1. Clone and Install**
```bash
npm install
cd backend
npm install
cd ..
```

**2. Setup MongoDB**
- Create FREE account at [MongoDB Atlas](https://cloud.mongodb.com)
- Create cluster, database user, whitelist IP
- Copy connection string

**3. Configure Backend**

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**4. Create Admin User**
```bash
npm run setup:admin
```

**5. Start Backend**
```bash
cd backend
npm run dev
```

**6. Start Frontend**
```bash
# New terminal, in project root
npm run dev
```

**7. Login**
- Open `http://localhost:3000`
- Enter PIN: **1234**

## 📖 Complete Setup Guide

👉 **New to the project?** Read [`START_HERE.md`](START_HERE.md)

👉 **Ready to deploy?** Read [`DEPLOYMENT.md`](DEPLOYMENT.md)

👉 **Need checklist?** Read [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)

## Default Login PIN

For demo purposes, use this PIN:

- **PIN:** 1234

## Project Structure

```
inventory-management-app/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   └── Layout.jsx     # Main layout with sidebar navigation
│   ├── pages/            # Page components
│   │   ├── Login.jsx     # Login page
│   │   ├── Dashboard.jsx # Dashboard with metrics
│   │   ├── Products.jsx  # Product management
│   │   ├── Categories.jsx # Category management
│   │   ├── Suppliers.jsx # Supplier management
│   │   ├── Orders.jsx    # Order management
│   │   ├── Reports.jsx   # Analytics and reports
│   │   └── Settings.jsx  # User settings
│   ├── App.jsx           # Main app component with routing
│   └── main.jsx          # Application entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── README.md            # This file
```

## Features Overview

### Dashboard
- Real-time statistics with gradient cards
- Low stock alerts in responsive cards
- Recent returns overview
- Visual analytics with charts
- Mobile-optimized layout

### Products
- Complete CRUD operations with confirmation dialogs
- Track total stock added to inventory
- Track items sold
- Track items returned
- Track remaining stock
- Automatic stock calculation (Total - Sold + Returned)
- Search and filter functionality
- Card-based responsive layout
- Category assignment
- SKU management
- Color-coded metrics (Sold=Red, Returned=Orange, Remaining=Green)

### Categories
- Organize products efficiently
- Track product counts per category
- Easy category management

### Sales
- Sales tracking and management
- Multiple sale statuses (Pending, Processing, Shipped, Completed, Cancelled)
- Customer information
- Sales history
- Total amount tracking

### Returns
- View all returned items in responsive cards
- Track quantity returned per product
- Calculate total return value
- Return date tracking
- Automatic stock adjustment
- Search functionality
- Summary statistics

### Search
- Date range selector (start date to end date)
- View items sold in the period
- View items returned in the period
- View items available
- Calculate net sales and return rate
- Beautiful card-based results with gradients

### Reports
- Sales analytics
- Top-selling products
- Monthly sales data
- Inventory metrics

### Settings
- User profile management
- Notification preferences
- Password management
- Customizable settings

## Customization

### Changing Theme Colors

Edit the theme configuration in `src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Change primary color
    },
    secondary: {
      main: '#dc004e', // Change secondary color
    },
  },
})
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Import and add the route in `src/App.jsx`
3. Add navigation link in `src/components/Layout.jsx`

## Future Enhancements

- [ ] Backend API integration
- [ ] Database connectivity
- [ ] Advanced analytics and charts
- [ ] Export functionality (PDF, Excel)
- [ ] Barcode scanning
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Email notifications
- [ ] Advanced search and filters
- [ ] Batch operations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ using React and Material-UI
