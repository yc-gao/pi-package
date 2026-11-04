---
name: learning-guide
description: >
  Guide the user step by step through learning a new topic, from what they
  already know to the target concept, in a structured and interactive lesson.
  Trigger on: "teach me X", "explain X to me", "help me learn X", "I want to
  understand X", "walk me through X", "how does X work under the hood".
  Use it when the user wants to be guided through learning something, not when
  they want a quick factual lookup or a one-line definition.
---

# Learning guide

Guide the user through learning something new, from what they already know to
the target concept. Teaching is structured and interactive, not a lecture
dump. Never start explaining before the planning phases are done.

## Core principles

### Understanding over memorization

True understanding means the learner can derive new knowledge from what they
already know. In a learner's mind, knowledge is not a pile of isolated
propositions but a network: nodes are concepts, edges are the logical
relationships between them. If a node is forgotten, the learner can rebuild it
by following the edges of the network.

So every teaching step must start from existing knowledge and extend the
network one node or edge at a time, until the target is reached.

### Build outward from the cognitive boundary

Before adding any new node or edge, locate the learner's cognitive boundary:
the edge of what they currently understand. Knowledge derived from that
boundary is the knowledge that sticks. Knowledge delivered from somewhere else
is noise.

## Workflow

The phases are ordered and all of them are required. The step that is most
often forgotten is Phase 1 — do not start from the goal, start from the map.

```
1. map the knowledge framework
2. confirm the learning goal      (user decides)
3. locate the cognitive boundary
4. agree on the learning plan
5. teach step by step
6. check understanding per goal
```

Keep the big picture: the framework from Phase 1 stays the backbone. Goals,
boundary checks and the plan are all read off that framework, and teaching
follows it edge by edge.

### Phase 1 — Recall the knowledge network and draw the framework

Before anything else:

1. Retrieve or recall the relevant knowledge network for the subject.
2. Sketch a knowledge framework: the map of nodes and edges covering the
   target concept.
3. Show where the target concept sits in that framework.

Never skip this phase and never replace it with a list of isolated facts. It
keeps the lesson grounded in a map, and it gives the later phases something to
refer to.

### Phase 2 — Confirm the learning goal with the user

The learning goal is decided by the user, never assumed. Read the possible
goals off the framework, guess 3-5 plausible ones, and ask the user to pick one
or state their own. Use `ask_user` with multiple-choice options. Get an
explicit, unambiguous answer before proceeding.

### Phase 3 — Locate the cognitive boundary

Find out what the user already knows and where their understanding stops:

1. Search the user's local knowledge base first — notes, files, earlier
   conversation — for evidence of existing knowledge.
2. Then design questions via `ask_user` to probe the boundary: where does the
   user start to feel unsure?

Do not assume the boundary; find it. It is the launch point for all teaching
that follows.

### Phase 4 — Propose the learning plan and reach consensus

1. Draw the plan as a diagram: the path from the boundary to the goal, along
   the framework, listing each step (the new node or edge) in order.
2. Present it to the user for confirmation.
3. Adjust it based on feedback. Reach agreement before teaching anything.

### Phase 5 — Teach along the plan

Advance step by step along the agreed path. Each step:

- Builds the new node or edge directly from what the user already
  understands.
- Explains the logical relationship, not only the fact, so the new knowledge
  joins the network instead of floating beside it.
- Uses a diagram whenever structure, relationships or a path are involved.

### Phase 6 — Check understanding after every learning goal

After finishing each learning goal — not only at the very end:

- Design questions via `ask_user` to confirm what was actually learned.
- Prefer questions that reveal reasoning (can the user derive the next node?)
  over recall of facts.
- Fix each misunderstanding one at a time, then continue.

## Interaction rules

- **One question per message.** Never bundle several questions together.
- **Use `ask_user`** for every question.
- **Mostly multiple choice**, with a few short open-ended questions; **never
  yes/no questions** — they reveal little about understanding.
- **Big picture first.** Draw the framework before asking about goals or
  boundaries.
- **The user owns the goal.** Offer candidates, do not decide.
- **Agree before teaching.** No explanation until the plan is confirmed.
- **Diagrams over prose** for structure and relationships.

## Readability

- Keep every diagram line at or under 120 characters so it never wraps.
- Avoid hard-to-distinguish symbols — circled numbers such as ① ② ③,
  full-width glyphs, decorative marks. Use plain numbering (`1.` `2.` `3.`),
  bullet lists, or tables instead.
- Leave a blank line before and after every diagram or table block.

## Diagram options

ASCII trees for hierarchy, node-edge graphs for the knowledge network, arrow
chains for causal or derivation paths, tables for comparisons.

## Example flow

1. User: "I want to learn how transformers work."
2. Agent recalls the ML knowledge network and sketches the framework
   (vectors → similarity → attention → self-attention → transformers).
3. Agent proposes candidate goals via `ask_user`, e.g.:
   - Understand attention well enough to read a paper.
   - Grasp the intuition only, no math.
   - Implement a minimal transformer.
4. User picks one.
5. Agent searches the user's notes, then asks one boundary question, e.g.
   "Which best describes your comfort with vector embeddings?" with options.
6. Agent draws the plan and confirms it:

   ```
   boundary: vector embeddings
     └─ dot-product similarity
          └─ attention weights
               └─ self-attention
                    └─ multi-head attention   <- goal
   ```

7. Agent teaches step by step, one node per step, with diagrams.
8. After the attention step, the agent asks one reasoning question, corrects
   the misunderstanding it reveals, then continues.
