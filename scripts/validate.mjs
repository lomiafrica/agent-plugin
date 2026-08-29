#!/usr/bin/env node
/**
 * Validates apps/agent-plugin manifests and skill layout (no network).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";

const PLUGIN_NAME_PATTERN = /^(?!.*(?:--|\\.\\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const SKILL_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const MCP_URL = "https://mcp.lomi.africa/mcp";
const PLUGIN_NAME = "lomi";
const SKILL_DIR = "lomi-payments";
const PRIVACY_URL = "https://lomi.africa/privacy";
const TERMS_URL = "https://lomi.africa/terms";
const errors = [];

const readJson = (rel) => {
  const path = join(root, rel);
  if (!existsSync(path)) {
    errors.push(`Missing file: ${rel}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    errors.push(`${rel}: invalid JSON, ${e.message}`);
    return null;
  }
};

const plugin = readJson("plugin.json");
if (plugin) {
  if (plugin.$schema !== PLUGIN_SCHEMA) {
    errors.push(`plugin.json: $schema must be ${PLUGIN_SCHEMA}`);
  }
  if (!plugin.name || typeof plugin.name !== "string") {
    errors.push("plugin.json: name is required");
  } else if (plugin.name.length > 64 || !PLUGIN_NAME_PATTERN.test(plugin.name)) {
    errors.push(`plugin.json: invalid name "${plugin.name}"`);
  } else if (plugin.name !== PLUGIN_NAME) {
    errors.push(`plugin.json: name must be "${PLUGIN_NAME}"`);
  }
}

const mcp = readJson("mcp.json");
if (mcp) {
  if (mcp.$schema !== MCP_SCHEMA) {
    errors.push(`mcp.json: $schema must be ${MCP_SCHEMA}`);
  }
  const servers = mcp.mcpServers;
  if (!servers || typeof servers !== "object") {
    errors.push("mcp.json: mcpServers object is required");
  } else {
    const lomi = servers.lomi;
    if (!lomi) {
      errors.push("mcp.json: mcpServers.lomi is required");
    } else {
      if (lomi.type !== "streamable-http") {
        errors.push("mcp.json: lomi.type must be streamable-http");
      }
      if (lomi.url !== MCP_URL) {
        errors.push(`mcp.json: lomi.url must be ${MCP_URL}`);
      }
    }
  }
}

const cursorManifest = readJson(".cursor-plugin/plugin.json");
if (cursorManifest) {
  if (!cursorManifest.name) {
    errors.push(".cursor-plugin/plugin.json: name is required");
  }
  if (plugin && cursorManifest.name !== plugin.name) {
    errors.push(".cursor-plugin/plugin.json: name must match plugin.json");
  }
  const logoPath = join(root, cursorManifest.logo ?? "");
  if (!cursorManifest.logo || !existsSync(logoPath)) {
    errors.push(".cursor-plugin/plugin.json: logo file missing or not set");
  }
}

const codexManifest = readJson(".codex-plugin/plugin.json");
if (codexManifest) {
  if (!codexManifest.name) {
    errors.push(".codex-plugin/plugin.json: name is required");
  }
  if (plugin && codexManifest.name !== plugin.name) {
    errors.push(".codex-plugin/plugin.json: name must match plugin.json");
  }
  if (codexManifest.mcpServers !== "./.mcp.json") {
    errors.push('.codex-plugin/plugin.json: mcpServers must be "./.mcp.json"');
  }
  if (codexManifest.skills !== "./skills/") {
    errors.push('.codex-plugin/plugin.json: skills must be "./skills/"');
  }
  const iface = codexManifest.interface;
  if (!iface || typeof iface !== "object") {
    errors.push(".codex-plugin/plugin.json: interface is required");
  } else {
    if (iface.privacyPolicyURL !== PRIVACY_URL) {
      errors.push(
        `.codex-plugin/plugin.json: interface.privacyPolicyURL must be ${PRIVACY_URL}`,
      );
    }
    if (iface.termsOfServiceURL !== TERMS_URL) {
      errors.push(
        `.codex-plugin/plugin.json: interface.termsOfServiceURL must be ${TERMS_URL}`,
      );
    }
    if (iface.brandColor !== "#1A5FD4") {
      errors.push('.codex-plugin/plugin.json: interface.brandColor must be "#1A5FD4"');
    }
    if (!Array.isArray(iface.defaultPrompt) || iface.defaultPrompt.length < 3) {
      errors.push(
        ".codex-plugin/plugin.json: interface.defaultPrompt needs at least 3 prompts",
      );
    }
  }
} else {
  errors.push("Missing file: .codex-plugin/plugin.json");
}

const codexMcp = readJson(".mcp.json");
if (codexMcp) {
  const servers = codexMcp.mcpServers ?? codexMcp.mcp_servers ?? codexMcp;
  const lomi = servers?.lomi;
  if (!lomi?.url) {
    errors.push(".mcp.json: lomi.url is required");
  } else if (lomi.url !== MCP_URL) {
    errors.push(`.mcp.json: lomi.url must be ${MCP_URL}`);
  }
  if (lomi && lomi.oauth_resource !== MCP_URL) {
    errors.push(`.mcp.json: lomi.oauth_resource must be ${MCP_URL}`);
  }
} else {
  errors.push("Missing file: .mcp.json");
}

const marketplace = readJson(".agents/plugins/marketplace.json");
if (marketplace) {
  if (marketplace.name !== PLUGIN_NAME) {
    errors.push(`.agents/plugins/marketplace.json: name must be "${PLUGIN_NAME}"`);
  }
  const entry = marketplace.plugins?.find((p) => p.name === PLUGIN_NAME);
  if (!entry) {
    errors.push(
      `.agents/plugins/marketplace.json: plugins[] must include ${PLUGIN_NAME}`,
    );
  } else if (entry.source?.path !== `./plugins/${PLUGIN_NAME}`) {
    errors.push(
      `.agents/plugins/marketplace.json: ${PLUGIN_NAME} source.path must be "./plugins/${PLUGIN_NAME}"`,
    );
  }
  const pluginRoot = join(root, `plugins/${PLUGIN_NAME}`);
  if (!existsSync(pluginRoot)) {
    errors.push(
      `plugins/${PLUGIN_NAME} is missing (directory or symlink to plugin root)`,
    );
  } else if (!existsSync(join(pluginRoot, ".codex-plugin/plugin.json"))) {
    errors.push(`plugins/${PLUGIN_NAME}/.codex-plugin/plugin.json is missing`);
  }
} else {
  errors.push("Missing file: .agents/plugins/marketplace.json");
}

const skillDir = `skills/${SKILL_DIR}`;
const skillPath = join(root, skillDir, "SKILL.md");
if (!existsSync(skillPath)) {
  errors.push(`${skillDir}/SKILL.md is missing`);
} else {
  const body = readFileSync(skillPath, "utf8");
  const match = body.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    errors.push("SKILL.md: missing YAML frontmatter");
  } else {
    const nameLine = match[1].match(/^name:\s*(.+)$/m);
    const descLine = match[1].match(/^description:\s*(.+)$/m);
    const skillName = nameLine?.[1]?.trim();
    if (!skillName) {
      errors.push("SKILL.md: frontmatter name is required");
    } else if (skillName !== SKILL_DIR || !SKILL_NAME_PATTERN.test(skillName)) {
      errors.push(`SKILL.md: invalid name "${skillName}"`);
    }
    if (!descLine?.[1]?.trim()) {
      errors.push("SKILL.md: frontmatter description is required");
    }
    if (skillName && skillName !== SKILL_DIR) {
      errors.push(`SKILL.md: name must match directory ${SKILL_DIR}`);
    }
    if (!body.includes("lomi_checkout")) {
      errors.push("SKILL.md: must document lomi_checkout");
    }
    if (!body.includes("lomi_webhooks")) {
      errors.push("SKILL.md: must document lomi_webhooks");
    }
    if (!body.includes("lomi_transactions")) {
      errors.push("SKILL.md: must document lomi_transactions");
    }
    if (!body.includes("lomi_register_agent")) {
      errors.push("SKILL.md: must document lomi_register_agent");
    }
    if (!body.includes("Failure modes")) {
      errors.push("SKILL.md: must include Failure modes");
    }
  }
}

const readmePath = join(root, "README.md");
if (!existsSync(readmePath)) {
  errors.push("README.md is missing");
} else {
  const readme = readFileSync(readmePath, "utf8");
  for (const needle of ["OpenCode", "Claude", "PUBLISH.md", "Agent Plugins 1.0"]) {
    if (!readme.includes(needle)) {
      errors.push(`README.md: must mention ${needle}`);
    }
  }
}

const publishPath = join(root, "PUBLISH.md");
if (!existsSync(publishPath)) {
  errors.push("PUBLISH.md is missing");
} else {
  const publish = readFileSync(publishPath, "utf8");
  if (!publish.includes("cursor.com/marketplace/publish")) {
    errors.push("PUBLISH.md: must include Cursor Marketplace submit URL");
  }
  if (!publish.includes("Do not claim")) {
    errors.push("PUBLISH.md: must warn not to claim listings early");
  }
}

if (errors.length > 0) {
  console.error("agent-plugin validation failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("agent-plugin: OK");
