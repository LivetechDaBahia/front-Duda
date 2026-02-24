

# Sales Management: Real API Integration + Full Locale Support

## Overview
Replace all mock data usage on the Sales page with real API calls, update types to match the API response models, and add full locale support (en, pt-BR, es-ES) for all labels and messages.

## Files to Create

### 1. `src/types/sales.ts` — Complete rewrite
Replace current mock-oriented types with API-aligned models:
- `SalesElementItem` — matches API response from stage endpoints (id as number, flowId, stageId, group, user, key, entity, name, background, borders, offer, date as ISO string or null, client, clientBranch, sellerGroup, sellerName, currency, value, type, oper, cnpj, tid)
- `Stage` — matches `/sales/stage-sequence` (id, flowId, name, stageSequence, final)
- `SalesElementItemDetails` — matches `/sales/:id` response (branch, order, offer, review, contract, additional, item, product, description, local, numAvailable, numReserved, productOrder, numOp, purchaseOrder, numPo, purchaseRequest, numSc, batch, sequence, include, minDate, nf, shippingObservations, logisticsObservations, offerObservations)
- `SalesFilters` — keep search, status; add sellerName, type, currency filters

### 2. `src/services/salesService.ts` — New service
Follow `creditService.ts` pattern exactly:
- `getCreditStage()` → `GET /sales/credit-stage` → `SalesElementItem[]`
- `getStockStage()` → `GET /sales/stock-stage` → `SalesElementItem[]`
- `getShippingStage()` → `GET /sales/shipping-stage` → `SalesElementItem[]`
- `getAttendedStage()` → `GET /sales/attended-stage` → `SalesElementItem[]`
- `getStageSequence()` → `GET /sales/stage-sequence` → `Stage[]`
- `getItemDetails(id: string)` → `GET /sales/:id` → `SalesElementItemDetails[]`
- All use `apiClient` and `addUIBreadcrumb`

### 3. `src/hooks/useSales.ts` — New hook
Follow `useCredits.ts` pattern:
- Fetch all 4 stage endpoints in parallel using `Promise.all`
- Merge all items into a single `SalesElementItem[]` array
- Return `{ items, isLoading, error, refetch }`

### 4. `src/hooks/useSalesStages.ts` — New hook
Follow `useCreditStatuses.ts` pattern:
- Fetch from `salesService.getStageSequence()`
- Sort by `stageSequence`
- Return `{ stages, isLoading, error }`

### 5. `src/hooks/useSalesDetails.ts` — New hook
Follow `useCreditDetails.ts` pattern (simpler — single endpoint):
- Fetch from `salesService.getItemDetails(id)`
- Enabled when `id` is truthy
- Return `{ details, isLoading, error }`

## Files to Modify

### 6. `src/pages/Sales.tsx` — Major rewrite
- Replace mock imports with `useSales()` and `useSalesStages()` hooks
- Add loading/error states matching Credit page pattern (Loader2 spinner, error display)
- Use `useLocale()` for all labels
- Use `useErrorHandler()` for error handling
- Update filter logic to work with new `SalesElementItem` fields
- Pass `usePermissions().canViewSales` for access control (already done)

### 7. `src/components/sales/SalesCard.tsx` — Update
- Update props to accept `SalesElementItem` and `Stage` (new types)
- Apply `background` and `borders` styling from API data (like CreditCard)
- Use `t()` for all labels (Offer, Client, Value, Seller, Type)
- Format dates using `formatDate` from `@/lib/utils`
- Use locale-aware currency formatting

### 8. `src/components/sales/SalesKanbanView.tsx` — Update
- Update types from `SalesItem`/`SalesStatus` to `SalesElementItem`/`Stage`
- Match items by `stageId` instead of `statusId`
- Use `t()` for empty state message

### 9. `src/components/sales/SalesTableView.tsx` — Update
- Update types to `SalesElementItem`/`Stage`
- Use `t()` for all column headers and empty state
- Add CNPJ, operation columns (hidden on smaller screens)
- Format dates using `formatDate`

### 10. `src/components/sales/SalesDetailPanel.tsx` — Major rewrite
- Replace mock `getSalesItemDetails` with `useSalesDetails` hook
- Show loading skeleton while fetching (like CreditDetailPanel)
- Display `SalesElementItemDetails[]` as a table/list of rows
- Tab structure: "Overview" (item summary from the card data), "Allocation Details" (the details rows from API)
- All labels use `t()`
- `minDate` is DD/MM/YYYY — display as-is, no parsing needed

### 11. `src/components/sales/SalesFilters.tsx` — Update
- Derive filter options from real data (sellers, types, currencies from items)
- Use `t()` for all labels (Status, Type, Seller, placeholders)

### 12. `src/contexts/LocaleContext.tsx` — Add sales translations
Add `sales.*` keys to all three locales (en, pt-BR, es-ES):

**English keys:**
- `sales.title` = "Sales Management"
- `sales.subtitle` = "Track and manage your sales pipeline"
- `sales.offer` = "Offer"
- `sales.client` = "Client"
- `sales.clientBranch` = "Branch"
- `sales.value` = "Value"
- `sales.currency` = "Currency"
- `sales.seller` = "Seller"
- `sales.sellerGroup` = "Sales Group"
- `sales.type` = "Type"
- `sales.operation` = "Operation"
- `sales.cnpj` = "CNPJ"
- `sales.tid` = "TID"
- `sales.date` = "Date"
- `sales.noItems` = "No sales items found"
- `sales.noItemsInStage` = "No items in this stage"
- `sales.searchPlaceholder` = "Search by offer, client, or name..."
- `sales.allStages` = "All Stages"
- `sales.allTypes` = "All Types"
- `sales.allSellers` = "All Sellers"
- `sales.details` = "Details"
- `sales.overview` = "Overview"
- `sales.allocationDetails` = "Allocation Details"
- `sales.branch` = "Branch"
- `sales.order` = "Order"
- `sales.review` = "Review"
- `sales.contract` = "Contract"
- `sales.additional` = "Additional"
- `sales.item` = "Item"
- `sales.product` = "Product"
- `sales.description` = "Description"
- `sales.local` = "Location"
- `sales.numAvailable` = "Qty Available"
- `sales.numReserved` = "Qty Reserved"
- `sales.productOrder` = "Production Order"
- `sales.numOp` = "Qty OP"
- `sales.purchaseOrder` = "Purchase Order"
- `sales.numPo` = "Qty PO"
- `sales.purchaseRequest` = "Purchase Request"
- `sales.numSc` = "Qty SC"
- `sales.batch` = "Batch"
- `sales.sequence` = "Sequence"
- `sales.include` = "Included"
- `sales.minDate` = "Min. Date"
- `sales.nf` = "NF Message"
- `sales.shippingObservations` = "Shipping Obs."
- `sales.logisticsObservations` = "Logistics Obs."
- `sales.offerObservations` = "Offer Obs."
- `sales.errorLoading` = "Error loading sales data"

**Portuguese (pt-BR)** and **Spanish (es-ES)**: equivalent translations for all keys above.

### 13. `src/hooks/usePermissions.ts` — Update
- Update `canViewSales` to also check for `sales:read` / `sales.read` explicitly (already done, just verify)

### 14. `src/data/mockSales.ts` — Delete
No longer needed once real API is integrated.

### 15. `src/components/navigation/AppSidebar.tsx` — Update
- Use `t("sales.title")` for the nav label instead of hardcoded "Sales Management"

## Technical Details

### API Data Flow
```text
Sales Page
├── useSalesStages() → GET /sales/stage-sequence → Stage[]
├── useSales() → Promise.all([
│     GET /sales/credit-stage,
│     GET /sales/stock-stage,
│     GET /sales/shipping-stage,
│     GET /sales/attended-stage
│   ]) → SalesElementItem[]
└── Detail Panel
    └── useSalesDetails(id) → GET /sales/:id → SalesElementItemDetails[]
```

### Card Styling
Cards will render `background` and `borders.left`/`borders.right` from the API, matching the CreditCard pattern where border colors indicate item state.

### Currency Formatting
Reuse the same `formatCurrency` helper already in CreditDetailPanel, extracted into a shared utility or kept inline. The API sends currency codes (BRL, USD) directly — no symbol mapping needed.

### Date Handling
- `date` in `SalesElementItem`: ISO 8601 string or null → parse with `toDateNoTZShift` and format with `formatDate`
- `minDate` in details: arrives as DD/MM/YYYY string → display as-is (no conversion per project convention)

### Error Handling
Use `useErrorHandler` hook for all API error states, consistent with Credit page pattern.

