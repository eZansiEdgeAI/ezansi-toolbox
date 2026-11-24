# design-thinking-coach

Turn a student's observation or idea into a researched, defensible proposal.

`design-thinking-coach` is an agent skill for students in grades 5–12. It grills an idea one small round at a time, pushes for evidence and critical thinking, verifies the sources the student finds, and produces three files: `PROPOSAL.md`, `RESEARCH.md`, and `DECISIONS.md`.

It coaches. It does not write the proposal for the student. The student owns the idea, decisions, and research. The agent owns the questions, structure, and fact-checking.

## Who it is for

- **Students** working on a design-thinking, inquiry, entrepreneurship, or capstone project.
- **Teachers** running a 45–90 minute ideation lesson, with or without devices.
- **Anyone** who wants an idea stress-tested instead of politely accepted.

## What it produces

| File | Contents |
|---|---|
| `PROPOSAL.md` | The pitch, problem, user, solution, evidence, risks, fairness, success measure, first test, and open questions. |
| `RESEARCH.md` | The questions asked, sources, what each source actually shows, a verification verdict, what changed the student's mind, and gaps. |
| `DECISIONS.md` | Each decision, the options considered, what was chosen and why, and what would change the student's mind. |

Every factual claim is sourced or labelled `Assumption`. If a source cannot be opened, or does not say what the student claims, the agent records it as unverified. It never invents a source or counts an unverified one as support.

## How a session runs

1. **Set up.** Grade band, time available, solo or teacher mode, and the problem the student has noticed.
2. **Notice and define.** Narrow to one user and one moment, and test whether an app is even needed.
3. **Research sprint.** The student finds sources; the agent verifies them.
4. **Ideate and choose.** At least three ideas, including a non-digital option and a "change nothing" option.
5. **Shape the proposal.** One question per section, in the student's words.
6. **Red-team.** The strongest argument against the idea, who is left out, and the cheapest test.
7. **Confirm and write.** The student corrects a summary, then the three files are written.
8. **Defend.** Three questions the student should be able to answer without reading.

## Grade bands

| | Grades 5–7 | Grades 8–10 | Grades 11–12 |
|---|---|---|---|
| Round size | 2–3 questions | 3–4 questions | 4–5 questions |
| Language | Short, concrete, no jargon | Terms defined plainly | Full design vocabulary |
| Evidence | 1 source or 1 trusted person | 2 sources, at least 1 primary | 3+ sources, data, counter-evidence |
| Ideas | 3, including a non-digital option | 3 scored on criteria | Existing solutions, feasibility, ethics |
| Session | 20–30 minutes | 40 minutes | 60 minutes |

The band changes the wording and depth. It does not change the expectation that the student thinks.

## Using it

Copy the skill into your agent's skills directory:

```bash
cp -r collection/skills/design-thinking-coach .agents/skills/
```

Then ask normally, for example:

> I'm in grade 7. I want to make an app so kids stop losing their lunchboxes. Help me turn it into a proposal. I have 25 minutes.

> Teacher mode: grade 8–10, 45 minutes, groups of four, one device per group. Set up a design-thinking lesson that ends with a proposal.

> Grill my idea: a service that lets neighbours share school-run lifts. I'm in grade 11.

## Teacher mode

Teacher mode adds lesson plans for 45, 60, and 90 minutes, group roles (including a challenger), teacher checkpoints, a printable no-AI worksheet, differentiation notes, and a rubric that scores the process, not the polish. See [references/teacher-mode.md](references/teacher-mode.md).

## Design principles

- **The student decides.** The agent supplies trade-offs and starter suggestions, never the verdict.
- **The student researches.** The agent verifies sources and refuses to invent citations.
- **Challenge the idea, not the student.** No sarcasm, no "that's wrong".
- **A "not yet" proposal is a real result.** If the idea fails the red-team, the honest outcome is a cheaper test, not a forced build.
- **Safeguarding is built in.** The agent asks for a grade band, not a name or school. Students interview people they already know, with permission, and harmful ideas are redirected.

## Folder layout

```text
design-thinking-coach/
  SKILL.md                      # Agent instructions: loop, process, gotchas, validation
  README.md                     # This file
  references/
    question-bank.md            # Grade-banded questions and worked rounds
    research-coach.md           # Source quality and verification protocol
    proposal-template.md        # Output structures and worked examples
    teacher-mode.md             # Lesson plans, roles, rubric, no-AI worksheet
  evals/
    evals.json                  # 2 happy-path and 3 edge-case cases
```

## Quality

- Audited with the repository's `skill-review`: 3.0 on all six axes (context economy, gotchas, procedural clarity, progressive disclosure, calibration, validation).
- Eval cases cover a grade 6 solo session, a grade 8–10 teacher lesson, a student asking the agent to write the proposal, a grade 5 student with no idea, and an unverifiable source.

## License

MIT. See the repository [LICENSE](../../../LICENSE).
