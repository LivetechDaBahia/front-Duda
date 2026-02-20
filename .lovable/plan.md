

# Sales Management Tab

## Overview
Create a new "Sales Management" page that mirrors the Credit page layout but with read-only kanban cards (no drag-and-drop). It will include a detail side panel with mock data for now, reusing as many existing components as possible.

## What will be built

1. **New route `/sales`** with a Sales Management page
2. **Read-only kanban view** reusing `CreditKanbanView` pattern but without drag-and-drop
3. **Table view** reusing `CreditTableView` pattern (read-only)
4. **Detail side panel** (Sheet) with mock item details, similar to `CreditDetailPanel`
5. **Navigation entry** in the sidebar
6. **Mock data** for sales items, statuses, and detail panel content

## Component Reuse Strategy

| Existing Component | Reuse Approach |
|---|---|
| `CreditHeader` | Create a generic `PageHeader` shared component (title, subtitle, view toggle) to replace both `CreditHeader` and the new sales header |
| `CreditKanbanView` | Create a simplified `SalesKanbanView` that reuses the same column layout but passes no drag handlers (cards are static) |
| `CreditCard` | Create a `SalesCard` component that strips out actions/drag logic, keeping only the informational display |
| `CreditDetailPanel` | Create a `SalesDetailPanel` with its own tabs and mock data |
| `CreditFilters` / `FilterContainer` | Reuse `FilterContainer` directly for search and filters |
| `ScrollArea` | Reuse as-is in kanban columns |

## Technical Details

### New Files

- **`src/pages/Sales.tsx`** -- Main page component (mirrors `Credit.tsx` structure but simpler, read-only)
- **`src/components/sales/SalesCard.tsx`** -- Informational card (no actions menu, no drag)
- **`src/components/sales/SalesKanbanView.tsx`** -- Kanban grid with static columns using `ScrollArea`
- **`src/components/sales/SalesTableView.tsx`** -- Table view (read-only, no actions)
- **`src/components/sales/SalesDetailPanel.tsx`** -- Side panel with mock detail tabs
- **`src/components/sales/SalesHeader.tsx`** -- Header with title and view toggle (reuses same pattern as `CreditHeader`)
- **`src/components/sales/SalesFilters.tsx`** -- Filters using `FilterContainer`
- **`src/data/mockSales.ts`** -- Mock sales items, statuses, and detail data
- **`src/types/sales.ts`** -- Type definitions for sales items

### Modified Files

- **`src/App.tsx`** -- Add `/sales` route with `ProtectedRoute`
- **`src/components/navigation/AppSidebar.tsx`** -- Add Sales Management link (visible to users who can view credit, or configurable)
- **`src/hooks/usePermissions.ts`** -- Add `canViewSales` permission check (initially tied to credit view permission so existing users can access it)

### Data Model (types/sales.ts)

```text
SalesItem
  - id, statusId, client, clientName, seller, value, currency, date, type, offer

SalesStatus
  - id, description, sequence

SalesItemDetails (for detail panel)
  - order info, products, shipping, payment terms
```

### Mock Data Structure

The mock data will include:
- 3-4 status columns (e.g., "New", "In Progress", "Completed", "Cancelled")
- 8-12 sample sales items distributed across statuses
- Detail data with tabs for: Overview, Products, Shipping

### Key Design Decisions

- Cards are purely informational -- no drag-and-drop, no action menus
- Clicking a card opens the detail side panel (same Sheet pattern as credit)
- Filters reuse `FilterContainer` with search + status filter
- The page will be ready for real API integration later (just swap mock data for service calls)

