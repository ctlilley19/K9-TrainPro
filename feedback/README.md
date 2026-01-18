# K9 ProTrain Feedback System

This folder contains testing feedback exported from the Admin Testing Portal.

## How It Works

1. Go to **Admin Portal** → **Testing**
2. Test each feature and mark its status (Passed/Failed/Blocked)
3. Add notes describing issues or suggestions for each feature
4. Click **Export** → **Export for Claude Code**

## Files

- `TESTING-FEEDBACK-LATEST.md` - Latest feedback in Markdown format (for Claude Code)
- `TESTING-FEEDBACK-LATEST.json` - Latest feedback in JSON format
- `TESTING-FEEDBACK-{date}.md` - Dated backups

## For Claude Code

When you want Claude Code to process your feedback:

1. Export your testing feedback from the Admin Portal
2. Tell Claude Code: "Read the testing feedback and fix the issues"
3. Claude will read `feedback/TESTING-FEEDBACK-LATEST.md` and execute the changes

## Feedback Format

- **ACTION REQUIRED** - Features marked as Failed or Blocked with notes
- **ENHANCEMENTS** - Features marked as Passed with improvement suggestions
- **Full Feature List** - Complete status of all features

The notes you add to each feature will become the instructions Claude Code follows.
