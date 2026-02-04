# Activity Logs Feature Documentation

## Overview
The Activity Logs feature provides comprehensive tracking and monitoring of all user activities within the Inventory Management System. It follows international standards for audit logging and provides a modern, responsive interface for viewing and filtering activities.

## Features

### Backend Features
- **Comprehensive Logging**: Tracks CREATE, UPDATE, DELETE, LOGIN, and LOGOUT actions
- **Advanced Filtering**: Filter by action type, module, date range, and search terms
- **Pagination**: Efficient pagination with configurable page sizes
- **Statistics**: Activity statistics by action type and module
- **User Context**: Logs include user information and IP addresses
- **Performance Optimized**: Indexed queries for fast retrieval

### Frontend Features
- **Reactive Forms**: Uses Angular Reactive Forms for better validation and control
- **Material Design**: Modern UI following Material Design principles
- **Real-time Updates**: Reactive data handling with RxJS
- **Advanced Filtering**: Multiple filter options with debounced search
- **Responsive Design**: Mobile-first responsive design
- **Accessibility**: WCAG compliant interface
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Professional loading indicators
- **Pagination**: Material paginator with configurable options

## Technical Implementation

### Backend Structure
```
backend/src/
├── controllers/activitylog.controller.js  # Main controller
├── models/activitylog.js                  # MongoDB model
├── routes/activitylog.routes.js           # API routes
└── services/activitylog.service.js        # Business logic
```

### Frontend Structure
```
frontend/src/app/
├── dashboard/activity-logs/               # Activity logs component
│   ├── activity-logs.component.ts        # Main component
│   ├── activity-logs.component.html      # Template
│   └── activity-logs.component.scss      # Styles
└── shared/services/
    └── activity-logs.service.ts           # Service layer
```

### API Endpoints

#### GET /api/activitylog
Retrieve activity logs with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in entity name and description
- `action` (string): Filter by action type
- `module` (string): Filter by module
- `startDate` (string): Filter from date (ISO format)
- `endDate` (string): Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "user": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "CREATE",
      "module": "Products",
      "entityName": "Product ABC",
      "description": "Created Product ABC in Products",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "totalPages": 10,
    "currentPage": 1,
    "limit": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST /api/activitylog
Create a new activity log entry.

**Request Body:**
```json
{
  "action": "CREATE",
  "module": "Products",
  "entityId": "product_id",
  "entityName": "Product ABC",
  "description": "Created new product"
}
```

#### GET /api/activitylog/stats
Get activity statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "actionStats": [
      { "_id": "CREATE", "count": 50 },
      { "_id": "UPDATE", "count": 30 }
    ],
    "moduleStats": [
      { "_id": "Products", "count": 40 },
      { "_id": "Inventory", "count": 25 }
    ]
  }
}
```

## Usage Examples

### Logging Activities in Components
```typescript
import { ActivityLogsService } from '../shared/services/activity-logs.service';

constructor(private activityService: ActivityLogsService) {}

// Log a create action
createProduct(product: Product) {
  this.productService.create(product).subscribe(result => {
    // Log the activity
    this.activityService.logCreate('Products', product.name, result.id)
      .subscribe();
  });
}

// Log an update action
updateProduct(product: Product) {
  this.productService.update(product).subscribe(() => {
    this.activityService.logUpdate('Products', product.name, product.id)
      .subscribe();
  });
}
```

### Viewing Activity Logs
Navigate to `/dashboard/activity-logs` to view the activity logs interface.

## Styling Standards

### Design Principles
- **Material Design**: Follows Google's Material Design guidelines
- **Accessibility**: WCAG 2.1 AA compliant
- **Responsive**: Mobile-first responsive design
- **Consistency**: Consistent with the overall application theme
- **Performance**: Optimized for fast loading and smooth interactions

### Color Scheme
- **Primary**: Blue gradient (#667eea to #764ba2)
- **Success**: Green (#4caf50)
- **Warning**: Orange (#ff9800)
- **Error**: Red (#f44336)
- **Info**: Blue (#2196f3)

### Typography
- **Headers**: Roboto, 28px, 600 weight
- **Body**: Roboto, 14px, 400 weight
- **Captions**: Roboto, 12px, 400 weight

## Routing Configuration

The activity logs are accessible via:
- **Path**: `/dashboard/activity-logs`
- **Component**: `ActivityLogsComponent`
- **Module**: `DashboardModule`
- **Guard**: `AuthGuard` (authentication required)

## Performance Considerations

### Backend Optimizations
- **Database Indexing**: Indexed on `createdAt` for fast sorting
- **Pagination**: Server-side pagination to handle large datasets
- **Query Optimization**: Efficient MongoDB aggregation queries
- **Caching**: Consider implementing Redis caching for frequently accessed data

### Frontend Optimizations
- **Lazy Loading**: Component is lazy-loaded within dashboard module
- **Debounced Search**: 300ms debounce on search input
- **Virtual Scrolling**: Consider for very large datasets
- **OnPush Strategy**: Use OnPush change detection for better performance

## Security Considerations

### Data Protection
- **User Authentication**: All endpoints require authentication
- **Data Sanitization**: Input validation and sanitization
- **IP Logging**: Track IP addresses for security auditing
- **Access Control**: Role-based access to sensitive logs

### Privacy Compliance
- **Data Retention**: Implement log retention policies
- **PII Protection**: Avoid logging sensitive personal information
- **Audit Trail**: Maintain immutable audit trail
- **Compliance**: GDPR and other privacy regulation compliance

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live updates
- **Export Functionality**: Export logs to CSV/PDF
- **Advanced Analytics**: Charts and graphs for activity trends
- **Alert System**: Notifications for suspicious activities
- **Bulk Operations**: Bulk delete/archive old logs
- **Advanced Search**: Full-text search capabilities

### Technical Improvements
- **Microservices**: Extract to dedicated logging microservice
- **Event Sourcing**: Implement event sourcing pattern
- **Message Queues**: Async logging with message queues
- **Elasticsearch**: Advanced search and analytics
- **Monitoring**: Application performance monitoring

## Troubleshooting

### Common Issues
1. **Logs not appearing**: Check authentication and API connectivity
2. **Slow loading**: Verify database indexes and query optimization
3. **Filter not working**: Check date format and parameter validation
4. **Pagination issues**: Verify total count calculation

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in backend.

## Contributing

When contributing to the activity logs feature:
1. Follow the established coding standards
2. Add comprehensive tests for new functionality
3. Update documentation for any changes
4. Ensure accessibility compliance
5. Test on multiple devices and browsers

## License

This feature is part of the Inventory Management System and follows the same licensing terms.