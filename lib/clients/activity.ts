// What a client has actually done — their appointments, their sales, and the
// detail behind their pets.
//
// This exists because the client detail dialog held one hardcoded appointment
// list and one hardcoded sales list at module scope, and rendered them for
// whoever it was opened on. Tom Cassidy's Overview said his last visit was for
// Mochi, who is Millie's cat; Kirsty Dingomal, who has spent nothing and owns
// one dog, showed three other people's pets and AED 75 of someone else's sales.
// It read as a demo that had not been finished, which for a review is worse
// than an empty state.
//
// Two decisions worth reading.
//
// 1. Pets are NOT redefined here. Every client already carries their pets
//    (id, name, species) on their record in app/clients/mock.ts; PET_DETAILS
//    adds only what a record has no room for — breed, weight, coat. A second
//    list of pets is exactly the drift this file is fixing, so there isn't one.
//
// 2. A client with no entry here has no activity, and that is deliberate. Most
//    rows in a client list are a name and a phone number; inventing a visit for
//    each one would put the original bug back, one layer down. The empty
//    Overview is a state the design has to hold, and the only way it gets
//    looked at is if some client actually lands on it.

import type { AvatarSpecies } from "@/components/ui/avatar"

// ─── Pets ────────────────────────────────────────────────────────────────────

/** The detail a client record has no room for. Keyed by pet id. */
export type PetDetail = {
  breed?: string
  weight?: string
  coat?: string
  /** "Spayed" (female), "Neutered" (male), or "Intact". */
  desexedStatus?: "Spayed" | "Neutered" | "Intact"
  /** Compact service-tier codes shown next to the pet name. */
  serviceCodes?: string[]
}

export const PET_DETAILS: Record<string, PetDetail> = {
  bobo: {
    breed: "French Bulldog",
    weight: "10 lbs",
    coat: "Short coat",
    desexedStatus: "Neutered",
    serviceCodes: ["5f", "4f"],
  },
  mochi: {
    breed: "Domestic Shorthair",
    weight: "8 lbs",
    coat: "Short coat",
    desexedStatus: "Spayed",
    serviceCodes: ["3f"],
  },
  kiwi: { breed: "Cockatiel", weight: "85 g", desexedStatus: "Intact" },
  luna: { breed: "Ragdoll", weight: "12 lbs", coat: "Long coat", desexedStatus: "Spayed" },
  biscuit: {
    breed: "Cavalier King Charles",
    weight: "17 lbs",
    coat: "Silky",
    desexedStatus: "Neutered",
  },
  pepper: { breed: "Holland Lop", weight: "3 lbs", coat: "Dense", desexedStatus: "Spayed" },
  ralph: {
    breed: "Golden Retriever",
    weight: "68 lbs",
    coat: "Double coat",
    desexedStatus: "Neutered",
    serviceCodes: ["6f"],
  },
  tofu: { breed: "British Shorthair", weight: "11 lbs", coat: "Plush", desexedStatus: "Spayed" },
  muffin: { breed: "Persian", weight: "9 lbs", coat: "Long coat", desexedStatus: "Spayed" },
  shadow: {
    breed: "Border Collie",
    weight: "42 lbs",
    coat: "Double coat",
    desexedStatus: "Neutered",
  },
  rocky: { breed: "Staffordshire Terrier", weight: "55 lbs", desexedStatus: "Intact" },
  mango: { breed: "Sun Conure", weight: "110 g", desexedStatus: "Intact" },
  ginger: { breed: "Maine Coon", weight: "18 lbs", coat: "Long coat", desexedStatus: "Spayed" },
  olive: { breed: "Netherland Dwarf", weight: "2 lbs", desexedStatus: "Spayed" },
  duke: { breed: "German Shepherd", weight: "75 lbs", coat: "Double coat", serviceCodes: ["6f"] },
  pickle: { breed: "Sphynx", weight: "9 lbs", coat: "Hairless", desexedStatus: "Neutered" },
  willow: {
    breed: "Cocker Spaniel",
    weight: "28 lbs",
    coat: "Wavy",
    desexedStatus: "Spayed",
    serviceCodes: ["4f"],
  },
}

// ─── Appointments ────────────────────────────────────────────────────────────

export type ClientApptStatus =
  | "booked"
  | "confirmed"
  | "arrived"
  | "started"
  | "completed"
  | "canceled"
  | "no-show"

export const APPT_STATUS_LABEL: Record<ClientApptStatus, string> = {
  booked: "Booked",
  confirmed: "Confirmed",
  arrived: "Arrived",
  started: "Started",
  completed: "Completed",
  canceled: "Canceled",
  "no-show": "No-show",
}

export type ClientAppointment = {
  id: string
  status: ClientApptStatus
  /** Day + month for the timeline leading, e.g. "May 22". */
  dayMonth: string
  weekday: string
  time: string
  /** Which of the client's own pets this was for. Absent for non-pet partners. */
  petId?: string
  /**
   * The branch it happened at (SCR-07, R13).
   *
   * Optional, because a single-location business has nothing to attribute and
   * a record without one is not broken — it is a visit from before the estate
   * existed. Surfaces show a branch only once a client's own history spans
   * more than one, so a single-branch history never grows a column of the same
   * repeated name (PRD §12).
   */
  locationId?: string
  services: Array<{ name: string; staff: string; duration: string; price: string }>
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export type ClientSaleStatus = "paid" | "draft" | "part-paid" | "unpaid" | "refunded"

export type ClientSale = {
  id: string
  status: ClientSaleStatus
  dayMonth: string
  weekday: string
  /**
   * The branch it happened at (SCR-07, R13).
   *
   * Optional, because a single-location business has nothing to attribute and
   * a record without one is not broken — it is a visit from before the estate
   * existed. Surfaces show a branch only once a client's own history spans
   * more than one, so a single-branch history never grows a column of the same
   * repeated name (PRD §12).
   */
  locationId?: string
  items: Array<{ name: string; priceMinor: number }>
  /** Amount already paid. Only meaningful for part-paid. Minor units. */
  paidMinor?: number
}

export type ClientActivity = {
  appointments: ClientAppointment[]
  sales: ClientSale[]
}

const EMPTY: ClientActivity = { appointments: [], sales: [] }

/**
 * Authored per client, and deliberately uneven.
 *
 * The set covers the shapes Overview has to hold rather than one good-looking
 * case repeated: a client with everything, one with a history and nothing
 * booked, one booked with no history at all, one whose only recent visit was a
 * no-show, and several with nothing. If every client looked like Millie, none
 * of the empty and partial states would ever be seen in a review.
 */
const ACTIVITY: Record<string, ClientActivity> = {
  // The brief's own record. These are the numbers on page 4 of the PDF, so the
  // customer card can be held next to the mockup and read line for line.
  "maaz-shaffi": {
    appointments: [
      {
        id: "ms-1",
        status: "confirmed",
        dayMonth: "Sep 17",
        weekday: "Thursday",
        time: "2:00pm",
        services: [
          { name: "Hair Colour", staff: "Sara", duration: "1h 30min", price: "AED 380" },
          { name: "Blowout", staff: "Sara", duration: "45min", price: "AED 150" },
        ],
      },
      {
        id: "ms-2",
        status: "completed",
        dayMonth: "Aug 20",
        weekday: "Wednesday",
        time: "11:00am",
        services: [
          { name: "Cut and finish", staff: "Sara", duration: "1h 15min", price: "AED 260" },
        ],
      },
      {
        id: "ms-3",
        status: "completed",
        dayMonth: "Jul 2",
        weekday: "Wednesday",
        time: "10:00am",
        services: [{ name: "Balayage", staff: "Lina", duration: "3h 30min", price: "AED 890" }],
      },
    ],
    sales: [
      {
        id: "ms-s1",
        status: "paid",
        dayMonth: "Aug 20",
        weekday: "Wednesday",
        items: [{ name: "Cut and finish", priceMinor: 26000 }],
      },
      {
        id: "ms-s2",
        status: "paid",
        dayMonth: "Jul 2",
        weekday: "Wednesday",
        items: [
          { name: "Balayage", priceMinor: 89000 },
          { name: "Bond treatment", priceMinor: 12000 },
        ],
      },
    ],
  },

  // The full case. Two completed visits, one booked, one no-show, and sales in
  // three different settlement states.
  "millie-cassidy": {
    appointments: [
      {
        id: "mc-1",
        locationId: "shampooch-jvc",
        status: "booked",
        dayMonth: "May 22",
        weekday: "Friday",
        time: "10:00am",
        petId: "bobo",
        services: [
          { name: "Full groom", staff: "Sophie", duration: "1h 30min", price: "AED 220" },
          { name: "Nail trim", staff: "Sophie", duration: "15min", price: "AED 40" },
        ],
      },
      {
        id: "mc-2",
        locationId: "shampooch-jvc",
        status: "no-show",
        dayMonth: "May 18",
        weekday: "Monday",
        time: "12:00pm",
        petId: "kiwi",
        services: [{ name: "Wing clip", staff: "Aisha", duration: "30min", price: "AED 90" }],
      },
      {
        id: "mc-3",
        locationId: "shampooch-jumeirah",
        status: "completed",
        dayMonth: "Apr 8",
        weekday: "Wednesday",
        time: "2:30pm",
        petId: "mochi",
        services: [{ name: "Bath & tidy", staff: "Aisha", duration: "45min", price: "AED 130" }],
      },
      {
        id: "mc-4",
        locationId: "shampooch-al-quoz",
        status: "completed",
        dayMonth: "Mar 2",
        weekday: "Monday",
        time: "9:00am",
        petId: "bobo",
        services: [{ name: "Full groom", staff: "Sophie", duration: "1h 30min", price: "AED 220" }],
      },
      // Two more branches, because "visits elsewhere" is the whole of SCR-07
      // and a three-branch history in a nine-branch estate barely tests it.
      // These are the two an owner would actually be comparing: a different
      // emirate, and the branch that charges differently for the same service.
      {
        id: "mc-5",
        locationId: "shampooch-downtown-dubai",
        status: "completed",
        dayMonth: "Feb 21",
        weekday: "Saturday",
        time: "11:15am",
        petId: "mochi",
        services: [{ name: "Blow dry", staff: "Diego", duration: "45min", price: "AED 150" }],
      },
      {
        id: "mc-6",
        locationId: "shampooch-al-reem",
        status: "completed",
        dayMonth: "Jan 30",
        weekday: "Friday",
        time: "4:00pm",
        petId: "bobo",
        services: [{ name: "Nail trim", staff: "Rana", duration: "15min", price: "AED 45" }],
      },
    ],
    sales: [
      {
        id: "mc-s1",
        locationId: "shampooch-jumeirah",
        status: "paid",
        dayMonth: "Apr 8",
        weekday: "Wednesday",
        items: [{ name: "Bath & tidy", priceMinor: 13000 }],
      },
      {
        id: "mc-s2",
        locationId: "shampooch-al-quoz",
        status: "part-paid",
        dayMonth: "Mar 2",
        weekday: "Monday",
        items: [{ name: "Full groom", priceMinor: 22000 }],
        paidMinor: 10000,
      },
      {
        id: "mc-s3",
        locationId: "shampooch-jvc",
        status: "unpaid",
        dayMonth: "Feb 14",
        weekday: "Friday",
        items: [
          { name: "Nail trim", priceMinor: 4000 },
          { name: "De-shed treatment", priceMinor: 9000 },
        ],
      },
      // The sales that settled the two visits above. A visit elsewhere with no
      // sale behind it reads as a branch that worked for free.
      {
        id: "mc-s4",
        locationId: "shampooch-downtown-dubai",
        status: "paid",
        dayMonth: "Feb 21",
        weekday: "Saturday",
        items: [{ name: "Blow dry", priceMinor: 15000 }],
      },
      {
        id: "mc-s5",
        locationId: "shampooch-al-reem",
        status: "paid",
        dayMonth: "Jan 30",
        weekday: "Friday",
        items: [{ name: "Nail trim", priceMinor: 4500 }],
      },
    ],
  },

  // Booked, never yet seen. Overview has to say "no completed visits" without
  // looking broken, and there is nothing to rebook.
  "kirsty-dingomal": {
    appointments: [
      {
        id: "kd-1",
        status: "confirmed",
        dayMonth: "May 24",
        weekday: "Sunday",
        time: "11:30am",
        petId: "biscuit",
        services: [{ name: "Puppy first groom", staff: "Aya", duration: "1h", price: "AED 180" }],
      },
    ],
    sales: [],
  },

  // Two pets, one of each half of the card: a completed visit for one, an
  // upcoming for the other.
  "tom-cassidy": {
    appointments: [
      {
        id: "tc-1",
        status: "booked",
        dayMonth: "May 27",
        weekday: "Wednesday",
        time: "4:00pm",
        petId: "luna",
        services: [
          { name: "Cat grooming", staff: "Aisha", duration: "1h 15min", price: "AED 200" },
        ],
      },
      {
        id: "tc-2",
        status: "completed",
        dayMonth: "Apr 19",
        weekday: "Sunday",
        time: "10:30am",
        petId: "bobo",
        services: [{ name: "Bath & brush", staff: "Sophie", duration: "1h", price: "AED 120" }],
      },
    ],
    sales: [
      {
        id: "tc-s1",
        status: "paid",
        dayMonth: "Apr 19",
        weekday: "Sunday",
        items: [{ name: "Bath & brush", priceMinor: 12000 }],
      },
      {
        id: "tc-s2",
        status: "paid",
        dayMonth: "Mar 8",
        weekday: "Sunday",
        items: [{ name: "Bath pass, 10 visits", priceMinor: 20000 }],
      },
    ],
  },

  // Lapsed. A history, and nothing booked — the case where Rebook is the only
  // thing on the card worth pressing.
  "grace-kent": {
    appointments: [
      {
        id: "gk-1",
        status: "completed",
        dayMonth: "Jan 24",
        weekday: "Saturday",
        time: "1:00pm",
        petId: "pepper",
        services: [{ name: "Small pet tidy", staff: "Aya", duration: "40min", price: "AED 140" }],
      },
      {
        id: "gk-2",
        status: "canceled",
        dayMonth: "Feb 28",
        weekday: "Saturday",
        time: "1:00pm",
        petId: "pepper",
        services: [{ name: "Small pet tidy", staff: "Aya", duration: "40min", price: "AED 140" }],
      },
    ],
    sales: [
      {
        id: "gk-s1",
        status: "paid",
        dayMonth: "Jan 24",
        weekday: "Saturday",
        items: [{ name: "Small pet tidy", priceMinor: 14000 }],
      },
    ],
  },

  // The no-show case, so the tomato pill in the header and the clickable cell
  // in the strip are both reachable from a real client.
  amy: {
    appointments: [
      {
        id: "amy-1",
        status: "no-show",
        dayMonth: "May 12",
        weekday: "Tuesday",
        time: "3:00pm",
        petId: "tofu",
        services: [
          { name: "Cat grooming", staff: "Aisha", duration: "1h 15min", price: "AED 200" },
        ],
      },
      {
        id: "amy-2",
        status: "no-show",
        dayMonth: "Apr 30",
        weekday: "Thursday",
        time: "3:00pm",
        petId: "muffin",
        services: [
          { name: "Cat grooming", staff: "Aisha", duration: "1h 15min", price: "AED 200" },
        ],
      },
      {
        id: "amy-3",
        status: "completed",
        dayMonth: "Feb 6",
        weekday: "Friday",
        time: "11:00am",
        petId: "tofu",
        services: [{ name: "Nail trim", staff: "Aya", duration: "15min", price: "AED 40" }],
      },
    ],
    sales: [
      {
        id: "amy-s1",
        status: "paid",
        dayMonth: "Feb 6",
        weekday: "Friday",
        items: [{ name: "Nail trim", priceMinor: 4000 }],
      },
      {
        id: "amy-s2",
        status: "refunded",
        dayMonth: "May 12",
        weekday: "Tuesday",
        items: [{ name: "Cat grooming deposit", priceMinor: 6000 }],
      },
    ],
  },

  // Loyal and regular — arrived today, so the mid-visit statuses are reachable.
  "lisa-lyons-wilson": {
    appointments: [
      {
        id: "ll-1",
        status: "arrived",
        dayMonth: "May 20",
        weekday: "Wednesday",
        time: "9:30am",
        petId: "ralph",
        services: [
          { name: "Full groom", staff: "Sophie", duration: "2h", price: "AED 320" },
          { name: "De-shed treatment", staff: "Sophie", duration: "30min", price: "AED 90" },
        ],
      },
      {
        id: "ll-2",
        status: "completed",
        dayMonth: "Apr 15",
        weekday: "Wednesday",
        time: "9:30am",
        petId: "ralph",
        services: [{ name: "Full groom", staff: "Sophie", duration: "2h", price: "AED 320" }],
      },
    ],
    sales: [
      {
        id: "ll-s1",
        status: "paid",
        dayMonth: "Apr 15",
        weekday: "Wednesday",
        items: [{ name: "Full groom", priceMinor: 32000 }],
      },
      {
        id: "ll-s2",
        status: "draft",
        dayMonth: "May 20",
        weekday: "Wednesday",
        items: [
          { name: "Full groom", priceMinor: 32000 },
          { name: "De-shed treatment", priceMinor: 9000 },
        ],
      },
    ],
  },

  // Four pets. The one that proves Overview's pet chips wrap rather than push
  // everything below the fold.
  luke: {
    appointments: [
      {
        id: "lu-1",
        status: "confirmed",
        dayMonth: "May 25",
        weekday: "Monday",
        time: "8:00am",
        petId: "shadow",
        services: [{ name: "Daycare, full day", staff: "Team", duration: "11h", price: "AED 140" }],
      },
      {
        id: "lu-2",
        status: "completed",
        dayMonth: "May 11",
        weekday: "Monday",
        time: "8:00am",
        petId: "rocky",
        services: [
          { name: "Bath & brush, large", staff: "Sophie", duration: "1h 30min", price: "AED 180" },
        ],
      },
      {
        id: "lu-3",
        status: "completed",
        dayMonth: "Apr 27",
        weekday: "Monday",
        time: "2:00pm",
        petId: "ginger",
        services: [
          { name: "Cat grooming", staff: "Aisha", duration: "1h 15min", price: "AED 200" },
        ],
      },
    ],
    sales: [
      {
        id: "lu-s1",
        status: "paid",
        dayMonth: "May 11",
        weekday: "Monday",
        items: [{ name: "Bath & brush, large", priceMinor: 18000 }],
      },
      {
        id: "lu-s2",
        status: "paid",
        dayMonth: "Apr 27",
        weekday: "Monday",
        items: [{ name: "Cat grooming", priceMinor: 20000 }],
      },
    ],
  },

  // Both of these carried a lifetime sales figure and no sale records at all,
  // which is a contradiction the client list states out loud in its Sales
  // column. They are also the two clients near the top of the default
  // "Created, newest first" order who have any history, so the list does not
  // open on eight empty rows.
  frances: {
    appointments: [
      {
        id: "fr-1",
        status: "confirmed",
        dayMonth: "May 26",
        weekday: "Tuesday",
        time: "9:00am",
        petId: "duke",
        services: [{ name: "Full groom", staff: "Sophie", duration: "2h", price: "AED 340" }],
      },
      {
        id: "fr-2",
        status: "completed",
        dayMonth: "May 15",
        weekday: "Friday",
        time: "9:00am",
        petId: "duke",
        services: [
          { name: "Full groom", staff: "Sophie", duration: "2h", price: "AED 340" },
          { name: "Ear clean", staff: "Sophie", duration: "15min", price: "AED 30" },
        ],
      },
    ],
    sales: [
      {
        id: "fr-s1",
        status: "paid",
        dayMonth: "May 15",
        weekday: "Friday",
        items: [
          { name: "Full groom", priceMinor: 34000 },
          { name: "Ear clean", priceMinor: 3000 },
        ],
      },
    ],
  },

  // The second client who can show the header's unpaid pill, so it is not
  // reachable on one record only.
  "evie-lelliott": {
    appointments: [
      {
        id: "ev-1",
        status: "completed",
        dayMonth: "May 9",
        weekday: "Saturday",
        time: "2:00pm",
        petId: "olive",
        services: [{ name: "Small pet tidy", staff: "Aya", duration: "40min", price: "AED 140" }],
      },
    ],
    sales: [
      {
        id: "ev-s1",
        status: "unpaid",
        dayMonth: "May 9",
        weekday: "Saturday",
        items: [{ name: "Small pet tidy", priceMinor: 14000 }],
      },
    ],
  },

  // Highest spend in the list. Long history, nothing outstanding.
  "karen-dougall": {
    appointments: [
      {
        id: "kdg-1",
        status: "confirmed",
        dayMonth: "May 23",
        weekday: "Saturday",
        time: "12:00pm",
        petId: "willow",
        services: [{ name: "Full groom", staff: "Aya", duration: "1h 45min", price: "AED 280" }],
      },
      {
        id: "kdg-2",
        status: "completed",
        dayMonth: "Apr 25",
        weekday: "Saturday",
        time: "12:00pm",
        petId: "willow",
        services: [{ name: "Full groom", staff: "Aya", duration: "1h 45min", price: "AED 280" }],
      },
      {
        id: "kdg-3",
        status: "completed",
        dayMonth: "Mar 28",
        weekday: "Saturday",
        time: "12:00pm",
        petId: "pickle",
        services: [{ name: "Sphynx bath", staff: "Aisha", duration: "45min", price: "AED 160" }],
      },
    ],
    sales: [
      {
        id: "kdg-s1",
        status: "paid",
        dayMonth: "Apr 25",
        weekday: "Saturday",
        items: [{ name: "Full groom", priceMinor: 28000 }],
      },
      {
        id: "kdg-s2",
        status: "paid",
        dayMonth: "Mar 28",
        weekday: "Saturday",
        items: [
          { name: "Sphynx bath", priceMinor: 16000 },
          { name: "Ear clean", priceMinor: 3000 },
        ],
      },
    ],
  },
}

export function getClientActivity(clientId?: string): ClientActivity {
  if (!clientId) return EMPTY
  return ACTIVITY[clientId] ?? EMPTY
}

/** Species a pet id is recorded as, for callers that only hold the id. */
export type ClientPet = { id: string; name: string; species: AvatarSpecies }
