# Proposal Template

> Load when: starting Step 4, or writing the three output files in Step 6. This file defines what goes in each file and how deep to go for each band.

Write in the student's voice and reading level. Fix spelling and grammar only where meaning is unclear. Never add a fact, number, quote, or source the student did not provide.

---

## File 1: `PROPOSAL.md`

### Full structure

```markdown
# <Project name>

**One-line pitch:** <who it is for> can <do what> so that <outcome>.

**Made by:** <first name or initials>  |  **Grade band:** <5-7 / 8-10 / 11-12>  |  **Date:** <date>

## The problem

<One paragraph: who has the problem, when it happens, what it costs them, and how we know it is real.>

**Problem statement:** <user> struggles to <task> when <context>, because <cause>.

## Who it is for

<One real user or a narrow group. Not "everyone". Include what they do today instead.>

## The idea

<What it is, in plain language. What the person does first, next, and last.>

**What it needs to work:** <people, data, permission, money, devices, a place>

## Why this is better

<The current alternatives and their weaknesses. What this does differently. Cite the evidence.>

## What could go wrong

| Risk | Who it affects | What we would do about it |
|---|---|---|
|  |  |  |

## Fairness, safety, and privacy

<Who could be left out or harmed. What data is collected and why. Who can say no.>

## How we would know it worked

<One or two measures, with a number and a time frame if possible. "More students use it" is not a measure.>

## What we would test first

<The smallest thing to make or try before building the real thing. One week, no code if possible.>

## Open questions

- <What we still do not know, and who could answer it.>

## Sources

<Numbered list matching RESEARCH.md. Do not list a source that is unverified without saying so.>

---

*I used an AI coach to ask questions and check sources. The idea, decisions, and research are mine.*
```

### Depth by band

**Grades 5-7** — use these headings only: The problem, Who it is for, The idea, Why this is better, What could go wrong, How we would know it worked, What we would try first, Sources. One or two sentences per section. A labelled drawing may replace "The idea" if the student also writes two sentences describing it.

**Grades 8-10** — use the full structure. One short paragraph or three bullets per section. The risk table needs at least two rows. The success measure needs a number.

**Grades 11-12** — use the full structure, plus:

- an **Assumptions** subsection under The idea, naming the load-bearing assumption;
- a **Limitations** subsection under Why this is better, stating what the evidence cannot show;
- a **Cost and adoption** sentence: who pays, who maintains it, and why anyone would switch.

---

## File 2: `RESEARCH.md`

Use the structure built during Step 2: questions, what we already knew, a source table with a verdict per source, findings, what changed our mind, what is still unknown, and primary research notes. The source table is mandatory.

A source row with a link but no "what it actually says" is incomplete. A claim in `PROPOSAL.md` that appears nowhere in `RESEARCH.md` must be labelled **Assumption** or removed.

---

## File 3: `DECISIONS.md`

This file is the evidence that the student thought, not the AI. Teachers read it to see the process.

```markdown
# Decisions: <project name>

## D1: <short decision title>

- **Date:** <date>
- **Options considered:** <option A>; <option B>; <option C>
- **Chosen:** <option>
- **Why:** <the student's reason, including the trade-off accepted>
- **What would change my mind:** <evidence or event>
- **Evidence:** <source numbers from RESEARCH.md, or "assumption">

## D2: ...
```

Record at minimum:

1. The problem definition (why this problem, not a nearby one).
2. The user (why this group, not a broader one).
3. The solution (why this idea, and why the others were rejected).
4. The scope (what is explicitly not included).
5. The first test (why this test, and what result would stop the project).

**Grades 5-7:** three decisions are enough, with one sentence each under Why. "What would change my mind" can be a single sentence.

**Grades 8-10:** all five decisions, with the rejected options named.

**Grades 11-12:** all five decisions plus a "Reversed decisions" entry if the research changed the student's mind, and a "Known weakness" line in the solution decision.

---

## Worked Examples

Both examples below are fictional and are included only to show the shape and depth expected. Their sources are placeholders, not real citations. A real proposal cites what the student actually found.

## Worked Example: Grades 5-7

```markdown
# The Lunchbox Alarm

**One-line pitch:** Grade 4 students can find a lost lunchbox before lunch ends so that food is not wasted.

## The problem

Some students put their lunchbox down at break and cannot find it later. They miss eating and a teacher has to help. I saw this happen twice in one week.

**Problem statement:** A grade 4 student struggles to find their lunchbox when they leave it somewhere at break, because there are 300 identical bags and no lost-property routine.

## Who it is for

A grade 4 student who brings lunch from home and forgets where they put their bag.

## The idea

A bright tag on the lunchbox with the student's class on it, plus one lost-lunchbox box outside the office. The student checks the box first, then their classroom.

## Why this is better

Today students walk around asking people. The tag means anyone who finds a lunchbox knows where it goes.

## What could go wrong

| Risk | Who it affects | What we would do |
|---|---|---|
| Students do not check the box | Students | Put it where everyone walks past |
| Tags fall off | Students | Use a marker as well |

## How we would know it worked

Count how many lunchboxes are in the office at the end of the week, before and after. Fewer than five would be a good sign.

## What we would try first

Put one box outside the office for a week and count what ends up in it.

## Sources

1. Interview with the office administrator, 12 March 2026.
```

---

## Worked Example: Grades 11-12

```markdown
# ShiftSwap

**One-line pitch:** Casual hospitality workers can trade shifts inside a verified pool so that a missed shift does not become a missed rent payment.

**Made by:** A. M.  |  **Grade band:** 11-12  |  **Date:** 12 March 2026

## The problem

Casual workers in food service are often scheduled with less than 48 hours' notice and cannot refuse without risking future shifts. When a conflict appears, the informal fix is a group chat, which reaches only the people already on shift.

**Problem statement:** A casual hospitality worker struggles to cover an unexpected shift when they have no personal network on call, because shift information is held by the manager and shared through ad hoc group chats.

## Who it is for

A casual worker with fewer than six months at one venue, who has no established swap network.

## The idea

A shift board restricted to verified employees of one venue. A worker posts a shift; eligible colleagues get a notification; the manager approves the swap in one tap.

**Assumptions:** Workers will post shifts before the penalty window, and managers will accept an in-app approval rather than a verbal agreement.

**What it needs to work:** Employer participation, roster data, identity verification, and a manager who responds.

## Why this is better

Group chats are fast but reach a narrow, already-connected group. Noticeboards are visible but not real-time. Shift-swap features exist inside enterprise rostering software, but casual workers are often excluded from those accounts.

**Limitations:** The evidence comes from eight interviews in one city. It cannot show whether managers would pay for the tool, and it does not cover workers on zero-hours contracts in other sectors.

**Cost and adoption:** The employer pays per venue; the worker uses it free. Adoption depends on the manager, not the worker, which is the main risk.

## What could go wrong

| Risk | Who it affects | What we would do about it |
|---|---|---|
| Managers refuse to approve in-app | Workers, product | Run the pilot with one willing venue and measure approval time |
| Workers without smartphones are excluded | Low-income workers | Add a text-message fallback |
| Employers use it to pressure swaps | Workers | Do not show refusal history to managers |

## Fairness, safety, and privacy

The app stores names, shift history, and availability. It should not store reasons for refusal. Workers must be able to decline without a visible penalty.

## How we would know it worked

In a four-week pilot at one venue, at least 60% of posted shifts are covered, and median time-to-cover is under 12 hours.

## What we would test first

A shared spreadsheet and a group chat run by one manager for two weeks. If fewer than a third of shifts are covered, the problem is not reachability.

## Open questions

- Will managers approve swaps without a face-to-face conversation?
- How many workers lack a smartphone?

## Sources

1. Interview with eight casual workers, March 2026 (primary; fictional example).
2. Example Hospitality Association (2025). *Rostering and retention*. example.org/rostering (secondary; fictional example, sample 400 venues).
3. Example Bureau of Statistics (2024). *Casual work survey*. example.org/casual-work (data; fictional example).
```

---

## Writing Rules

- **Student's words.** If a sentence sounds like a pitch deck and not like the student, rewrite it with them.
- **No invented evidence.** Every number traces to `RESEARCH.md` or is labelled **Assumption**.
- **No orphan claims.** A claim with no source and no assumption label goes.
- **One user.** "Students, teachers, and parents" is three proposals. Pick one.
- **Plain headings.** "What could go wrong" beats "Risk Mitigation Strategy" for every band.
- **Honest limitations.** A proposal that names what it cannot prove is stronger than one that pretends.
- **The AI line stays.** It is academic honesty, not a confession.
