# Publishing checklist (lomi. Agent Plugin)

Use this when you are ready to list the plugin publicly. **Nothing in this file triggers submission** — it is operator documentation only. Do not claim a marketplace listing in docs until that listing is approved.

## Before any marketplace

- [ ] **Public GitHub repo:** [`lomiafrica/agent-plugin`](https://github.com/lomiafrica/agent-plugin) (submodule of the lomi. monorepo).
- [ ] Confirm `repository` in [`plugin.json`](./plugin.json) and [`.cursor-plugin/plugin.json`](./.cursor-plugin/plugin.json) matches that URL.
- [ ] Run `node apps/agent-plugin/scripts/validate.mjs` from the monorepo root.
- [ ] Confirm hosted MCP is healthy: `https://mcp.lomi.africa/health`
- [ ] Privacy policy URL live: `https://lomi.africa/privacy`
- [ ] Terms URL live: `https://lomi.africa/terms`
- [ ] MCP user docs: `https://docs.lomi.africa/build/mcp`

## Cursor Marketplace

1. Repo must be **public** on GitHub.
2. Plugin layout: this directory with valid `.cursor-plugin/plugin.json` + Agent Plugins files.
3. Submit: [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)
4. Manual review by Cursor — allow lead time.
5. Optional community listing (no official review): [cursor.directory/plugins/new](https://cursor.directory/plugins/new)

**Template reference:** [cursor/plugin-template](https://github.com/cursor/plugin-template)

## Agent Plugins clients (ChatGPT, Copilot, VS Code, Kiro)

1. Ship this folder (or repo root) conforming to [Agent Plugins 1.0](https://agent-plugins.org/specification).
2. No separate OpenAI/GitHub/Microsoft submit URL in this checklist — distribution is per product (built-in plugin import, team marketplaces, etc.).
3. Keep `mcp.json` on **streamable-http** for hosted `https://mcp.lomi.africa/mcp`.

## Codex marketplace (Agent Plugin bundle)

1. Confirm [`.codex-plugin/plugin.json`](./.codex-plugin/plugin.json), [`.mcp.json`](./.mcp.json), and [`.agents/plugins/marketplace.json`](./.agents/plugins/marketplace.json) are present.
2. Public install path:

```bash
codex plugin marketplace add lomiafrica/agent-plugin
codex plugin add lomi@lomi
```

3. Smoke locally before pushing the submodule:

```bash
codex plugin marketplace add /absolute/path/to/apps/agent-plugin
codex plugin list
codex plugin add lomi@lomi
```

4. OAuth should prompt on install (`authentication: ON_INSTALL`). Checkout + webhook confirm stays in `lomi-payments`. Guest bootstrap stays `lomi_register_agent` on `/mcp/guest`.

## OpenCode

Official OpenCode marketplace is not shipped yet. Ship via docs + CLI:

```bash
opencode mcp add lomi --url https://mcp.lomi.africa/mcp
opencode mcp auth lomi
```

Optional community listing (independent of OpenCode): [opencode-plugin-marketplace](https://github.com/Tommertom/opencode-plugin-marketplace) — add `plugins/lomi.plugin.json` via PR.

## Claude Connectors Directory

OAuth consent is live when `LOMI_MERCHANT_OAUTH_ENABLED=true` on the API and `VITE_LOMI_MERCHANT_OAUTH_ENABLED=true` in the dashboard. Users can add `https://mcp.lomi.africa/mcp` with no headers and complete **Connect with lomi.**

Directory listing still needs Anthropic review materials:

- Secure OAuth, tool annotations, privacy policy, public docs, and **test credentials** for review.

1. Read [submission guidelines](https://claude.com/docs/connectors/building/submission) and [review criteria](https://claude.com/docs/connectors/building/review-criteria).
2. Submit via [Claude.ai admin directory portal](https://claude.ai/admin-settings/directory/submissions/new) (Team/Enterprise org required).
3. Note: MCP Registry / `modelcontextprotocol/servers` does **not** auto-list in Claude — directory submit is separate.

## MCP Registry / community

- [Smithery](https://smithery.ai/search?q=lomi.africa) — MCP server listing (`apps/mcp/smithery.yaml`). Independent of this plugin repo.
- [MCP Registry](https://registry.modelcontextprotocol.io) — optional discovery; independent of Claude directory.
- cursor.directory — fast community visibility.

## Post-publish

- [ ] Add marketplace badge/links on `docs.lomi.africa/build/mcp` only **after** approval (do not claim listings early).
- [ ] Monitor MCP rate limits and `lomi_register_agent` abuse after increased traffic.
- [ ] Claude Connectors Directory: submit when Team/Enterprise admin + review pack are ready (OAuth already live when the flag is on).

## Out of scope for this package

- Changing MCP tools or Railway deploy
- Bundling stdio / `npx @lomi./mcp` in the marketplace plugin (hosted HTTP only)
- Storing API keys or transport secrets in the repo
- A webhook-inbox demo app (use `lomi listen` / `lomi init` / docs)
