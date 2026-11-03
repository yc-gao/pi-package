---
name: learning-guide
description: >
  Guide the user through learning a new topic step by step, from their
  current understanding to the target concept. Use when the user wants to
  learn, study, understand, or master something — "teach me X", "explain X
  to me", "I want to learn/understand X", "help me learn X", "walk me
  through X" — especially when they want a structured path, not a one-off
  answer. The skill maps the knowledge, clarifies the goal, finds the user's
  cognitive boundary, and plans the path before teaching. Skip quick factual
  lookups or simple definitions that can be answered directly.
---

# Learn

Guide the user through learning something new, from what they already know to
the target concept. Teaching is structured and interactive, not a lecture
dump. Never start explaining before the planning phases are done.

## Core principle: understanding over memorization

True understanding means the learner can derive new knowledge from what they
already know. In a learner's mind, knowledge is not a pile of isolated facts
but a network: nodes are concepts, edges are the logical relationships between
them. If a node is forgotten, it can be re-derived by following the edges of
the network.

This is why every teaching step must start from existing knowledge and expand
the network outward — one new node or edge at a time — until the target is
reached. Before expanding, locate the learner's cognitive boundary: the edge
of what they currently understand. New knowledge built from that boundary is
the only knowledge that sticks.

## Workflow

Follow these phases in order. Do not skip the planning phases and jump
straight into teaching.

### Phase 1 — Recall the knowledge network and draw the framework (big picture)

Before anything else, build the big picture:

1. Retrieve or recall the relevant knowledge network for the subject.
2. Sketch a knowledge framework: the map of nodes and edges covering the
   target concept.
3. Identify where the target concept sits in that framework.

This phase is mandatory. It keeps the lesson grounded in a map rather than a
list of disconnected facts.

### Phase 2 — Clarify the learning goal

The learning goal is decided by the user, not assumed. Propose a few likely
goals (3-5) based on the framework, then ask the user to choose one or state
their own. Use `ask_user` with multiple-choice options. Get an explicit,
unambiguous answer before proceeding.

### Phase 3 — Locate the cognitive boundary

Determine what the user already knows and where their understanding stops:

1. Search the user's local knowledge base (notes, files, prior conversation)
   for evidence of existing knowledge.
2. Design questions (via `ask_user`) to probe the boundary — where do they
   start to feel unsure?

Do not assume the boundary; find it. The boundary is the launch point for all
teaching that follows.

### Phase 4 — Propose the learning plan and reach consensus

With the framework, goal, and boundary established:

1. Draw the learning plan as a diagram: the path from the boundary to the
   goal, showing each step (new nodes/edges) along the way.
2. Present it to the user for confirmation.
3. Adjust based on feedback. Do not start teaching until you and the user
   agree on the plan.

### Phase 5 — Teach along the plan

Advance step by step along the agreed path. Each step:

- Build the new node/edge directly from what the user already understands.
- Explain the logical relationship, not just the fact, so the new knowledge
  becomes part of the network.
- Use diagrams whenever they help.

### Phase 6 — Check understanding after each goal

After finishing each learning goal (not just at the very end):

- Design questions via `ask_user` to verify understanding.
- Prefer questions that reveal reasoning — can the user derive the next node? —
  over recall of facts.
- Fix each misunderstanding one at a time before moving on.

## Interaction rules

- **One question at a time.** Never bundle multiple questions into one message.
- **Use `ask_user`** for every question.
- **Mostly multiple-choice**, occasionally short open-ended questions.
- **Never yes/no (true/false) questions** — they reveal little about
  understanding.
- **Big picture first.** Always draw the framework before asking about goals
  or boundaries.
- **Agree before teaching.** Get explicit confirmation on the learning plan.

## Diagram guidance

- Prefer diagrams over prose for structure, relationships, and paths.
- Keep every diagram line ≤ 120 characters wide so it never overflows.
- Good options: ASCII trees, node-edge graphs, flow arrows, and tables.

## Example flow

1. User: "I want to learn how transformers work."
2. Agent recalls the ML knowledge network and sketches a framework
   (embeddings → attention → self-attention → transformers).
3. Agent proposes candidate goals via `ask_user`, e.g.:
   - "Understand attention well enough to read a paper."
   - "Just grasp the intuition, no math."
   - "Implement a minimal transformer."
4. User picks one goal.
5. Agent searches the user's notes, then asks one probing question to find
   the boundary, e.g. "Which best describes your comfort with vector
   embeddings?" with options.
6. Agent draws the learning plan and confirms it:

   ```
   boundary: vector embeddings
     └─ dot-product similarity
          └─ attention weights
               └─ self-attention
                    └─ multi-head attention   <- goal
   ```

7. Agent teaches step by step with diagrams.
8. After the attention step, agent asks a question to check, fixes a
   misunderstanding, then continues.
