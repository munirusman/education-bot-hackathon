# Orbit Design System

Orbit gives every student a private AI tutor while keeping the teacher in control. Teachers set how each tutor behaves, monitor student activity in real time, and step in when needed — personalized AI-powered learning without turning AI into an answer machine.

**Core idea:** thirty students, thirty isolated tutors, one teacher at the center of the orbit. The teacher writes plain-language rules ("Give hints, but never reveal the final answer."), sees who is working or stuck, and can jump into any session to leave a note, change behavior, approve an action, or pause the tutor.

## Sources
- Company description and product narrative supplied in chat (no codebase, Figma, logo, fonts or screenshots were provided).
- Everything here is therefore an **original, from-scratch system**. UI kits are proposed reference screens, not recreations of a shipped product.
- **Logo:** lowercase "orbit" in Hanken Grotesk 700 with a mortarboard on the first "o" (a student wearing the cap; the sun tassel is the teacher). Designed in this project (Logo Options.html, option 4e). Use the `Logo` component; static marks in `assets/`.

## Products / surfaces
1. **Teacher console** (desktop web) — live classroom grid, per-student session drill-in, tutor rules, test mode. `ui_kits/teacher-console/`
2. **Student tutor** (desktop web) — a private chat with the tutor, attached files, visible rules and teacher notes. `ui_kits/student-tutor/`

---

## CONTENT FUNDAMENTALS
- **Voice:** calm, plain, teacher-first. Orbit sounds like a competent teaching assistant, not a hype product. It never says "AI-powered magic", "supercharge" or "agent" in UI.
- **Person:** address the user as **you**. The product refers to itself rarely; the AI is "your tutor" (student) or "Maya's tutor" (teacher). The teacher is "your teacher" / "Ms. Ortega" to students.
- **Casing:** Sentence case everywhere — buttons, titles, tabs ("Pause tutor", "Tutor rules", "Needs approval"). Mono eyebrows are UPPERCASE with tracking.
- **Buttons are verbs + object:** "Pause tutor", "Send note", "Apply rule", "Approve". Never "OK" / "Submit".
- **State is stated, not dramatized:** "4 students are stuck on factoring." not "Uh oh! Some learners need a boost!"
- **Rules are quoted verbatim.** A teacher's rule is displayed exactly as written, in mono — never paraphrased. Tutor turns that were shaped by a rule carry a mono footnote: "Hint given · answer withheld".
- **Transparency to students:** students are always told what the tutor will and won't do ("Your tutor helps you think it through. It won't do the work for you.") and that "Your teacher can see this session."
- **Confirmations state the consequence:** "Maya will see 'Your teacher paused the tutor.' You can resume anytime."
- **Numbers:** numerals, not words ("6 min", "28 tutors"). Typographic quotes and real minus signs (−) in math.
- **Emoji:** never. No exclamation marks except in a teacher's own note.

## VISUAL FOUNDATIONS
- **Color:** warm *sand* paper neutrals carry 90% of the UI; **plum** (`--plum-600 #663a6c`) is the single brand ink for primary actions, selection and the tutor. **Sun** yellow is reserved exclusively for the teacher's presence — notes, teacher avatars, test mode, the "Leave a note" button — so a teacher intervention is always recognizable at a glance. Session states have fixed hues: green working, amber stuck, blue needs approval, sand paused, red blocked. Never use those hues decoratively.
- **Type:** Newsreader (serif) for page titles, big numbers and the wordmark — the human, editorial voice. Hanken Grotesk for all UI and reading. IBM Plex Mono for tutor rules, eyebrows, timestamps and file names — anything "configured" or machine-precise. Serif above 28px, sans below.
- **Spacing:** 2px-based scale (2,4,6,8,12,16,20,24,32,40,56,80). Cards pad 14–16; page gutters 28; grid gaps 12.
- **Backgrounds:** flat warm paper (`--bg-app #f5f2ed`), white cards on top. No gradients, no textures, no full-bleed imagery, no illustrations in product UI.
- **Imagery:** none supplied. If photography is introduced it should be warm, natural-light classroom imagery, never stock "robot/AI" visuals.
- **Borders:** 1px `--border-1` hairlines define structure before shadows do. Selected = 1px plum border + 1px plum ring.
- **Shadows:** warm plum-tinted, low. `shadow-xs` resting cards, `shadow-md` hover lift, `shadow-lg` dialogs/toasts only.
- **Corner radii:** 4 tags/tooltips, 6 controls, 10 cards, 14 dialogs and composer, full for badges/avatars/switches. Soft, not bubbly.
- **Cards:** white, 1px sand border, radius 10, shadow-xs, optional mono eyebrow + semibold title. No colored left-border accents.
- **Hover:** neutral surfaces darken one sand step; primary darkens one plum step; interactive cards lift to shadow-md. **Press:** one more step darker + 1px translateY. No scale bounces.
- **Focus:** plum border + 3px soft plum ring (`--ring-focus`).
- **Motion:** quick and calm — 120ms hover, 180ms popovers/toasts, 280ms dialogs, `cubic-bezier(.2,.7,.2,1)`. Entrances fade up 4px. The only looping animation is the amber pulse on a "stuck" status dot.
- **Transparency/blur:** only the dialog scrim (`rgba(29,26,23,.36)`). No glassmorphism.
- **Layout:** fixed 248px left sidebar, 56px top bar, scrollable content; teacher drill-in is a 420px right panel that keeps the classroom grid visible. Student chat column max 720px, centered.
- **Chat:** student turns are plum bubbles (right); tutor turns are unboxed prose (left) at 15px; teacher turns sit on the sun surface with a "TEACHER" mono label.

## ICONOGRAPHY
- **Lucide** (lucide.dev), 2px stroke, rounded joins — loaded from CDN (`lucide-static@0.469.0`) and rendered by the `Icon` component as a CSS mask so it inherits `currentColor`. No icon files were provided; Lucide is a chosen default, not a substitution of an existing set.
- Sizes: 14 in dense rows and badges, 16 default, 18–20 in empty states. Icons accompany labels; icon-only buttons always have a label/tooltip.
- Common glyphs: `layout-grid` live classroom, `scroll-text` rules, `pause`/`play` tutor control, `sticky-note` teacher note, `shield-check` rule footnote, `sparkle` tutor, `eye` "teacher can see", `paperclip` files.
- No emoji, no unicode-as-icon, no icon font, no PNG icons.

---

## Index
- `styles.css` — entry point (imports only)
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `base.css`
- `assets/` — `logo-mark.svg`, `logo-mark-white.svg`, `app-icon.svg`
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand)
- `components/` — React primitives (below), one `@dsCard` per folder
- `ui_kits/teacher-console/`, `ui_kits/student-tutor/` — clickable screens
- `thumbnail.html`, `SKILL.md`

### Components
- **brand/** — Logo
- **core/** — Icon, Button, IconButton, Badge, Tag, Avatar, Card
- **forms/** — Input (+ Field), Textarea, Select, Checkbox, Radio, Switch
- **navigation/** — Tabs
- **feedback/** — Dialog, Toast, Tooltip
- **orbit/** — StudentTile, RuleCard, ChatMessage, ActionRequest

### Intentional additions
- **Logo** — the chosen brand mark as a component (wordmark + mark).
- **Icon** — wrapper for Lucide glyphs so every component shares one icon path.
- **StudentTile, RuleCard, ChatMessage, ActionRequest** — product-specific primitives for Orbit's core loops (monitor, configure, converse, approve).

## Caveats
- Fonts are Google Fonts loaded via `@import` (Hanken Grotesk, Newsreader, IBM Plex Mono); no brand font files exist yet.
