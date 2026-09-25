# ENG3-33 · T1 — Inbox Phase 0 prototype and contract proposal

| | |
| --- | --- |
| Ticket | [ENG3-33](https://linear.app/getcami/issue/ENG3-33/t1-prototype-and-the-contract-proposal) · canonical story [`T1.md`](https://github.com/getcami/cami-docs-v1/blob/main/platform-docs/features/inbox-crm-phase-0/stories/T1.md) |
| Prototype | `/messages/inbox/phase-0` in projects-cami, branch `eng3-33-t1-prototype-and-the-contract-proposal`. Every frame below is a link on that route; `/screens` lists them with notes |
| Unblocks | [FND-2](https://github.com/getcami/cami-docs-v1/blob/main/platform-docs/features/inbox-crm-phase-0/stories/FND-2.md) (contract) from §4, [FND-4](https://github.com/getcami/cami-docs-v1/blob/main/platform-docs/features/inbox-crm-phase-0/stories/FND-4.md) (`ClientSummary`) from §5 |
| Reviewers | Product — Maaz · Reception — Quinee · Backend owner — for §4 |

**How to review.** Open the prototype, click the dashed **Design repo** chip at the top
right. It switches the page state, what the next send does, English/Arabic, pets on/off
and a 1280/1366 frame, and each switch is in the URL. The seeded chats each carry one
situation (§2). Nothing is stored between reloads.

---

## 1. Decisions made in T1

| # | Decision | Why |
| --- | --- | --- |
| T1-D1 | **Supported desktop widths: 1280 and 1366, all three panes open.** List 18 rem, client pane 20 rem, the thread takes the rest; the app sidebar is collapsed (68 px) on the inbox route. Thread width ≈ 590 px at 1280, ≈ 680 px at 1366. Below 1280 is out of scope (desktop only). Height is not constrained — every pane scrolls inside itself | `IX-A1-AC1` expects three panes; the old design hid the right pane below 1280 |
| T1-D2 | **`ClientSummary` content** is §5 | FND-4 / P13 asks design to choose it here |
| T1-D3 | **One countdown, three tones.** Quiet while there is time, amber under 2 h, red under 10 min. It is shown before typing, beside when the client last wrote | `IX-A2` row 2 and "never two countdowns" |
| T1-D4 | **Closed window replaces the text field.** The reason is shown, free typing is disabled, and "Choose a template" is the only action. Anything typed before the window closed is kept on screen (copy or discard) — never sent, never lost | `IX-A4` row 4, `IX-A2` edge case |
| T1-D5 | **A template blank is filled from the record only.** If the record cannot fill it, the send is blocked and names the blank; reception cannot type a value in | `IX-A4` row 3 read literally — **Michelle to confirm** (§7) |
| T1-D6 | **Every identity change is a line in the thread** — auto-link by Cami, match, re-match (showing what it replaced), created — with who and when | INV-08 visible where the work happens; P6's Cami actor |
| T1-D7 | **Match and Add live in the right pane**; Add is a short dialog over the chat, with a link to the existing full client form | `IX-C3`, `IX-C4` row 1 and the full-intake edge case |

## 2. States covered

Links are paths on the prototype route. `?c=` picks the seeded chat.

| State | Frame | What it shows |
| --- | --- | --- |
| **Unmatched** *(feature)* | `?c=unmatched-saturday` | The number is the title, "Unmatched" on the row and header, the chat reads normally, the pane offers Match and Add only |
| **Free-text window closed** *(feature)* | `?c=sara` | Reason, no free typing, template picker, blanks filled from the record |
| **Window closes while typing** *(feature)* | `?c=maryam` | Closes ~2 min after load. Type first: the text is kept, templates are offered |
| **Send failed** *(feature)* | `?c=noura` | Reason + Retry on the same bubble; "Next send" in the Design repo bar makes a retry fail again, fail late, or come back as WhatsApp's window-closed |
| Empty | `?state=list-empty` | No chats yet |
| Loading | `?state=list-loading`, `?state=thread-loading` | Skeletons; never a spinner where content goes |
| Error | `?state=list-error`, `?state=thread-error` | Reason + retry |
| Partial | `?state=visits-error` | Thread and client name in; the visits read failed and says so with a retry. `?state=visits-slow` shows the skeleton rows |
| Permission denied — no read | `?state=no-access` | Page-level; nav entry hidden in production |
| Permission denied — no reply | `?state=read-only` | Reads normally; composer, retry, Match, Add not offered |
| Feature off (403 `FEATURE_DISABLED`) | `?state=feature-off` | Page-level; `useHasInbox()` false hides the nav |
| Long history | `?c=omar` | Six months, 40 per keyset page, place kept while older pages load, floating day chip while scrolling |
| RTL | `?lang=ar`, e.g. `?lang=ar&width=1280&c=sara` | Mirrored layout, Arabic copy, numbers stay LTR |
| Widths | `?width=1280`, `?width=1366` | Dashed outline = viewport minus the collapsed sidebar |
| Without pets | `?pets=off` | Pet rows and the first-pet field disappear |

## 3. Story coverage

"Frame" is where the row is seen. "No screen" means the row is a data rule the backend
enforces; the frame shows the result.

### `IX-A1` — read the whole conversation

| Row | Frame |
| --- | --- |
| 1 Three panels | Any chat, e.g. `/` (default Layla). Card content verified under `IX-C6` (P3) |
| 2 Grouped by day | `?c=omar`, `?c=layla` — day chips in the salon's timezone |
| 3 One chat per number | No screen — `uq_inbox_conversation_connection_phone`. The list has one row per number |
| 4 Which of us sent it, by name | `/` — "Aisha · 10:30" in the bubble (verified under `IX-A2`, P4) |
| 5 "Answered on phone" | `?c=omar` — seeded phone-app echo. **Deferred to Phase 1 (P14)**, built |
| Edge: two people, one number | `?c=huda` — one chat; person chosen at booking (`IX-F1`, S1) |
| Edge: no client | `?c=unmatched-saturday` |
| Edge: 6-month history | `?c=omar` (P11 seed shape: `history_import`, no staff name) |

### `IX-A2` — reply, knowing if free text is allowed

| Row | Frame |
| --- | --- |
| 1 Ctrl/⌘+Enter sends | `/` — type, Ctrl+Enter: Sending → Sent |
| 2 Open, with a countdown, before typing | `/` — above the field, beside "Client last wrote …" |
| 3 Closed → templates only | `?c=sara` (verified under `IX-A4`, P2) |
| 4 First reply recorded | No screen — `first_reply_at` (§4.6, **new**) |
| Edge: window closes while typing | `?c=maryam` (verified under `IX-A4`, P2) |
| Edge: client writes again mid-reply | `?c=maryam` — type, then "Client writes now": countdown resets, text kept |
| Edge: Cami and WhatsApp disagree | "Next send: WhatsApp says window closed" — the provider's answer closes the window; still one countdown |

### `IX-A4` — template when free typing is closed

| Row | Frame |
| --- | --- |
| 1 Pick from a list | `?c=sara` — Choose a template |
| 2 Name and booking fill in | `?c=sara` — Booking details, filled in violet |
| 3 A blank blocks the send, naming it | `?c=maryam` after close — Booking details with no booking |
| 4 Typing freely is stopped, with why | `?c=sara` |
| Edge: unmatched, name blank | `?c=unmatched-closed` — any template with the name is blocked, "Match first" |
| Edge: approval pending at S0 start | **Superseded** — the Phase 0 exit is held (Mike, 2026-09-23) |
| Edge: rejected by Meta | No screen — resubmission is the Meta-assets owner's; a failed template send shows as `?c=noura` |
| Also: `IX-A5` template retry (P8) | Send a template with "Next send: fails", Retry resends the template |
| Also: `IX-C4` name question as a template (P10) | `?c=unmatched-quiet` → Add → Ask for their name → Send as template |

Template names and wording are placeholders until FND-5b records the approved ones.

### `IX-A5` — failed, and send again

| Row | Frame |
| --- | --- |
| 1 Shows failed, with retry | `?c=noura` |
| 2 Retry → sent, one message | `?c=noura` — Retry lands on the same bubble (same idempotency key) |
| 3 Pending / sent / failed always visible | Any send — clock, tick, "Not sent" |
| Edge: failure known late | "Next send: fails late" — Sent, then flips to failed ~6 s later with Retry |
| Edge: retry also fails | "Next send: fails", Retry twice — "Retried 2×" |
| Edge: template fails after window closed | Verified under `IX-A4` (P8) |

### `IX-A6` — photos, videos and files

| Row | Frame |
| --- | --- |
| 1 Photo shows, tap for full size | `?c=omar` — photo and video open full size |
| 2 Send a photo, video or file from the computer | `/` — paperclip; `?c=unmatched-fatima` shows a PDF sent from the chat |
| 3 Photos tab on the client card | **Deferred — `CC-1`** (Mike, 2026-09-23) |
| Edge: older than 2 weeks at sync | `?c=omar`, scroll up — "On the phone only", never a broken tile (P12) |
| Edge: file type WhatsApp rejects | `/` — attach a `.zip`: blocked with the reason; also over-size |
| Edge: stylist wants the photo | No screen — stylists have no login until S2 |
| Edge: unmatched chat receives a photo | `?c=unmatched-saturday` — shows; lands on the client once matched |

### `IX-C3` — match a number to a client

| Row | Frame |
| --- | --- |
| 1 Marked unmatched | `?c=unmatched-saturday`. "Cannot book until matched" **deferred to `IX-F1` (P5)** |
| 2 Search name/phone/email/pet, pick, number saved | Match to client → search → pick → confirm says what happens to the number |
| 3 History stays, card paints | After Match — every earlier message still there, pane shows the summary |
| 4 Re-match, both kept with who and when | Any matched chat → "Wrong client? Change the match" — both lines stay |
| 5 Never asks the client for their name | No screen — Match never sends anything |
| 6 Stylists never see unmatched chats | No screen — data rule; no stylist login until S2 |
| Edge: family phone | `?c=huda` |
| Edge: archived client | Search "Ahmed" — matchable, shown as Archived |
| Edge: client at another location | Search "Rana" — "Client at Shampooch JLT", match allowed |
| Edge: number on two records | `?c=unmatched-closed` → Match — both shown, I pick |
| Also: `IX-C6` "pane offers Match" (P9) | `?c=unmatched-saturday` |

### `IX-C4` — add a new client from the chat

| Row | Frame |
| --- | --- |
| 1 Short form over the chat, phone filled | `?c=unmatched-saturday` → Add new client |
| 2 First name the only required field | Same |
| 3 Name from the message, marked as a guess | `?c=unmatched-fatima` → Add — "Fatima", "Guessed from their message" |
| 4 No name: one question, the form waits | `?c=unmatched-saturday` → Add → Ask for their name. Window closed: `?c=unmatched-quiet` waits and sends nothing (P10) |
| 5 Already a client → match instead | `?c=unmatched-closed` → Add — "This number is on 2 clients", Match instead |
| 6 Save binds, clean empty card, recorded | Save — "added as a new client by Queenie", pane shows "New client" |
| Edge: business has pets | `?pets=off` removes the first-pet field |
| Edge: abandon | Cancel — chat stays unmatched, nothing created |
| Edge: free text closed | `?c=unmatched-quiet` → Add → Ask — waits, nothing sent; the template is `IX-A4`'s (P10) |
| Edge: full intake | "Open the full client form" — the existing `ClientEditSheet`, prefilled |
| Also: `IX-C6` "pane offers Add" (P9) | `?c=unmatched-saturday` |

### `IX-C6` — client card beside the chat

| Row | Frame |
| --- | --- |
| 1 Name, pet, last service, no spinner | `/` — painted with the messages. Usual stylist **deferred — `CC-1`** |
| 2 Last three visits: what, who, when, how much | `/` — AED |
| 3 Usual staff per service type | **Deferred — `CC-1`** |
| 4 Visit rhythm | **Deferred — `CC-1`** |
| 5 Brand new client: clean empty panel | Add a client (`?c=unmatched-fatima` → Save) |
| 6 Stylist sees no prices | No screen — data rule; no stylist login until S2 |
| 7 Notes, team only | `/` — "Team only · never sent to the client" |
| Edge: history slow | `?state=visits-slow` |
| Edge: client at another location | Match "Rana" — badge on the summary; visit location waits on V0.3 |
| Edge: unmatched | `?c=unmatched-saturday` — no summary, Match and Add only (P9) |

## 4. Contract proposal — what each screen needs, and where it comes from

Names are camelCase of the draft columns in
[`code-design.md`](https://github.com/getcami/cami-docs-v1/blob/main/platform-docs/features/inbox-crm-phase-0/code-design.md).
**New** marks something the draft schema does not have yet.

### 4.1 Conversation list — `GET /inbox/conversations` (keyset, polled 15 s)

| Field | Shown on | Source |
| --- | --- | --- |
| `publicId` | Row selection, URL | `inbox_conversation.public_id` |
| `phoneE164` | Row title when unmatched | `inbox_conversation.phone_e164` |
| `customer` `{ publicId, firstName, lastName }` or `null` | Row title, avatar, Unmatched marker | `customer_id` → customer module |
| `lastMessageAt` | Row time, sort | `inbox_conversation.last_message_at` |
| `lastMessage` `{ direction, bodySnippet, mediaKind, deliveryState, sentByStaffName }` | Preview line, "You:", "Not sent" | Latest `inbox_message` (+ media kind), staff name via `sent_by_staff_id` |
| `unreadCount` | Unread badge | **New** — see §4.6 |

### 4.2 Thread read — `GET /inbox/conversations/{id}` + messages (keyset, `after` cursor, polled 5 s)

| Field | Shown on | Source |
| --- | --- | --- |
| `lastInboundAt` | "Client last wrote …" | `inbox_conversation.last_inbound_at` |
| `windowClosesAt` | Countdown; open vs closed composer | Computed: `last_inbound_at + 24 h`, or the provider rejection time if earlier — needs `window_closed_by_provider_at` (**new**) |
| `customer.firstName`, `lastName`, `pets[] {name, species, breed}`, `lastService {name, at}` | Pane header, pets, last service — painted with the messages | Customer module, carried on the thread read (contract.md, latency) |
| `customer.nextBooking {service, startAt}` | Template blanks | Booking module — **new on the thread read** (or served by the template preview, §4.4) |
| `events[] {publicId, kind, actorName, at, customerName, previousCustomerName}` | Identity lines in the thread | **New table** — §4.6 |
| Message `publicId` | Stable id before confirm; retry target | `inbox_message.public_id` |
| `direction` | Side of the thread | `direction` |
| `origin` (`live` / `history_import`) | No staff name, no delivery mark on imported | **New column or derived** from `raw_event_id` / import job — needed to say honestly "from history" |
| `sentByStaffName` | Name in the bubble | `sent_by_staff_id` → staff display name; null for imported and echoes |
| `sentFromPhoneApp` | "Answered on phone" | `sent_from_phone_app` |
| `body` | Bubble text, caption | `body` |
| `templateCode` (+ template name) | "Template · …" label; retry stays a template | `template_code` |
| `deliveryState`, `retryCount`, `failureCode` | Clock / tick / Not sent, "Retried 2×", reason | `delivery_state`, `retry_count`, `failure_code` |
| `providerSentAt` | Time, day grouping (salon timezone), order | `provider_sent_at` |
| `media[] {publicId, kind, mimeType, fileName, byteSize, status, url}` | Tiles, file card, full-size view, phone-only | `inbox_message_media`; `kind` from `mime_type`; `url` a short-lived signed URL from `storage_key`; `file_name` **new column** |

### 4.3 Send and retry — `POST /inbox/conversations/{id}/messages`

| Field | Where | Notes |
| --- | --- | --- |
| Header `Idempotency-Key` | Every attempt of one message, retry included | Decided (Mike, 2026-09-23): 201 first, 200 replay, 409 different body |
| `body` | Composer | Free text only while the window is open; else `WINDOW_CLOSED` |
| `templateCode` | Template send | Server fills blanks from the record; blank → `TEMPLATE_BLANK` with `details.blanks[]` |
| `media[]` (upload refs) | Attach | One file per message, text as the first caption (WhatsApp's shape). Type/size rejected → `MEDIA_REJECTED` with `details.reason` (`type` / `size`) and `details.limitBytes` |
| Response | The message, in every case | Delivery state later changes by poll |

Retry is the same request with the same key; a template retries as the template.

### 4.4 Templates — `GET /inbox/templates`, preview

| Field | Shown on | Source |
| --- | --- | --- |
| `code`, `name`, `language`, `body` with placeholders | Picker | FND-5b's approved templates |
| **Preview** `POST /inbox/conversations/{id}/templates/{code}/preview` → segments `{text}` / `{blank, value \| null, reason}` | Filled values, red blanks, "Match first" / "no upcoming booking" | **New (proposed).** Keeps the fill rule on the backend, which also blocks the send. Alternative: the frontend fills from `customer` + `nextBooking` on the thread read — cheaper, but the rule then lives twice |

### 4.5 Identity — match, re-match, create

| Call | Shown on | Source / rule |
| --- | --- | --- |
| `GET /customers?search=` — name, phone, email, **pet** | Match search | Exists except pet (`IX-C3` backend adds it). Results need `archived`, `homeLocation`, `pets`, `phoneE164`, `email` |
| Clients on this number | "This number is on 2 client records" | Search by phone; P6 leaves such chats unmatched |
| `PUT /inbox/conversations/{id}/customer` `{ customerId, phone: "save" \| "keep" \| "replace" }` | Match / re-match confirm | Sets `customer_id`, writes a link event, saves the number per the choice. **Keep vs Replace is Michelle's open call** |
| `POST /inbox/conversations/{id}/customer` (create) `{ firstName, lastName?, pet? }` | Add client | Customer module quick-create + first pet; links and records `created`. Number already a client → `NUMBER_ALREADY_CLIENT` |
| Name request `{ askedAt, sent }` | "Waiting for their name" | **New** `inbox_conversation.name_requested_at` (+ whether it went) — so a colleague sees the chat is waiting, not only the person who asked |

### 4.6 What the draft schema is missing

| Proposed | Why — which screen needs it |
| --- | --- |
| **`inbox_conversation_link`** — `conversation_id`, `customer_id`, `previous_customer_id`, `kind` (`auto_linked` / `matched` / `rematched` / `created`), `actor_staff_id` (null = Cami), `created_at` | INV-08 and `IX-C3` row 4: "both changes kept, with who and when". Today only the current `customer_id` exists, so a re-match overwrites the history |
| `inbox_conversation.first_reply_at timestamptz NULL` | `IX-A2` row 4 — first reply recorded with its time (`IX-H1` later) |
| `inbox_conversation.window_closed_by_provider_at timestamptz NULL` | A WhatsApp "outside the window" rejection is final and must close the window for everyone, not just the sender's screen |
| `inbox_message_media.file_name text NULL` | The file card and full-size title (welcome pack PDF) |
| `inbox_message.origin` (or a derivation) | Imported history carries no staff name and no delivery mark; the UI must be able to tell it apart honestly |
| Read state: `inbox_conversation.last_read_at` (shared desk) **or** drop unread | The list's unread badge. No story asks for it — keep (one shared read marker for the desk) or drop is a product call |
| `inbox_conversation.name_requested_at` | §4.5 — the waiting state survives reload and is visible to the team |

### 4.7 Visits read for `ClientSummary` — customer module

| Field | Shown on | Source |
| --- | --- | --- |
| Last 3 visits `{ service, staffName, startAt, amountMinor }` | "Last visits" | Appointments/sales via the customer module. p95 ≤ 500 ms on staging, skeleton rows while loading (Mike, 2026-09-23) |
| Notes `{ body, authorName, createdAt }` | "Notes · team only" | Existing `useCustomerNotes` |
| `archived`, `homeLocation` | Badges | Customer record |

### 4.8 Error codes the frontend branches on

| `error.code` | Status | Screen |
| --- | --- | --- |
| `FEATURE_DISABLED` | 403 | `?state=feature-off` |
| `WINDOW_CLOSED` | 409 or 422 | Closed composer; failed send "Free text had closed" |
| `TEMPLATE_BLANK` (`details.blanks[]`) | 422 | Blocked template, blank named |
| `MEDIA_REJECTED` (`details.reason`, `details.limitBytes`) | 422 | Attachment chip with the reason |
| `NUMBER_ALREADY_CLIENT` | 409 | Add → "Match instead" |
| `IDEMPOTENCY_CONFLICT` | 409 | Same key, different body — a client bug, logged |
| Delivery `failureCode`: `PROVIDER_REJECTED`, `WINDOW_CLOSED` | on the message | Failed bubble reason |

Names are proposals; FND-2 settles them.

### 4.9 Permissions

`inbox:read` — list, thread, client pane. `inbox:reply` — send, retry, templates, attach,
Match, Add (they change the record). Read without reply: `?state=read-only`.

## 5. `ClientSummary` content (for FND-4)

Display only; data through the customer module's hooks; the inbox passes the thread
read's client fields as initial data.

1. **Identity** — avatar, full name, phone (LTR). Badges: Archived; "Client at {location}" when their home location is another one. *(Painted with the messages.)*
2. **Pets** — name, species icon, breed. Hidden when the business has no pets. *(Painted with the messages.)*
3. **Last service** — service name and day. *(Painted with the messages.)*
4. **Last visits** — three rows: service; staff · day; amount in AED. Skeleton rows while loading; an inline "Couldn't load visits · Retry" on failure, the rest of the summary stays.
5. **Notes** — body, author · day, labelled "Team only · never sent to the client".
6. **Empty** — a new client with no visits, notes or last service shows one calm "New client" panel instead of empty sections.

Not in Phase 0: usual stylist per service type and visit rhythm (`CC-1`), the Photos tab
(`CC-1`), rebook (`IX-F6`). The pane leaves room for them; nothing placeholders them.
"Wrong client? Change the match" sits under the summary but belongs to the inbox, not
to `ClientSummary`.

## 6. Interaction, accessibility, RTL

- **Keyboard.** Ctrl/⌘+Enter sends. List rows, template picker, match results and dialogs are reachable by Tab with visible focus; dialogs trap focus and close on Esc (Radix).
- **Screen readers.** The thread is `role="log"`. Unread counts and delivery icons have text labels. The countdown is not a live region (a per-minute announcement is noise); the change that matters — closing — replaces the composer with the closed notice.
- **Colour is never the only signal.** Failed, blank, unmatched and closed all carry words.
- **RTL.** Logical properties throughout; the send and back arrows mirror; phone numbers and English template bodies stay LTR inside Arabic. Every string exists in `en` and `ar`. In the prototype only the inbox region mirrors; the app shell around it is production's.
- **Polling.** Thread 5 s, list 15 s, paused while hidden (decided). A new message scrolls into view; loading older pages keeps the reader's place.
- **Time.** Stored UTC, shown in the salon's timezone; day grouping uses the salon's day.

## 7. Open — who decides

| Question | Who |
| --- | --- |
| Matched number when the client has a different one: Keep (default) or Replace — the prototype builds the proposal | Michelle |
| May reception type a value into a template blank the record cannot fill? (T1-D5 says no) | Michelle |
| P13 — `ClientSummary` rather than the existing Overview | Michelle |
| Unread: keep with a shared desk marker, or drop from Phase 0 | Michelle, Mike |
| Template preview on the backend (§4.4) or fill on the frontend | Backend owner, FND-2 |
| New columns and the link table (§4.6) | Backend owner, FND-2 |
| Where phone normalisation lives | Backend, with the customer-module owner |
| Media bucket and retention | Backend |
