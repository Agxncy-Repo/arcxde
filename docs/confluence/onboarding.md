# Engineering Onboarding

**Owner:** Hiring manager (per hire) + Engineering Lead (process)
**Audience:** New engineers, their managers, their onboarding buddies
**Status:** Living

> The goal of this document: a new engineer is productive — meaning they have shipped real code to production — by the end of Week 2, and they feel like a member of the team by the end of Month 1.

---

## 1. Before Day 1 (hiring manager's checklist)

Done before the new hire's start date:

- [ ] Onboarding buddy assigned (peer engineer, not the manager).
- [ ] Onboarding starter issue created in GitHub — a real, small, shippable change.
- [ ] Manager has scheduled the Week 1 calendar with the new hire (see below).
- [ ] Access requests filed: GitHub, Slack, cloud console (read-only initially), Sentry, observability stack, password manager, internal docs.
- [ ] Hardware delivered or remote-work stipend confirmed.
- [ ] Welcome message drafted for the team channel.

---

## 2. Day 1

The first day is mostly logistical. Don't try to do more — people are overwhelmed.

### Morning

- HR onboarding (employment paperwork, benefits, payroll).
- Hardware setup, accounts validated, dev environment can be pulled later.
- Welcome lunch or coffee (in person or virtual) with the team.

### Afternoon

- 1:1 with hiring manager (30–60 min):
  - Personal intro both directions.
  - What the team works on, why it matters, current quarter's goals.
  - What "success" looks like at 30 / 60 / 90 days.
  - How to ask for help.
- 1:1 with onboarding buddy (30 min):
  - Buddy explains the daily rhythm.
  - Buddy shares Slack channels worth joining.
  - Buddy commits to being the "any question, no judgment" person for 30 days.
- Read this handbook, the [Engineering Handbook](./engineering-handbook.md), and [README](../../README.md).

By end of day 1, new hire should know: who to ask, where things live, what their first task is.

---

## 3. Week 1: Environment + first PR

### Goals

- Local development environment runs.
- New hire has merged at least one PR (any size, including docs).
- New hire has done at least one code review (even just leaving a question).

### Day 2: Get the system running locally

Run through the [README quickstart](../../README.md). Expected sequence:

1. Clone the repo.
2. Install pnpm + Node (version pinned in `.nvmrc`).
3. `pnpm install`.
4. `docker compose up -d` for Postgres + Redis.
5. Copy `.env.example` to `.env`, fill placeholder values from the team password manager.
6. `pnpm db:migrate`, `pnpm db:seed`.
7. `pnpm dev` — API on `:3001`, web on `:3000`.
8. Hit a couple of endpoints, log in to the seeded test account, confirm a green checkmark in the buddy's eyes.

**If any step is broken or unclear, that's the first PR.** Updating onboarding docs while you can still see them with fresh eyes is the single highest-leverage contribution a new engineer can make.

### Day 3–4: Read the lay of the land

In rough order of priority:

1. [Architecture overview](../architecture/overview.md)
2. [Backend architecture](../architecture/backend.md)
3. [Database architecture](../architecture/database.md)
4. [Coding standards](../conventions/coding-standards.md)
5. [Git workflow](../conventions/git-workflow.md)
6. [Testing](../conventions/testing.md)
7. [ADR index](../adr/README.md) — skim, read any that seem relevant

Don't try to memorize. Just know what exists and where it lives.

### Day 5: First real PR

Pick up the starter issue prepared by your manager. Pair with the buddy on the first PR to learn:

- Branch naming
- Commit message style
- PR description template
- CI feedback loop
- Code review etiquette

Ship it. Celebrate. Even if it's three lines.

---

## 4. Week 2: First real contribution

### Goals

- Pick up a real issue from the backlog (not the starter one).
- Submit and ship a PR that involves writing tests and touching observability.
- Attend the first sprint planning / weekly planning session.
- Shadow on-call for a day (paired with primary on-call).

### Daily rhythm

- Morning: check Slack, scan PRs from yesterday, plan the day in writing.
- Standup: blockers only.
- Deep work: protect long blocks; don't fragment.
- End of day: short written wrap-up in a personal Slack channel or notes — what shipped, what's stuck, what's next.

### Questions to ask this week

- "What does the data flow look like for X?"
- "If I wanted to add a new endpoint that does Y, where would it live?"
- "Why is this code structured this way?"
- "Where do I look first when something breaks?"

Questions are not interruptions, they are the work this week.

---

## 5. Month 1: Owning small things

### Goals

- Has shipped 3–5 PRs of varying size.
- Has reviewed 5+ PRs from teammates.
- Knows the runbook locations and has read at least the top-3 runbooks for their team's services.
- Can describe the system architecture at a whiteboard level.
- Has done one full on-call shadow shift.
- Has identified at least one piece of friction worth improving — and either fixed it or filed an issue.

### 30-day check-in

Manager + new hire, 60 min:

- What's gone well?
- What's still confusing?
- Are the expectations clear?
- What would you change about onboarding?
- Anything blocking you from being effective?

This is feedback in both directions. The hiring manager listens for org-level signal too: "the docs for X are bad" is a team problem, not a new-hire problem.

---

## 6. Month 2: Owning end-to-end work

### Goals

- Owns a feature or fix end-to-end: scope it, build it, ship it, observe it in production.
- Goes on call as secondary (paged only when primary doesn't respond).
- Comfortable proposing approaches in design discussions.
- Has contributed to at least one ADR (could be authoring, could be reviewing).

---

## 7. Month 3: Full member of the team

### Goals

- Goes on call as primary on at least one rotation.
- Owns a meaningful slice of the team's roadmap.
- Has done at least one cross-team collaboration.
- Has identified an area of personal growth and has a plan for it (with manager).

### 90-day check-in

The official end of "onboarding." The conversation shifts from "are you ramping up?" to "what are your growth goals for the next 6 months?"

---

## 8. Onboarding buddy: what's expected

The buddy is _not_ the manager. The buddy is a peer who:

- Answers small questions ("where's the Slack channel for X?") so the new hire doesn't feel they're bothering the manager.
- Initiates daily check-ins for the first two weeks (15 min, "anything stuck?").
- Pairs on the first PR.
- Introduces the new hire to people across the org.
- Flags to the manager if the new hire seems stuck or unhappy.

Buddies get explicit time for this work — it's not on top of full-time delivery. Plan ~20% of the buddy's time the first two weeks, ~10% weeks 3–4, then ad hoc.

---

## 9. Manager: what's expected

The manager is responsible for outcomes; the buddy is responsible for friction.

The manager:

- Sets the 30/60/90 expectations clearly on Day 1.
- Holds weekly 1:1s.
- Provides feedback continuously, not just at check-ins.
- Removes blockers proactively.
- Notices when things are off ("you seem quieter this week — anything on your mind?").
- Adjusts the plan when reality diverges from it.

If a hire isn't ramping after 60 days, that's a manager problem to solve, not a "wait and see" — escalate to the engineering lead group.

---

## 10. Common pitfalls

| Pitfall | What to do instead |
|---|---|
| New hire is stuck on environment setup but doesn't say so | Buddy checks in proactively; new hire is told explicitly that asking for help is the right move |
| Manager dumps tribal knowledge in one giant meeting | Spread context over weeks; let the new hire ask when they need it |
| New hire spends week 1 reading and nothing else | Ship the starter PR by end of week 1 even if it's tiny — momentum matters |
| First real task is too ambiguous | Manager scopes the first 2–3 tasks tightly; ambiguity comes later |
| New hire is afraid to ask "stupid" questions | Buddy normalizes it: "the only stupid question is the unasked one that becomes a bug" |
| New hire is shielded from on-call and prod | Shadow early; production is part of the job |

---

## 11. Checklist for the new engineer

Copy this into a personal doc on Day 1 and tick as you go.

### Week 1
- [ ] Met the team
- [ ] Local environment running
- [ ] Read the README and architecture overview
- [ ] First PR merged
- [ ] First code review left

### Week 2
- [ ] Sprint planning attended
- [ ] On-call shadow done
- [ ] Test written and shipped
- [ ] Read 5 ADRs

### Month 1
- [ ] 3+ PRs shipped
- [ ] 5+ PRs reviewed
- [ ] Runbooks read
- [ ] 30-day check-in done
- [ ] Identified one friction point and either fixed it or filed an issue

### Month 2
- [ ] Owned a feature end-to-end
- [ ] On-call as secondary
- [ ] Contributed to an ADR

### Month 3
- [ ] On-call as primary
- [ ] 90-day check-in done
- [ ] Growth plan for next 6 months

---

## 12. Updating this doc

Every new hire updates this document at the end of their first month. What was missing? What was wrong? What was scary that didn't need to be? Onboarding is the area where stale docs hurt the most, because the people who notice are the people with the least permission to fix it. Permission granted, in advance, by this paragraph.
