# Visacasa - New Features Guide

## 🎉 New Features Implemented

This document guides you through the new features added to your Visacasa application.

---

## 1. Favorites System ❤️

### How to Use

**As a Customer:**
1. Browse products on the home screen
2. Tap the **heart icon** in the top-right corner of any product card
3. Product is instantly added to favorites (optimistic UI)
4. Access your favorites: Navigate to **Favorites screen** from the menu
5. Remove from favorites: Tap the filled heart icon again

**Features:**
- ✅ Instant feedback (no waiting for server)
- ✅ Pull-to-refresh to sync latest favorites
- ✅ View all favorite products in one place
- ✅ Tap product to view details
- ✅ Heart icon changes: outline → filled when favorited

**Navigation:**
```javascript
// Navigate to favorites screen
navigation.navigate('Favorites');

// Or add a button in your profile/menu:
<TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
  <Text>Meus Favoritos</Text>
</TouchableOpacity>
```

---

## 2. Price Comparison 📊

### How to Use

**As a Customer:**
1. Browse product list
2. Select 2 or more products (TODO: add checkboxes to product list)
3. Navigate to Price Comparison screen
4. View comparison with:
   - ⭐ Cheapest product highlighted with **gold border** and trophy icon
   - 🔢 Price differences in Meticais and percentages
   - 📈 Summary statistics (lowest, highest, average prices)
   - 💰 Potential savings shown

**What You See:**
- **Gold Trophy Badge**: Cheapest product
- **Orange Boxes**: Shows how much more you'd pay for other options
- **Summary Panel**: Key statistics at a glance

**Navigation:**
```javascript
// Navigate to price comparison
navigation.navigate('PriceComparison');
```

---

## 3. API Endpoints

### Favorites API

**Base URL:** `http://localhost:5000/api/favorites`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/toggle` | Add or remove favorite |
| GET | `/user/:userId` | Get all user favorites (paginated) |
| GET | `/check?userId=X&productId=Y` | Check if product is favorited |
| GET | `/user/:userId/count` | Get total favorites count |
| DELETE | `/remove` | Remove specific favorite |
| DELETE | `/user/:userId/clear` | Clear all favorites |

**Example: Toggle Favorite**
```javascript
import api from './hooks/createConnectionApi';

const response = await api.post('/favorites/toggle', {
  userId: '507f1f77bcf86cd799439011',
  productId: '607f191e810c19729de860ea'
});

// Response:
// { success: true, isFavorited: true, message: "Adicionado aos favoritos" }
```

### Price Comparison API

**Base URL:** `http://localhost:5000/api/comparisons`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create new comparison |
| GET | `/user/:userId` | Get user comparisons (paginated) |
| GET | `/:id` | Get specific comparison details |
| POST | `/:id/add-product` | Add product to comparison |
| DELETE | `/:id/remove-product/:productId` | Remove product |
| GET | `/user/:userId/stats` | Get comparison statistics |

**Example: Create Comparison**
```javascript
const response = await api.post('/comparisons/create', {
  userId: '507f1f77bcf86cd799439011',
  name: 'Laptop Comparison',
  productIds: ['607f...', '608f...', '609f...']
});

// Response includes calculated metadata:
// {
//   success: true,
//   comparison: {
//     metadata: {
//       cheapestProduct: '607f...',
//       lowestPrice: 15000,
//       highestPrice: 25000,
//       maxDifference: 10000,
//       maxDifferencePercentage: 66.67
//     }
//   }
// }
```

---

## 4. Redux State Management

### Favorites State

**Selectors:**
```javascript
import { useSelector } from 'react-redux';
import { selectFavorites, selectIsFavorited } from './features/favoriteSlice';

// Get all favorites
const favorites = useSelector(selectFavorites);

// Check if specific product is favorited
const isFavorited = useSelector(selectIsFavorited(productId));
```

**Actions:**
```javascript
import { useDispatch } from 'react-redux';
import { toggleFavoriteOptimistic } from './features/favoriteSlice';

const dispatch = useDispatch();

// Toggle favorite (optimistic update)
dispatch(toggleFavoriteOptimistic(productId));
```

### Comparison State

**Selectors:**
```javascript
import { selectSelectedProducts, selectComparisonResults } from './features/comparisonSlice';

const selectedProducts = useSelector(selectSelectedProducts);
const results = useSelector(selectComparisonResults);
```

---

## 5. Testing the Features

### Start Backend
```bash
cd backend
npm install
npm start
```

Backend will run on `http://localhost:5000`

### Start Mobile App
```bash
cd visacasa
npm install
npx expo start
```

### Test Favorites
1. Launch app
2. Login as customer
3. Browse home screen
4. Tap heart icon on any product → Should fill red
5. Navigate to Favorites screen → Product should appear
6. Tap heart again → Product should be removed
7. Pull down to refresh → Should reload favorites

### Test Price Comparison
1. Use Postman to create a comparison:
```
POST http://localhost:5000/api/comparisons/create
Body: {
  "userId": "YOUR_USER_ID",
  "productIds": ["PRODUCT_1", "PRODUCT_2", "PRODUCT_3"]
}
```
2. Navigate to PriceComparison screen in app
3. Should see products with cheapest highlighted

---

## 6. Performance Optimizations

### What Was Optimized
- ✅ `ProductCardView` wrapped with `React.memo`
- ✅ `FavoriteButton` extracted as memoized component
- ✅ `useCallback` used for all event handlers
- ✅ Optimistic UI updates (no waiting for network)

### Benefits
- **Faster rendering**: Product lists scroll smoothly
- **Reduced re-renders**: Only changed components update
- **Better UX**: Instant feedback on user actions

---

## 7. Troubleshooting

### "Favorites not showing"
- Check if user is logged in (`user._id` exists)
- Verify backend is running on port 5000
- Check network requests in dev tools
- Ensure MongoDB is connected

### "Price comparison not loading"
- Need at least 2 products selected
- Verify backend is running
- Check `selectSelectedProducts` in Redux DevTools

### "Heart icon not working"
- Must be logged in first
- Check console for errors
- Verify `userSlice` has user data

---

## 8.Next Steps (TODO)

### High Priority
1. **Add Product Selection Checkboxes**
   - Modify `ProductCardView` to show checkbox
   - Connect to `comparison` Redux state
   - Add "Compare" button to show comparison screen

2. **Add Favorites Tab**
   - Modify `ButtomTabNavegation.js`
   - Add new tab for Favorites
   - Use heart icon for tab

3. **Infinite Scroll**
   - Implement in `NewProducts.jsx`
   - Use `FlatList` `onEndReached`
   - Add skeleton loaders

### Medium Priority
4. **Image Caching** - Install `react-native-fast-image`
5. **Sentry Integration** - Error monitoring
6. **Enhanced Animations** - Use Reanimated

---

## 9. File Structure

```
visacasa/
├── features/
│   ├── favoriteSlice.js     ← Favorites Redux state
│   ├── comparisonSlice.js   ← Comparison Redux state
│   ├── userSlice.js         ← User state (needs to exist)
│   └── ...
├── screens/
│   ├── FavoritesScreen.jsx   ← NEW: Favorites management
│   └── PriceComparisonScreen.jsx  ← NEW: Price comparison
├── components/
│   └── products/
│       └── ProductCardView.jsx  ← ENHANCED: With heart button
└── store.js  ← UPDATED: Includes new reducers

backend/
├── models/
│   ├── FavoriteModel.js         ← NEW: Favorites schema
│   └── PriceComparisonModel.js  ← NEW: Comparison schema
├── routes/
│   ├── favoriteRoutes.js        ← NEW: 8 endpoints
│   └── priceComparisonRoutes.js ← NEW: 8 endpoints
└── index.js  ← UPDATED: Registered new routes
```

---

## 10. Support

For bugs or questions, check:
- `walkthrough.md` - Complete implementation details
- `implementation_plan.md` - Original technical plan
- Console logs for debugging

Happy coding! 🚀
