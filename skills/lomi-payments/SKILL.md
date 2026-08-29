---
name: lomi-payments
description: Collect money with lomi. hosted checkout, send the customer the URL, and confirm via webhooks before fulfilling. Use when the user needs a checkout session, payment link, or webhook confirmation on lomi.africa.
compatibility: Requires lomi. MCP (hosted https://mcp.lomi.africa/mcp or equivalent). Network access to the lomi. API.
---

# lomi. payments

Payment infrastructure for francophone West Africa: hosted checkout, Mobile Money, cards, payouts, subscriptions, and developer APIs across UEMOA.

## When to use

- Collect a one-off payment in XOF, USD, or EUR.
- Send a customer to hosted checkout instead of building a payment form.
- Confirm Mobile Money asynchronously with webhooks and `lomi_transactions action=get`.

## Do not use when

- You only need a generic global card gateway outside UEMOA.
- You would inject a live secret (`lomi_sk_live_*`) into a chat, docs page, or client bundle.

## Prerequisites

1. Connect lomi. MCP at `https://mcp.lomi.africa/mcp` (OAuth **Connect with lomi.**, or `x-lomi-api-key` / `LOMI_SECRET_KEY`). Guest bootstrap: `https://mcp.lomi.africa/mcp/guest`.
2. If tools are missing, call `lomi_search_tools` with keywords like `checkout`, `webhook`, `transaction`.
3. Sandbox keys (`lomi_sk_test_*`) only work against sandbox. Live keys only against live.

## Happy path

1. **Create checkout** — `lomi_checkout` with `action=create`, `amount`, `currency_code`, `success_url`, and `cancel_url`. Amounts in XOF are integer centimes.
2. Persist `id` and `checkout_url`. Return `checkout_url` to the human. Do not treat the create response as paid.
3. **Register a webhook** — `lomi_webhooks` with `action=create`. Persist the signing secret. Verify `X-Lomi-Signature` on your server.
4. After the webhook, confirm with `lomi_transactions` `action=get` before fulfilling.
5. Send `Idempotency-Key` on money-moving writes.

## Guest bootstrap (no merchant key)

1. Connect `https://mcp.lomi.africa/mcp/guest` with no headers.
2. Call `lomi_register_agent` (the session adopts a sandbox `lomi_prov_*` key).
3. `lomi_provision` `action=create_account`. Live money still needs `lomi_provision` `action=request_live` and human approval at https://dashboard.lomi.africa/connect/go-live.

## Fields to save

| Field | When |
| --- | --- |
| `checkout_url` | Always, after create |
| checkout `id` | Follow-up get / expire |
| webhook signing secret | After `lomi_webhooks` create |
| transaction `id` | After webhook, before fulfill |

## Failure modes

- **Create succeeded, no payment yet** — hosted checkout and Mobile Money are async. Wait for the webhook, then `lomi_transactions action=get`.
- **401** — missing or wrong-environment key. Do not paste live secrets into chat.
- **Webhook signature mismatch** — verify the raw body against `X-Lomi-Signature`. Local relay: `lomi listen`.

## Reference

- MCP overview: https://docs.lomi.africa/build/mcp
- Checkout task: https://docs.lomi.africa/build/accept/checkout
- Agent briefing: https://lomi.africa/llms.txt
- Hosted MCP: https://mcp.lomi.africa/mcp
