// Data behind the public consent-form signing flow (/sign/[token]).
//
// A form the operator sent for signature is addressed by an opaque link token
// (what lands in the recipient's email). This is mock-only: a small map of
// seeded tokens, mirroring how /[slug]/pay/[token] fakes its payment links.
// The `-signed` / `-completed` / `-closed` suffixes seed each terminal state so
// every screen is reachable from a URL for the /screens index.

export type SignableFormState = "awaiting" | "signed" | "completed" | "closed"

export type SignableForm = {
  token: string
  /** Operator-given form name shown in the header, e.g. "COVID-19 consent". */
  formName: string
  /** Business that sent the form. */
  businessName: string
  businessLogoUrl?: string
  /** Recipient (client / pet parent) who must sign. */
  recipientName: string
  /** Full email the link was sent to — pre-filled (and locked) on the signing panel. */
  recipientEmail: string
  /** Masked email the link was sent to, for the OTP screen copy. */
  recipientEmailMasked: string
  /** Title printed at the top of the embedded PDF document. */
  documentTitle: string
  /** Consent copy rendered into the embedded PDF (one entry per paragraph). */
  statements: readonly string[]
  state: SignableFormState
}

// Pet grooming consent + liability waiver — the kind of form a grooming /
// boarding business sends a pet parent to sign before their first visit.
const GROOMING_STATEMENTS: readonly string[] = [
  "I confirm that the information I have provided about my pet — including its age, health, temperament and vaccination history — is accurate and complete.",
  "I consent to my pet being handled, bathed and groomed by the team, and understand that a muzzle or other safe restraint may be used if my pet becomes anxious or aggressive.",
  "I understand that grooming can occasionally reveal pre-existing conditions such as skin irritation, lumps or matting, and I authorise the groomer to proceed using their professional judgement.",
  "I understand that a severely matted coat may need to be shaved for my pet's comfort, and that this carries a small risk of nicks or skin sensitivity that the business is not liable for.",
  "I confirm my pet is in good health and free of fleas, ticks and contagious conditions; if any are found, the appointment may be paused or rescheduled for the safety of other animals.",
  "I authorise the business to seek veterinary care for my pet in an emergency if I cannot be reached, and I accept responsibility for any resulting costs.",
  "I release the staff and the business from liability for any accidental injury, illness or stress to my pet that may occur despite reasonable and professional care.",
]

const LOGO =
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&h=200&q=80"

const BASE: Omit<SignableForm, "token" | "state"> = {
  formName: "Grooming consent form",
  businessName: "Shampooch",
  businessLogoUrl: LOGO,
  recipientName: "Michelle You",
  recipientEmail: "michelle.you@email.com",
  recipientEmailMasked: "mi•••••@email.com",
  documentTitle: "Pet grooming consent & liability waiver",
  statements: GROOMING_STATEMENTS,
}

const FORMS: ReadonlyMap<string, SignableForm> = new Map(
  (
    [
      { token: "consent", state: "awaiting" },
      { token: "consent-signed", state: "signed" },
      { token: "consent-completed", state: "completed" },
      { token: "consent-closed", state: "closed" },
    ] as const
  ).map(({ token, state }) => [token, { ...BASE, token, state }]),
)

export function getSignableForm(token: string): SignableForm | undefined {
  return FORMS.get(token)
}

export function listSignableFormTokens(): readonly string[] {
  return Array.from(FORMS.keys())
}
