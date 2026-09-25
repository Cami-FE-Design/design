import { SALON_TIME_ZONE } from "@/app/messages/inbox/phase-0/mock"

// Every user-facing string is a key in both `en` and `ar` (design.md, invariants).
// The prototype holds them here so the RTL frames are real Arabic, not mirrored
// English; production moves them to `src/messages/{en,ar}/inbox.json`.

export type Lang = "en" | "ar"

const en = {
  inbox: "Inbox",
  searchPlaceholder: "Search chats",
  unmatched: "Unmatched",
  unreadCount: (n: number) => `${n} unread`,
  noResults: "No chats match your search",
  listEmptyTitle: "No chats yet",
  listEmptyBody: "When a client messages your WhatsApp number, the chat shows here.",
  listErrorTitle: "Couldn't load your chats",
  threadErrorTitle: "Couldn't load this chat",
  errorBody: "Check your connection and try again. Nothing has been lost.",
  retry: "Try again",
  today: "Today",
  yesterday: "Yesterday",
  answeredOnPhone: "Answered on phone",
  loadingEarlier: "Loading earlier messages…",
  historyStart: "Chat history synced from WhatsApp starts here",
  conversationStart: "Start of this chat",
  phoneOnlyTitle: "On the phone only",
  phoneOnlyBody: "Older than 2 weeks when WhatsApp was connected",
  photo: "Photo",
  video: "Video",
  file: "File",
  composerPlaceholder: "Write a message",
  send: "Send",
  shortcutHint: "Ctrl + Enter to send",
  shortcutHintMac: "⌘ + Enter to send",
  sending: "Sending",
  sent: "Sent",
  notSent: "Not sent",
  you: "You",
  clientTab: "Client",
  notMatchedTitle: "Not matched to a client",
  notMatchedBody: "Match this number to a client you already have, or add them as new.",
  match: "Match to client",
  add: "Add new client",
  lastService: "Last service",
  noLastService: "No visits yet",
  pets: "Pets",
  whatsapp: "WhatsApp",
  selectChat: "Select a chat to read it",
  noChatOpenTitle: "Nothing to read yet",
  noChatOpenBody: "New WhatsApp messages open here.",
  paneEmpty: "The client's details show here when a chat is open.",
  chatList: "Chats",
  messageLog: "Messages",
  // Free-text window (IX-A2, IX-A4)
  windowOpen: (left: string) => `Free text open · closes in ${left}`,
  clientLastWrote: (when: string) => `Client last wrote ${when}`,
  windowClosedTitle: "Free text is closed",
  windowClosedBody: (when: string) =>
    `The client last wrote ${when}. WhatsApp only allows an approved template until they write again.`,
  providerClosedBody:
    "WhatsApp says the 24-hour window has closed. Only an approved template can go until the client writes again.",
  typingBlocked: "Free typing is off — choose a template",
  draftKeptTitle: "Your message wasn't sent",
  draftKeptBody: (when: string) =>
    `Free text closed at ${when}. Your text is kept here — reply with a template, or send it once the client writes again.`,
  copyText: "Copy text",
  copied: "Copied",
  discard: "Discard",
  chooseTemplate: "Choose a template",
  templatesHeading: "Approved templates",
  changeTemplate: "Change",
  removeTemplate: "Remove template",
  sendTemplate: "Send template",
  templateLabel: (name: string) => `Template · ${name}`,
  blank: {
    first_name: "first name",
    service: "service",
    booking_date: "booking date",
    booking_time: "booking time",
  },
  blankBlocked: (list: string, n: number) =>
    `Can't send yet — ${list} ${n === 1 ? "is" : "are"} blank.`,
  blankUnmatched: "Match this chat to a client first. Cami never guesses a name.",
  blankNoBooking: (name: string) => `${name} has no upcoming booking to fill it from.`,
  and: " and ",
  // Delivery (IX-A5)
  failure: {
    PROVIDER_REJECTED: "WhatsApp didn't accept it",
    WINDOW_CLOSED: "Free text had closed",
    UNKNOWN: "It didn't go through",
  } as Record<string, string>,
  retrySend: "Retry",
  retried: (n: number) => `Retried ${n}×`,
  retryTextClosed: "Free text has closed, so this can't go again as typed. Reply with a template.",
  lessThanMinute: "less than a minute",
  hoursMinutes: (h: number, m: number) => (h > 0 ? `${h} h ${m} min` : `${m} min`),
  // Media (IX-A6)
  attach: "Attach a photo, video or file",
  removeAttachment: "Remove",
  rejectedType: (name: string) => `WhatsApp doesn't accept this type of file (${name})`,
  rejectedSize: (limit: string) => `Too large — WhatsApp's limit for this type is ${limit}`,
  removeRejected: "Remove the file WhatsApp won't accept to send.",
  openFullSize: "Open full size",
  download: "Download",
  close: "Close",
  // Identity (IX-C3, IX-C4) — the lines in the thread keep every change (INV-08)
  eventAutoLinked: (name: string) => `Linked to ${name} automatically by Cami`,
  eventMatched: (name: string, actor: string) => `Matched to ${name} by ${actor}`,
  eventRematched: (prev: string, name: string, actor: string) =>
    `Match changed from ${prev} to ${name} by ${actor}`,
  eventCreated: (name: string, actor: string) => `${name} added as a new client by ${actor}`,
  matchTitle: "Match to a client",
  matchPlaceholder: "Name, phone, email or pet",
  matchHint: "Search your clients by name, phone, email or pet name.",
  onThisNumber: (n: number) => `This number is on ${n} client records. Pick the right one.`,
  archived: "Archived",
  atLocation: (loc: string) => `Client at ${loc}`,
  noMatches: "No clients match that search.",
  addInstead: "Add as a new client instead",
  back: "Back",
  cancel: "Cancel",
  confirmMatchTitle: (name: string) => `Match this chat to ${name}?`,
  phoneWillSave: "This number will be saved on their record.",
  phoneAlreadyOn: "This number is already on their record.",
  phoneDifferent: "Their record has a different number:",
  keepExisting: "Keep their current number",
  replacePhone: "Replace it with this one",
  historyStays: "Everything already in this chat stays here.",
  confirmMatch: "Match",
  changeMatch: "Wrong client? Change the match",
  addTitle: "Add a new client",
  addBody: "Only the first name is needed. Everything else can wait.",
  phone: "Phone",
  firstName: "First name",
  lastName: "Last name",
  optional: "optional",
  guessed: "Guessed from their message — check it",
  firstPet: "First pet",
  petName: "Pet name",
  species: { dog: "Dog", cat: "Cat", rabbit: "Rabbit", bird: "Bird", other: "Other" },
  fullForm: "Need consent or an address? Open the full client form",
  saveClient: "Save client",
  askName: "Ask for their name",
  askNameBody:
    "Don't know their name? Cami asks them once and the form waits for the reply. It never makes a name up.",
  askNameText: "Hi! Thanks for getting in touch. Could you tell us your name so we can help?",
  waitingTitle: "Waiting for their name",
  waitingBody: (when: string) => `Asked ${when}. When they reply, it fills in here.`,
  waitingClosedBody:
    "Free text is closed, so the question can't go as a message. Send it as a template, or wait — nothing is sent until they write again.",
  sendAsTemplate: "Send as template",
  stopWaiting: "Stop waiting",
  waitingPill: "Waiting for name",
  alreadyAsked: (when: string) => `Already asked ${when} — waiting for their reply.`,
  repliedTitle: "They replied",
  repliedWithName: (name: string) => `Their reply gives a name: ${name}. Check it before you save.`,
  repliedNoName: "Their reply is in the chat. Read it for their name.",
  addNamed: (name: string) => `Add ${name}`,
  alreadyClientTitle: (n: number) =>
    n === 1 ? "This number is already a client" : `This number is on ${n} clients`,
  alreadyClientBody:
    "A second client on one number is never created from here. Match the chat instead.",
  matchInstead: "Match instead",
  // ClientSummary (IX-C6, FND-4)
  lastVisits: "Last visits",
  newClientTitle: "New client",
  newClientBody: "No visits or notes yet. Their history starts with the first booking.",
  notes: "Notes",
  teamOnly: "Team only · never sent to the client",
  visitsError: "Couldn't load visits",
  noNotes: "No notes",
  // Access (T1: permission-denied; design.md: feature flag)
  noAccessTitle: "You don't have access to the inbox",
  noAccessBody: "Ask an owner or manager to give your role Inbox access.",
  readOnlyTitle: "You can read this chat, but not reply",
  readOnlyBody: "Replying needs the Inbox reply permission. Ask an owner or manager.",
  featureOffTitle: "The inbox isn't on for this business",
  featureOffBody:
    "WhatsApp inbox is being piloted with a few salons. When it's turned on, it appears here.",
}

type Copy = { [K in keyof typeof en]: (typeof en)[K] }

const ar: Copy = {
  inbox: "صندوق الوارد",
  searchPlaceholder: "ابحث في المحادثات",
  unmatched: "غير مرتبط",
  unreadCount: (n: number) => `${n} غير مقروءة`,
  noResults: "لا توجد محادثات تطابق البحث",
  listEmptyTitle: "لا توجد محادثات بعد",
  listEmptyBody: "عندما يراسل عميل رقم واتساب الخاص بك، تظهر المحادثة هنا.",
  listErrorTitle: "تعذّر تحميل المحادثات",
  threadErrorTitle: "تعذّر تحميل هذه المحادثة",
  errorBody: "تحقق من الاتصال وحاول مرة أخرى. لم يُفقد أي شيء.",
  retry: "حاول مرة أخرى",
  today: "اليوم",
  yesterday: "أمس",
  answeredOnPhone: "تم الرد من الهاتف",
  loadingEarlier: "جارٍ تحميل الرسائل السابقة…",
  historyStart: "يبدأ هنا سجل المحادثة المُزامَن من واتساب",
  conversationStart: "بداية هذه المحادثة",
  phoneOnlyTitle: "على الهاتف فقط",
  phoneOnlyBody: "أقدم من أسبوعين عند ربط واتساب",
  photo: "صورة",
  video: "فيديو",
  file: "ملف",
  composerPlaceholder: "اكتب رسالة",
  send: "إرسال",
  shortcutHint: "Ctrl + Enter للإرسال",
  shortcutHintMac: "⌘ + Enter للإرسال",
  sending: "جارٍ الإرسال",
  sent: "تم الإرسال",
  notSent: "لم تُرسل",
  you: "أنت",
  clientTab: "العميل",
  notMatchedTitle: "غير مرتبط بعميل",
  notMatchedBody: "اربط هذا الرقم بعميل موجود لديك، أو أضفه كعميل جديد.",
  match: "ربط بعميل",
  add: "إضافة عميل جديد",
  lastService: "آخر خدمة",
  noLastService: "لا توجد زيارات بعد",
  pets: "الحيوانات الأليفة",
  whatsapp: "واتساب",
  selectChat: "اختر محادثة لقراءتها",
  noChatOpenTitle: "لا يوجد ما يُقرأ بعد",
  noChatOpenBody: "تُفتح رسائل واتساب الجديدة هنا.",
  paneEmpty: "تظهر تفاصيل العميل هنا عند فتح محادثة.",
  chatList: "المحادثات",
  messageLog: "الرسائل",
  windowOpen: (left: string) => `الكتابة الحرة متاحة · تُغلق خلال ${left}`,
  clientLastWrote: (when: string) => `آخر رسالة من العميل ${when}`,
  windowClosedTitle: "الكتابة الحرة مغلقة",
  windowClosedBody: (when: string) =>
    `آخر رسالة من العميل ${when}. يسمح واتساب بقالب معتمد فقط حتى يكتب العميل مرة أخرى.`,
  providerClosedBody:
    "أفاد واتساب بأن نافذة الـ 24 ساعة قد أُغلقت. يمكن إرسال قالب معتمد فقط حتى يكتب العميل مرة أخرى.",
  typingBlocked: "الكتابة الحرة متوقفة — اختر قالبًا",
  draftKeptTitle: "لم تُرسل رسالتك",
  draftKeptBody: (when: string) =>
    `أُغلقت الكتابة الحرة عند ${when}. نصّك محفوظ هنا — رُدّ بقالب، أو أرسله عندما يكتب العميل مجددًا.`,
  copyText: "نسخ النص",
  copied: "تم النسخ",
  discard: "تجاهل",
  chooseTemplate: "اختر قالبًا",
  templatesHeading: "القوالب المعتمدة",
  changeTemplate: "تغيير",
  removeTemplate: "إزالة القالب",
  sendTemplate: "إرسال القالب",
  templateLabel: (name: string) => `قالب · ${name}`,
  blank: {
    first_name: "الاسم الأول",
    service: "الخدمة",
    booking_date: "تاريخ الحجز",
    booking_time: "وقت الحجز",
  },
  blankBlocked: (list: string, n: number) =>
    `لا يمكن الإرسال بعد — ${list} ${n === 1 ? "فارغ" : "فارغة"}.`,
  blankUnmatched: "اربط هذه المحادثة بعميل أولًا. لا يخمّن Cami الأسماء أبدًا.",
  blankNoBooking: (name: string) => `لا يوجد لدى ${name} حجز قادم لملئه منه.`,
  and: " و",
  failure: {
    PROVIDER_REJECTED: "لم يقبلها واتساب",
    WINDOW_CLOSED: "كانت الكتابة الحرة قد أُغلقت",
    UNKNOWN: "لم تصل",
  } as Record<string, string>,
  retrySend: "إعادة المحاولة",
  retried: (n: number) => `أُعيدت ${n} مرة`,
  retryTextClosed: "أُغلقت الكتابة الحرة، لذا لا يمكن إرسال هذا النص مجددًا. رُدّ بقالب.",
  lessThanMinute: "أقل من دقيقة",
  hoursMinutes: (h: number, m: number) => (h > 0 ? `${h} س ${m} د` : `${m} د`),
  attach: "إرفاق صورة أو فيديو أو ملف",
  removeAttachment: "إزالة",
  rejectedType: (name: string) => `لا يقبل واتساب هذا النوع من الملفات (${name})`,
  rejectedSize: (limit: string) => `كبير جدًا — حد واتساب لهذا النوع ${limit}`,
  removeRejected: "أزل الملف الذي لن يقبله واتساب لتتمكن من الإرسال.",
  openFullSize: "فتح بالحجم الكامل",
  download: "تنزيل",
  close: "إغلاق",
  eventAutoLinked: (name: string) => `رُبطت تلقائيًا بـ ${name} بواسطة Cami`,
  eventMatched: (name: string, actor: string) => `رُبطت بـ ${name} بواسطة ${actor}`,
  eventRematched: (prev: string, name: string, actor: string) =>
    `تغيّر الربط من ${prev} إلى ${name} بواسطة ${actor}`,
  eventCreated: (name: string, actor: string) => `أُضيف ${name} كعميل جديد بواسطة ${actor}`,
  matchTitle: "ربط بعميل",
  matchPlaceholder: "الاسم أو الهاتف أو البريد أو الحيوان الأليف",
  matchHint: "ابحث في عملائك بالاسم أو الهاتف أو البريد الإلكتروني أو اسم الحيوان الأليف.",
  onThisNumber: (n: number) => `هذا الرقم مسجّل في ${n} من سجلات العملاء. اختر الصحيح.`,
  archived: "مؤرشف",
  atLocation: (loc: string) => `عميل في ${loc}`,
  noMatches: "لا يوجد عملاء يطابقون البحث.",
  addInstead: "أضفه كعميل جديد بدلًا من ذلك",
  back: "رجوع",
  cancel: "إلغاء",
  confirmMatchTitle: (name: string) => `ربط هذه المحادثة بـ ${name}؟`,
  phoneWillSave: "سيُحفظ هذا الرقم في سجله.",
  phoneAlreadyOn: "هذا الرقم موجود في سجله بالفعل.",
  phoneDifferent: "في سجله رقم مختلف:",
  keepExisting: "الإبقاء على رقمه الحالي",
  replacePhone: "استبداله بهذا الرقم",
  historyStays: "يبقى كل ما في هذه المحادثة هنا.",
  confirmMatch: "ربط",
  changeMatch: "عميل خطأ؟ غيّر الربط",
  addTitle: "إضافة عميل جديد",
  addBody: "الاسم الأول فقط مطلوب. كل شيء آخر يمكن أن ينتظر.",
  phone: "الهاتف",
  firstName: "الاسم الأول",
  lastName: "اسم العائلة",
  optional: "اختياري",
  guessed: "مُستنتج من رسالته — تحقّق منه",
  firstPet: "أول حيوان أليف",
  petName: "اسم الحيوان الأليف",
  species: { dog: "كلب", cat: "قطة", rabbit: "أرنب", bird: "طائر", other: "أخرى" },
  fullForm: "تحتاج موافقة أو عنوانًا؟ افتح نموذج العميل الكامل",
  saveClient: "حفظ العميل",
  askName: "اسأله عن اسمه",
  askNameBody: "لا تعرف اسمه؟ يسأله Cami مرة واحدة وينتظر النموذج الرد. لا يخترع اسمًا أبدًا.",
  askNameText: "Hi! Thanks for getting in touch. Could you tell us your name so we can help?",
  waitingTitle: "بانتظار اسمه",
  waitingBody: (when: string) => `سُئل ${when}. عندما يرد، يُملأ هنا.`,
  waitingClosedBody:
    "الكتابة الحرة مغلقة، لذا لا يمكن إرسال السؤال كرسالة. أرسله كقالب، أو انتظر — لا يُرسل شيء حتى يكتب مجددًا.",
  sendAsTemplate: "إرسال كقالب",
  stopWaiting: "إيقاف الانتظار",
  waitingPill: "بانتظار الاسم",
  alreadyAsked: (when: string) => `سُئل ${when} — بانتظار رده.`,
  repliedTitle: "ردّ العميل",
  repliedWithName: (name: string) => `يذكر رده اسمًا: ${name}. تحقّق منه قبل الحفظ.`,
  repliedNoName: "ردّه في المحادثة. اقرأه لمعرفة اسمه.",
  addNamed: (name: string) => `إضافة ${name}`,
  alreadyClientTitle: (n: number) =>
    n === 1 ? "هذا الرقم لعميل موجود" : `هذا الرقم مسجّل لـ ${n} عملاء`,
  alreadyClientBody: "لا يُنشأ عميل ثانٍ على رقم واحد من هنا. اربط المحادثة بدلًا من ذلك.",
  matchInstead: "ربط بدلًا من ذلك",
  lastVisits: "آخر الزيارات",
  newClientTitle: "عميل جديد",
  newClientBody: "لا توجد زيارات أو ملاحظات بعد. يبدأ سجله مع أول حجز.",
  notes: "ملاحظات",
  teamOnly: "للفريق فقط · لا تُرسل إلى العميل أبدًا",
  visitsError: "تعذّر تحميل الزيارات",
  noNotes: "لا توجد ملاحظات",
  noAccessTitle: "ليس لديك صلاحية الوصول إلى صندوق الوارد",
  noAccessBody: "اطلب من المالك أو المدير منح دورك صلاحية صندوق الوارد.",
  readOnlyTitle: "يمكنك قراءة هذه المحادثة لكن لا يمكنك الرد",
  readOnlyBody: "الرد يتطلب صلاحية الرد في صندوق الوارد. اطلب ذلك من المالك أو المدير.",
  featureOffTitle: "صندوق الوارد غير مفعّل لهذا النشاط",
  featureOffBody: "يُجرَّب صندوق وارد واتساب مع عدد من الصالونات. عند تفعيله يظهر هنا.",
}

export const COPY: Record<Lang, Copy> = { en, ar }
export type InboxCopy = Copy

// ─── Formatting — UTC in, the salon's timezone out ────────────────────────────

const localeFor = (lang: Lang) => (lang === "ar" ? "ar-AE" : "en-GB")

// The clock re-renders the inbox every few seconds; building a formatter per
// label per tick is the expensive part, so each shape is built once.
const formatters = new Map<string, Intl.DateTimeFormat>()
function fmt(lang: Lang, options: Intl.DateTimeFormatOptions) {
  const key = lang + JSON.stringify(options)
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat(localeFor(lang), { timeZone: SALON_TIME_ZONE, ...options })
    formatters.set(key, f)
  }
  return f
}

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: SALON_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/** YYYY-MM-DD in the salon's timezone — what day grouping compares. */
export function dayKey(iso: string | number): string {
  return dayKeyFormat.format(new Date(iso))
}

function daysBetween(fromKey: string, toKey: string) {
  return Math.round((Date.parse(toKey) - Date.parse(fromKey)) / 86_400_000)
}

/** Day header: Today, Yesterday, a weekday within the week, else the date. */
export function dayLabel(iso: string, now: number, lang: Lang): string {
  const diff = daysBetween(dayKey(iso), dayKey(now))
  if (diff === 0) return COPY[lang].today
  if (diff === 1) return COPY[lang].yesterday
  const sameYear = dayKey(iso).slice(0, 4) === dayKey(now).slice(0, 4)
  return fmt(lang, {
    weekday: diff < 7 ? "long" : "short",
    day: diff < 7 ? undefined : "numeric",
    month: diff < 7 ? undefined : "short",
    year: sameYear ? undefined : "numeric",
  }).format(new Date(iso))
}

export function timeLabel(iso: string, lang: Lang): string {
  return fmt(lang, { hour: "numeric", minute: "2-digit" }).format(new Date(iso))
}

/** List-row time: the time today, else the day. */
export function listTimeLabel(iso: string, now: number, lang: Lang): string {
  const diff = daysBetween(dayKey(iso), dayKey(now))
  if (diff === 0) return timeLabel(iso, lang)
  if (diff === 1) return COPY[lang].yesterday
  return fmt(lang, diff < 7 ? { weekday: "short" } : { day: "numeric", month: "short" }).format(
    new Date(iso),
  )
}

/** +971501234501 → +971 50 123 4501. Always rendered LTR, even in Arabic. */
export function formatPhone(e164: string): string {
  if (e164.startsWith("+971") && e164.length === 13) {
    return `+971 ${e164.slice(4, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`
  }
  return e164
}

/** "today at 14:02", "yesterday at 09:12", "Mon 22 Sep at 17:40". */
export function whenLabel(iso: string, now: number, lang: Lang): string {
  const day = dayLabel(iso, now, lang)
  const time = timeLabel(iso, lang)
  const joiner = lang === "ar" ? " الساعة " : " at "
  return `${lang === "en" && (day === "Today" || day === "Yesterday") ? day.toLowerCase() : day}${joiner}${time}`
}

/** Time left in the window, e.g. "5 h 12 min". */
export function formatLeft(ms: number, lang: Lang): string {
  const c = COPY[lang]
  if (ms < 60_000) return c.lessThanMinute
  const totalMin = Math.floor(ms / 60_000)
  return c.hoursMinutes(Math.floor(totalMin / 60), totalMin % 60)
}

/** 1240000 → "1.2 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`
}
