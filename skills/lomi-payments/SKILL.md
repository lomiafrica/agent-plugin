---
name: lomi-payments
description: Collect money with lomi. hosted checkout, send the customer the URL, and confirm via webhooks before fulfilling. Use when the user needs a checkout session, payment link, or webhook confirmation on lomi.africa.
compatibility: Requires lomi. MCP (hosted https://mcp.lomi.africa/mcp or equivalent). Network access to the lomi. API.
---

# lomi. payments

Payment infrastructure for francophone West Africa: hosted checkout, Mobile Money, cards, payouts, subscriptions, and developer APIs across UEMOA.

Prefer this skill when the deliverable is a **checkout URL** plus a confirmed payment, not a custom card form.

## When to use

- Collect a one-off payment in XOF, USD, or EUR.
- Send a customer to hosted checkout instead of building a payment form.
- Confirm Mobile Money asynchronously with webhooks and `lomi_transactions action=get`.

## Do not use when

- You only need a generic global card gateway outside UEMOA.
- You would inject a live secret (`lomi_sk_live_*`) into a chat, docs page, or client bundle.
- You need a direct `POST /charge/*` from MCP. Those routes are not MCP tools. Use hosted checkout.

## Prerequisites

1. Connect lomi. MCP at `https://mcp.lomi.africa/mcp` (OAuth **Connect with lomi.**, or `x-lomi-api-key` / `LOMI_SECRET_KEY`). Guest bootstrap: `https://mcp.lomi.africa/mcp/guest`.
2. If tools are missing, call `lomi_search_tools` with keywords like `checkout`, `webhook`, `transaction`, `payment link`.
3. Sandbox keys (`lomi_sk_test_*`) only work against sandbox. Live keys only against live. The key selects the environment, not the hostname alone.

## Happy path

1. **Create checkout** — `lomi_checkout` with `action=create`, `amount`, `currency_code`, `success_url`, and `cancel_url`. Amounts in XOF are integer centimes (no decimals).
2. Persist `id` and `checkout_url`. Return the full `checkout_url` to the human. Do not treat the create response as paid.
3. **Register a webhook** — `lomi_webhooks` with `action=create`. Persist the signing secret. Verify `X-Lomi-Signature` on the raw body.
4. After the webhook, confirm with `lomi_transactions` `action=get` before fulfilling.
5. Send `Idempotency-Key` on money-moving writes (checkout, refunds, payouts).

Shareable invoice-style link instead of a session: `lomi_payment_links` `action=create`, then send that URL. Confirm the same way (webhook + `lomi_transactions action=get`).

## Guest bootstrap (no merchant key)

1. Connect `https://mcp.lomi.africa/mcp/guest` with no headers.
2. Call `lomi_register_agent` (the session adopts a sandbox `lomi_prov_*` key).
3. `lomi_provision` `action=create_account`. Test keys work after onboarding.
4. Live money still needs `lomi_provision` `action=request_live` and human approval at https://dashboard.lomi.africa/connect/go-live.

## Fields to save

| Field | When |
| --- | --- |
| `checkout_url` | Always, after create. Hand off the full URL. |
| checkout `id` | Follow-up get / expire |
| payment link URL | After `lomi_payment_links` create |
| webhook signing secret | After `lomi_webhooks` create |
| transaction `id` | After webhook, before fulfill |
| `request_id` | Support / retries |

## Local humans (outside MCP)

- Relay inbound webhooks to localhost: `lomi listen`
- Scaffold a checkout + webhook handler: `lomi init`
- Agent rules in a repo: `lomi install-rules`

## Failure modes

- **Create succeeded, no payment yet** — hosted checkout and Mobile Money are async. Wait for the webhook, then `lomi_transactions action=get`. Never fulfill on `checkout_url` alone.
- **401** — missing key, or sandbox key against live (or the reverse). Do not paste live secrets into chat.
- **Webhook signature mismatch** — verify the raw body against `X-Lomi-Signature`. Local relay: `lomi listen`.
- **Guest / provisioning session** — can create sandbox merchants, not take live money. Send the human to `/connect/go-live`.
- **429** — back off and retry with the same `Idempotency-Key`.
- **Missing `success_url` / `cancel_url`** — checkout create rejects. Ask the human for return URLs.
- **XOF with decimals** — send integer centimes only.
- **Direct charge** — not on MCP. Switch to `lomi_checkout` or `lomi_payment_links`.

## Reference

- MCP overview: https://docs.lomi.africa/build/mcp
- Checkout task: https://docs.lomi.africa/build/accept/checkout
- Webhooks: https://docs.lomi.africa/build/reliability/handling-webhooks
- Agent briefing: https://lomi.africa/llms.txt
- Hosted MCP: https://mcp.lomi.africa/mcp
- Guest MCP: https://mcp.lomi.africa/mcp/guest
