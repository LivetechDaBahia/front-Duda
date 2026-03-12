

## Plan: Add Client Contracts Tab to Credit Detail Panel

### Changes Required

**1. Add `CreditContract` type to `src/types/credit.ts`**
- Add interface with fields: `contract`, `additive`, `efctDate`, `clientId`, `clientBranch`, `clientName`, `contractValue`, `billValue`, `balance`

**2. Add `getClientContracts` to `src/services/creditService.ts`**
- `GET /credit/contracts?clientId={clientId}&branch={branch}`

**3. Add contracts query to `src/hooks/useCreditDetails.ts`**
- New `useQuery` for contracts using `clientBranch` and `clientId` params
- Return `contracts` and `isLoadingContracts`

**4. Add translations to `src/contexts/LocaleContext.tsx`**
- Keys: `credit.contracts`, `credit.contract`, `credit.additive`, `credit.effectiveDate`, `credit.contractValue`, `credit.billValue`, `credit.balance` (en, pt-BR, es-ES)

**5. Update `src/components/credit/CreditDetailPanel.tsx`**
- Add a 6th tab trigger "Contracts" to the TabsList (update grid to `grid-cols-3 grid-rows-2` stays, just add one more trigger)
- Add `TabsContent value="contracts"` with a table displaying: Contract, Additive, Effective Date, Contract Value, Bill Value, Balance
- Reuse existing `formatCurrency` and `formatDate` helpers already in the component

