# Persistent MJD Wellness Platform

## Goal
Replace sample-only screens with a secure, persistent multi-organization system for staff, patients, and platform administrators, while preserving the approved dark desktop-style interface.

## Build
1. **Database foundation**
   - Add organizations, locations, user profiles, separate role assignments, organization memberships, patients, conversations, messages, calls, appointments, subscriptions, phone numbers, and audit activity.
   - Add organization-aware access rules so users see only permitted records; super admins can manage all organizations.
   - Seed the existing MJD Wellness sample information into the database so the first real view remains familiar.

2. **Accounts and access**
   - Add email/password sign-in, email confirmation, password reset, and sign-out.
   - Store names, avatars, preferences, roles, and organization membership in user profiles.
   - Gate staff, patient, and super-admin areas by server-validated roles. Account invitation/registration management remains deferred as requested.

3. **Staff workspace**
   - Load Inbox conversations/messages, Calls, Patients, and Schedule from the database.
   - Make message sending, patient creation/editing, and appointment creation/editing persist.
   - Keep telecom calling/recording controls as saved records and interface states until a telecom provider is connected.

4. **Super-admin portal**
   - Replace organizations, locations, users, subscriptions, telecom, and dashboard metrics with database-backed records.
   - Add create/edit forms with validation and clear success/error states.
   - Record sensitive administrator changes in an audit trail.

5. **Patient access**
   - Add a protected patient-facing account area showing only that patient’s permitted profile, messages, and appointments.

6. **Verification**
   - Validate role and organization isolation, persisted edits, sign-in/reset flows, database security checks, key staff/admin workflows, and desktop/mobile layouts.

## Technical details
- Lovable Cloud provides authentication and the PostgreSQL database.
- Protected reads and writes use authenticated server functions plus row-level database policies.
- Roles remain in a dedicated role table, separate from profiles.
- Existing clinical-system boundaries remain: this stores operational/minimum-necessary data and does not recreate the EHR.
- The same backend will support the future Windows and macOS desktop packages.
