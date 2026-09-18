# Centralize tenant practice information

## Goal
Use each signed-in tenant’s organization record as the single source for the practice name and details shown throughout its workspace.

## Implementation
- Extend the signed-in account context with the user’s active organization and practice profile.
- Replace fixed MJD organization IDs in tenant reads and saves with the signed-in organization.
- Display the saved practice name in the workspace header, account label, Settings heading, home copy, and patient portal.
- Keep platform-wide super-admin screens global rather than forcing a tenant identity onto them.
- Refresh shared tenant data immediately after Settings saves, then verify persistence and workspace-wide updates.

## Technical details
- Staff organization comes from the active organization membership.
- Patient organization comes from the linked patient record.
- Tenant data remains protected by the existing access policies.
