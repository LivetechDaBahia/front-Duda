# API Integration Guide

This application is now ready to connect to a backend API. Currently, it's using mock data for development purposes.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Set to false when connecting to a real API
VITE_USE_MOCK_DATA=true
```

## API Endpoints

The application expects the following API endpoints:

### Get All Orders
- **Endpoint**: `GET /api/orders`
- **Response**: Array of `PurchaseOrder` objects

```typescript
interface PurchaseOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  value: number;
  status: 'pending' | 'processing' | 'approved' | 'completed' | 'declined' | 'cancelled';
  items: number;
  createdAt: string;
  dueDate: string;
  description: string;
  shippingAddress: string;
  billingAddress: string;
  needsApproval?: boolean;
}
```

### Get Single Order
- **Endpoint**: `GET /api/orders/:orderId`
- **Response**: Single `PurchaseOrder` object

### Update Order Status
- **Endpoint**: `PATCH /api/orders/:orderId/status`
- **Request Body**:
```json
{
  "status": "approved" | "declined" | "pending" | "processing" | "completed" | "cancelled"
}
```
- **Response**: Updated `PurchaseOrder` object

### Create Order
- **Endpoint**: `POST /api/orders`
- **Request Body**: `PurchaseOrder` object (without `id`)
- **Response**: Created `PurchaseOrder` object with `id`

### Delete Order
- **Endpoint**: `DELETE /api/orders/:orderId`
- **Response**: 204 No Content

## Switching to Real API

1. Set up your backend API with the endpoints listed above
2. Update `.env` file:
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   VITE_USE_MOCK_DATA=false
   ```
3. Restart the development server

## API Service

The API calls are centralized in `src/services/orderService.ts`. This service handles all HTTP requests and can be easily extended with additional endpoints.

## Data Fetching

The application uses:
- **React Query (@tanstack/react-query)** for data fetching, caching, and state management
- **Custom Hook (`useOrders`)** that provides:
  - `orders`: Array of all orders
  - `isLoading`: Loading state
  - `error`: Error state
  - `refetch`: Function to manually refetch data
  - `updateStatus`: Function to update order status
  - `approveOrder`: Function to approve an order
  - `declineOrder`: Function to decline an order
  - `isUpdating`: Loading state for mutations

## Authentication

Currently, the application uses mock authentication. When connecting to a real API, you'll need to:

1. Add authentication tokens to API requests in `src/services/orderService.ts`:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
}
```

2. Implement token management in `src/contexts/AuthContext.tsx`

## Error Handling

- Network errors are caught and displayed to users
- Loading states show spinner UI
- React Query automatically retries failed requests once
- Toast notifications inform users of success/error states

## Localization

All user-facing messages support three languages:
- English (en)
- Portuguese Brazil (pt-BR)
- Spanish Spain (es-ES)

API error messages will need to be localized on the backend or mapped in the frontend.
