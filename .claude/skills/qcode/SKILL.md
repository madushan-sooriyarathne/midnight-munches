---
name: qcode
description: Implement the plan from /qplan to a production-ready state, following project standards and running the project's own quality gate. Trigger with /qcode.
argument-hint: "[optional plan reference or notes]"
disable-model-invocation: true
allowed-tools:
  - Read
  - Edit
  - Write
  - Grep
  - Glob
  - Bash
---

Execute the most recent `/qplan` plan. If no plan exists in the session, ask the user to run
`/qplan` first — do not improvise one. Ensure `ponytail`, `caveman`, and `i-have-adhd` actively guide implementation.

## Steps

1. **Follow the plan in order.** Create and modify exactly the files it named. Match the
   surrounding code's patterns, naming, and idioms; obey the project instructions
   (`CLAUDE.md` / `AGENTS.md`). No scope creep beyond the plan.
2. **Apply ponytail & i-have-adhd discipline.** Enforce `ponytail`: write the simplest,
   shortest, most minimal code that works. Native platform APIs over dependencies, three similar lines
   over a premature helper, zero speculative abstractions. Apply `i-have-adhd`: restate step state, make
   completed work visible, matter-of-fact error reporting, no pleasantries or recaps.
3. **Detect the project's commands.** Read `package.json` scripts (or the equivalent manifest —
   `Cargo.toml`, `go.mod`, `pyproject.toml`, `Makefile`) and config files (biome/eslint/prettier,
   tsconfig, etc.). Prefer commands the instruction file names.
4. **Run the quality gate** the project defines, skipping any step it lacks: type-check, lint,
   test, build. If a project-specific gate exists (e.g. a single `test`/`check` script the
   instructions point to), run that instead. Fix failures the change caused before moving on.
5. **Report honestly.** If tests fail, say so with the output. If a step was skipped, say which
   and why. Never claim done on an unverified change.

## Output

Terse progress as you go (`caveman` + `i-have-adhd`: `Step X/Y: ✓ edited X`, `✓ lint clean`, `✗ tests failing at file:line`). Close with visible wins and exactly ONE next action: `/qcheck` (review) or `/qgit` (commit).
