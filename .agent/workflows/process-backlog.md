---
description: Process the next backlog item from check-out to commit
---

// turbo-all

1. [Task Initialization] Call the `task_boundary` tool to start a new task named "Processing Backlog Item: [Item Name]". This serves as a "token clear" or context reset for the new task.
2. [Ticket Reading]
   - Read the `BACKLOG.md` (or `backlog.md`) file to identify the next unchecked high-priority item.
   - Mark the item as "In Progress" in the file.
3. [Design]
   - Create an `implementation_plan.md` artifact detailing the necessary code changes.
   - **Skip user approval** unless there is a critical blocker, as per user request to complete all tasks before review.
4. [Implementation]
   - Apply the code changes using file editing tools.
   - Run relevant tests if applicable.
5. [Verification & Self-Review]
   - Use `browser_subagent` to navigate to the affected screen and capture a screenshot.
   - Critically review the screenshot against the requirements in the backlog item.
   - Ensure no regressions were introduced.
6. [Commit]
   - Stage the changes: `git add .`
   - Commit the changes with a descriptive message referencing the item: `git commit -m "Fix: [Item Description]"`
   - Update `BACKLOG.md` to mark the item as completed.
