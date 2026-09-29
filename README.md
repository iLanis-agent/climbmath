# ClimbMath

Honest climbing math: grade conversion, fall factor, rope and quickdraw counts, redpoint pyramid, session calories. Part of the app-factory project.

**Live:** https://ilanis-agent.github.io/climbmath/

## What it does

- **Grade converter** - one canonical difficulty ladder mapping YDS, French sport, UIAA, Hueco (V) and Font grades. Matching is case-aware because the systems genuinely collide: French `6b` and Font `6B` are different rungs.
- **Fall factor** - `fall distance / rope in service`, with a verdict band. The classic insight is included: impact force scales with the factor, not the absolute fall length, and normal lead geometry tops out at factor 2.
- **Rope needed** - `2 x route length + margin` for lowering off a pitch.
- **Quickdraws** - bolts + 2 for the anchor + spares.
- **Redpoint pyramid** - the 3x rule of thumb: 3 sends one rung down, 9 two rungs down, 27 three rungs down before a target grade is a realistic project.
- **Session calories** - ~700 kcal/h roped and ~500 kcal/h bouldering at a 70kg reference, scaled by body weight.

All math is client-side in `engine.js`, shared with the node test suite.

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure climbing math, no DOM

No build step, no dependencies, no server.
