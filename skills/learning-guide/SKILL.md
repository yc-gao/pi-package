---
name: learning-guide
description: >
  Guide a user through learning new knowledge step by step — map the
  knowledge framework for the topic, discover the learner's current
  knowledge boundary, propose a learning plan, then teach via analogies and
  diagrams and confirm understanding along the way. Use whenever the user
  wants to learn, understand, or be taught something (a concept, a subject,
  a skill, a theory, or any new topic), says they don't understand
  something, asks "teach me", "explain it to me from the ground up", or
  wants a study plan — rather than when they just want a one-off answer to
  a task they are already doing.
---

# Learning Guide

Help the user genuinely learn new knowledge. The goal is not to dump
information, but to grow the learner's understanding from what they already
know, one step at a time, and to verify that understanding sticks.

## Core idea: knowledge is a network, not a list

People who truly understand something don't hold isolated facts — they hold
a **network**. Nodes are concepts, edges are the logical relationships
between them. This matters because:

- Understanding beats memorization. A learner who understands can
  **re-derive** a missing node (something they forgot) from the surrounding
  network.
- New knowledge is only easy to grasp when it connects to nodes the learner
  already has. Teaching should therefore always **extend from the learner's
  existing network**, adding one edge and one node at a time until the target
  is reached.

Consequences for how to teach:

- Never start explaining before you know what the learner already knows.
  The learner's **cognitive boundary** (the edge of their current network)
  is the only valid starting point.
- Build outward from that boundary. A new concept should land as an edge
  from an existing node, not as a free-floating fact.
- Prefer a chain of small derivations over a big statement. If you can
  arrive at the target by walking edges from a node the learner already
  holds, that is the explanation.

## The workflow — do not skip step 1

Follow these phases in order for every learning request. The orientation
phase is mandatory; jumping straight to "explain the thing" is the most
common failure mode.

### 1. Orientation (never skip)

Do three things, in this order, before teaching anything:

1. **Map the knowledge framework.** Sketch the network for the target
   topic — its key nodes and how they connect — so you have the big
   picture. You may search for reference material to make this framework
   accurate, but the framework is your working map, not a lecture.
2. **Clarify the learning goal.** The goal is decided by the *user*, not
   by you. Propose a few plausible goals based on the framework, then ask
   the user to pick or state one. Never assume the goal silently.
3. **Discover the cognitive boundary.** Find the edge of what the user
   already knows. First check the user's local knowledge base or files if
   available, then ask questions to probe where they stand. Use a few
   targeted questions; you do not need a complete picture, just enough to
   know where to start.

Only after these three are done: write a short learning plan as a sequence
of nodes along the framework, from the boundary to the goal, and share it.

### 2. Teach along the framework

Move node by node along the plan:

- Start from something the learner already holds (their boundary) and
  extend one edge at a time.
- **Build a subjective feel first**, then refine. Use analogies and
  concrete examples so the concept has a hook before the details. Details
  without a feel are exactly the isolated facts that get forgotten.
- Prefer derivation over assertion: walk from the known node to the new
  node step by step, showing *why* the connection holds.
- After each node or small group of nodes, pause and check before moving on.

### 3. Confirm and correct

At the end of each learning goal (not just at the very end), check
understanding:

- Ask questions designed to reveal whether the learner can traverse the
  network themselves — e.g. "given X, what happens to Y?" — rather than
  asking them to recite definitions.
- Address misunderstandings one by one. When an answer shows a wrong edge,
  find which node or connection is off and repair that specific spot,
  then re-check.

## Interaction rules

### Ask one question at a time

Ask exactly one question, wait for the answer, then continue. Never bundle
several questions into one message.

### Question types

- Mostly **multiple choice** — offer a few concrete options. Options make
  the learner's current model visible with low effort and low pressure.
- A small number of **open-ended** questions where you need the learner to
  articulate reasoning in their own words.
- **Never use true/false or yes/no questions** — they carry almost no
  information about the learner's mental model.

### Keep it low-pressure

Guide thinking, don't test. Use analogies to make ideas feel familiar
before getting precise. The learner should feel they are discovering the
connection, not being examined on it.

## Presenting with diagrams

When expressing structure, relationships, or a sequence, use diagrams.
Output them as **mermaid**, and lay them out **vertically** (top-to-bottom)
so they read naturally as a progression.

Use `flowchart TB` (top-to-bottom) or `graph TD` for structure and
relationships. For a progression of concepts, a vertical flowchart works
well:

```mermaid
flowchart TB
    A[Known node] -->|edge / relationship| B[New node]
    B --> C[Next node]
    C --> D[Learning goal]
```

Keep each diagram small and focused on the current step; a sprawling
diagram of the whole field is a map to get lost in, not a teaching aid.
