# Milestone Roadmap: UI De-AI-ification & Metallic Industrial Redesign

## Phases & Execution Waves

### Phase 1: Audit & Design Contract (Completed)
- [x] Comprehensive scan of all AI markers across HTML, CSS, and JS files (`ui_ai_markers_audit.md`).
- [x] 6-Pillar retroactive UI audit scorecard (`ui_review_6_pillar.md`).
- [x] UI Design Specification Contract defining Metal Black, Shine Gray & Tactile Shadow (`ui_spec_metallic_industrial.md`).

### Phase 2: Design Token & Core Stylesheet Migration
- [ ] Refactor `frontend/styles.css` root variables to the Metal Black & Shine Gray token hierarchy.
- [ ] Replace all neon glow box-shadows (`box-shadow: 0 0 ...`) with multi-stage contact shadows.
- [ ] Remove radial background glow orbs and replace with solid brushed metal dark background.
- [ ] Synchronize `frontend/css/variables.css` and `frontend/css/dashboard.css` to match tokens.

### Phase 3: HTML Iconography & Buzzword Cleanse
- [ ] Cleanse `frontend/index.html` (Landing page) — remove glow layers, AI badges, and robotic copy.
- [ ] Cleanse `frontend/dashboard.html` (Main dashboard) — update badges and replace AI tropes.
- [ ] Cleanse `frontend/roadmap.html` — replace magic wand button and AI commentary tags with placement readiness audit terms.
- [ ] Cleanse `frontend/interview.html` and `frontend/softskills.html` — replace robot emojis, sparkles, and magic wands.
- [ ] Refactor `frontend/mock_interview.html` — remove Tailwind CDN injection, eliminate "NeuroMock" branding, and hook into standard metallic styles.

### Phase 4: Component Tactility & Verification
- [ ] Validate button depress behavior (`:active { transform: translateY(1px); }`) and inset well styling across all interactive elements.
- [ ] Verify responsive layout across mobile and desktop viewport widths.
- [ ] Run full test suite (`python -m pytest ml_engine/tests/test_ml.py -v`) to confirm zero regressions to backend or ML layers.
