# Role-Based Access Control (RBAC) System

## Overview
This inventory management system implements a two-tier role-based access control system with **Admin** and **User** roles.

## Roles and Permissions

### Admin Role
**Full system access with management capabilities:**

#### Products
- ✅ View all products
- ✅ Create new products
- ✅ Update existing products
- ✅ Delete products

#### Inventory Management
- ✅ View stock levels
- ✅ Add stock (stock movements)
- ✅ Remove stock (stock movements)
- ✅ Update stock level rules (min stock, reorder levels)

#### Purchase Orders
- ✅ View all purchase orders
- ✅ Create purchase orders
- ✅ Approve purchase orders
- ✅ Receive purchase orders
- ✅ Delete purchase orders

#### Settings
- ✅ View/Update personal settings (security, notifications, inventory)
- ✅ View/Update business settings (global company settings)

#### Reports
- ✅ View all reports and analytics

### User Role
**Limited access focused on viewing and basic operations:**

#### Products
- ✅ View all products
- ❌ Create new products
- ❌ Update existing products
- ❌ Delete products

#### Inventory Management
- ✅ View stock levels
- ❌ Add stock (stock movements)
- ❌ Remove stock (stock movements)
- ❌ Update stock level rules

#### Purchase Orders
- ✅ View all purchase orders
- ✅ Create purchase orders
- ❌ Approve purchase orders
- ❌ Receive purchase orders
- ❌ Delete purchase orders

#### Settings
- ✅ View/Update personal settings (security, notifications, inventory)
- ❌ View/Update business settings

#### Reports
- ✅ View all reports and analytics

## Implementation Details

### Backend Protection
- Routes are protected using `verifytoken` middleware for authentication
- Role-specific routes use `restrictto(['admin'])` middleware
- User role is stored in JWT token and database

### Frontend Protection
- `RoleGuard` service protects routes based on required roles
- `HasRoleDirective` conditionally shows/hides UI elements
- AuthService provides role checking methods

### Default Behavior
- New users are assigned 'user' role by default
- Admin users must be manually assigned in the database
- Unauthorized access redirects to dashboard with appropriate error messages

## Usage Examples

### Backend Route Protection
```javascript
// Admin only
router.post("/", verifytoken, restrictto(['admin']), controller.create);

// Both admin and user
router.get("/", verifytoken, controller.getAll);
```

### Frontend Role Directive
```html
<!-- Show only for admin -->
<button *appHasRole="'admin'" (click)="deleteProduct()">Delete</button>

<!-- Show for both admin and user -->
<button *appHasRole="['admin', 'user']" (click)="viewProduct()">View</button>
```

### Role Checking in Components
```typescript
// Check if user is admin
if (this.authService.hasRole('admin')) {
  // Show admin features
}

// Check if user has any of the specified roles
if (this.authService.hasAnyRole(['admin', 'user'])) {
  // Show features for both roles
}
```

## Security Notes
- All sensitive operations require admin role
- Business settings are admin-only to prevent unauthorized system changes
- Stock movements are admin-only to maintain inventory integrity
- Personal settings remain user-accessible for individual preferences