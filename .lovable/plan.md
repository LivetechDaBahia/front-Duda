
# Fix: Credit Item Assignment for Coordinators

## Problem
Credit coordinators cannot assign items to other users when a card is already assigned. Two bugs cause this:

1. **All actions hidden for read-only users**: The `isReadOnly` flag gates the entire actions menu (`onActionsClick`), removing assignment options even for users who have assignment permissions.
2. **Wrong operator (`??` vs `||`)**: In `CreditCard.tsx`, `isCreditManager ?? canAssignCreditToOthers` uses the nullish coalescing operator, which does NOT fall through when `isCreditManager` is `false` -- it only falls through on `null`/`undefined`. This means `canAssignCreditToOthers` is never evaluated.

## Solution

### 1. Credit.tsx -- Always pass `onActionsClick`
Currently, `isReadOnly` disables both status changes AND actions. We need to separate these concerns:
- `onStatusChange` should still be gated by `isReadOnly` (prevents drag-and-drop status moves)
- `onActionsClick` should ALWAYS be passed, so assignment and other non-destructive actions remain available

Change lines 408 and 419 from:
```
onActionsClick={isReadOnly ? undefined : handleActionsClick}
```
to:
```
onActionsClick={handleActionsClick}
```

### 2. CreditCard.tsx -- Fix `??` to `||`
Change line 62 from:
```
const canAssignToOthers = isCreditManager ?? canAssignCreditToOthers;
```
to:
```
const canAssignToOthers = isCreditManager || canAssignCreditToOthers;
```

### 3. CreditCard.tsx -- Hide status-change actions for read-only users
Since we're now always passing `onActionsClick`, we need to ensure read-only users still cannot change statuses via the card's actions. The card currently only has assignment and log-viewing actions (no status change in the dropdown), so no additional gating is needed there. The status change is controlled via drag-and-drop (already gated by `isReadOnly` through `canDragCredit`).

### 4. CreditTableView.tsx -- Same `||` fix
Line 61: Change `isCreditManager || canAssignCreditToOthers` -- this one is already correct with `||`. No change needed.

Also, ensure `onActionsClick` is always passed in the table view (same fix as kanban).

## Files to modify
- `src/pages/Credit.tsx` (2 lines -- always pass `onActionsClick`)
- `src/components/credit/CreditCard.tsx` (1 line -- `??` to `||`)

## Technical note
The `onStatusChange` prop remains gated by `isReadOnly`, so read-only users still cannot drag cards or change statuses. Only assignment and log-viewing actions become available.
