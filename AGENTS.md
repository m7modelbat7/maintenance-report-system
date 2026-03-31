# AGENTS.md

## Project goal
Build a simple and professional maintenance report system for internal company use.

The app should help users:
- create maintenance reports
- view and search reports
- update report status
- track work history
- view a simple dashboard

This project is also for learning, so code should be beginner-friendly and easy to explain.

## Working style
- At the start of future tasks, read `docs/SESSION_HANDOFF.md` after reading `AGENTS.md`.
- Always explain the plan briefly before making changes.
- Prefer small, reviewable changes.
- Do not change unrelated files.
- Do not over-engineer.
- Keep code simple and readable.
- Stop after completing the requested task only.

## Architecture
- Frontend: React
- Backend: Node.js + Express
- Database: SQLite for MVP
- Keep frontend and backend clearly separated

## Code rules
- Use clear variable and function names
- Add comments only when they help understanding
- Validate backend input
- Handle loading, empty, and error states in frontend
- Prefer simple folder structures over advanced patterns

## Testing rules
- After changes, explain how to test
- Add the smallest useful test when possible
- Do not claim something works without stating what was checked

## Dependency rules
- Avoid adding dependencies unless they clearly help
- Do not replace the stack unless asked
- Ask before deleting files

## Output format
For each task, provide:
1. what changed
2. why it changed
3. how to test it
4. what should be done next
