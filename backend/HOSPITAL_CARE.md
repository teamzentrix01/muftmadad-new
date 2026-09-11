# Hospital care workflow

The hospital module uses the existing Next.js/Express/PostgreSQL application and blue/green theme. Lab and family vault modules are outside this change.

## Start and migrate

From `backend`, run `npm run db:migrate`, then `npm start`. On PowerShell systems that disable `.ps1` scripts, use `npm.cmd`.

Migrations create care tables without deleting existing directory data. `schema.sql` remains the original directory snapshot; apply the migration command after restoring it. `schema_migrations` records applied files and a database lock prevents simultaneous migration runners. Existing administrator roles are preserved. New registrations explicitly receive `isadmin=false`.

The frontend's `NEXT_PUBLIC_API_URL` must point to the backend `/api`. In this local workspace the API is `http://localhost:4002/api`. Development accepts localhost and loopback frontend origins on any port, so Next.js can start on 3000 or choose another available port. In production (`NODE_ENV=production`), `FRONTEND_URL` must match the frontend origin including its port; multiple trusted origins can be comma-separated. The backend checks PostgreSQL connectivity before listening and reports connection failures at startup.

## Routes and setup

- `/dashboard`: administrator's existing directory tools plus the hospital operations dashboard.
- `/care`: patient requirement/search, verified specialists, package comparison and appointment booking.
- `/care?view=bookings`: authenticated patient's appointments, care timeline, assistance and follow-ups.
- `/provider`: staff portal, restricted on the server to hospitals assigned by an administrator.
- `/api/care/*`: public discovery plus authenticated patient and management APIs.

An administrator must first verify/activate doctors and hospitals using the existing directory tools. In **Doctor Availability**, publish future slots at the correct hospital. In **Treatment Packages**, publish actual prices, inclusions/exclusions and validity dates. The module deliberately does not invent availability or prices. In **Hospital Access**, map reviewed concern phrases to specialities and assign registered staff accounts to hospitals. Staff can manage packages, availability, bookings and follow-ups for those hospitals; only administrators grant access or decide financial assistance.

Patient signups and logins lead to Hospital Care unless an administrator signs in. Existing administrator credentials were not changed by this implementation.

## Workflow behavior

1. Patients search concern/speciality/city, or enter from a doctor, hospital or treatment detail page.
2. Only active, verified, non-deleted doctors appear in the care search. Concern matching uses admin-maintained keywords, not medical diagnosis.
3. Comparison shows actual, active, unexpired hospital packages. Availability links a doctor to a hospital. Patients may book a consultation without choosing a treatment package.
4. Confirming a booking locks the selected slot, validates remaining capacity and snapshots prices/inclusions. A per-user request key makes retries safe. Confirmation is stored immediately and appears in the patient and hospital dashboards.
5. Patients can cancel confirmed bookings or reschedule within the same doctor/hospital. Cancelled slots release capacity. Rescheduling checks capacity again.
6. Staff move appointments through permitted stages: confirmed → consulted → diagnostics/treatment/follow-up → completed. Cancellation and no-show are terminal alternatives. All care-stage changes record patient-visible notes and actor/time history.
7. Patients submit financial-help requests; administrators review, ask for information, approve or decline. Approval records an assistance decision, not money disbursement. Requests awaiting information can be resubmitted.
8. Staff schedule follow-ups and record completion; patients see the instructions and timeline.

Package edits do not alter estimates saved with existing appointments. Slot closure is blocked while an active appointment remains. Legacy directory write endpoints now require administrator authentication. No email/SMS/WhatsApp integration or payment/disbursement provider is configured by this change; confirmations and guidance are available in the application.

## Verification

Admin save updates: Speciality, Treatment, Review, Blog and City use authenticated create/update requests and retain the returned record ID for subsequent saves. Treatment offers Save beside Next; single-page forms offer Save and Save & Create Next. Blog offers Save Draft, Save & Create Next (saves a draft), and Publish. Forms clear only on the explicit create-next action after successful persistence. Mobile fields on doctor/hospital forms accept at most 10 digits, must start with 6–9, and are validated again by the backend. Invalid email and mobile inputs show validation messages. `npm test` includes create/update/list coverage for all five additional admin modules using an isolated database schema.

Directory form fixes (2026-09-10): run `npm run db:migrate` after pulling to apply `003_directory_form_storage.sql`. It preserves existing records, allows uploaded doctor/hospital photos, and adds storage for hospital certificate files, doctor current workplace and sitting plans. Both add forms offer Save on every step and Save & Create Next on the last step. Save creates once and subsequent saves update that record while the form remains open; Create Next clears the form only after success. Hospital saves require name, slug, contact details, address and city. Add any open embedded doctor form to its list before saving the hospital. If a queued doctor fails, only failed doctors remain queued for retry and the already-saved hospital is updated rather than recreated. Directory integration tests use a disposable schema and verify create/update/read without adding demonstration records to the real directory.

Run `npm test` from `backend` for all six automated scenarios (care workflow, concurrent booking/rescheduling, invalid requests, staff access revocation, frontend API error handling, and development/production CORS rules). The frontend API client has a 20-second timeout and explicit configuration/network/invalid-response errors. A failed initial dashboard load shows a retry state rather than zero operational counts. Successful bookings remain clearly confirmed even when the subsequent details refresh fails.

Verification on 2026-09-10: all six scenarios passed; scoped care ESLint and the complete frontend production build passed. Live `/care`, `/provider`, and `/login?next=/provider` returned HTTP 200. Public catalog and doctor APIs returned HTTP 200 with the correct local frontend CORS origin; unauthenticated appointment and management APIs returned HTTP 401. Interactive browser verification could not run because this session had no connected browser.

Before accepting the UI for release, check in a connected browser: patient signup/login and return to care, doctor search, package or consultation selection, booking confirmation, reschedule/cancel, assistance submission, hospital staff status updates and follow-ups, and patient visibility of those updates. Check narrow mobile layouts too. The existing database currently has no publicly available packages; publish actual hospital prices and future appointment slots through the admin dashboard. Do not populate these with invented production data.

`npm run test:care` creates a random, isolated PostgreSQL schema in the configured database, runs the real router against it, then removes only that schema. It does not add test records to public tables. The database user needs schema creation permission.

Coverage includes discovery, roles and hospital isolation, booking retries, concurrent capacity checks, cancellation, rescheduling, immutable booking prices, expired packages, assistance decisions and care/follow-up progression. Frontend verification: `npm run build` and ESLint on `src/components/care`, `src/lib/care-api.js`, `src/app/care` and `src/app/provider`.
