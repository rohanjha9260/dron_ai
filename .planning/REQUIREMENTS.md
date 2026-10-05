# Milestone Requirements: UI De-AI-ification & Metallic Industrial Theme

## Functional & Design Requirements

### REQ-UI-01: Token Architecture Overhaul
- **REQ-UI-01.1**: Purge all diffuse neon glow tokens (`--accent-orange-glow`, `--accent-cyan-glow`, `--accent-purple-glow`, `--shadow-orange-glow`).
- **REQ-UI-01.2**: Implement the Metal Black palette (`--metal-chassis-deep: #07080A`, `--metal-surface-base: #0C0E12`, `--metal-surface-card: #12151C`).
- **REQ-UI-01.3**: Implement the Shine Gray specular highlights (`--metal-border-specular`, `--metal-border-shine`, `--metal-steel-100` through `--metal-steel-600`).
- **REQ-UI-01.4**: Implement multi-stop tactile shadow physics (`--shadow-tactile-card`, `--shadow-tactile-sunken`, `--shadow-button-raised`, `--shadow-button-active`).

### REQ-UI-02: Component Tactility & Physics
- **REQ-UI-02.1**: Replace floating glass cards (`backdrop-filter: blur(16px)`) with solid milled metal cards featuring 1px top specular lips.
- **REQ-UI-02.2**: Upgrade buttons to tactile mechanical push controls with physical state depression on `:active`.
- **REQ-UI-02.3**: Recess all form input fields, code blocks, and data tables into sunken machine wells.
- **REQ-UI-02.4**: Calibrate all badges, pills, and status tags to clean monospace engineering tags (`JetBrains Mono`).

### REQ-UI-03: Synthetic Trope & Icon Purge
- **REQ-UI-03.1**: Eliminate all magic wand (`fa-wand-magic-sparkles`), sparkle (`✨`, `fa-sparkles`), and robot (`🤖`, `fa-robot`) icons from HTML templates.
- **REQ-UI-03.2**: Replace with functional mechanical icons (`fa-sliders`, `fa-microchip`, `fa-chart-simple`, `fa-waveform`, `fa-pen-ruler`).
- **REQ-UI-03.3**: Strip infinite loop pulse animations (`.badge-pulse`, `.status-indicator-dot`, `.audit-btn-pulse`).

### REQ-UI-04: Copywriting & Authentic Tone
- **REQ-UI-04.1**: Remove all synthetic AI buzzwords ("Autonomous AI Engine", "NeuroMock", "AI-Powered Magic").
- **REQ-UI-04.2**: Replace with authentic engineering and campus placement terminology ("Placement Readiness Calculator", "STAR Framework Evaluator", "T&P Placement Cell Advisories").

### REQ-UI-05: Layout & File Harmonization
- **REQ-UI-05.1**: Unify `frontend/styles.css`, `frontend/css/variables.css`, and `frontend/css/dashboard.css` under the single Metal Black token system.
- **REQ-UI-05.2**: Remove inline Tailwind CDN and cyber configuration from `frontend/mock_interview.html`.
