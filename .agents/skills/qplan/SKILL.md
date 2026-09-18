---
name: qplan
description: Turn a task into an implementation plan that follows the project's own rules, patterns, and existing code. Trigger with /qplan followed by the task.
---

Plan the task in `$ARGUMENTS` so it fits the codebase instead of fighting it. Understand first,
then propose the smallest change that works. Always apply `ponytail` discipline, `caveman` brevity, and `i-have-adhd` structure.

## Steps

1. **Read rules and ensure mandatory skills.** Load the project instructions (`CLAUDE.md` for Claude Code / `AGENTS.md`
   for Antigravity) plus referenced rules. Ensure `ponytail` (ruthless simplicity, YAGNI, standard library first),
   `caveman` (terse, compressed output), and `i-have-adhd` (lead with action, numbered steps, no fluff) skills are active.
2. **Map the ground.** If `graphify-out/GRAPH_REPORT.md` exists, read it first for the god nodes
   and community structure before scanning raw files. Then grep for existing functionality,
   patterns, and naming conventions the task touches — trace the real flow end to end.
3. **Reuse before adding (Ponytail).** Find helpers, utilities, types, and patterns already in the repo that
   the task can build on. Prefer extending existing code over new files. Adhere strictly to `ponytail`:
   native APIs over dependencies, three similar lines before a helper, zero speculative abstractions.
4. **Assess the diff.** Determine the minimal set of files to modify vs. create. Note backward-
   compatibility and any callers that must change together (fix at the shared root, not per caller).
5. **Write the plan.** Numbered steps (per `i-have-adhd`), each naming the exact files and single bounded action. Call out the test
   strategy that matches the project's existing test style, and any risks or dependencies.

## Output

Lead with the immediate next action. Provide numbered steps (`i-have-adhd` + `caveman` style: `file(s)` + one line of rationale). Keep it tight — no preamble, no recap. End with one concrete next step: run `/qcode` to implement.
