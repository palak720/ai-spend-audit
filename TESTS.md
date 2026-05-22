# Test Inventory

## Automated Tests
- `tests/audit-engine.spec.ts`:
  - computes monthly and annual savings totals
  - flags over-provisioned team plans for low seat counts
  - recommends same-vendor downgrade when materially cheaper
  - recommends alternative vendor when substantially cheaper
  - returns honest keep recommendation when already cost-efficient

## How to run
- `npm test`
