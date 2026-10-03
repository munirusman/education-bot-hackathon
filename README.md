# Classroom Harness (Orbit)

A private, sandboxed AI tutor per student, branded and styled with the Orbit design system. Teachers set the rules, watch every session live, and can step in.
Built on Next.js (App Router), assistant-ui, and the AI SDK harness packages (experimental, pinned).

## Run it

```bash
npm install
npm run dev            # http://localhost:3000, then /teacher or /student
npm test               # 24 tests
npm run tutor -- hint-only "just give me the answer"   # runtime from the terminal, no UI
```

Everything works with no API keys: the default `local` adapter is a scripted guided-help tutor in a private
directory sandbox. Open `/teacher` (Ms. Rivera) and `/student` (Ava) in two tabs to see the live mirror,
approvals, notes, pause, override and reset.

## Layout

| Path | What |
|---|---|
| `src/lib/contracts` | The five shared contracts: policy schema, `EnvironmentService`, event schema, realtime topics, teacher REST API |
| `src/lib/runtime` | `EnvironmentServiceImpl`, policy to harness compiler (`compile.ts`), drivers (`local-driver.ts`, `harness-driver.ts`) |
| `src/lib/db` | PGlite schema (all tables in the plan, plus `flags` and `approvals`) and typed repository |
| `src/lib/platform` | Effective-policy resolution, fixed safety layer, classifier, approval broker, realtime bus, encryption, dashboard queries |
| `src/lib/projection.ts` | Events to AI SDK UI messages: one function feeds the student stream, history, and teacher replay |
| `src/app/api` | `/api/chat` (student turn), `/api/teacher/**` (actions, SSE mirrors, files, policy) |
| `src/components` | assistant-ui Thread, Generative UI for tool calls, teacher dashboard, policy editor, intervention panel |

## Design (Orbit)

The UI follows `Orbit Design System/` (read its `readme.md` before changing the UI).

- Tokens are copied into `src/styles/orbit-tokens.css` and exposed to Tailwind in `src/app/globals.css` (`bg-plum-600`, `text-fg-2`, `rounded-md`, `type-h3`, …). Change a token there, not in components.
- The Orbit components are ported to TypeScript in `src/components/orbit/` (`core`, `forms`, `feedback`, `product`). Fonts are self-hosted via `next/font` and icons come from `lucide-react` (the same Lucide set the system specifies, without the CDN).
- Layout follows the UI kits: teacher console with a 248px sidebar, a live classroom grid and a 420px session panel; a student tutor with a files sidebar and a 720px chat column.
- Sun yellow is reserved for the teacher, and the state hues (working, stuck, approval, paused) are used only for session state.

## How the plan's rules are enforced

- **Policy on the next turn, loaded server-side.** `/api/chat` resolves class policy + per-student override + assessment window on the server for every turn; the browser sends only the environment id and the question. `compileTurn` turns it into instructions, a pedagogy skill, active tools, approval gates and a permission mode.
- **Fixed safety layer first.** Teacher guidance is appended after it (`compile.ts`), so it can narrow but not loosen.
- **Isolation.** One sandbox per (student, class), id derived as `env-<id>`. Every student route re-checks ownership and enrolment; sandbox paths are confined to the environment's root.
- **Resume state** is sealed with AES-256-GCM before it reaches Postgres and is never sent to a browser.
- **Approvals fail closed:** no approver, timeout (10 min) or abort means deny.
- **Audit:** every teacher action and sandbox file read is written to `teacher_actions`; drill-in views are logged (once a minute per teacher).

## Known gaps (read before a real classroom)

- **No auth.** Identity comes from the route: `/teacher` is the demo teacher, `/student` the demo student, with no cookie or login (per the MVP scope). Only one demo student is reachable from the UI. Route-level role and ownership checks are real, so adding auth means replacing `requireUser()`. Do not put real student data behind it.
- **The `claude-code` harness driver is not exercised by tests.** It type-checks against the real `@ai-sdk/harness` types but has never run against a live sandbox here. Per-turn behaviour (approval continuation, file-change detection, sandbox read-back) needs a live check.
- **Freestyle sandboxes are not wired.** No Freestyle adapter exists in the installed packages; the harness driver uses the Vercel network sandbox adapter with `networkPolicy: "deny-all"`.
- **Local mode simulates code execution** rather than running student code on the host.
- **The classifier is heuristic** (regex + word overlap, no model call). It will miss things and false-positive; wellbeing flags page the dashboard, but nothing yet notifies a teacher outside the app.
- **Realtime is in-process.** SSE fan-out works for a single server process; multi-instance needs a Redis/Ably `RealtimeBus`. Same for the approval waiter map.
- Retention jobs, roster import, teacher-defined host tools, and the idle reaper's scheduler (only the `/api/admin/reap` endpoint exists) are not built.
- UI components were type-checked and the pages/APIs exercised over HTTP, but not clicked through in a browser.
