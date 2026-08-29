# lomi. Agent Plugin

Portable [Agent Plugins 1.0](https://agent-plugins.org) package: **Agent Skill** + **hosted MCP** for merchant checkout and webhooks.

- **MCP endpoint:** `https://mcp.lomi.africa/mcp` (full tools; OAuth **Connect with lomi.**, or `lomi_sk_*` / `x-lomi-api-key`)
- **Guest-only endpoint:** `https://mcp.lomi.africa/mcp/guest` (register / provision / search without a merchant key)
- **Docs:** [docs.lomi.africa/build/mcp](https://docs.lomi.africa/build/mcp)
- **Privacy:** [lomi.africa/privacy](https://lomi.africa/privacy)
- **Terms:** [lomi.africa/terms](https://lomi.africa/terms)

This is marketplace packaging only. Payment logic lives on the hosted MCP. You can connect with the MCP URL alone; you do not need this plugin.

## What it does

Connects compatible agent clients to lomi. so they can create a hosted checkout, send the customer the URL, register a webhook, and confirm the transaction before fulfilling. See `skills/lomi-payments/SKILL.md` for the recommended tool sequence.

## Install

### Cursor (Marketplace or local)

Install from the [Cursor Marketplace](https://cursor.com/marketplace) when listed, or load this directory as a plugin. Cursor reads both [Agent Plugins](https://agent-plugins.org) (`plugin.json`, `mcp.json`, `skills/`) and `.cursor-plugin/plugin.json`.

Manual MCP-only config (no plugin folder):

```json
{
  "mcpServers": {
    "lomi": {
      "url": "https://mcp.lomi.africa/mcp"
    }
  }
}
```

OAuth-capable clients open **Connect with lomi.** You can also paste a secret key as `x-lomi-api-key`.

### Codex (Agent Plugin marketplace)

This repo is a Codex marketplace + plugin (`/.agents/plugins/marketplace.json` + `/.codex-plugin/plugin.json` + `/.mcp.json`).

```bash
# local (monorepo submodule) or public GitHub
codex plugin marketplace add /path/to/apps/agent-plugin
# or: codex plugin marketplace add lomiafrica/agent-plugin

codex plugin add lomi@lomi
```

Complete **Connect with lomi.** when Codex prompts OAuth (`policy.authentication: ON_INSTALL`).

MCP-only (no plugin skills):

```bash
codex mcp add lomi --url https://mcp.lomi.africa/mcp
# if OAuth does not start automatically:
codex mcp login lomi
```

### Agent Plugins 1.0 (ChatGPT / Copilot / VS Code / Kiro)

Use this folder as an Agent Plugin (root `plugin.json` + `mcp.json` + `skills/`). Clients that support Agent Plugins 1.0 discover components from fixed paths.

### OpenCode

No official marketplace yet. Install the hosted MCP and complete **Connect with lomi.**:

```bash
opencode mcp add lomi --url https://mcp.lomi.africa/mcp
opencode mcp auth lomi
```

Then `opencode mcp list` should show lomi. connected.

### Claude

Use **Custom connector** with URL `https://mcp.lomi.africa/mcp` today. Official [Connectors Directory](https://claude.com/docs/connectors/directory) listing requires a separate submission. See [PUBLISH.md](./PUBLISH.md).

## Quick start for agents

1. Connect MCP at `/mcp` (OAuth in the browser, or a `lomi_sk_*` key). Guest bootstrap: `/mcp/guest`.
2. `lomi_checkout` with `action=create` → persist `id` and `checkout_url`.
3. Send the human `checkout_url`. Do not treat create as paid.
4. `lomi_webhooks` with `action=create` and persist the signing secret.
5. After the webhook, `lomi_transactions` with `action=get` before fulfilling.

Local webhook relay outside MCP: `lomi listen`. Scaffold a handler with `lomi init`.

## Package layout

| Path                               | Purpose                                      |
| ---------------------------------- | -------------------------------------------- |
| `plugin.json`                      | Agent Plugins 1.0 manifest                   |
| `mcp.json`                         | Agent Plugins streamable-http MCP            |
| `.codex-plugin/plugin.json`        | Codex plugin manifest                        |
| `.mcp.json`                        | Codex bundled MCP (URL → hosted `/mcp`)      |
| `.agents/plugins/marketplace.json` | Codex marketplace catalog (`lomi@lomi`)      |
| `plugins/lomi` → `..`              | Codex plugin path (symlink to this repo root)|
| `.cursor-plugin/plugin.json`       | Cursor Marketplace manifest                  |
| `skills/lomi-payments/`            | Agent Skill (checkout → webhook confirm)     |
| `PUBLISH.md`                       | Operator listing checklist                   |

## Validate

From the monorepo root (no npm package):

```bash
node apps/agent-plugin/scripts/validate.mjs
```

## Monorepo

This directory is the public submodule [`lomiafrica/agent-plugin`](https://github.com/lomiafrica/agent-plugin) at `apps/agent-plugin`. Marketplace submission uses this repo as-is. See [PUBLISH.md](./PUBLISH.md).

## License

MIT — see [LICENSE](./LICENSE).
