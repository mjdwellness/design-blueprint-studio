# Fix Settings saving

## Goal
Make the Settings “Save changes” action persist the current organization settings and provide clear success or error feedback.

## Implementation
- Trace the existing Settings form and its current data source.
- Connect the save action to the existing organization record with validation and access controls.
- Refresh the displayed account data after saving and show a concise confirmation or error.
- Verify the flow in the signed-in preview and confirm the project remains error-free.
