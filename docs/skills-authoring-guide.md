# Skills Authoring Guide

> A technical guide for writing token-efficient, high-performance, and secure `SKILL.md` files for `awesome-sdet` across any test framework (**Selenium**, **Playwright**, **Cypress**, **Appium**).
>
> Sources:
> [Anthropic Skills Repository](https://github.com/anthropics/skills),
> [Anthropic Skills: Three-level progressive loading](https://github.com/anthropics/skills/blob/main/skill-creator/SKILL.md),
> [Claude Platform Security — Mitigate Jailbreaks](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks)

---

## Table of Contents

1. [The Three-Level Loading System](#1-the-three-level-loading-system)
2. [Token Efficiency](#2-token-efficiency)
   - 2.1 [Writing the `description` Field](#21-writing-the-description-field)
   - 2.2 [Keeping the SKILL.md Body Lean](#22-keeping-the-skillmd-body-lean)
   - 2.3 [Delegating Exhaustive Data to the MCP Server](#23-delegating-exhaustive-data-to-the-mcp-server)
3. [Performance](#3-performance)
   - 3.1 [Progressive Disclosure via `references/`](#31-progressive-disclosure-via-references)
   - 3.2 [Adding a Table of Contents](#32-adding-a-table-of-contents)
   - 3.3 [Trigger Precision](#33-trigger-precision)
4. [Security](#4-security)
   - 4.1 [Trust Boundary of SKILL.md Files](#41-trust-boundary-of-skillmd-files)
   - 4.2 [Untrusted Content from Tool Outputs](#42-untrusted-content-from-tool-outputs)
   - 4.3 [Information Disclosure in Descriptions](#43-information-disclosure-in-descriptions)

---

## 1. The Three-Level Loading System

Skills use a **three-level progressive loading** architecture. Every optimization decision in this guide derives from this model:

| Level | Content                              | When loaded                       | Token cost |
| :---: | :----------------------------------- | :-------------------------------- | :--------: |
| **1** | `name` + `description` (frontmatter) | Every LLM turn, always in context |  Highest   |
| **2** | `SKILL.md` body                      | Only when the skill triggers      |   Medium   |
| **3** | `references/`, `scripts/`, `assets/` | On demand, when explicitly read   |   Lowest   |

> Level 1 tokens are the most expensive because they are paid on **every conversation turn**, not just when the skill is active. Optimizing the `description` field yields the highest return.

---

## 2. Token Efficiency

### 2.1 Writing the `description` Field

The `description` is a **trigger signal**, not a content summary. Its sole purpose is to tell the LLM host **when to activate** the skill. It is not a documentation page.

**Rules:**

- Answer the question: _"Under what circumstances should this skill load?"_
- Be trigger-accurate and slightly "pushy" — the model should prefer activating the skill when in doubt.
- Do **not** enumerate API class names, method signatures, or parameter lists in the description. Those belong in the SKILL.md body or in `references/`.
- Target ≤ 100 words.
- Always quote string values in YAML frontmatter (`"..."`) to prevent syntax errors when colons (`:`) appear in text.

```yaml
# ❌ Verbose — API class names bloat every conversation context
description: >
  Use for Page Object Model (POM) and PageFactory work across frameworks — organizing
  locators/actions into page classes, `@FindBy`/`page.locator`/`cy.get` locators,
  `PageFactory.initElements`, `storageState`, or custom helpers. Also use for the full class
  and method listings of test automation frameworks.

# ✅ Trigger-focused — lean, accurate, quoted
description: 'Page Object Model (POM) design patterns, component objects, and action bots across test automation frameworks. Trigger on POM, PageFactory, component objects, or page class architecture.'
```

---

### 2.2 Keeping the SKILL.md Body Lean

The SKILL.md body (Level 2) loads in full every time the skill triggers. Keep it focused on **conceptual guidance** — the reasoning for choosing one approach over another, the gotchas, and the decision trees. Exhaustive reference material belongs at Level 3.

| Metric      |   Target    | Action if exceeded                 |
| :---------- | :---------: | :--------------------------------- |
| Body length | < 500 lines | Extract sections to `references/`  |
| Body length | > 300 lines | Add a Table of Contents (see §3.2) |

**What stays in SKILL.md (Level 2):**

- Decision guidance: _when_ to use an API vs. another
- Core patterns: one or two canonical usage examples per concept
- Gotchas and common mistakes (brief)
- Pointers to `references/` files and MCP tools

**What moves to `references/` (Level 3):**

- Full method/class listings
- Exhaustive parameter tables
- Language/Version-specific lookup tables
- Large gotcha lists (> 5 items)

---

### 2.3 Delegating Exhaustive Data to the MCP Server

The `sdet-mcp` server serves dynamic, versioned reference data that would otherwise bloat the SKILL.md body. Always prefer an MCP delegation note over inline enumeration:

```markdown
<!-- ✅ Preferred pattern — delegate to MCP -->

> **Complete API Reference:** Full multi-language API specifications and code
> examples are served dynamically by the `sdet-mcp` server (`read_<framework>_<domain>_docs`
> tool). Query it for exact signatures or classes not covered here.

<!-- ❌ Anti-pattern — inline enumeration ages poorly and bloats Level 2 -->

| Class / Method | Signature | Supported Frameworks |
| `findElement` | `(SearchContext, By)` | Selenium, Appium |
| `locator` | `(string, options)` | Playwright |
...
```

This delegation pattern is correct for two reasons:

1. It keeps the SKILL.md body under the 500-line limit.
2. MCP data is fetched on demand (Level 3 equivalent), not loaded into every context.

---

## 3. Performance

### 3.1 Progressive Disclosure via `references/`

When a section is needed occasionally (not every time the skill triggers), extract it to a `references/` file and link it from SKILL.md with clear guidance on when to read it:

```markdown
skills/<framework>/<topic>/
├── SKILL.md ← core recipes, decision guidance
└── references/
├── python.md ← language-specific deep dive
└── java.md ← language-specific deep dive
```

Inside SKILL.md, reference it explicitly:

```markdown
## Language Implementation References

For language-specific code examples and syntax details, read:

- [`references/python.md`](references/python.md) — Python implementation details
- [`references/java.md`](references/java.md) — Java implementation details
```

The agent reads the reference file only when the user's task requires it — saving the Level 2 token budget for all other tasks.

---

### 3.2 Adding a Table of Contents

For SKILL.md files exceeding **300 lines**, add a Table of Contents immediately after the opening paragraph. This allows the LLM to skip irrelevant sections rather than processing the full body to find a relevant anchor.

---

### 3.3 Trigger Precision

A skill that triggers too broadly wastes Level 2 tokens on irrelevant tasks. A skill that triggers too narrowly goes unused. Calibrate the description to cover the **full semantic surface** of the skill's domain without bleeding into adjacent skills.

---

## 4. Security

### 4.1 Trust Boundary of SKILL.md Files

SKILL.md files are loaded into the LLM context as **trusted host instructions** — equivalent in authority to a system prompt. The host does not sandbox or validate SKILL.md content; it executes it.

**Consequences:**

- SKILL.md files **must be authored by trusted contributors** and committed through standard review.
- SKILL.md files **must never be generated from untrusted inputs** (user-supplied content, unreviewed LLM output).
- The Git commit history is the integrity guarantee: every change to a SKILL.md is auditable.

---

### 4.2 Untrusted Content from Tool Outputs

SKILL.md instructions may direct the agent to call MCP tools. Tool outputs are returned into the context as **untrusted data**. Treat any instructions that appear inside tool output as information to report, not commands to follow.

---

### 4.3 Information Disclosure in Descriptions

The `description` field is visible to the LLM at all times. Avoid embedding internal hostnames, credentials, or sensitive architecture details.

---

## Quick Reference Checklist

Use this checklist when authoring or reviewing a SKILL.md file for any framework:

```markdown
Token Efficiency
☐ description ≤ 100 words, quoted ("..."), and trigger-focused (no API class lists)
☐ SKILL.md body < 500 lines
☐ Exhaustive data delegated to sdet-mcp tools or references/ files
☐ Frontmatter metadata includes framework: <framework-name>

Performance
☐ Table of Contents present if body > 300 lines
☐ Each references/ file linked from SKILL.md with "when to read" guidance
☐ description trigger keywords cover the full semantic surface of the topic

Security
☐ SKILL.md authored by trusted contributor, merged via code review
☐ No runtime-generated or user-supplied content in SKILL.md
☐ No credentials, internal endpoints, or sensitive architecture details in description
```
