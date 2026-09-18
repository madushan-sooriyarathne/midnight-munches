---
name: qcheck
description: Skeptical senior-engineer review of the session's major changes against the project's own best-practice checklists. Trigger with /qcheck.
disable-model-invocation: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(git status)
  - Bash(git log *)
---

Review the substantial changes from this session as a skeptical senior engineer. Question every
major decision — look for problems, do not rubber-stamp. Always enforce `ponytail` simplicity, `caveman` terseness, and `i-have-adhd` focus.

## Steps

1. **Find the major changes.** Use `git diff` / session history. Focus on new functions,
   significant logic changes, and new files. Ignore formatting, comments, and trivial tweaks.
2. **Load checklists and verify skills.** Read the project instructions (`CLAUDE.md` / `AGENTS.md`)
   and rules. Verify that `ponytail` build discipline was upheld: flag any over-engineering,
   premature abstractions, unnecessary helper functions, dead code, or redundant dependencies.
3. **Review functions.** Naming and clarity, single responsibility and size, parameter/type
   safety, error handling, edge cases, performance implications.
4. **Review tests.** Coverage of the new/changed behavior, isolation, edge and error cases,
   naming, and whether they test behavior rather than implementation.
5. **Review implementation.** Consistency with existing architecture, error-handling patterns,
   security at trust boundaries, duplication vs. reuse, scalability.

## Output

Terse (`caveman` + `i-have-adhd` style). Ranked findings, max 5 items per group:
`path:line — <symbol> <problem>. <fix>.` where symbol is ✓ good / ⚠️ concern / ✗ violation. Most-severe first.
No praise padding, no sidebars. End with ONE concrete next action.
