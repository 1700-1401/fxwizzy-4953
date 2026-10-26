# Fxwizzy — Your Trading Edge

Responsive forex and gold chart-analysis website built on the managed Runable Bun / Vite / React / Hono template.

## Features
- Upload up to four PNG, JPEG or WebP chart screenshots from a gallery, drag-and-drop, or browser screen capture (where supported).
- Real vision analysis via AI Gateway (`openai/gpt-5.4-mini`), with market structure, liquidity, candle behavior, supplied timeframe context, and one conditional scenario or an explicit WAIT decision.
- Entry, stop and up to three targets with calculated risk-to-reward. Numeric setup geometry is checked server-side.
- Chart-context mentor follow-ups, browser-local journal (up to 20 entries), text export, risk preferences and a trading playbook.
- USD-account, USD-quoted position-size calculator with adjustable contract units. No currency conversion, broker execution or live market feed.

## Running the source
Install Bun, run `bun install`, configure the root `.env` using `.env.template`, then `bun run dev`.
The website uses the port in `__ports.cjs` (4200). The source download intentionally excludes credentials; supply your own AI Gateway URL and API key. Keep secrets server-side in root `.env`.

## Important limitations
The initial chart and levels are illustrative, not current gold prices. Real analysis starts only after a screenshot is submitted. AI can misread charts and must not be treated as an execution instruction. Readable symbol, timeframe and price axis are required for reliable context; missing information produces questions rather than fabricated levels.

All saved history lives in local browser storage, not a shared database. Uploaded screenshots are sent to the AI gateway after the user clicks Analyze. Screen capture requires browser permission and may be unavailable on mobile devices or restricted embeds; gallery upload is the fallback. Position sizing excludes fees, spreads, slippage and non-USD quote conversion.

No signal guarantees profit. Leveraged forex and gold trading can cause substantial loss. This application provides educational analysis, not financial advice.

## Project structure
Frontend: `packages/web/src/web/`. API features: `packages/web/src/api/routes/analysis.ts`. Query hooks use the template’s typed oRPC client. Design tokens and layout direction are documented in `design.md`. Supplied brand assets and self-hosted fonts are in `packages/web/public/`.

The Expo and Electron packages are template scaffolds, not separately implemented deliverables. Web is the built platform.

## Template commands

The root package commands are the external contract:

- `bun run dev` starts the web app.
- `bun run dev:desktop` and `bun run dev:mobile` start platform clients.
- `bun run build` builds every package.
- `bun run start` starts or restarts the production server.
- `bun run stop` stops the production server.
- `bun run lint` and `bun run typecheck` validate the project.
- The `db:generate`, `db:migrate`, and `db:push` commands manage the database.

Deployment tools depend on these command names. Their implementations may change, but the names must remain stable.

The web package owns the API, database, and shared web interface. The mobile package is an Expo client. The desktop package is an Electron shell around the web app. Services use the fixed ports defined in `__ports.cjs`, and the web health endpoint is `/api/health`.

Secrets belong in the root `.env` file. Browser values must use the `VITE_` prefix. Commands prefixed with `internal:` are for template maintenance.
