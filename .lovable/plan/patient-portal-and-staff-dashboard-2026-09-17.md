# Patient portal and staff dashboard

## Build
- Add secure records for form assignments/submissions, patient charges/payments, and staff time entries.
- Give patients read access only to records linked to their own patient account; give authorized MJD staff organization access.
- Add Marie's initial appointment, assigned forms, and payment history so her portal is useful on first sign-in.
- Redesign the patient portal into clear Appointments, Forms, and Payments views with status, due dates, balances, and payment history.
- Replace `/admin` platform-style totals with live MJD staff metrics for patients, appointments, payments, and staff hours, plus concise operational breakdowns.

## Technical details
- Use additive Lovable Cloud migrations with grants, row-level access rules, indexes, and generated types.
- Query through the signed-in browser client so database access rules enforce patient isolation and staff access.
- Keep the existing dark compact visual system and current account invitation flow.
- Verify Marie's linked records, dashboard calculations, permissions, build health, and desktop/mobile layouts.
