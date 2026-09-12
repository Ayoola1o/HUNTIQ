---
description: Use this skill whenever the user provides a long implementation plan, spec, task, migration guide, or multi-step document and wants every step actually carried out — "implement this plan," "go through this doc and do each step," "execute this ch
---

# Long Implementation Plan Execution

Long plans fail in two specific ways when handled carelessly: **omission** (steps quietly dropped because they fell outside what was actually re-read before acting) and **hallucination** (steps invented or merged from a vague memory of the plan rather than its actual text). This skill's job is to eliminate both by treating the plan as ground truth to be read and re-read, not summarized-once-and-recalled.

## Step 1: Build a literal checklist from the source before doing anything

Read the entire plan first, end to end, without skipping ahead to implementation. Then extract every discrete action item into an explicit checklist, preserving:
- The plan's own step numbering/section structure (don't renumber or reorganize — if the plan says "Step 4.2," keep it as "Step 4.2" in your tracking, so it stays traceable back to the source)
- The exact scope of each step as written — don't compress two steps into one or split one step into two based on what "feels" like the right granularity
- Any explicit ordering/dependency the plan states (e.g., "after step 3 completes," "in parallel with step 5") — carry that dependency into the checklist, don't flatten it into a simple top-to-bottom list if the plan didn't intend that

If a maintained todo-list tool is available in this environment, create one entry per checklist item now, before starting implementation, so progress is tracked externally rather than held only in conversational memory.

If the plan is long enough that it doesn't comfortably fit for re-reading in one pass, split extraction into chunks (e.g., by section/phase) and build the checklist incrementally, chunk by chunk — don't extract from a compressed mental summary of the whole document.

## Step 2: Re-read the relevant section immediately before executing it — never work from memory of a long doc

This is the core anti-hallucination rule. Before implementing any given step, re-view the actual source text for that step (and its immediate context) rather than relying on what you extracted into the checklist or remember from having read it earlier. The checklist tells you *what step is next*; the source document tells you *exactly what that step requires*.

This matters most for:
- Steps with specific values (exact file paths, config keys, version numbers, flag names, commands) — these are exactly the details that drift or get invented when recalled from memory instead of re-read
- Steps far into a long document, where earlier context has been pushed out of easy recall
- Any step you're even slightly unsure about the precise wording of

If the source document is a file, re-`view` the specific section (use line ranges if the tool supports it) rather than trusting the initial full read. If it's inline in the conversation, scroll back to the actual paragraph rather than paraphrasing from summary.

## Step 3: Execute one step at a time, mark it, then move to the next

Work strictly in the plan's intended order (respecting Step 1's dependency notes). For each step:
1. Re-read the step's exact text (Step 2)
2. Execute it
3. Verify the result actually satisfies what that step asked for — not just "something happened," but the specific outcome the step described
4. Mark it complete on the checklist/todo list before starting the next step

Do not batch multiple steps into one uninspected pass "to save time" on a long plan — this is exactly the pattern that causes silent omission (a step gets absorbed into a nearby one and quietly disappears) and hallucination (gaps between steps get filled in with plausible-sounding but invented actions). Long plans should feel slower and more deliberate than short ones, not faster.

## Step 4: Treat ambiguity as a stop-and-check, not a fill-in-the-blank

If a step's wording is genuinely ambiguous or seems to depend on something not yet established (a prior step's output, a file that should exist but doesn't, a value the plan assumes but never states), do not guess a plausible completion and continue silently. Either:
- Resolve it from earlier context in the plan itself (re-read backward for the missing definition before asking), or
- Flag it to the user with the specific step number and the specific ambiguity, and pause that step rather than inventing an assumption and pressing on

Silently resolving ambiguity with an invented assumption is a form of hallucination even when the resulting code/action looks reasonable — it's not what the plan actually specified.

## Step 5: Periodically reconcile the checklist against the source, not just against your own progress notes

On long plans (roughly every 10-15 steps, or at natural phase boundaries the plan defines), stop and re-diff your checklist against the actual source document rather than just against your own running list of "done" items — a running list only catches items *you* recorded; it won't catch items that were never extracted into the checklist in the first place. Confirm:
- Every numbered/bulleted action item in that section of the source has a corresponding checklist entry
- No checklist entry exists that doesn't trace back to actual source text (a sign of earlier hallucination/drift)
- Completed items' checklist descriptions still match the source's actual wording (a sign of earlier compression/paraphrase drift)

## Step 6: Final reconciliation before declaring the plan complete

Before telling the user the plan is fully implemented, do one full pass: re-read the entire source document one more time, section by section, and confirm every single action item has both a checklist entry and a completed status. Report this as an explicit accounting, not a general "done" — e.g.:

```
Plan reconciliation:
✅ Steps 1–12 (Phase 1: Setup) — all complete
✅ Steps 13–28 (Phase 2: Migration) — all complete
⚠️ Step 22 — flagged earlier for ambiguity (missing config value), still unresolved
✅ Steps 29–41 (Phase 3: Cleanup) — all complete
Total: 40/41 steps complete, 1 pending your input (see Step 22)
```

If anything is incomplete, unresolved, or was skipped for a stated reason, say so explicitly rather than reporting blanket completion — the user needs to know the plan's actual coverage, not a summary that assumes success.

## Anti-patterns to avoid

- **Summarize-then-implement-from-summary**: reading the whole plan once, writing your own condensed version, and working from that condensed version for the rest of the task. The condensed version is where omissions and hallucinations enter — always trace back to source text before acting.
- **Confidence-based skipping**: skipping re-verification of a step because it "seems simple" or "obviously means X." Simple-seeming steps are exactly where small wording details (a specific flag, a specific threshold, a specific file name) get silently swapped for a plausible-sounding guess.
- **End-loaded verification**: only checking coverage at the very end. Reconciling periodically (Step 5) catches drift while it's still cheap to fix, rather than discovering 30 missed steps after everything else is already built on top of the gap.
- **Renumbering/reorganizing the plan for "better flow"**: this breaks traceability back to the source and makes later reconciliation (Step 5, Step 6) unreliable, since you can no longer cleanly diff your checklist against the plan's own structure.