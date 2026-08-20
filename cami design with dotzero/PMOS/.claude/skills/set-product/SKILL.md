---
name: set-product
description: 'Switch which assigned product your synced outputs route to. Lists your products from the companion app and sets the active one. Use when: set product, switch product, change active product, which product, route outputs.'
allowed-tools: "Bash, Read"
disable-model-invocation: true
category: cc
---

# Set Product

Switch which of your assigned products synced outputs route to. If you're a PM with
more than one product in the companion app, this picks the **active** one — every
artifact you sync after running this lands under that product.

This skill is user-invoked only (`/set-product` or `/set-product <name>`). It does not
run on its own — switching the active product is a stateful change, so you drive it.

## When to Use This Skill

- You work across multiple products and want new outputs to land under a different one
- You're not sure which product is currently active
- You just started a work session on a different product than last time

## Process

Run every `curl` **silently** via Bash — do not paste the raw command or HTTP response
into the chat. Parse the result and report only what the user needs.

### Step 1: Load companion credentials

Before any API call, get `COMPANION_API_KEY` and `COMPANION_API_URL` into the shell
environment. Prefer the companion CLI's per-project credentials file; fall back to a
project-root `.env`. Run silently:

```bash
# Resolve the per-project credentials file.
# One match -> use it. Multiple -> newest mtime (the dirs are named by an opaque
# <projectHash>, so there is no reliable way to match the current project by name —
# see the mysecond print-env follow-up issue).
CRED=$(ls -t ~/.mysecond/projects/*/credentials 2>/dev/null | head -1)
# Note: use ';' not '&&' so 'set +a' always runs even if 'source' exits non-zero —
# otherwise auto-export leaks into the rest of the session.
[ -n "$CRED" ] && { set -a; source "$CRED"; set +a; }
# Fall back to .env in the project root.
[ -z "$COMPANION_API_KEY" ] && [ -f .env ] && { set -a; source .env; set +a; }
# Machine-wide fallback: `~/.mysecond/credentials`, written by the `/mysecond`
# login skill (new install flow — no `mysecond init` step exists there).
# Same bare-token-or-VAR=value handling as the per-project file.
if [ -z "$COMPANION_API_KEY" ] && [ -f ~/.mysecond/credentials ]; then
  if grep -qE '^[A-Z_][A-Z0-9_]*=' ~/.mysecond/credentials 2>/dev/null; then
    set -a; source ~/.mysecond/credentials; set +a
  else
    COMPANION_API_KEY=$(head -1 ~/.mysecond/credentials | tr -d '[:space:]')
    export COMPANION_API_KEY
  fi
fi
```

If `COMPANION_API_KEY` is still empty after this, the companion CLI isn't initialized
for this project. Tell the user plainly **and give them the recovery step** — stop
after this, don't guess a key:

> This workspace isn't connected to mySecond yet. Run `/mysecond` to connect
> (or `mysecond init` in this folder if you use the CLI setup), then try
> `/set-product` again.

### Step 2: List your assigned products

Capture both the body and the HTTP status so you can detect a failed request:

```bash
RESP=$(curl -s -w '\n%{http_code}' \
  "${COMPANION_API_URL:-https://app.mysecond.ai}/api/companion/products" \
  -H "Authorization: Bearer ${COMPANION_API_KEY}")
STATUS=$(printf '%s' "$RESP" | tail -n1)
BODY=$(printf '%s' "$RESP" | sed '$d')
```

If `STATUS` is not `200` (e.g. `401` bad key, `500`, or an empty/garbage body),
**stop** and surface the problem — for a `401`, tell the user their companion
credentials look invalid or expired and to run `/mysecond` to reconnect (or
`mysecond init` if they use the CLI setup). Do not try to
parse `.products` from a failed response.

On `200`, the body is an **object** with a `products` key (not a bare array):

```json
{ "products": [ { "product_id": "...", "slug": "...", "name": "..." } ] }
```

Read `.products` from `BODY`. Each product's id field is **`product_id`** — that exact
value is what Step 4 sends. Do not use any other key.

Always fetch the current selection too — you need it to mark the list (no-argument
case) and to show "switched from X" in the Step 6 confirmation:

```bash
curl -s "${COMPANION_API_URL:-https://app.mysecond.ai}/api/companion/active-product" \
  -H "Authorization: Bearer ${COMPANION_API_KEY}"
```

This returns `{ "active_product_id": "...", ... }`. Keep the `active_product_id` and
the name of the product it points to. Render the matching list entry with a
`(current)` marker, e.g. `2. Callie (current)`. If this GET fails, just omit the
marker and the "switched from" text — both are non-fatal niceties.

### Step 3: Resolve which product

- **No products:** if `.products` is empty, tell the user they have no assigned
  products in the companion app and stop.
- **One product:** don't show a one-item list or say "nothing to switch" — that
  leaves the "which product am I on?" question unanswered. Instead confirm it
  directly: *"Your only assigned product is **Callie**, and it's already active.
  Outputs route there."* Then stop.
- **User named a product** (`/set-product callie`): match the name case-insensitively
  against each product's `name` **or** `slug`. On a unique match, proceed to Step 4.
  - On **no match**, show the numbered list prefixed with the reason:
    *"No product matched 'calie'. Pick from your assigned products:"*
  - On an **ambiguous match** (the term matches more than one), show only the
    matching products, prefixed: *"Multiple products match 'acme' — pick one:"*
- **User named nothing** (`/set-product`): show the numbered list (with the `(current)`
  marker from Step 2) and ask which product to activate.

### Step 4: Set the active product

Set `PRODUCT_ID` to the chosen product's `product_id` (the exact value from Step 2's
list — never send the literal placeholder), then POST it and split status from body:

```bash
PRODUCT_ID="<paste the chosen product_id here>"
RESP=$(curl -s -w '\n%{http_code}' -X POST \
  "${COMPANION_API_URL:-https://app.mysecond.ai}/api/companion/active-product" \
  -H "Authorization: Bearer ${COMPANION_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\":\"${PRODUCT_ID}\"}")
STATUS=$(printf '%s' "$RESP" | tail -n1)
BODY=$(printf '%s' "$RESP" | sed '$d')
```

Check `STATUS`. On **403** (product not assigned or archived) or any other non-2xx
response, surface the error message from `BODY` to the user and stop — do **not**
continue to Step 5 or claim success.

### Step 5: Reload context

On a successful POST, reload the companion context so the new routing takes effect.
Capture the exit code — a failed sync is not fatal but the user must know:

```bash
bash -lc 'mysecond sync --silent'; echo "sync_exit=$?"
```

If `sync_exit` is non-zero, the product switch still committed server-side, but local
context didn't reload. Note this in the Step 6 confirmation rather than hiding it.

### Step 6: Confirm

Confirm the switch so the user can verify it — name what they switched **from** (the
`active_product_id` product from Step 2) and **to**, and describe the effect in
concrete terms:

> Switched from **Callie** to **Acme Billing**. Outputs you sync from now on will
> appear under **Acme Billing** in the companion app.

If Step 2's active-product fetch failed, drop the "from" clause. If the Step 5 sync
exited non-zero, append:

> ⚠️ Local context didn't reload — re-run `mysecond sync` so your local outputs
> reflect the new routing.
