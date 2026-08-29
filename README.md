# lomi. Agent Plugin

Portable [Agent Plugins 1.0](https://agent-plugins.org) package: **Agent Skill** + **hosted MCP** for merchant checkout and webhooks.

- **MCP:** `https://mcp.lomi.africa/mcp`
- **Guest:** `https://mcp.lomi.africa/mcp/guest`
- **Docs:** [docs.lomi.africa/build/mcp](https://docs.lomi.africa/build/mcp)
- **Briefing:** [lomi.africa/llms.txt](https://lomi.africa/llms.txt)

This is marketplace packaging only. Payment logic lives on the hosted MCP. You can connect with the MCP URL alone; you do not need this plugin.

## What it does

Connects agent clients to lomi. so they can create a hosted checkout, send the customer the URL, register a webhook, and confirm the transaction before fulfilling. See `skills/lomi-payments/SKILL.md`.

## Install

### Cursor

Load this directory as a plugin, or MCP-only:

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

### Codex

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
codex mcp login lomi
```

### Agent Plugins 1.0

Use this folder as an Agent Plugin (`plugin.json` + `mcp.json` + `skills/`).

## Quick start for agents

1. Connect MCP at `/mcp` (OAuth in the browser, or a `lomi_sk_*` key). Guest bootstrap: `/mcp/guest`.
2. `lomi_checkout` with `action=create` → persist `id` and `checkout_url`.
3. Send the human `checkout_url`. Do not treat create as paid.
4. `lomi_webhooks` with `action=create` and persist the signing secret.
5. After the webhook, `lomi_transactions` with `action=get` before fulfilling.

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

## Validate

From the monorepo root:

```bash
pnpm plugin:validate
```

## Monorepo

This directory is the public submodule [`lomiafrica/agent-plugin`](https://github.com/lomiafrica/agent-plugin) at `apps/agent-plugin`.

## License

MIT — see [LICENSE](./LICENSE).
