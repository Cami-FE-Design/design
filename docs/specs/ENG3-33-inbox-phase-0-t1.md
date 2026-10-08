# ENG3-33 · T1 — Inbox Phase 0 prototype and contract proposal

| | |
| --- | --- |
| Ticket | [ENG3-33](https://linear.app/getcami/issue/ENG3-33/t1-prototype-and-the-contract-proposal) · canonical story [`T1.md`](https://github.com/getcami/cami-docs-v1/blob/main/platform-docs/features/inbox-crm-phase-0/stories/T1.md) |
| Prototype | `/messages/inbox/phase-0` in projects-cami, branch `eng3-33-t1-prototype-and-the-contract-proposal`. Every frame below is a link on that route; `/screens` lists them with notes |
| Unblocks | [FND-2](https://github.com/getcami/cami-docs-v1/blob/main/platform-docs/features/inbox-crm-phase-0/stories/FND-2.md) (contract) from §4, [FND-4](https://github.com/getcami/cami-docs-v1/blob/main/platform-docs/features/inbox-crm-phase-0/stories/FND-4.md) (`ClientSummary`) from §5 |
| Reviewers | Product — Maaz · Reception — Quinee · Backend owner — for §4 |

**How to review.** Open the prototype, click the dashed **Design repo** chip floating
over the top right. It does not take a row. It switches the page state, what the next
send does, English/Arabic, pets on/off and a 1280/1366 frame, and each switch is in the
URL. The seeded chats each carry one situation (§2). Nothing is stored between reloads.

---

## 1. Decisions made in T1

| # | Decision | Why |
| --- | --- | --- |
| T1-D1 | **Three panes at 1280 and up; below that the pane becomes a sheet.** 1024 to 1279: list and chat, the client pane opens as a sheet over the chat (starts hidden). Below 1024 (tablet portrait): one pane at a time, the chat full width with a back arrow, the client pane a sheet (Michelle, 2026-10-08). At 1280 and 1366: List 18 rem, client pane 20 rem, the thread takes the rest; the app sidebar is collapsed (68 px) on the inbox route. Thread width ≈ 590 px at 1280, ≈ 680 px at 1366. Below 1280 is out of scope (desktop only). Height is not constrained — every pane scrolls inside itself | `IX-A1-AC1` expects three panes; the old design hid the right pane below 1280 |
| T1-D2 | **`ClientSummary` content** is §5 | FND-4 / P13 asks design to choose it here |
| T1-D3 | **One countdown line.** "Free text open · closes in … · last wrote …" is a single short line above the field. It stays quiet until under 2 h remain, then the line is colored (amber under 2 h, red under 10 min). "Ctrl + Enter to send" is the Send button's tooltip, not a second line | `IX-A2` row 2 and "never two countdowns". Michelle, 2026-09-30 |
| T1-D4 | **Closed window is one sand row.** A lock icon, the reason, and "Choose a template" share one row. Neutral sand (`bg-sand-3` / `text-sand-11`), not a yellow banner. No disabled text box. Anything typed before the window closed is still kept (copy or discard), never sent and never lost | `IX-A4` row 4, `IX-A2` edge case. Michelle, 2026-09-30 |
| T1-D5 | **A template blank is filled from the record only.** One rule for every blank: reception fixes the client record (match the chat, add the booking) and never types into a blank. If the record cannot fill it, the send is blocked and names the blank. An extra template with no blanks, "Thanks, reply here" ("Hi, thanks for your message. Reply here and we'll pick up where we left off."), so an unmatched chat can still be answered | `IX-A4` row 3. Michelle, ENG3-33, 2026-09-29 |
| T1-D6 | **Every identity change is a line in the thread** — auto-link by Cami, match, re-match (showing what it replaced), created — with who and when. These lines stay | INV-08 visible where the work happens; P6's Cami actor. Michelle, 2026-09-30: do not remove them |
| T1-D7 | **Match and Add open as dialogs**, from the unmatched pane or the chat header's "Link client" menu. Match confirm is titled "Match to {name}": the client card, then what happens to the number. Number already on their record: no confirm, picking them is the match. No number: it will be saved. A different number: On record and This chat, and "Update their number to the one from this chat", unchecked (Keep, IX-C3); checked, the button reads "Match and update number". Cancel closes. Add asks for first and last name and shows the chat's phone read only, with an "Open full client form" link. A matched chat's ⋯ menu has "Change linked client" | `IX-C3`, `IX-C4` row 1 and the full-intake edge case. Michelle, 2026-10-08 |
| T1-D8 | **Unread is out of Phase 0.** No story asks for it (Mike, 2026-09-28). The list does not show a count, a dot, a badge, or a bold name or preview. Read and unread rows look the same. `unreadCount` is not in the contract | Michelle, 2026-09-30, pointing at Mike's comment |
| T1-D9 | **An unmatched list avatar is a dashed circle with a person icon.** Not phone-digit initials, and not a search icon beside the number. The word "Unmatched" stays on that avatar for the screen reader. There is no "Not matched" text anywhere: linked clients carry no "Linked" label, so the avatar alone marks the state (Intercom does the same for WhatsApp leads) | Michelle, 2026-09-30; text label removed 2026-10-08 |
| T1-D10 | **Thread header is the avatar and the name, or the dashed avatar and the number when unmatched.** No phone when matched (it is on the card, T1-D11), no "WhatsApp" subline. A panel button on the right hides and shows the client pane. Named list and pane avatars use the same pet-parent character avatar as Clients (`Avatar` with `fallback="character"`). Unmatched list avatars are the dashed person (T1-D9) | Michelle, 2026-09-30; phone moved to the card 2026-10-07 |
| T1-D11 | **The card carries the client's name and phone**, under the avatar in a `bg-muted/40` band like the client profile header. The thread header keeps the name only. Supersedes "name and phone appear once, in the thread header" (2026-09-30): the card is a standalone client view and will appear where there is no thread header | Michelle, 2026-10-07 |
| T1-D12 | **A failed message keeps the red "Not sent · reason" line and Retry.** The bubble has no red border and no red icon | Michelle, 2026-09-30 |
| T1-D14 | **Visits on the card: Upcoming and Last visits, two sections.** Upcoming holds every booked visit, soonest first, and is left out when there are none. Last visits holds the last three completed, so `IX-C6` row 2 holds. Grouped by visit day, each service on its own line: staff initials avatar (name in a tooltip and the accessible label), service, AED.  Day labels show the relative day and the date in one color ("Tomorrow · 25 Sept", "5 weeks ago · 21 Aug"). FND-4's "completed only" needs amending for upcoming | Michelle, 2026-10-07 |
| T1-D15 | **No computed usual staff or rhythm on the card.** The staff avatar on each line shows who, and the relative dates show the real rhythm, irregular gaps included. `IX-C6` rows 3 and 4 stay deferred to `CC-1` (rows are verbatim, so they are not reworded) | Michelle, 2026-10-07 |
| T1-D16 | **No name prefill, and the WhatsApp profile name is not shown.** Add opens with first and last name empty; reception types the name. Unmatched chats show the number only. Earlier versions prefilled from the profile name or the message and showed the profile name in brackets; both are removed | `IX-C4` rows 3 and 4. Michelle, 2026-10-08. Story change proposed to Mike |
| T1-D17 | **No name question to the client.** First name starts empty and Save stays off until reception types one. Free text to an unmatched chat is allowed (29 Sep decision), so reception can ask in the chat. Retires `IX-C4` row 4's question and its closed-window template (P10) | Michelle, 2026-10-08. Story change proposed to Mike |
| T1-D18 | **Pet notes show under each pet.** Structured notes (Allergies, Behavior, Medical, Handling, Grooming sensitivity, Other) sit under their pet, never in Client notes. If no pet has notes, pets stay as pills | Michelle, 2026-10-08. Not in FND-4 or `IX-C6`; proposed to Mike |
| T1-D19 | **Card order and empty states.** Pets first (only with the pet module and a pet), then Upcoming, Last visits and Client notes. Only Last visits has an empty state ("No appointments yet"), shown when there are no appointments at all; Pets, Upcoming and Client notes are left out when empty | Michelle, 2026-10-08 |
| T1-D20 | **Add client has no first-pet field.** Name and phone only, even when the business has pets. The pet is added later or at booking, like every other optional field (quick-create). Drops `IX-C4`'s "business has pets" edge case | Michelle, 2026-10-08. Story change proposed to Mike |
| T1-D13 | **The list header is "Inbox" and a search icon in a pale circle.** The field is hidden until that icon is clicked. Clicking the icon again, or clearing the field, hides it and the list is unfiltered. The page does not title itself Inbox a second time above the panes | Michelle, 2026-09-30 |

## 2. States covered

Links are paths on the prototype route. `?c=` picks the seeded chat.

| State | Frame | What it shows |
| --- | --- | --- |
| **Unmatched** *(feature)* | `?c=unmatched-saturday` | The number is the title. The list avatar is a dashed person. The chat reads normally and free text can be sent. The pane offers Match and Add only |
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
| Without pets | `?pets=off` | The Pets section and pet notes disappear; the card starts with Upcoming |
| Tablet and small laptop | `?c=huda`, window narrowed | Below 1280 the pane is a sheet; below 1024 one pane at a time (T1-D1) |

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
| 2 Open, with a countdown, before typing | `/` — one line above the field: open, time left, and when the client last wrote. Colored only under 2 h |
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
| Edge: unmatched, name blank | `?c=unmatched-closed` — any template with a blank is blocked, "Match first". "Thanks, reply here" has no blanks and can go |
| Edge: approval pending at S0 start | **Superseded** — the Phase 0 exit is held (Mike, 2026-09-23) |
| Edge: rejected by Meta | No screen — resubmission is the Meta-assets owner's; a failed template send shows as `?c=noura` |
| Also: `IX-A5` template retry (P8) | Send a template with "Next send: fails", Retry resends the template |
| Also: `IX-C4` name question as a template (P10) | **Retired** (T1-D17). "Ask for a name" stays in the template list as a no-blank template reception can pick |

Template names and wording are placeholders until FND-5b records the approved ones. "Thanks, reply here" is the no-blank template Michelle asked to include in that submission (ENG3-33, 2026-09-29).

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
| 4 Re-match, both kept with who and when | Any matched chat → ⋯ → "Change linked client". Both lines stay |
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
| 1 Short form over the chat, phone filled | `?c=unmatched-saturday` → Add new client: a dialog, phone read only |
| 2 First name the only required field | Same |
| 3 Name from the message, marked as a guess | **Not built** (T1-D16): nothing is prefilled; reception types the name. **Story change proposed** |
| 4 No name: one question, the form waits | No question is sent (T1-D17); reception can ask in the chat. Save is off until a first name is typed. **Story change proposed** |
| 5 Already a client → match instead | `?c=unmatched-closed` → Add — "This number is on 2 clients", Match instead |
| 6 Save binds, clean empty card, recorded | Save: "added as a new client by Queenie", the card shows "No appointments yet" under Last visits (T1-D19) |
| Edge: business has pets | **Dropped** (T1-D20): no first-pet field. Story change proposed |
| Edge: abandon | Cancel — chat stays unmatched, nothing created |
| Edge: free text closed | No question exists (T1-D17). With the window closed, only a no-blank template can go out |
| Edge: full intake | "Open full client form": the existing `ClientEditSheet`, prefilled |
| Also: `IX-C6` "pane offers Add" (P9) | `?c=unmatched-saturday` |

### `IX-C6` — client card beside the chat

| Row | Frame |
| --- | --- |
| 1 Name, pet, last service, no spinner | `/`: name and phone in the card band, pets, and the last service as the first visit row, painted with the messages. Usual stylist **deferred, `CC-1`** |
| 2 Last three visits: what, who, when, how much | `/`: Last visits, with Upcoming above it as its own section (T1-D14). Who is the staff avatar, name on hover |
| 3 Usual staff per service type | **Deferred, `CC-1`** (T1-D15) |
| 4 Visit rhythm | **Deferred, `CC-1`**. Relative dates on each visit stand in (T1-D15) |
| 5 Brand new client: clean empty panel | Add a client (`?c=unmatched-fatima` → Save): Last visits shows "No appointments yet"; Pets, Upcoming and Client notes are left out (T1-D19) |
| 6 Stylist sees no prices | No screen — data rule; no stylist login until S2 |
| 7 Notes, team only | `/`: "Client notes", body and author · day, time. Team only is a data rule (staff only, never sent); no label on screen |
| Pet notes (not a story row) | `/` and `?c=huda`: notes under the pet (T1-D18). **Proposed to Mike** |
| Edge: history slow | `?state=visits-slow` |
| Edge: client at another location | Match "Rana" — badge on the summary; visit location waits on V0.3 |
| Edge: unmatched | `?c=unmatched-saturday`: no summary; the dashed avatar and the number, then Match and Add (P9) |

## 4. Contract proposal — what each screen needs, and where it comes from

Names are camelCase of the draft columns in
[`code-design.md`](https://github.com/getcami/cami-docs-v1/blob/main/platform-docs/features/inbox-crm-phase-0/code-design.md).
**New** marks something the draft schema does not have yet.

### 4.1 Conversation list — `GET /inbox/conversations` (keyset, polled 15 s)

| Field | Shown on | Source |
| --- | --- | --- |
| `publicId` | Row selection, URL | `inbox_conversation.public_id` |
| `phoneE164` | Row title when unmatched | `inbox_conversation.phone_e164` |
| `customer` `{ publicId, firstName, lastName }` or `null` | Row title and avatar. Null shows the dashed person avatar, not a marker beside the number | `customer_id` → customer module |
| `lastMessageAt` | Row time, sort | `inbox_conversation.last_message_at` |
| `lastMessage` `{ direction, bodySnippet, mediaKind, deliveryState, sentByStaffName }` | Preview line, same style as any row ("You:" and the message). A failed last send does not say "Not sent" in the preview. Its list signal is a small red circle on the pet-parent avatar. An unmatched row keeps the dashed person avatar and is not marked again. A file attachment has no document icon | Latest `inbox_message` (+ media kind), staff name via `sent_by_staff_id` |

### 4.2 Thread read — `GET /inbox/conversations/{id}` + messages (keyset, `after` cursor, polled 5 s)

| Field | Shown on | Source |
| --- | --- | --- |
| `lastInboundAt` | The one countdown line ("last wrote …") | `inbox_conversation.last_inbound_at` |
| `windowClosesAt` | Countdown; open vs closed composer | Computed: `last_inbound_at + 24 h`, or the provider rejection time if earlier — needs `window_closed_by_provider_at` (**new**) |
| `customer.firstName`, `lastName`, `phone` (the conversation's `phoneE164`) | Thread header, once. The pane does not repeat the name or the phone | Customer module, carried on the thread read (contract.md, latency) |
| `customer.pets[] {name, species, breed}`, `lastService {name, at}` | Pane: Pets, and the first Last visits group | Customer module, carried on the thread read |
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
| `PUT /inbox/conversations/{id}/customer` `{ customerId, phone: "save" \| "keep" \| "replace" }` | Match / re-match confirm | Sets `customer_id`, writes a link event, saves the number per the choice: `save` (no number on record), `keep` (default) or `replace` (the update box). The same number needs no confirm (T1-D7) |
| `POST /inbox/conversations/{id}/customer` (create) `{ firstName, lastName? }` | Add client | Customer module quick-create, no pet (T1-D20); links and records `created`. Number already a client → `NUMBER_ALREADY_CLIENT` |

### 4.6 What the draft schema is missing

| Proposed | Why — which screen needs it |
| --- | --- |
| **`inbox_conversation_link`** — `conversation_id`, `customer_id`, `previous_customer_id`, `kind` (`auto_linked` / `matched` / `rematched` / `created`), `actor_staff_id` (null = Cami), `created_at` | INV-08 and `IX-C3` row 4: "both changes kept, with who and when". Today only the current `customer_id` exists, so a re-match overwrites the history |
| `inbox_conversation.first_reply_at timestamptz NULL` | `IX-A2` row 4 — first reply recorded with its time (`IX-H1` later) |
| `inbox_conversation.window_closed_by_provider_at timestamptz NULL` | A WhatsApp "outside the window" rejection is final and must close the window for everyone, not just the sender's screen |
| `inbox_message_media.file_name text NULL` | The file card and full-size title (welcome pack PDF) |
| `inbox_message.origin` (or a derivation) | Imported history carries no staff name and no delivery mark; the UI must be able to tell it apart honestly |
| Nothing for the name | `name_requested_at` is no longer needed (T1-D17), and the WhatsApp profile name is not used (T1-D16) |

Unread is out of Phase 0 (T1-D8). The list does not need `unreadCount`, `hasUnread`, or `last_read_at`.

### 4.7 Visits read for `ClientSummary` — customer module

| Field | Shown on | Source |
| --- | --- | --- |
| Upcoming visits and the last 3 completed, each `{ startAt, lines[] { service, staffName, amountMinor } }` | "Upcoming" and "Last visits" | Appointments via the customer module. FND-4 says completed only; upcoming needs adding (T1-D14). p95 ≤ 500 ms on staging, skeleton rows while loading (Mike, 2026-09-23) |
| Client notes `{ body, authorName, createdAt }` | "Client notes" | Existing `useCustomerNotes` |
| Pet notes per pet `{ category, detail }[]` | Under each pet (T1-D18) | The pet's structured notes (`PetNoteEntry`). **Not in FND-4**; proposed |
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

Built as `components/blocks/client-summary.tsx`, a new component, not the client dialog
(P13). It owns its strings and imports nothing from the inbox; its sample reads are
`lib/client-summary/mock.ts`.

1. **Identity band** (`bg-muted/40`, as the client profile header): pet-parent avatar, full name, phone (LTR) (T1-D11). Badges: Archived; "Client at {location}" when their home location is another one. *(Painted with the messages.)*
2. **Pets** (first, T1-D19): every pet with species icon, name, breed. Hidden when the business has no pets or the client has none. If any pet has notes, pets show as rows in one card with each pet's notes under it, a category label over each detail (T1-D18); otherwise pills. *(Pets paint with the messages; notes arrive with the second read.)*
3. **Upcoming** (left out when none), then **Last visits**, the last three completed; each grouped by day (T1-D14). Each line: staff initials avatar (name on hover), service, AED. The last service paints with the messages as the first group; the rest load as skeletons. On failure, "Couldn't load visits · Try again" inside the card; the rest of the card stays.
   With no visits, the card shows "No appointments yet".
4. **Client notes**: one card, each note's body, then author · day, time ("Aisha · 21 Aug, 2:30pm"). Left out when there are none.
5. **Empty**: only Last visits has an empty state, when there are no appointments at all; Pets, Upcoming and Client notes are left out (T1-D19).
6. **View profile** in the band opens the existing client detail dialog, unchanged.

Section titles sit outside their cards. The card is display only: no Edit, Add note, Rebook
or tabs; View profile only opens the existing dialog.

Not in Phase 0: usual stylist per service type and visit rhythm (`CC-1`, T1-D15), the Photos
tab (`CC-1`), rebook (`IX-F6`).
"Change linked client" is in the chat header's ⋯ menu and belongs to the inbox, not
to `ClientSummary`.

## 6. Interaction, accessibility, RTL

- **Keyboard.** Ctrl/⌘+Enter sends. The shortcut is the Send button's tooltip. List rows, template picker, match results and dialogs are reachable by Tab with visible focus; dialogs trap focus and close on Esc (Radix).
- **Screen readers.** The thread is `role="log"`. The unmatched list avatar has the word "Unmatched". Delivery icons for sending and sent have text labels. A failed send has no icon; the "Not sent" line is the label. The countdown is not a live region (a per-minute announcement is noise); the change that matters, closing, replaces the composer with the closed row. There is no unread announcement.
- **Colour is never the only signal.** Failed, blank, unmatched and closed all carry words.
- **RTL.** Logical properties throughout; the send and back arrows mirror; phone numbers and English template bodies stay LTR inside Arabic. Every string exists in `en` and `ar`. In the prototype only the inbox region mirrors; the app shell around it is production's.
- **Polling.** Thread 5 s, list 15 s, paused while hidden (decided). A new message scrolls into view; loading older pages keeps the reader's place.
- **Time.** Stored UTC, shown in the salon's timezone; day grouping uses the salon's day.

## 7. Open — who decides

| Question | Who |
| --- | --- |
| P13 — `ClientSummary` rather than the existing Overview | Michelle |
| Template preview on the backend (§4.4) or fill on the frontend | Backend owner, FND-2 |
| New columns and the link table (§4.6) | Backend owner, FND-2 |
| Where phone normalisation lives | Backend, with the customer-module owner |
| Media bucket and retention | Backend |
| Story changes from T1: pet notes, upcoming visits, Upcoming and Last visits, card order and empty states, no name prefill, retiring the name question, no first-pet field (T1-D14, D16 to D20) | Mike |
