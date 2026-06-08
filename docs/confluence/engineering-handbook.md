# Engineering Handbook

**Owner:** Head of Engineering
**Audience:** All engineers, current and future
**Status:** Living
**Last reviewed:** _set on commit_

> This handbook is the "how we work" companion to the technical documentation. The technical docs answer _what_ we build; this answers _how_ we behave while building it.

---

## 1. What we optimize for

In priority order, when two of these conflict, the higher one wins:

1. **Customer trust.** Every line of code is a promise. Don't ship things that quietly break promises.
2. **Speed of learning.** We win by shipping, measuring, and adjusting faster than the alternatives. Long branches, perfect specs, and analysis paralysis are anti-patterns.
3. **Engineering leverage.** Automate the second time you do something. Document the third time you explain something. Build the platform when the fifth person needs the same thing.
4. **Sustainable pace.** Heroics that produce burnout are a tax on next quarter. We notice and intervene.
5. **Craftsmanship.** Code is read more than written. Pay the small cost up front so the next engineer (often yourself) is fast.

If you can't tell which of these applies, ask. The answer reveals what kind of team we are.

---

## 2. How we make decisions

### Reversible vs irreversible

We borrow Bezos' framing:

- **Type 1 (irreversible):** Database choice, public API contracts, authentication model, employment offers. Slow down. Write an ADR. Get senior input. Sleep on it.
- **Type 2 (reversible):** Library choice inside a module, internal naming, sprint planning details, most code review threads. Decide fast. If wrong, fix it next week.

The mistake is treating Type 2 decisions as Type 1 — that's where teams die of slowness.

### Disagree and commit

Once a decision is made (in an ADR, a meeting, a PR review), people who disagreed must support the execution. Re-litigating in side channels is corrosive. If new information arrives, raise it openly and re-open the decision; don't quietly undermine it.

### Strong opinions, weakly held

Bring conviction. Bring evidence. Update when better evidence appears. Engineers who never change their mind aren't thinking; engineers who change their mind on every push are also not thinking.

---

## 3. Communication norms

### Default to async, written, public

| Channel                     | Use for                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **Pull requests**           | All code-level discussion. Code review is the primary technical conversation.                 |
| **GitHub Issues**           | Bugs, feature work, technical debt. One issue = one outcome.                                  |
| **ADRs**                    | Decisions that future engineers will need to understand. Immutable once accepted.             |
| **Slack `#eng-*` channels** | Real-time but searchable. Default to public channels; DMs only for genuinely personal things. |
| **Docs in this repo**       | Anything that's true today and should still be true in 6 months.                              |
| **Confluence / Notion**     | Process docs that span engineering + non-engineering.                                         |
| **Meetings**                | Last resort. See below.                                                                       |

### Meetings

Defaults:

- Every recurring meeting has an owner, an agenda, and notes captured in a known place.
- If a meeting has no agenda by start time, it's cancelled.
- 25 / 50 minute defaults, not 30 / 60 — buffer between meetings.
- Decisions made in meetings are summarized in writing within 24 hours and posted to the relevant channel. **A decision that isn't written down didn't happen.**
- No-meeting blocks: most engineers protect at least 4 hours of contiguous deep work per day. Respect calendars.

Standing meetings the engineering org keeps:

| Meeting                           | Cadence                                 | Purpose                                  |
| --------------------------------- | --------------------------------------- | ---------------------------------------- |
| Team standup                      | Daily, 10 min                           | Blockers only; not status theatre        |
| Sprint planning / weekly planning | Weekly, 30 min                          | What ships this week                     |
| Engineering all-hands             | Bi-weekly                               | Cross-team visibility, roadmap           |
| Incident review                   | As needed, within 5 business days of P1 | Blameless review (see incident-response) |
| Architecture review               | Bi-weekly, opt-in                       | ADRs needing discussion                  |
| 1:1 with manager                  | Weekly, 30 min                          | Career, blockers, feedback               |

### Response-time expectations

- **DMs / mentions during work hours:** within ~4 hours, not instantly.
- **PR review requests:** within 1 business day. Faster reviews beat faster writing.
- **On-call pages:** see [incident-response.md](./incident-response.md).
- **Outside work hours:** no expectation of response unless you're on call.

---

## 4. Code review culture

Reviewers and authors share equal responsibility for shipping good code.

### As an author

- PRs under 400 lines wherever possible. Bigger PRs require a heads-up in chat.
- Self-review your diff before requesting human review — catch the easy stuff yourself.
- Write a PR description that answers: _what does this do, why now, what's risky, how do I know it works?_
- If a reviewer asks a question, the answer goes in the PR (or as a code comment), not just in chat — future readers need it too.
- Don't take review feedback personally. Code is not identity.

### As a reviewer

- Lead with the thing that matters most (correctness > design > readability > nits).
- Distinguish blocking from non-blocking: prefix nits with `nit:`, suggestions with `consider:`, blocking issues with `blocking:`.
- "I don't understand this" is a blocking comment. If the reviewer can't follow it, neither can the next engineer.
- Approving a PR means you understand it well enough to debug it at 2am. If you don't, ask questions or decline.
- The fact that something is _already done_ is not a reason to approve. It's also not a reason to demand a rewrite — judgment call.

### Tone

Comment on the code, not the coder. "This function is hard to follow" not "you wrote this confusingly." Use questions over commands when the path forward isn't obvious: "could we extract this?" beats "extract this."

---

## 5. Ownership

### Code ownership

- Every directory has an owning team in `CODEOWNERS`. Owners get auto-requested on PRs.
- Owners are accountable for: tests passing, performance budgets, security posture, on-call response, technical-debt decisions in their area.
- Non-owners can absolutely make changes — ownership is about accountability, not gatekeeping.

### Service ownership

- The team that ships a service runs it. There is no separate "ops team" who catches the pages.
- On-call rotation per team or per service area, depending on size.
- Production access requires audit logging. Read access broadly available; write access role-gated.

### Knowledge ownership

- Anything one person knows is a bus-factor risk. Pair, review, document.
- When someone is the only person who can do X, scheduling Y to spread that knowledge is a manager's job.

---

## 6. Quality bar

### Definition of done

A change is _done_ when:

1. Code is merged to main.
2. Tests cover the new behavior (see [testing.md](../conventions/testing.md)).
3. Observability is in place (logs, metrics, traces — see [observability.md](../architecture/observability.md)).
4. Docs are updated if behavior visible to other engineers or users changed.
5. It's running in production (or scheduled to via a release train) and the dashboards look healthy.

"Code complete" is not done. Many bugs live in the gap.

### Tech debt

We accept debt deliberately, not accidentally. When taking debt:

- Note it in the PR description (`# Tech debt incurred:`).
- File an issue with the cleanup work.
- Add a `// TODO(owner, deadline)` comment if it's load-bearing.
- Don't leave the repo in a worse state than you found it without saying so.

A standing 10–20% of each sprint goes to debt and platform work. If we're skipping this for more than two sprints in a row, that's an escalation signal.

---

## 7. On-call expectations

Detailed flow lives in [incident-response.md](./incident-response.md). The cultural part:

- **Being on-call is the job, not extra to the job.** Pages during your shift get response priority over your feature work.
- **You will be paged sometimes for things that aren't your fault.** That's fine. Triage, mitigate, document, hand off to the right owner.
- **No hero culture.** If you're at hour 3 of an incident, hand off. Tired humans make outages worse.
- **Compensation:** see HR for the on-call comp policy.
- **Shadowing:** new engineers shadow at least 2 weeks of on-call before primary.

---

## 8. Career & growth

### Levels (summary)

Detailed level definitions live in HR. The shape:

| Level        | Scope                                  | Signal                                          |
| ------------ | -------------------------------------- | ----------------------------------------------- |
| L1 Engineer  | Tasks within a service, with guidance  | Reliably ships well-defined features            |
| L2 Engineer  | Features end-to-end, mostly autonomous | Owns problems, not tasks                        |
| L3 Senior    | Owns a service or domain               | Mentors, raises the bar, called on for design   |
| L4 Staff     | Cross-service or cross-team scope      | Sets technical direction, multiplier on the org |
| L5 Principal | Org-wide technical leadership          | Defines the shape of what we build              |

Engineering management is a parallel track, not a promotion from L4.

### Feedback

- 1:1s are the main feedback channel. Use them.
- Peer feedback collected formally twice a year, but the expectation is continuous informal feedback.
- Praise in public, correct in private.
- "Praise" includes the small stuff — a clean PR, a good catch in review, a thoughtful incident write-up.

### Learning budget

Each engineer has a learning budget (books, courses, conferences). See HR. Use it. Engineers who don't grow drag the org backwards.

---

## 9. Inclusion & psychological safety

Non-negotiable. The fastest way to slow a team is to make people afraid to:

- Ask "obvious" questions
- Admit they don't know something
- Push back on a senior engineer
- Say "I caused this"
- Disagree with a decision

We protect that environment actively. Behavior that erodes it is a manager-level conversation immediately, not a quarterly review note.

A few practices that help:

- New engineers should be the first to ask questions in onboarding sessions — leads should leave space.
- "I don't know" is a complete sentence, including from staff engineers.
- Blameless incident reviews are blameless in practice, not just in name.
- Use someone's pronouns. Pronounce names correctly. Ask if you're not sure.

---

## 10. The "don't" list

Things that consistently slow us down or hurt the team. Not exhaustive.

- Don't merge to main on Friday afternoon without a clear rollback plan.
- Don't review PRs by skimming — say no to a review if you don't have time to do it well.
- Don't introduce a new library/tool/pattern without a sentence explaining why the existing one won't do.
- Don't write code first and tests later "if I have time."
- Don't blame a person in an incident review. Blame systems and processes.
- Don't sit on a question for more than ~30 minutes when someone can unblock you.
- Don't pile work on someone going on leave the week before they leave.

---

## 11. Changing this handbook

This document is in version control. PRs welcome from any engineer. Substantive changes (anything beyond typos and clarifications) go through review by the engineering lead group and are announced in the engineering all-hands.

The handbook is a description of how we already work as much as a prescription. If reality and this doc diverge, one of them is wrong — fix whichever is.
