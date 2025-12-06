# E-Sell Frontend

A modern, responsive e-commerce web application built with vanilla JavaScript, HTML5, and CSS3. E-Sell provides a complete shopping experience with product browsing, cart management, order tracking, and an admin dashboard.

## 🚀 Features

### Customer Features
- **Product Browsing** - Browse products with search and filtering
- **SEO-Friendly URLs** - Product and order URLs include descriptive slugs
- **Shopping Cart** - Add/remove items, manage quantities
- **Wishlist** - Save favorite products for later
- **Order Management** - Track orders and view order history
- **User Authentication** - Login, registration, and profile management
- **Product Details** - View detailed product information with images and specifications
- **Email Verification** - Secure email-based account verification
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices

### Admin Dashboard
- **Product Management** - Add, edit, delete products with bulk operations
- **Order Management** - View and manage customer orders
- **Customer Management** - View customer details and activity
- **Analytics** - View sales analytics and business metrics
- **User Agent Analysis** - Analyze device types, browsers, and operating systems
- **Feature Flags** - Enable/disable features without deployment
- **Feedback Management** - View and manage customer feedback
- **Transaction Tracking** - Monitor all transactions
- **Contact Forms** - View and manage contact form submissions

## 📁 Project Structure

```
E_Sell_frontend/
├── index.html                 # Home page
├── product-info.html          # Product detail page
├── cart.html                  # Shopping cart
├── auth.html                  # Login/Registration
├── profile.html               # User profile
├── ordered-lists.html         # Order history
├── ordered-details.html       # Order details
├── watchlist.html             # Wishlist
├── search-result.html         # Search results
├── contact.html               # Contact form
├── rider-page.html            # Delivery tracking
│
├── admin/
│   ├── dashboard.html         # Admin dashboard
│   ├── products.html          # Product management
│   ├── orders.html            # Order management
│   ├── customers.html         # Customer management
│   ├── analytics.html         # Sales analytics
│   ├── user-agent.html        # Device/Browser analysis
│   ├── feedbacks.html         # Customer feedback
│   ├── transactions.html      # Transaction logs
│   ├── featureflag.html       # Feature flags
│   └── contact-forms.html     # Contact form submissions
│
├── css/
│   ├── style.css              # Global styles
│   ├── index.css              # Home page styles
│   ├── product-info.css       # Product detail styles
│   ├── cart.css               # Cart styles
│   ├── auth.css               # Auth page styles
│   ├── profile.css            # Profile styles
│   ├── ordered-details.css    # Order detail styles
│   ├── ordered-lists.css      # Order list styles
│   ├── watchlist.css          # Wishlist styles
│   ├── search.css             # Search page styles
│   ├── rider.css              # Delivery tracking styles
│   ├── limited.css            # Limited products styles
│   ├── verified-email.css     # Email verification styles
│   ├── 404.css                # Error page styles
│   │
│   └── admin/
│       ├── style.css          # Admin global styles
│       ├── dashboard.css      # Dashboard styles
│       ├── product.css        # Product management styles
│       ├── customer.css       # Customer management styles
│       ├── order.css          # Order management styles
│       ├── analytics.css      # Analytics styles
│       ├── user-agent.css     # Device analysis styles
│       ├── feedbacks.css      # Feedback styles
│       ├── transactions.css   # Transaction styles
│       └── featureflag.css    # Feature flag styles
│
├── js/
│   ├── main.js                # Global utilities & URL generation
│   ├── index.js               # Home page logic
│   ├── product-info.js        # Product detail logic
│   ├── cart.js                # Cart logic
│   ├── auth.js                # Authentication logic
│   ├── profile.js             # Profile logic
│   ├── ordered-details.js     # Order detail logic
│   ├── ordered-lists.js       # Order list logic
│   ├── watchlist.js           # Wishlist logic
│   ├── search.js              # Search logic
│   ├── rider.js               # Delivery tracking logic
│   ├── limited.js             # Limited products logic
│   ├── verified-email.js      # Email verification logic
│   ├── verified-email-failed.js # Email verification failure logic
│   ├── 404.js                 # Error page logic
│   │
│   └── admin/
│       ├── main.js            # Admin utilities
│       ├── dashboard.js       # Dashboard logic
│       ├── product.js         # Product management logic
│       ├── customer.js        # Customer management logic
│       ├── order.js           # Order management logic
│       ├── analytics.js       # Analytics logic
│       ├── user-agent.js      # Device analysis logic
│       ├── feedbacks.js       # Feedback logic
│       ├── transactions.js    # Transaction logic
│       └── featureflag.js     # Feature flag logic
│
└── img/                       # Images and assets
    └── logo.jpeg              # Application logo
```

## 🎨 Design System

### Color Palette
- **Primary Color**: `#8a4b38` (Brown)
- **Secondary Color**: `#e8d0b3` (Light Beige)
- **Accent Color**: `#d4a373` (Tan)
- **Dark Color**: `#4a2c2a` (Dark Brown)
- **Light Color**: `#f9f5f0` (Off-white)

### Typography
- **Primary Font**: Poppins (sans-serif)
- **Display Font**: Playfair Display (serif) - for headings

### Image Specifications
- **Recommended Upload Size**: 800px × 800px
- **Aspect Ratio**: 1:1 (Square)
- **Format**: JPEG or WebP
- **Quality**: 85% compression
- **File Size**: ~50-80KB per image

All images use CSS `background-size: contain` for perfect scaling across all display sizes without distortion.

## 🔧 Key Features & Implementation

### SEO-Friendly URLs
Product and order URLs include descriptive slugs for better SEO and user experience:
- Product: `product-info.html?id=58&slug=premium-nigerian-fabric`
- Order: `ordered-details.html?id=48&slug=order-ao-48`

URL generation handled by utility functions in `js/main.js`:
- `generateProductUrl(id, title)` - Creates SEO-friendly product URLs
- `generateOrderUrl(id)` - Creates SEO-friendly order URLs

### Authentication System
- Cookie-based token storage
- Email verification workflow
- Profile management with user information

### Shopping Features
- Add to cart with quantity selection
- Color and size options for products
- Wishlist management
- Order history and tracking

### Admin Dashboard
- Bootstrap 5.3.0-alpha1 UI framework
- Chart.js for data visualization
- Font Awesome 6.0 for icons
- Real-time data updates
- User-agent analysis with device breakdown
- Feature flag management for feature toggling

## 📦 Dependencies

### Frontend Libraries
- **Bootstrap 5.3.0-alpha1** - UI framework (admin only)
- **Chart.js** - Data visualization (admin only)
- **Font Awesome 6.0** - Icon library
- **Vanilla JavaScript** - No framework dependencies

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Backend API server running (for data operations)

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd E_Sell_frontend
```

2. Start a local web server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

3. Open in browser:
```
http://localhost:8000
```

## 🔌 API Integration

The frontend communicates with a backend API for:
- Product data retrieval
- Order management
- User authentication
- Cart operations
- Analytics data
- User-agent analysis

### Key Endpoints
- `/products` - Get products
- `/orders` - Get orders
- `/auth/login` - User login
- `/auth/register` - User registration
- `/user-agent-analysis/` - Device analysis data

## 📱 Responsive Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🎯 Performance Optimization
- Efficient CSS with CSS variables
- Background images for fast loading
- Lazy loading for images
- Optimized image sizes (800×800px)
- Minimal JavaScript footprint
- DOM caching patterns for faster queries

## 🔐 Security Features
- Secure token-based authentication
- Email verification for account creation
- Cookie-based session management
- Protected admin routes
- XSS protection through proper escaping

## 📊 User-Agent Analysis
Track and analyze:
- Device types (Mobile, Tablet, Desktop)
- Browser distribution (Chrome, Firefox, Safari, Edge, etc.)
- Operating systems (Windows, macOS, iOS, Android)
- Device status (Active/Inactive)
- Global and user-specific analytics

## 🎪 Admin Features Highlights

### User Agent Analysis Dashboard
- 4-column KPI summary cards
- 3-column device/browser/OS breakdown
- Device status chart visualization
- Email-based filtering
- Real-time user details display

### Product Management
- CRUD operations
- Image uploads (800×800px optimized)
- Bulk operations
- Product search and filtering

### Order Management
- Order status tracking
- Customer information
- Order items with images
- Payment details
- Shipping information

## 📝 Code Standards
- **CSS**: Mobile-first approach with media queries
- **JavaScript**: Vanilla JS with DOM caching for performance
- **HTML**: Semantic HTML5 structure
- **Naming**: BEM-inspired CSS class naming

## 🚀 Deployment
1. Ensure all assets are properly linked
2. Update API endpoints for production
3. Set up proper CORS policies
4. Enable HTTPS for production
5. Optimize images before deployment
6. Test on multiple devices and browsers

## 🤝 Contributing
1. Follow the existing code structure
2. Maintain consistent styling with the design system
3. Test on multiple browsers and devices
4. Update this README if adding new features

## 📄 License
[Add your license here]

## 👨‍💻 Author
E-Sell Development Team

## 📞 Support
For issues or questions, please contact the development team.

---

**Last Updated**: December 2025
**Version**: 1.0.0
