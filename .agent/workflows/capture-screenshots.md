---
description: Capture screenshots of all main screens in the application
---

1. [Ensure the development environment is running] Make sure a local server (e.g. `npm run dev`) is active.
2. Call the `browser_subagent` tool with the following dynamic instructions:
   - **TaskName**: "Auto-Discovery Screenshot Capture"
   - **RecordingName**: "app_screenshot_tour"
   - **Task**:
     1. **Initialize State**:
        - Navigate to the local app URL.
        - Execute `window.localStorage.clear(); location.reload();` to ensure a consistent, fresh start (Onboarding flow).
     2. **Onboarding Flow**:
        - Capture the initial welcome screen.
        - Proceed through the onboarding steps by identifying and clicking the primary "Start" or "Next" buttons (e.g., look for buttons with text like "始める", "次へ", "Start").
        - Complete any initial setup modals (like Sleep Data input) by entering default values and saving.
     3. **Main Navigation**:
        - Once on the main dashboard, identify the main navigation bar (look for `<nav>` or elements with class `bottom-nav`).
        - **Iterate through EACH navigation item**:
          - Click the item.
          - Wait for the page content to update and stabilize (1 sec).
          - Capture a screenshot using the navigation item's text or meaningful ID as the filename (e.g., "nav_dashboard", "nav_journal").
     4. **Primary Actions**:
        - Return to the Dashboard (default view).
        - Look for primary action buttons (like Floating Action Buttons, "Add" buttons, or elements with a plus icon/aria-label="Add/Record").
        - Click the button to open the main modal (e.g., Intake/Record).
        - Capture the modal content.
        - Close the modal (look for "Cancel", "Close", or "X" button).
     5. **Completion**:
        - Return a list of all captured screenshots and their contexts.
3. Organize the screenshots into a `walkthrough.md` artifact for the user to review.
