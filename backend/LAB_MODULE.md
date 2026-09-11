# Diagnostics module

The lab module uses the existing PostgreSQL connection, `users` accounts and JWT login. Its tables use the `lab_` prefix. Hospital APIs, tables and dashboard screens are unchanged; the dashboard navigation groups the existing hospital menu alongside the lab menu, with one group expanded at a time on desktop and mobile.

## Access and setup

- Administrator: `/dashboard` → **Lab Dashboard**.
- Patient: `/labs` (also available through **Lab Tests** in the site navigation).
- Collector / laboratory: `/labs/workspace`.

Run `npm run db:migrate` in `backend` before starting the server. Migration `006_lab_module.sql` is additive. It does not create fictitious laboratories, tests, prices or collectors.

In the lab dashboard, add service areas and collection fees, tests/packages and prices, laboratories, then collectors attached to areas. Under **Users & Permissions**, assign an existing registered account to a collector or laboratory. Revocation and deactivation take effect on subsequent API requests. The user signs in with the existing login page. Admin-created bookings explicitly select the patient account that receives access to the booking and report.

## Workflow

`confirmed → assigned → collected → received → processing → report_ready`

Admin assigns a collector serving the booking's area and an active lab. Collection and sample receipt require the matching sample ID. Collectors update only their own collections; laboratory accounts process only their assigned samples. A PDF must be uploaded before marking a report ready. Patients can download only their own ready reports. PDFs (maximum 5 MB) are stored in PostgreSQL and served by an authenticated download endpoint, not a public file URL. Sample IDs can be entered manually or using an existing scanner configured to type the label ID.

Prices and item names are snapshotted when booking. The server calculates the total from the catalogue and collection fee. Duplicate retries with the same request key return the existing booking. State transitions, payments and settlement updates run in transactions with booking locks and an activity log. Cancellation is available before collection; payments must be refunded before cancellation. Settled bookings need manual reconciliation before refunds.

## Current integration boundaries

- Uses existing account login, not mobile OTP. No OTP provider is configured.
- Cash on collection is supported. Payment and settlement screens record receipts/transfers made outside the application; they do not initiate online payments or bank transfers.
- Patient/staff booking lists refresh every 30 seconds while visible, with status history and report downloads inside the app. SMS, WhatsApp and push delivery require a provider integration and are not sent by this module.
- Admin assignment is filtered by service area; it does not estimate physical proximity or automatically choose a collector. Directions open the entered address in Maps.
- This adds responsive web workspaces, not native mobile applications.
- Dashboard lists currently cover the latest 500 bookings; analytics aggregate all bookings. User selection supports the first 1,000 registered accounts. Larger deployments need paginated history and account search.

## Verification

Run `node --test tests/lab.test.js` in `backend`. The tests use an isolated random schema and remove only that schema after completion. They exercise pricing, duplicate booking requests, patient isolation, role permissions, matching sample IDs, transitions, PDF access, payment validation, settlement duplication and membership revocation.
