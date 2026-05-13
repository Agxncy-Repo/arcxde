# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** [DATE]
- **Deciders:** Founding engineers
- **Tags:** process, documentation

---

## Context

We are building a system that will outlive any individual engineer's tenure. Decisions made today shape what is easy and what is hard for the next two years. Without a record, the *why* is lost and decisions get re-litigated every six months.

## Decision

We will use **Architecture Decision Records (ADRs)** in the Michael Nygard format, stored under `docs/adr/`, version-controlled with the codebase.

- Every significant technical decision gets an ADR.
- ADRs are immutable once accepted. Superseded by new ADRs, never edited.
- Numbered sequentially: `NNNN-short-name.md`.
- PR review of new ADRs is part of the standard review process.

## Consequences

### Positive
- New engineers can read the ADR index and understand the system's reasoning in under an hour.
- Decisions are debated in writing, with the trail preserved.
- Reversing or revisiting a decision becomes a deliberate act, not a quiet drift.

### Negative
- Small overhead: an ADR takes 30–60 minutes to write well.
- Risk of "ADR theater" where decisions are made first and the ADR is written as justification. Mitigated by requiring the ADR PR *before* the implementation PR for big decisions.

### Neutral
- We commit to writing them in markdown, not in a wiki, so they version with the code.

## Alternatives considered

### Confluence-only documentation
- Pros: easier collaborative editing for non-engineers.
- Cons: drifts out of sync with code, no version diff, search is mediocre.
- Verdict: rejected as the source of truth. Confluence will hold *process* docs; technical decisions live in the repo.

### No formal record
- Pros: zero overhead.
- Cons: same arguments repeated every quarter, knowledge tied to specific people.
- Verdict: rejected — the cost of forgetting is far higher than the cost of writing.

## References

- [Michael Nygard's original article](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [adr.github.io](https://adr.github.io/)
