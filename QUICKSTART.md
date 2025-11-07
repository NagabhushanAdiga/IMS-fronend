# 🚀 Quick Start Guide

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Start the development server:**

```bash
npm run dev
```

The application will automatically open in your browser at `http://localhost:3000`

## Default Login PIN

- **PIN:** 1234

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Implemented

✅ **PIN Authentication System**
- Login page with 4-digit PIN
- Session persistence
- Protected routes
- Logout confirmation dialog

✅ **Dashboard**
- Real-time statistics cards
- Sales and order charts
- Low stock alerts
- Recent orders overview
- Category distribution

✅ **Products Management**
- Complete CRUD operations with delete confirmation
- Track total stock, sold, returned, and remaining
- Search functionality
- Card-based responsive layout
- Pagination with MUI Pagination component
- Stock status tracking
- Category assignment
- Color-coded metrics

✅ **Categories**
- Card-based layout
- Add/Edit/Delete operations
- Product count tracking

✅ **Suppliers**
- Supplier contact management
- Status tracking (Active/Inactive)
- Email and phone information

✅ **Orders**
- Order tracking
- Status management
- Customer information
- Search and filter

✅ **Reports & Analytics**
- Sales trends
- Top selling products
- Category performance
- Monthly order charts
- Key metrics dashboard

✅ **Returns Management**
- View all returned items
- Track return quantities and values
- Return date tracking
- Responsive card layout
- Search and pagination

✅ **Date Range Search**
- Select start and end dates
- View items sold, returned, and available
- Calculate net sales and return rate
- Beautiful gradient cards for results
- Summary statistics

✅ **Settings**
- Profile management
- Password change
- Notification preferences
- User preferences

## Tech Stack

- **React 18** - Latest React version
- **Vite** - Fast build tool
- **Material-UI (MUI v5)** - Modern component library
- **MUI X Charts** - Advanced charting components
- **React Router v6** - Client-side routing
- **Emotion** - CSS-in-JS styling

## Project Structure

```
inventory-management-app/
├── src/
│   ├── components/
│   │   └── Layout.jsx        # Main layout with sidebar
│   ├── pages/
│   │   ├── Login.jsx         # Authentication page
│   │   ├── Dashboard.jsx     # Dashboard with metrics
│   │   ├── Products.jsx      # Product management
│   │   ├── Categories.jsx    # Category management
│   │   ├── Suppliers.jsx     # Supplier management
│   │   ├── Orders.jsx        # Order management
│   │   ├── Reports.jsx       # Analytics & reports
│   │   └── Settings.jsx      # User settings
│   ├── App.jsx               # Main app with routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
└── README.md                 # Documentation
```

## Navigation

After logging in, use the sidebar to navigate between:

1. **Dashboard** - Overview and analytics
2. **Products** - Manage inventory items
3. **Categories** - Organize products
4. **Suppliers** - Manage supplier contacts
5. **Orders** - Track customer orders
6. **Reports** - View analytics and insights
7. **Settings** - Update profile and preferences

## Mock Data

The application includes pre-populated mock data for:
- 8 sample products
- 6 product categories
- 5 suppliers
- 8 customer orders
- Sales analytics data

All data is stored in component state and persists during the session.

## Customization

### Change Theme Colors

Edit `src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Your primary color
    },
    secondary: {
      main: '#dc004e', // Your secondary color
    },
  },
})
```

### Add New Pages

1. Create component in `src/pages/`
2. Import in `src/App.jsx`
3. Add route in Routes
4. Add navigation in `src/components/Layout.jsx`

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder ready for deployment.

## Deployment

The application can be deployed to:
- Vercel
- Netlify  
- GitHub Pages
- Any static hosting service

Simply build and upload the `dist/` folder.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

This is a frontend-only demo application. To make it production-ready:

1. **Add Backend API** - Connect to a real backend service
2. **Database Integration** - Store data persistently
3. **Real Authentication** - Implement proper auth system
4. **API Integration** - Replace mock data with API calls
5. **Form Validation** - Add comprehensive validation
6. **Error Handling** - Implement global error handling
7. **Loading States** - Add loading indicators
8. **Testing** - Add unit and integration tests

---

**Enjoy managing your inventory! 📦**

