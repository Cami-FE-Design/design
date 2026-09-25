# Inbox Phase 0 — walkthrough

Every flow in the T1 prototype, one at a time: the link, what to click, and what you
should see. The story row each one proves is in brackets. Companion to
[ENG3-33-inbox-phase-0-t1.md](ENG3-33-inbox-phase-0-t1.md), which holds the decisions,
the coverage table and the contract proposal.

**Before you start**

- Links use `http://localhost:3000`. On the branch preview, swap the host and keep the path.
- Hard refresh (Ctrl+Shift+R) before each flow. Nothing is saved: a reload starts clean.
- The dashed **Design repo** chip at the top right holds the controls a real salon never
  sees — "Client writes now" (stands in for the client replying) and "Next send" (makes
  WhatsApp accept or refuse the next send). Links with `controls=open` open with that bar
  already showing.
- Seeded chats: **Layla** window open · **Maryam** window closes ~2 min after the page
  loads · **Sara** window closed · **Omar** six months of history and media · **Noura** a
  failed send · **Huda** two pets on one number · four **unmatched** numbers.

---

## A. Reading a chat

**A1 · Three panes, days, who sent what** [IX-A1 rows 1, 2, 4]
<http://localhost:3000/messages/inbox/phase-0>
1. Look at Layla's chat.
- Chat list, chat and client all visible.
- Messages grouped under Tuesday / Yesterday / Today.
- Each message we sent shows the staff name in the bubble: "Aisha · 10:30", "Queenie · 12:30".
- A violet line at the top: "Linked to Layla Haddad automatically by Cami" (P6).

**A2 · Six months of history** [IX-A1 long-history edge case, rows 5; IX-A6 old media]
<http://localhost:3000/messages/inbox/phase-0?c=omar>
1. Scroll up slowly in the chat.
- "Loading earlier messages…" appears and older messages load 40 at a time; your place does not jump.
- While you scroll, the day floats at the top of the chat and fades when you stop.
- Tiles reading "Photo · On the phone only" — media older than two weeks, never a broken tile.
- Nine days back: "Answered on phone" under a reply sent from the phone app.
2. Keep scrolling to the very top.
- "Chat history synced from WhatsApp starts here". Imported messages carry no staff name.

**A3 · Two people, one number** [IX-A1 edge case]
<http://localhost:3000/messages/inbox/phase-0?c=huda>
- One chat. Huda books for her mum; both dogs are on the client. The person is chosen at booking (S1).

---

## B. Replying while the window is open

**B1 · Send** [IX-A2 rows 1, 2; IX-A5 row 3]
<http://localhost:3000/messages/inbox/phase-0>
1. Look above the text box: "Free text open · closes in 23 h …" and "Client last wrote today at 13:44".
2. Type anything and press Ctrl+Enter (⌘+Enter on Mac).
- The message appears with a clock (sending), then a tick (sent), signed "Queenie".

**B2 · The countdown, and the window closing while you type** [IX-A2 edge cases]
<http://localhost:3000/messages/inbox/phase-0?c=maryam&controls=open>
1. The countdown is red: "closes in 2 min". Type a message, but don't send it.
2. Wait about two minutes.
- The text box is replaced by "Free text is closed". Your text is kept in a box marked "Your message wasn't sent", with Copy and Discard. "Choose a template" is the only way to reply.
3. Click **Client writes now** in the dashed bar.
- The client's message arrives, the window reopens for 24 h, and your text is back in the box.

---

## C. When the window has closed

**C1 · Templates, filled from the record** [IX-A4 rows 1, 2, 4]
<http://localhost:3000/messages/inbox/phase-0?c=sara>
1. Note: free typing is off, and it says why.
2. Click **Choose a template** → **Booking details**.
- "Hi **Sara**, a note about your **Puppy intro groom** on **Friday** at **10:00**…" — the violet parts come from her record.
3. Click **Send template**.
- It sends, labelled "Template · Booking details" in the chat.

**C2 · A blank blocks the send** [IX-A4 row 3, unmatched edge case]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-closed>
1. **Choose a template** → **Follow-up reply**.
- "[first name]" in red. "Can't send yet — first name is blank. Match this chat to a client first. Cami never guesses a name." Send is off.
2. Change to **Ask for a name**.
- No blanks, so it can go.

**C3 · WhatsApp says the window has closed** [IX-A2 "Cami and WhatsApp disagree"]
<http://localhost:3000/messages/inbox/phase-0?send=window>
1. Type a message and send it.
- It fails: "Not sent · Free text had closed". The composer closes at once — WhatsApp's answer is final, and there is still one countdown, not two.
- The failed message has no Retry, and says why: typed text can't go again once the window is closed.

---

## D. When a send fails

**D1 · Failed, then retry** [IX-A5 rows 1, 2]
<http://localhost:3000/messages/inbox/phase-0?c=noura>
- Noura's last message: red, "Not sent · WhatsApp didn't accept it", with **Retry**. The list row says "Not sent" too.
1. Click **Retry**.
- The same bubble goes to sending, then sent. One message, not two.

**D2 · The retry fails again** [IX-A5 "retry also fails"]
<http://localhost:3000/messages/inbox/phase-0?c=noura&send=fail&controls=open>
1. Click **Retry** twice.
- Still failed, and "Retried 2×". Set **Next send: goes** in the bar and retry once more: sent.

**D3 · The failure arrives late** [IX-A5 "failure known late"]
<http://localhost:3000/messages/inbox/phase-0?send=late>
1. Send a message.
- It shows as sent. About 6 seconds later it flips to "Not sent" and Retry appears.

**D4 · A template retries as a template** [IX-A4 → IX-A5, P8]
<http://localhost:3000/messages/inbox/phase-0?c=sara&send=fail&controls=open>
1. Send **Booking details**. It fails.
2. Set **Next send: goes**, then **Retry**.
- The template goes again as the template, never as free text.

---

## E. Photos, videos and files

**E1 · Full size** [IX-A6 row 1]
<http://localhost:3000/messages/inbox/phase-0?c=omar>
1. Click the photo, then the video.
- Each opens full size with who sent it and when.

**E2 · Send from this computer** [IX-A6 row 2]
<http://localhost:3000/messages/inbox/phase-0>
1. Click the paperclip, pick a JPG or PNG under 5 MB (a PDF works too). Type a caption if you like, then Send.
- A preview shows before sending; after, the photo is in the chat with the caption.

**E3 · A file WhatsApp rejects** [IX-A6 edge case]
<http://localhost:3000/messages/inbox/phase-0>
1. Attach a `.zip` (or a photo over 5 MB).
- A red chip: "WhatsApp doesn't accept this type of file (.zip)" or "Too large…". Send stays off until you remove it.

**E4 · A file in the chat** [IX-A6 row 2, Walk 2 welcome pack]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-fatima>
- "Welcome pack.pdf · 1.2 MB · PDF" sent from the chat. Click it to open.

**E5 · An unmatched chat receives a photo** [IX-A6 edge case]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-saturday>
- The photo shows like any other. It moves to the client once the chat is matched.

---

## F. Matching a number to a client

**F1 · Same number on two records** [IX-C3 edge case; P6]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-closed>
1. Right pane → **Match to client**. Don't type anything.
- "This number is on 2 client records. Pick the right one." — both listed.
2. Pick **Khalid Omar** → **Match**.
- "This number is already on their record." After Match: the chat is Khalid's, the line "Matched to Khalid Omar by Queenie" is added, and his message from before is still there.

**F2 · Search, and what happens to the number** [IX-C3 row 2]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-fatima>
1. **Match to client** → type `Fatima`.
- Two results.
2. Pick **Fatima Noor** (no number on her record).
- "This number will be saved on their record."
3. **Back**, pick **Fatima Al Hashimi** (a different number).
- Keep their current number (default) or Replace it. *Michelle's open decision — this is the proposal.*
4. Try searching `Luna` — found by pet name.

**F3 · Archived, and another location** [IX-C3 edge cases]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-fatima>
1. **Match to client** → `Ahmed` — shown as Archived, still matchable.
2. Search `Rana` — "Client at Shampooch JLT", still matchable.

**F4 · Wrong client? Re-match** [IX-C3 row 4]
<http://localhost:3000/messages/inbox/phase-0>
1. Right pane, bottom → **Wrong client? Change the match** → search `Rana` → pick her → **Match**.
- The line "Match changed from Layla Haddad to Rana Haddad by Queenie" is added. The first line ("Linked… by Cami") stays — both changes are kept.

---

## G. Adding a new client from the chat

**G1 · The name is in their message** [IX-C4 rows 1, 2, 3, 6]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-fatima>
1. Right pane → **Add new client**.
- Phone filled. First name "Fatima", highlighted, "Guessed from their message — check it". Last name and first pet optional.
2. **Save client**.
- The chat becomes Fatima's, the line "Fatima added as a new client by Queenie" is added, and the pane shows "New client".

**G2 · No name: ask once, wait, add** [IX-C4 row 4]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-saturday&controls=open>
1. **Add new client** — First name empty, Save off. Click **Ask for their name**.
- The question goes into the chat. The pane: "Waiting for their name".
2. Open **Add new client** again.
- "Already asked … waiting for their reply" — no second question.
3. Cancel, then **Client writes now** in the dashed bar.
- The client replies "It's Rana, thanks!". The pane: "They replied — Their reply gives a name: Rana".
4. **Add Rana** → **Save client**.

**G3 · No name, window closed: nothing is sent** [IX-C4 row 4 with the window closed, P10]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-quiet>
1. **Add new client** → **Ask for their name**.
- Nothing is sent. The pane waits: "Free text is closed, so the question can't go as a message…"
2. **Send as template**.
- The question goes as the "Ask for a name" template.

**G4 · The number is already a client** [IX-C4 row 5]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-closed>
1. **Add new client**.
- "This number is on 2 clients" — no Save, only **Match instead**.

**G5 · Full details, pets, abandon** [IX-C4 edge cases]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-fatima>
1. **Add new client** → "Need consent or an address? Open the full client form" — the existing client form, prefilled.
2. **Cancel** — the chat stays unmatched, nothing is created.
3. The same with <http://localhost:3000/messages/inbox/phase-0?c=unmatched-fatima&pets=off> — no first-pet field.

---

## H. The client pane

**H1 · Summary** [IX-C6 rows 1, 2, 7]
<http://localhost:3000/messages/inbox/phase-0>
- Name, phone, pet and last service at once. Last three visits (what, who, when, AED) a moment later. Notes: "Team only · never sent to the client".

**H2 · Visits slow** [IX-C6 "history endpoint slow"]
<http://localhost:3000/messages/inbox/phase-0?state=visits-slow>
- The name and pet are there at once; three grey rows hold the visits' place for ~3 s. Never a spinner where the name goes.

**H3 · Visits failed (partial)** [T1 partial state]
<http://localhost:3000/messages/inbox/phase-0?state=visits-error>
- "Couldn't load visits · Try again". The rest of the summary stays.

**H4 · Unmatched** [IX-C6 edge case, P9]
<http://localhost:3000/messages/inbox/phase-0?c=unmatched-saturday>
- No summary — only Match to client and Add new client.

---

## I. Page states

| State | Link | What you should see |
| --- | --- | --- |
| Loading, first open | <http://localhost:3000/messages/inbox/phase-0?state=list-loading> | Grey skeleton rows in all three panes |
| Loading a chat | <http://localhost:3000/messages/inbox/phase-0?state=thread-loading> | List in; chat and pane skeletons |
| No chats yet | <http://localhost:3000/messages/inbox/phase-0?state=list-empty> | "No chats yet", "Nothing to read yet", and the pane says what it is for |
| List failed | <http://localhost:3000/messages/inbox/phase-0?state=list-error> | "Couldn't load your chats · Try again" |
| Chat failed | <http://localhost:3000/messages/inbox/phase-0?state=thread-error> | "Couldn't load this chat · Try again" |
| Read only | <http://localhost:3000/messages/inbox/phase-0?state=read-only> | Chats read; the composer says replying needs the permission; no Match, Add or Retry |
| No inbox access | <http://localhost:3000/messages/inbox/phase-0?state=no-access> | Page-level: "You don't have access to the inbox" |
| Inbox off for this business | <http://localhost:3000/messages/inbox/phase-0?state=feature-off> | Page-level: "The inbox isn't on for this business" |

## J. Widths and Arabic

| Check | Link | What you should see |
| --- | --- | --- |
| 1280 wide | <http://localhost:3000/messages/inbox/phase-0?width=1280> | All three panes inside the dashed outline |
| 1366 wide | <http://localhost:3000/messages/inbox/phase-0?width=1366> | The same, the chat a little wider |
| Arabic, right to left | <http://localhost:3000/messages/inbox/phase-0?lang=ar&width=1280> | Everything mirrored, Arabic copy, "صندوق الوارد" as the title; phone numbers and English messages stay left to right |
| Arabic, window closed | <http://localhost:3000/messages/inbox/phase-0?lang=ar&c=sara> | The closed notice and template picker in Arabic; the template itself stays English |
| Arabic, add client | <http://localhost:3000/messages/inbox/phase-0?lang=ar&c=unmatched-saturday> | The dialog mirrored, the pet type list in Arabic |
