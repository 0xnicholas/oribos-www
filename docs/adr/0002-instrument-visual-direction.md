# Instrument visual direction for Oribos WWW

Status: accepted
Date: 2026-10-21

The new site uses the **B · instrument** direction: graphite surfaces, mono-led labels, a 1328 px container with a 144 px section rhythm, rail sections, 1 px hairlines, zero radius, and a dark-first default. The accent is A's signal orange — `#d94f2b` in light, `#ff7a4d` in dark. The Oribos wordmark is text, not a drawn mark, at launch. This is a greenfield identity: it does not inherit `oribos-website` or `oribos-docs` tokens, components, or material, and it does not copy Mastra's soft dark panels, large radii, 2 px borders, shadows, or 180 px rhythm. The structural grammar (section tabs, cross-column cards, three-column bands, comparison matrices, native FAQ) is borrowed; the visual material is not.

## Considered Options

- **A · editorial signal**: serif display, warm paper, signal orange, 1240 px, 112 px rhythm, light default. Rejected as the base because the serif is a real brand bet and the light-first reading is less instrument-like for a developer tool.
- **C · Mastra-near**: soft dark, 30–40 px radii, 2 px borders, 180 px rhythm, pill tabs, shadows, gradients, dual accent. Rejected because it is the most expensive direction against the dual-theme AA gate and reads as a Mastra skin rather than an Oribos identity.
- **Accent alternatives**: ice cyan, cobalt, violet, and signal red were prototyped. Rejected for launch; signal orange won because it carries A's editorial signal into B's instrument structure and remains legible in both themes. The alternatives stay in the throwaway prototype only.
- **A drawn logo/mark at launch**: rejected. The text wordmark plus a placeholder O tile favicon is enough for launch; a custom locked mark is a separate brand effort.

## Consequences

- `docs/spec/design-system.md` is the visual contract; implementation consumes its tokens and component anatomy and must not redefine them.
- Both themes must pass the 33-pair contrast gate; `1px`/`0 radius`/no-shadow rules are CI-enforced by the design gate.
- The prototype on `prototype/visual-direction` is evidence, not production code; it is not merged or folded into the site.
- Mastra's visual tokens, the old site's trace-ink/Swiss material, and any customer-proof visual treatment are out of scope.
- A future brand effort may add a drawn mark or change the accent; that requires a new ADR, not a silent token edit.
