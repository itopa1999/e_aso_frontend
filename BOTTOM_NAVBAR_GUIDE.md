# Bottom Navbar Guide - Complete Explanation

## 📱 Overview

The **Bottom Navbar** is a mobile-first navigation menu fixed at the bottom of the page. It provides quick access to the main sections of your app.

---

## 🏗️ Structure

```html
<nav class="bottom-navbar">
    <a href="index.html" class="nav-item active">
        <i class="fas fa-home nav-icon"></i>
        <span>Home</span>
    </a>
    <a href="search-result.html" class="nav-item">
        <i class="fas fa-search nav-icon"></i>
        <span>Search</span>
    </a>
    <a href="watchlist.html" class="nav-item">
        <i class="fas fa-heart nav-icon"></i>
        <span>Wishlist</span>
        <span class="nav-badge" id="watchlist-count">0</span>
    </a>
    <a href="ordered-lists.html" class="nav-item">
        <i class="fas fa-shopping-bag nav-icon"></i>
        <span>Orders</span>
    </a>
</nav>
```

---

## 🔍 Component Breakdown

### **1. Bottom Navbar Container**
```html
<nav class="bottom-navbar">
```
- **Class**: `bottom-navbar`
- **Type**: Navigation element (`<nav>`)
- **Position**: Fixed at bottom of screen
- **Visibility**: Primarily for mobile, hidden on desktop
- **Background**: White with shadow
- **Z-index**: 100 (stays above content)
- **Height**: ~60-70px

---

### **2. Navigation Items** 

Each nav item is a link with 3 parts:

#### **Item Structure:**
```html
<a href="page.html" class="nav-item">
    <i class="fas fa-icon nav-icon"></i>
    <span>Label</span>
    <span class="nav-badge">Count</span>  <!-- Optional -->
</a>
```

---

## 📋 The Four Main Sections

### **① HOME** 🏠
```html
<a href="index.html" class="nav-item active">
    <i class="fas fa-home nav-icon"></i>
    <span>Home</span>
</a>
```

| Property | Value |
|----------|-------|
| **Icon** | `fas fa-home` (House) |
| **Label** | "Home" |
| **Link** | `index.html` |
| **Badge** | None |
| **Active State** | `active` class (highlighted on home page) |
| **Purpose** | Return to homepage |

**Visual State on Home Page:**
- Icon color: Brown (primary color)
- Text: Bold, brown
- Background: Light beige highlight
- Indicates: "You are here"

**Desktop Behavior:**
- Hidden on screens larger than 768px
- Top header takes over navigation role

---

### **② SEARCH** 🔍
```html
<a href="search-result.html" class="nav-item">
    <i class="fas fa-search nav-icon"></i>
    <span>Search</span>
</a>
```

| Property | Value |
|----------|-------|
| **Icon** | `fas fa-search` (Magnifying glass) |
| **Label** | "Search" |
| **Link** | `search-result.html` |
| **Badge** | None |
| **Purpose** | Navigate to search results page |

**Function:**
- Leads to search results page
- Shows filtered/searched products
- Can be combined with filters

---

### **③ WISHLIST** ❤️
```html
<a href="watchlist.html" class="nav-item">
    <i class="fas fa-heart nav-icon"></i>
    <span>Wishlist</span>
    <span class="nav-badge" id="watchlist-count">0</span>
</a>
```

| Property | Value |
|----------|-------|
| **Icon** | `fas fa-heart` (Heart) |
| **Label** | "Wishlist" |
| **Link** | `watchlist.html` |
| **Badge** | `#watchlist-count` (Shows item count) |
| **Purpose** | View saved/favorited items |

**Badge Details:**
- **ID**: `watchlist-count`
- **Default Value**: `0`
- **Updated By**: JavaScript (`index.js`)
- **Display**: Red circle with white number
- **Visibility**: 
  - Hidden when count is 0
  - Visible when count > 0
  - Shows exact number of items

**Example Badge States:**
- Empty: Badge hidden (or shows "0")
- 1 item: Shows "1"
- 5 items: Shows "5"
- 12+ items: Shows "12+"

**Function:**
- Quick access to favorite items
- Track items for later purchase
- Compare items before buying

---

### **④ ORDERS** 🛍️
```html
<a href="ordered-lists.html" class="nav-item">
    <i class="fas fa-shopping-bag nav-icon"></i>
    <span>Orders</span>
</a>
```

| Property | Value |
|----------|-------|
| **Icon** | `fas fa-shopping-bag` (Shopping bag) |
| **Label** | "Orders" |
| **Link** | `ordered-lists.html` |
| **Badge** | None |
| **Purpose** | View order history |

**Function:**
- See all past orders
- Track order status
- View order details
- Reorder items

---

## 🎨 Visual Styling

### **Default Style:**
```css
.bottom-navbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 60px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    z-index: 100;
    border-top: 1px solid #eee;
}
```

### **Nav Item Style:**
```css
.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    color: #777;
    text-decoration: none;
    flex: 1;
    padding: 8px;
    transition: all 0.3s ease;
}

.nav-item.active,
.nav-item:hover {
    color: var(--primary-color);
    background: var(--light-color);
}
```

### **Icon Style:**
```css
.nav-icon {
    font-size: 1.5rem;
    width: 24px;
    height: 24px;
}
```

### **Badge Style:**
```css
.nav-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #e74c3c;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
}
```

---

## 📱 Responsive Behavior

### **Mobile (below 768px):**
- ✅ **Visible** - Fixed at bottom
- All 4 items displayed
- Touch-friendly spacing (60px height)
- Takes up ~10% of screen height
- Full width

### **Tablet (768px - 1024px):**
- ✅ **Visible** - Still fixed at bottom
- Adjusts width for larger screen
- Better spacing between items

### **Desktop (1024px+):**
- ❌ **Hidden** - Uses top header instead
- Top navigation bar takes over
- Bottom navbar removed from view
- More screen space for content

---

## 🔄 Active State Management

### **How Active State Works:**

```javascript
// When page loads, JavaScript adds 'active' class to current page nav item
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});
```

### **Visual Indicators:**
- **Icon Color**: Changes to primary color (#8a4b38)
- **Text Color**: Changes to primary color
- **Background**: Light beige highlight
- **Font Weight**: Slightly bolder

---

## 🎯 Badge System

### **Wishlist Badge Updates:**

The badge count is updated dynamically based on localStorage:

```javascript
// Update wishlist badge
function updateWishlistBadge() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const badge = document.getElementById('watchlist-count');
    
    if (wishlist.length > 0) {
        badge.textContent = wishlist.length;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// Call when adding/removing items
updateWishlistBadge();
```

### **Badge Display Rules:**
- Show count only when > 0
- Update in real-time when items added/removed
- Persist across page navigations
- Clear when user empties wishlist

---

## 🚀 User Journey

### **Typical Navigation Path:**
```
1. Land on Home (bottom-navbar shown)
   ↓
2. User browses products
   ↓
3. Clicks Wishlist icon (heart) → Adds item
   ↓
4. Badge updates showing count
   ↓
5. User clicks Wishlist nav item → Views saved items
   ↓
6. User clicks Search icon → Searches for more
   ↓
7. User clicks Orders → Views past purchases
   ↓
8. Clicks Home to start over
```

---

## 🎨 Color Scheme

| Element | Default | Active | Hover |
|---------|---------|--------|-------|
| **Icon** | #777 (gray) | #8a4b38 (brown) | #8a4b38 (brown) |
| **Text** | #777 (gray) | #8a4b38 (brown) | #8a4b38 (brown) |
| **Background** | transparent | #f9f5f0 (light beige) | #f9f5f0 (light beige) |
| **Badge** | N/A | #e74c3c (red) | #e74c3c (red) |

---

## 📊 Touch Targets

### **Mobile Accessibility:**
- Each nav item: **60px height** minimum
- Each nav item: **25% width** (4 items across)
- Target area: **Finger-friendly** (at least 48px)
- Gap between items: **5-10px**

---

## 🔌 JavaScript Integration

### **Essential Functions:**

**1. Update Active State:**
```javascript
function setActiveNav(pageName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`a[href="${pageName}"]`);
    if (activeItem) activeItem.classList.add('active');
}
```

**2. Update Wishlist Badge:**
```javascript
function updateWishlistBadge() {
    const count = localStorage.getItem('wishlist-count') || 0;
    const badge = document.getElementById('watchlist-count');
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
}
```

**3. Add Bottom Padding to Body:**
```javascript
// Prevent content from hiding behind fixed navbar
document.body.style.paddingBottom = '70px'; // On mobile
```

---

## ✅ Checklist for Implementation

- [ ] Bottom navbar CSS is loaded
- [ ] All 4 nav items have correct href links
- [ ] Home page has `active` class by default
- [ ] Wishlist badge ID matches in HTML (`#watchlist-count`)
- [ ] Badge updates when items added/removed
- [ ] Navbar hidden on desktop (768px+)
- [ ] Icons load correctly (Font Awesome 7.0)
- [ ] Active state styling visible
- [ ] Touch targets properly sized
- [ ] No content hidden behind navbar (body padding)

---

## 🎯 Tour Guide Integration

The tour guide highlights:
1. **Home Nav** - First step
2. **Search Nav** - Finding products
3. **Wishlist Nav** - Saving favorites
4. **Orders Nav** - Tracking purchases

---

## 📝 Summary

| Feature | Details |
|---------|---------|
| **Type** | Fixed bottom navigation |
| **Items** | 4 main sections |
| **Visibility** | Mobile only (< 768px) |
| **Active State** | Highlighted current page |
| **Badges** | Wishlist count (dynamic) |
| **Icons** | Font Awesome 7.0 |
| **Colors** | Brown theme with beige highlight |
| **Responsive** | Fully adaptive |
| **Accessibility** | Touch-friendly targets |

---

**Last Updated**: December 2025
