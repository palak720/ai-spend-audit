# Test Inventory

## Automated Tests
- `tests/audit-engine.spec.ts`:
  - Correctly computes monthly and annual savings by tool
  - Flags over-provisioned team plans for low seat counts
  - Recommends same-vendor downgrade when fit exists
  - Recommends alternative vendor when materially cheaper and capability-fit
  - Returns honest outcome when spend is already near-optimal

## How to run
- `npm test`